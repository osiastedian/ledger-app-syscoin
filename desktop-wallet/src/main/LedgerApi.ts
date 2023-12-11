import axios from "axios";
import SpeculosTransport from "@ledgerhq/hw-transport-node-speculos-http";
import HIDTransport from "@ledgerhq/hw-transport-node-hid";
import { DisconnectedDevice } from "@ledgerhq/errors";
import { listen } from "@ledgerhq/logs";
import {
  AppClient,
  DefaultDescriptorTemplate,
  DefaultWalletPolicy,
  PsbtV2,
  WalletPolicy,
} from "../../../bitcoin_client_js/build/main";
import { BrowserWindow, ipcMain } from "electron";
import { Psbt, Transaction } from "bitcoinjs-lib";

import sjs from "syscoinjs-lib";
import { fromBase58 } from "bip32";
import { BlockbookTransaction, BlockbookUTXO } from "../types/BlockbookUTXO";
import { toSatoshi } from "satoshi-bitcoin";
import fs from "fs";
import path from "path";
import { BlockbookAPIURL, SYSCOIN_NETWORK } from "../constants";

const opts = {
  baseURL: "http://localhost:5002",
};
const axiosInstance = axios.create(opts);
const speculosTransport = new SpeculosTransport(axiosInstance, opts);

let isConnected = false;

let appClient: AppClient;

const syscoin = new sjs.syscoin(null, BlockbookAPIURL, SYSCOIN_NETWORK);

const connectToLedgerDevice = () => {
  return new Promise<HIDTransport>((resolve, reject) => {
    HIDTransport.open("")
      .then((transport) => {
        listen((log) => console.log(log));
        resolve(transport);
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
        reject(error);
      });
  });
};

console.log({ syscoin });

const connectToLedger = () => {
  return new Promise<SpeculosTransport>((resolve, reject) => {
    axiosInstance({
      url: "/events?stream=true",
      responseType: "stream",
    })
      .then((response) => {
        response.data.on("data", () => {
          // console.log('Events Stream data', { chunk});
        });
        response.data.on("close", () => {
          speculosTransport.emit(
            "disconnect",
            new DisconnectedDevice("Speculos exited!")
          );
        });
        speculosTransport.eventStream = response.data;
        // we are connected to speculos
        resolve(speculosTransport);
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
        reject(error);
      });
  });
};

