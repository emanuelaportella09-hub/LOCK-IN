const {contextBridge , ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('keyrender',
{
addSite : (site) => ipcRenderer.send('add-site', site ),
addApp : (app) => ipcRenderer.send('add-app', app),
back : () => ipcRenderer.send('back'),
getSites: () => ipcRenderer.invoke('get-sites'),
getApps: () => ipcRenderer.invoke('get-apps'),
removeSite: (site) => ipcRenderer.send('remove-site' , site),
removeApp: (app) =>  ipcRenderer.send('remove-app' , app),
CleanUpUrl: (url) => ipcRenderer.invoke('clean-up-url', url),
})


