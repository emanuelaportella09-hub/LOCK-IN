const{contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('warningAPI', {
    getSavedAudio: () => ipcRenderer.invoke('get-saved-audio')
})