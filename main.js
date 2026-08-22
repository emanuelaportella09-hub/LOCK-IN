
const { app, BrowserWindow, Menu, ipcMain,screen } = require('electron')
const path = require('path')
const fs = require('fs')
const activeWin = require('active-win')
const { time } = require('console')

let finestra
let BlackListWindow
let FinishWindow
let SettingWindow
let Bstate = false
let warning
let blacklist = []
let blacklist1 = []
let timerSeconds = 300
let timerMode = true
const dataPath = path.join(app.getPath('userData'), 'data.json')



ipcMain.on('set-timer', (event, seconds) =>{
  timerSeconds = seconds
  saveData()
})

ipcMain.on('set-timer-mode',(event, mode) =>{
  timerMode = mode
  saveData()
})


app.whenReady().then(() => {
  finestra = new BrowserWindow({
    icon:path.join(__dirname,'images', 'lock.png'),
    webPreferences: {
    preload: path.join(__dirname, 'onboarding', 'preload.js')
  }
  })

 finestra.loadFile('./onboarding/intro.html')
 Menu.setApplicationMenu(null)
 loadData()
})

app.on('window-all-closed', () => {
  app.quit()
})





ipcMain.on('open-blackList', () => {
  BlackListWindow = new BrowserWindow({
    icon:path.join(__dirname,'images', 'lock.png'),
    webPreferences :{
      preload : path.join(__dirname,'blackList' ,'b-preload.js')
    }
    
  })
  BlackListWindow.loadFile('./blackList/blacklist.html')
  //BlackListWindow.webContents.openDevTools()
  finestra.close()
})

ipcMain.on('open-setting', () => {
  
  SettingWindow = new BrowserWindow({
    icon:path.join(__dirname,'images', 'lock.png'),
    webPreferences:{
      preload : path.join(__dirname,'settings' ,'s-preload.js')
    }
  })
  SettingWindow.loadFile('./settings/settings.html')
  finestra.close()
})

ipcMain.on('start-session' , () =>{


const intervalId = setInterval(() => {

  activeWin().then((result) => {
    const isBlocked = blacklist.some(site => result.title.toLowerCase().includes(site))
    const isBlockedApp = blacklist1.some(app => result.owner.name.toLowerCase().includes(app))
    const shouldwarn = isBlocked || isBlockedApp

    if ( shouldwarn && Bstate == false) {
  
      Bstate = true


      warning = new BrowserWindow({
        transparent : true,
        frame : false,
        alwaysOnTop : true,
        fullscreen : true,
        skipTaskbar : true,

      })

      warning.loadFile('./warning/overlay.html')
      warning.setIgnoreMouseEvents(true)

    }
    else if(!shouldwarn &&   Bstate == true){
  
      warning.close()
      Bstate = false
 
    }

  })

}, 2000 )

if(timerMode){
  let remaining = timerSeconds



  const{ width } = screen.getPrimaryDisplay().workAreaSize
  const timerDisplay = new BrowserWindow({
    width: 150,
    height:60,
    x: width-160,
    y: 10,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences:{
      preload: path.join(__dirname, 'timer', 't-preload.js')
    }
  })

  timerDisplay.loadFile('./timer/timer-display.html')

  const countdownId = setInterval(() => {

    remaining -=1
    timerDisplay.webContents.send('update-time', remaining)
    if (remaining<= 0){

      clearInterval(countdownId)

    }
  }, 1000)
  setTimeout(()=>{

    clearInterval(intervalId)

    if(warning && !warning.isDestroyed()){
      warning.close()
    } 
      FinishWindow = new BrowserWindow({
        transparent : true,
        frame : false,
        alwaysOnTop : true,
        fullscreen : true,

      })
      
       FinishWindow.loadFile('./warning/finished-session.html')
       FinishWindow.setIgnoreMouseEvents(true)
       setTimeout(() => {
        FinishWindow.close()
        timerDisplay.close()
       }, 3000)


  }, timerSeconds *1000)
}

})





ipcMain.on('remove-site' , (event , site) => {

blacklist = blacklist.filter((s) => s !== site)

saveData()
})

ipcMain.on('remove-app',(event, app) => {


blacklist1 = blacklist1.filter((s) => s !== app)


saveData()
})

ipcMain.on('add-site' , (event, site) => {

  blacklist.push(site)
  
  saveData()
})

ipcMain.on('add-app' , (event, app) =>{

  blacklist1.push(app)
  

saveData()


})


function saveData(){
  const data = {
    sites: blacklist, apps: blacklist1 , time : timerSeconds, mode: timerMode
  }
  fs.writeFileSync(dataPath, JSON.stringify(data))
}

function loadData(){
  if( fs.existsSync(dataPath)){
    const raw = fs.readFileSync(dataPath, 'utf-8')
    const data = JSON.parse(raw)
    blacklist = data.sites || []
    blacklist1 = data.apps || []
    timerSeconds= data.time || 300
    timerMode = data.mode !== undefined ? data.mode : true
  }
}




ipcMain.handle('get-sites' , () => {


return blacklist

})

ipcMain.handle('get-apps' , () => {

return blacklist1

})

ipcMain.handle('get-timer-settings',() =>{
  return { mode: timerMode, seconds: timerSeconds}
}) 













ipcMain.on('back' , (event) => {
  const senderWindow =  BrowserWindow.fromWebContents(event.sender)
  senderWindow.close()
  finestra = new BrowserWindow({
      icon:path.join(__dirname,'images', 'lock.png'),
      webPreferences: {
      preload: path.join(__dirname, 'onboarding', 'preload.js')
    }
    })
  
  finestra.loadFile('./onboarding/intro.html')

  


})

