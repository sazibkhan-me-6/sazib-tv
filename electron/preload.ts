import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('sazibApi', {
  openGoogleLogin: () => ipcRenderer.invoke('open-google-login'),
  openOttWindow: (data: { url: string; title?: string }) => ipcRenderer.invoke('open-ott-window', data),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url)
});
