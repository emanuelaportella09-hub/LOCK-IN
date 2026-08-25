
const { app, BrowserWindow, Menu, ipcMain,screen,dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const activeWin = require('active-win')
const { time, error } = require('console')
const psl = require('psl')

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
let currentIntervalId = null
let currentCountdownId = null
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

ipcMain.on('start-session' , async () =>{
  
  const result = await dialog.showMessageBox({
    type:'question',
    buttons:['Start', 'Cancel'],
    title: 'Start Session',
    message:'Are you ready to start your focus session?'
  })
  if (result.response!== 0){
    return
  }
  if(currentIntervalId) clearInterval(currentIntervalId)
  if(currentCountdownId) clearInterval(currentCountdownId)

  
  currentIntervalId = setInterval(() => {

    activeWin().then((result) => {
      if(!result){
        console.log('active-win ha restituito undefined')
        return

      } 

      const isBlocked = blacklist.some(site => result.title.toLowerCase().replace(/\s+/g,'').replace(/-/g, '').includes(site))
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
        warning.setIgnoreMouseEvents(true)
        warning.focus()
        warning.setAlwaysOnTop(true,'screen-saver')
        warning.loadFile('./warning/overlay.html')
        warning.setIgnoreMouseEvents(true)

      }
      else if(!shouldwarn &&   Bstate == true){
    
        warning.close()
        Bstate = false
  
      }

    }).catch((error) =>{
      dialog.showMessageBox({
        type: 'error',
        title:'Detection Error',
        message:'Something went wrong while checking active window',
        detail:error.message
      })

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

    currentCountdownId = setInterval(() => {

      remaining -=1
      timerDisplay.webContents.send('update-time', remaining)
      if (remaining<= 0){

        clearInterval(currentCountdownId)

      }
    }, 1000)
    setTimeout(()=>{

      clearInterval(currentIntervalId)

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


ipcMain.handle('clean-up-url', (event, url) =>{
  const parced = psl.parse(url.replace('https://' , '')
                               .replace('http://', '')
                               .split('/')[0])
  console.log(parced.sld)
  return parced.sld

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

