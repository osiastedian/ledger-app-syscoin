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

const opts = {
  baseURL: "http://localhost:5002",
};
const axiosInstance = axios.create(opts);
const speculosTransport = new SpeculosTransport(axiosInstance, opts);

let isConnected = false;

let appClient: AppClient;

const BlockbookAPIURL = "https://blockbook.elint.services/";

const syscoinNetwork = {
  messagePrefix: "\x18Syscoin Signed Message:\n",
  bech32: "sys",
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x3f,
  scriptHash: 0x05,
  wif: 0x80,
};

const syscoin = new sjs.syscoin(null, BlockbookAPIURL, syscoinNetwork);

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
    return connectToLedgerDevice().then((transport) => {
      isConnected = true;
      appClient = new AppClient(transport);
    });
  };

  connect();

  ipcMain.handle("request", (sender, method, params) => {
    switch (method) {
      case "checkConnection":
        {
          connect().then(() => {
            window.webContents.send("message", "connected", isConnected);
          });
        }
        break;

      case "getMasterFingerprint":
        {
          appClient
            .getMasterFingerprint()
            .then((fingerPrint) => {
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
          console.log("getXpub", { path });
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
          const walletPolicy = new DefaultWalletPolicy(descriptor, policy);
          appClient
            .getWalletAddress(walletPolicy, null, change, addressIndex, false)
            .then((addresss) => {
              window.webContents.send("message", method, addresss);
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

          Promise.all(loadInputs).then((inputs) => {
            const bitcoinPsbt = new Psbt({
              network: syscoinNetwork,
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
                      const [index, pubkeySign, signature] = entry;

                      if (i === entries.length - 1) {
                        psbt.setInputFinalScriptsig(index, signature);
                      } else {
                        psbt.setInputPartialSig(index, pubkeySign, signature);
                      }
                    });

                    const transaction = Transaction.fromBuffer(
                      psbt.serialize()
                    );

                    console.log({
                      inputs: transaction.ins,
                      outputs: transaction.outs,
                      hext: transaction.toHex(),
                    });

                    window.webContents.send(
                      "message",
                      method,
                      psbt.serialize().toString("hex")
                    );
                  })
                  .catch((e) => console.error("SignPsbt error", { e }));
              });
          });
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
