import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  onMenuNewTask: (callback: () => void) => {
    ipcRenderer.on('menu-new-task', callback);
  },
});

