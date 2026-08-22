const {contextBridge , ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('keyrender',
{


back : () => ipcRenderer.send('back'),
setTimer: (seconds) => ipcRenderer.send('set-timer', seconds),
setTimerMode :  (mode) => ipcRenderer.send('set-timer-mode', mode),
getTimerSettings: () => ipcRenderer.invoke('get-timer-settings')
})