export const setupLedgerApi = (window: BrowserWindow) => {
  const connect = () => {
    const connectFn =
      process.env.DEVICE_TYPE === "speculos"
        ? connectToLedger
        : connectToLedgerDevice;

    return connectFn().then((transport) => {
      isConnected = true;
      appClient = new AppClient(transport);
    });
  };

  connect();

  ipcMain.handle("request", (sender, method, params) => {
    console.log(method, params);
    switch (method) {
      case "checkConnection":
        {
          connect().then(() => {
            window.webContents.send("message", "connected", isConnected);
          });
        }
        break;

      case "saveLocalWallet": {
        const [localWallet] = params;
        appClient.getMasterFingerprint().then((fingerprint) => {
          const container = path.resolve(__dirname, "data/wallets");

          if (!fs.existsSync(container)) {
            fs.mkdirSync(container);
          }

          const walletPath = path.resolve(
            __dirname,
            `data/wallets/${fingerprint}.json`
          );

          fs.writeFileSync(walletPath, JSON.stringify(localWallet));
        });
        break;
      }

      case "getLocalWallet": {
        appClient.getMasterFingerprint().then((fingerprint) => {
          const walletPath = path.resolve(
            __dirname,
            `data/wallets/${fingerprint}.json`
          );
          fs.readFile(walletPath, (err, data) => {
            if (err) {
              console.log(err);
              window.webContents.send("message", method, null);
            }
            window.webContents.send(
              "message",
              method,
              data ? JSON.parse(data.toString()) : null
            );
          });
        });
        break;
      }

      case "getMasterFingerprint":
        {
          appClient
            .getMasterFingerprint()
            .then((fingerPrint) => {
              console.log("Fingerprint", fingerPrint);
              window.webContents.send("message", method, fingerPrint);
            })
            .catch((e) => {
              console.log("Fingerprint error", e);
            });
        }
        break;
      case "getXpub": {
        {
          const [path] = params as string[];
          appClient.getExtendedPubkey(path).then((fingerPrint) => {
            window.webContents.send("message", method, fingerPrint);
          });
        }
        break;
      }
      case "getAddress": {
        {
          const [fingerprint, xpub, path, descriptor, change, addressIndex] =
            params;
          const policy = `[${path}]${xpub}`.replace("m", fingerprint);
          console.log(params, policy);
          const walletPolicy = new DefaultWalletPolicy(descriptor, policy);
          appClient
            .getWalletAddress(walletPolicy, null, change, addressIndex, false)
            .then((addresss) => {
              window.webContents.send("message", method, addresss);
            })
            .catch((e) => {
              console.error("getAddress error", e);
            });
        }
        break;
      }
      case "signMessage":
        {
          const [path, message] = params;
          console.log("signMessage", { path, message });
          appClient
            .signMessage(Buffer.from(message), path)
            .then((signedMessage) => {
              window.webContents.send("message", method, signedMessage);
            });
        }
        break;

      case "signPsbt":
        {
          const [
            fingerprint,
            xpub,
            path,
            descriptor,
            sysAddress,
            amount,
            utxos,
          ] = params as [
            string,
            string,
            string,
            DefaultDescriptorTemplate,
            string,
            string,
            BlockbookUTXO[]
          ];

          console.log("signPsbt", {
            fingerprint,
            xpub,
            path,
            descriptor,
            sysAddress,
            amount,
            utxos,
          });

          const account = fromBase58(xpub);

          const loadInputs = utxos.map((utxo) => {
            const url = `${BlockbookAPIURL}/api/v2/tx/${utxo.txid}`;

            const derivationTokens = utxo.path.replace(path, "").split("/");

            const derivedAccount = derivationTokens.reduce((acc, token) => {
              const der = parseInt(token);
              if (isNaN(der)) {
                return acc;
              }
              return acc.derive(der);
            }, account);
            return fetch(url)
              .then((resp) => resp.json())
              .then((transaction: BlockbookTransaction) => {
                const vout = transaction.vout[utxo.vout];
                const input = {
                  hash: utxo.txid,
                  index: utxo.vout,
                  witnessUtxo: {
                    script: Buffer.from(vout.hex, "hex"),
                    value: parseInt(vout.value, 10),
                  },
                  bip32Derivation: [
                    {
                      masterFingerprint: Buffer.from(fingerprint, "hex"),
                      pubkey: derivedAccount.publicKey,
                      path: utxo.path,
                    },
                  ],
                };
                return input;
              });
          });

          Promise.all(loadInputs)
            .then((inputs) => {
              const bitcoinPsbt = new Psbt({
                network: SYSCOIN_NETWORK,
              });

              bitcoinPsbt.addInputs(inputs);
              console.log("bitcoinPsbt.txInputs", bitcoinPsbt.txInputs);
              bitcoinPsbt.addOutput({
                address: sysAddress,
                value: toSatoshi(amount),
              });

              const policy = `[${path}]${xpub}`.replace("m", fingerprint);
              const walletPolicy = new DefaultWalletPolicy(descriptor, policy);

              appClient
                .getWalletAddress(walletPolicy, null, 1, 0, false)
                .then((changeAddress) => {
                  const fees = toSatoshi(0.00001);

                  const total = utxos.reduce((acc, utxo) => {
                    return acc + parseInt(utxo.value);
                  }, 0);

                  bitcoinPsbt.addOutput({
                    address: changeAddress,
                    value: total - toSatoshi(amount) - fees,
                  });

                  const psbt = new PsbtV2();

                  psbt.fromBitcoinJS(bitcoinPsbt);

                  appClient
                    .signPsbt(psbt, walletPolicy, null)
                    .then((entries) => {
                      console.log("Sign psbt resp", { entries });

                      entries.forEach((entry, i) => {
                        const [index, partialSig] = entry;
                        bitcoinPsbt.updateInput(index, {
                          partialSig: [partialSig],
                        });
                      });

                      bitcoinPsbt.finalizeAllInputs();

                      const transaction = bitcoinPsbt.extractTransaction();

                      window.webContents.send("message", method, {
                        id: transaction.getId(),
                        hex: transaction.toHex(),
                      });
                    })
                    .catch((e) => console.error("SignPsbt error", { e }));
                });
            })
            .catch((e) => console.log(e));
        }
        break;

      case "registerWallet":
        {
          const [fingerprint, xpub, path, descriptor, walletName] = params;
          console.log({ params });
          const walletPolicy = new WalletPolicy(walletName, descriptor, [
            `[${path}]${xpub}`.replace("m", fingerprint),
          ]);
          appClient.registerWallet(walletPolicy).then((results) => {
            const [walletId, walletHmac] = results;
            console.log("registerWallet resp", { walletId, walletHmac });
            window.webContents.send(
              "message",
              method,
              results.map((buffer) => buffer.toString("hex"))
            );
          });
        }
        break;

      // SYS COMMANDS

      default:
        break;
    }
  });
};
