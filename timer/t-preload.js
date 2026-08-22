const {contextBridge , ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('keyrender',{


onUpdateTime : (callback) => ipcRenderer.on('update-time' ,(event,remaining) => callback (remaining))



})