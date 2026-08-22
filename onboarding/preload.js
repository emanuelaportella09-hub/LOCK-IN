
const {contextBridge , ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('keyrender', {

openBlackList : () => ipcRenderer.send('open-blackList'),
openSetting : () => ipcRenderer.send('open-setting'),
startSession  : () => ipcRenderer.send('start-session')

})



