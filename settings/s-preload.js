const {contextBridge , ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('keyrender',
{


back : () => ipcRenderer.send('back'),
setTimer: (seconds) => ipcRenderer.send('set-timer', seconds),
setTimerMode :  (mode) => ipcRenderer.send('set-timer-mode', mode),
getTimerSettings: () => ipcRenderer.invoke('get-timer-settings'),
saveAudioFile: (fileName, arrayBuffer) => ipcRenderer.invoke('save-audio-file', fileName, arrayBuffer),
getSavedAudio: () => ipcRenderer.invoke('get-saved-audio'),
removeAudioFile: () => ipcRenderer.invoke('remove-audio-file'),
setPomodoroEnabled: (enabled) => ipcRenderer.send('set-pomodoro-enabled', enabled),
setPomodoroShort : (seconds) => ipcRenderer.send('set-pomodoro-short', seconds),
setPomodoroLong: (seconds) => ipcRenderer.send('set-pomodoro-long', seconds),
setPomodoroActiveTab: (tab) => ipcRenderer.send('set-pomodoro-active-tab', tab),
openGuide: ()=> ipcRenderer.send('open-guide'),
setYoutubeUrl: (url) => ipcRenderer.send('set-youtube-url', url)


})