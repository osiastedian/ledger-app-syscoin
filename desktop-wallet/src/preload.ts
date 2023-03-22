// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// const client = new AppClient()

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("LEDGER_API", {
  onMessage: (callback: () => void) => ipcRenderer.on("message", callback),
  onceMessage: (callback: () => void) => ipcRenderer.once("message", callback),
  request: (message: string, ...args: any[]) => {
    ipcRenderer.invoke("request", message, args);
  },
});
