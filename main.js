
const { app, BrowserWindow, Menu, ipcMain,screen,dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const activeWin = require('active-win')
const { time, error } = require('console')
const psl = require('psl')
const { arrayBuffer } = require('stream/consumers')

let youtubeUrl = ''
let youtubeWin = null
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
let currentTimeoutId = null
let currenttimerDisplay = null
let pomodoroEnabled = false
let pomodoroShort = 300
let pomodoroLong = 900
let pomodoroActiveTab = 'true'
let currentStepType ='work'
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

ipcMain.on('start-session' , async () => {
  
  if(youtubeWin && !youtubeWin.isDestroyed()){
    youtubeWin.close()
  }



  const result = await dialog.showMessageBox({
    type:'question',
    buttons:['Start', 'Cancel'],
    title: 'Start Session',
    message:'Are you ready to start your focus session?'
  })
  if (result.response !== 0) return

  if(currentIntervalId) clearInterval(currentIntervalId)
  if(currentCountdownId) clearInterval(currentCountdownId)
  if(currentTimeoutId) clearTimeout(currentTimeoutId)
  if(currenttimerDisplay && !currenttimerDisplay.isDestroyed()){
    currenttimerDisplay.close()
  }

  if(warning && !warning.isDestroyed()){
    warning.close()
  } 

  Bstate = false
  currentStepType = 'work'

  // Intervallo controllo blacklist
  currentIntervalId = setInterval(() => {

    if(currentStepType === 'break'){
      if(Bstate && warning && !warning.isDestroyed()){
        warning.close()
        Bstate = false
      }
      return      
    }

    activeWin().then((result) => {
      if(!result) return 

      const isBlocked = blacklist.some(site => result.title.toLowerCase().replace(/\s+/g,'').replace(/-/g, '').includes(site))
      const isBlockedApp = blacklist1.some(app => result.owner.name.toLowerCase().includes(app))
      const shouldwarn = isBlocked || isBlockedApp

      if (shouldwarn && Bstate == false) {
        Bstate = true

        warning = new BrowserWindow({
          transparent : true,
          frame : false,
          alwaysOnTop : true,
          fullscreen : true,
          skipTaskbar : true,
          webPreferences:{
            preload: path.join(__dirname,'warning','w-preload.js')
          }
        })
        warning.setIgnoreMouseEvents(true)
        warning.focus()
        warning.setAlwaysOnTop(true,'screen-saver')
        warning.loadFile('./warning/overlay.html')
      }
      else if(!shouldwarn && Bstate == true){
        if(warning && !warning.isDestroyed()){
          warning.close()
        }
        Bstate = false
      }

    }).catch((error) => {
      dialog.showMessageBox({
        type: 'error',
        title:'Detection Error',
        message:'Something went wrong while checking active window',
        detail:error.message
      })
    })

  }, 2000)

  if(timerMode){
    const { width } = screen.getPrimaryDisplay().workAreaSize
    const timerDisplay = new BrowserWindow({
      width: 320,
      height: 140,
      x: width - 340,
      y: 20,
      frame: false,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      webPreferences:{
        preload: path.join(__dirname, 'timer', 't-preload.js')
      }
    })
    currenttimerDisplay = timerDisplay
    timerDisplay.loadFile('./timer/timer-display.html')

    let step = []
    if(!pomodoroEnabled){
      step.push({ type: 'work', duration: timerSeconds, label: 'Work' })
    } else {
      const numBlocks = Math.max(1, Math.round(timerSeconds / 1500))
      const workBlockDuration = Math.floor(timerSeconds / numBlocks)

      for(let i = 1; i <= numBlocks; i++){
        // Corretto: backtick per le variabili
        step.push({ type: 'work', duration: workBlockDuration, label: `Work ${i}/${numBlocks}` })
        
        if(i < numBlocks){
          step.push({ type: 'break', duration: pomodoroShort, label: 'Short Pause' })
        } else {
          // Corretto: type invece di step
          step.push({ type: 'break', duration: pomodoroLong, label: 'Long Pause' })
        }
      }
    }

    let currentStepIndex = 0
    let remaining = step[0].duration
    currentStepType = step[0].type

    handleYoutube(currentStepType)
    
    currentCountdownId = setInterval(() => {
      remaining -= 1

      if(!timerDisplay.isDestroyed()){
        timerDisplay.webContents.send('update-time', {
          remaining: remaining,
          label: step[currentStepIndex].label,
          type: step[currentStepIndex].type
        })
      }

      if (remaining <= 0){
        currentStepIndex++

        if(currentStepIndex < step.length){
          remaining = step[currentStepIndex].duration
          currentStepType = step[currentStepIndex].type

          handleYoutube(currentStepType)

          if(currentStepType === 'break' && warning && !warning.isDestroyed()){
            warning.close()
            Bstate = false
          }
        } else {

          if(youtubeWin && !youtubeWin.isDestroyed()){
            youtubeWin.close()
          }
          
          clearInterval(currentCountdownId)
          clearInterval(currentIntervalId)

          if(warning && !warning.isDestroyed()) {
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
            if(FinishWindow && !FinishWindow.isDestroyed()){
              FinishWindow.close()
            }
            if(timerDisplay && !timerDisplay.isDestroyed()){
              timerDisplay.close()
            }
          }, 3000)
        }
      }
    }, 1000)
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
    sites: blacklist,
    apps: blacklist1 , 
    time : timerSeconds, 
    mode: timerMode,
    pomodoroEnabled:pomodoroEnabled,
    pomodoroShort: pomodoroShort,
    pomodoroLong:pomodoroLong,
    pomodoroActiveTab: pomodoroActiveTab,
    youtubeUrl: youtubeUrl
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
    pomodoroEnabled = data.pomodoroEnabled || false
    pomodoroShort = data.pomodoroShort || 300
    pomodoroLong = data.pomodoroLong || 900
    pomodoroActiveTab = data.pomodoroActiveTab || 'short'
    youtubeUrl = data.youtubeUrl || ''
  }
}

function handleYoutube(type){
  if(type === 'break' && youtubeUrl && youtubeUrl.trim() !== ''){
    if(!youtubeWin || youtubeWin.isDestroyed()){
      youtubeWin = new BrowserWindow({
        width: 1000,
        height: 600,
        autoHideMenuBar: true,
        webPreferences:{
          autoplayPolicy: 'no-user-gesture-required'
        }
      })

      
      const chromeUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

      youtubeWin.loadURL(formatYoutubeUrl(youtubeUrl), {
        userAgent: chromeUserAgent,
      })
    }
  }else{
    if(youtubeWin && !youtubeWin.isDestroyed()){
      youtubeWin.close()
      youtubeWin = null
    }
  }
}


function formatYoutubeUrl(url){
  if(!url){
    return''
  }
  let videoId = ''
  if(url.includes('v=')){
    videoId = url.split('v=')[1].split('&')[0]
  }else if( url.includes('youtu.be/')){
    videoId = url.split('youtu.be/')[1].split('?')[0]
  }

  if(videoId){
    return `https://www.youtube.com/watch?v=${videoId}`
  }
  return url
}


ipcMain.handle('get-sites' , () => {


return blacklist

})

ipcMain.handle('get-apps' , () => {

return blacklist1

})

ipcMain.handle('get-timer-settings',() =>{
  return { mode: timerMode, seconds: timerSeconds,
    pomodoroEnabled: pomodoroEnabled,
    pomodoroShort: pomodoroShort,
    pomodoroLong: pomodoroLong,
    pomodoroActiveTab:pomodoroActiveTab,
    youtubeUrl: youtubeUrl
  }
}) 

ipcMain.handle('save-audio-file', async(event,fileName,arrayBuffer) =>{

  const folderPath =path.join(__dirname, 'sound')
if(!fs.existsSync(folderPath)){
  fs.mkdirSync(folderPath,{recursive: true})
}else{
  const existingFiles = fs.readdirSync(folderPath)
  for(const existingFile of existingFiles){
    const existingFilePath = path.join(folderPath, existingFile)

    if (fs.statSync(existingFilePath).isFile()){
      fs.unlinkSync(existingFilePath)
    }
  }
}

const filePath =path.join(folderPath,fileName)
fs.writeFileSync(filePath,Buffer.from(arrayBuffer))
return filePath

})

ipcMain.handle('get-saved-audio', () => {

  const folderPath = path.join(__dirname,'sound')

  if(!fs.existsSync(folderPath)){
    return null
  }
  const files = fs.readdirSync(folderPath).filter(f =>
  
  fs.statSync(path.join(folderPath, f)).isFile()
  )
    


    return files.length > 0 ? files[0] : null
});

ipcMain.handle('remove-audio-file', () => {
  const folderPath = path.join(__dirname,'sound')
  if(!fs.existsSync(folderPath)){
    return true
  }
  const files = fs.readdirSync(folderPath).filter(f =>
    fs.statSync(path.join(folderPath, f)).isFile()
  )

  for (const f of files) {
    fs.unlinkSync(path.join(folderPath, f))
  }

  return true


})



ipcMain.on('set-pomodoro-enabled', (event, enabled) =>{
  pomodoroEnabled =enabled
  saveData()

})

ipcMain.on('set-pomodoro-short', (event, seconds) =>{
  pomodoroShort =seconds
  saveData()
})

ipcMain.on('set-pomodoro-long', (event,seconds) =>{

  pomodoroLong = seconds
  saveData()

})

ipcMain.on('set-pomodoro-active-tab', (event, tab) =>{

  pomodoroActiveTab =tab
  saveData()
})

ipcMain.on('set-youtube-url', (event, url) =>{
  youtubeUrl = url
  saveData()
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


ipcMain.on('open-guide', ()=>{
  const guidePath = path.join(__dirname, 'guidepomodorotimer.txt')
  shell.openPath(guidePath)
})
