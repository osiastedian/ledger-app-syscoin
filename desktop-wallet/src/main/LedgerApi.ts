import axios from "axios";
import SpeculosTransport from "@ledgerhq/hw-transport-node-speculos-http";
import HIDTransport from "@ledgerhq/hw-transport-node-hid";
import { DisconnectedDevice } from "@ledgerhq/errors";
import { listen } from "@ledgerhq/logs";
import {
  AppClient,
  DefaultWalletPolicy,
  PsbtV2,
  WalletPolicy,
} from "../../../bitcoin_client_js/build/main";
import { BrowserWindow, ipcMain } from "electron";
import { Psbt } from "bitcoinjs-lib";
import sjs from "syscoinjs-lib";
import { fromBase58 } from "bip32";

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
  // connectToLedger()
  connectToLedgerDevice().then((transport) => {
    isConnected = true;
    appClient = new AppClient(transport);
  });

  ipcMain.handle("request", (sender, method, params) => {
    switch (method) {
      case "checkConnection":
        {
          window.webContents.send("message", "connected", isConnected);
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
          const [fingerprint, xpub, path, descriptor, sysAddress] = params;

          console.log("signPsbt", {
            fingerprint,
            xpub,
            path,
            descriptor,
            sysAddress,
          });

          const bitcoinPsbt = new Psbt({
            network: syscoinNetwork,
          });

          const account = fromBase58(xpub);
          // Syscoin Mainnet TX
          // https://blockbook.elint.services/tx/2568120c6d413a97d66c2225707b47f68adbb710e3b128851bbdf05adb2f182b
          bitcoinPsbt.addInput({
            hash: "2568120c6d413a97d66c2225707b47f68adbb710e3b128851bbdf05adb2f182b",
            index: 0,

            witnessUtxo: {
              //transaction.outs[0]
              script: Buffer.from(
                "0014668981f7a7874d45047ca340fb21b83be3054ee6",
                "hex"
              ),
              value: 887_000,
            },
            bip32Derivation: [
              {
                masterFingerprint: Buffer.from(fingerprint, "hex"),
                pubkey: account.derive(0).derive(0).publicKey,
                path: `${path}/0/0`,
              },
            ],
          });

          bitcoinPsbt.addOutput({
            address: sysAddress,
            value: 880_000, //0.00880,
          });

          const policy = `[${path}]${xpub}`.replace("m", fingerprint);
          const walletPolicy = new DefaultWalletPolicy(descriptor, policy);

          appClient
            .getWalletAddress(walletPolicy, null, 1, 0, false)
            .then((changeAddress) => {
              bitcoinPsbt.addOutput({
                address: changeAddress,
                value: 1_000,
              });
              const psbt = new PsbtV2();

              psbt.fromBitcoinJS(bitcoinPsbt);

              appClient
                .signPsbt(psbt, walletPolicy, null)
                .then((entries) => {
                  console.log("Sign psbt resp", { entries });
                  window.webContents.send(
                    "message",
                    method,
                    entries.map((params) => [
                      params[0],
                      params[1].toString("base64"),
                      params[2].toString("base64"),
                    ])
                  );
                })
                .catch((e) => console.error("SignPsbt error", { e }));
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
      default:
        break;
    }
  });
};
