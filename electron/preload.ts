import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
  onMaximizedChanged: (callback: (maximized: boolean) => void) => {
    ipcRenderer.on("window:maximized-changed", (_event, value) => callback(value));
  },
  platform: process.platform,
});
