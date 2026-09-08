let totalSeconds = 300
let pomodoroShortSeconds= 300
let pomodoroLongSeconds = 900

const timeInput = document.getElementById('timeInput')
const timerContent = document.getElementById('timerContent')
const tabTimer = document.getElementById('tabTimer')
const tabNoTimer = document.getElementById('tabNoTimer')
const currentAudioName = document.getElementById('currentAudioName')
const removeAudioBtn = document.getElementById('btnX')
const pomodoroCheckbox = document.getElementById('pomodoroCheckbox')
const pomodoroCard = document.getElementById('pomodoroCard')
const tabShortBreak = document.getElementById('tabShortBreak')
const tabLongBreak = document.getElementById('tabLongBreak')
const pomodoroTimeInput = document.getElementById('pomodoroTimeInput')
const pomodoroWrapper = document.getElementById('pomodoroWrapper')
const pomodoroTabs = document.getElementById('pomodoroTabs')
const howItWorks = document.getElementById('howItWorks')
const youtubeInput = document.getElementById('youtubeInput')


function setTimerMode(enabled){
    if(enabled){
        tabTimer.classList.add('active');
        tabNoTimer.classList.remove('active');
        timeInput.disabled =false;
        timerContent.classList.remove('disabled');
        window.keyrender.setTimerMode(enabled)
        pomodoroWrapper.style.display = 'block'
    }
    else{
        tabNoTimer.classList.add('active');
        tabTimer.classList.remove('active')
        timeInput.disabled = true;
        timerContent.classList.add('disabled')
        window.keyrender.setTimerMode(enabled)
        pomodoroWrapper.style.display = 'none'
    }
}

function parseTimeToSeconds(timeStr){
    const parts = timeStr.split(':').map(Number)
    if (parts.length === 3) return (parts[0]*3600)+(parts[1]*60)+ parts[2]
    if (parts.length === 2) return (parts[0]*60)+parts[1]
    return 0
}

function formatSeconds(sec){
    const h = Math.floor(sec/3600)
    const m = Math.floor((sec % 3600)/60)
    const s = sec % 60
    return[h,m,s].map(v=> String(v).padStart(2, '0')).join(':')
}

timeInput.addEventListener('change', () =>{
    totalSeconds = parseTimeToSeconds(timeInput.value);
    timeInput.value = formatSeconds(totalSeconds)
    window.keyrender.setTimer(totalSeconds)
})

function addSeconds(sec){
    totalSeconds += sec
    timeInput.value = formatSeconds(totalSeconds)
    window.keyrender.setTimer(totalSeconds)
}


document.getElementById('backBtn').addEventListener('click' , () => {

window.keyrender.back()


})

window.addEventListener('DOMContentLoaded' , () => {
    window.keyrender.getTimerSettings().then((settings) =>{
        setTimerMode(settings.mode)
        timeInput.value = formatSeconds(settings.seconds)
        totalSeconds = settings.seconds
        pomodoroShortSeconds = settings.pomodoroShort
        pomodoroLongSeconds = settings.pomodoroLong

        pomodoroCheckbox.checked = settings.pomodoroEnabled
        pomodoroTabs.style.display = settings.pomodoroEnabled ? 'flex' : 'none'
        pomodoroCard.style.display = settings.pomodoroEnabled ? 'block' : 'none'

        if(settings.pomodoroActiveTab === 'long'){
            tabLongBreak.classList.add('active')
            tabShortBreak.classList.remove('active')
            pomodoroTimeInput.value = formatSeconds(pomodoroLongSeconds)

        }else{
            tabShortBreak.classList.add('active')
            tabLongBreak.classList.remove('active')
            pomodoroTimeInput.value = formatSeconds(pomodoroShortSeconds)

        }


        if(settings.youtubeUrl){
            youtubeInput.value = settings.youtubeUrl
        }






    })


    refreshAudioLabel()

})


async function refreshAudioLabel() {
    const savedFile = await window.keyrender.getSavedAudio()
    currentAudioName.textContent = savedFile
        ? `File: ${savedFile}`
        : 'No file selected'

        removeAudioBtn.style.display = savedFile ? 'inline-block' : 'none'
}

document.getElementById('song').addEventListener('change', async (e) =>{
    const file = e.target.files[0]
    if(!file) return;
    const arrayBuffer = await file.arrayBuffer()
    await window.keyrender.saveAudioFile(file.name,arrayBuffer)
    refreshAudioLabel() 

})

removeAudioBtn.addEventListener('click', async () => {
    await window.keyrender.removeAudioFile()
    document.getElementById('song').value =''
    refreshAudioLabel()

})

pomodoroCheckbox.addEventListener('change', () =>{
    pomodoroTabs.style.display = pomodoroCheckbox.checked ? 'flex' : 'none'
    pomodoroCard.style.display = pomodoroCheckbox.checked ? 'block' : 'none'
    window.keyrender.setPomodoroEnabled(pomodoroCheckbox.checked)
})


tabShortBreak.addEventListener('click', () =>{

    tabShortBreak.classList.add('active')
    tabLongBreak.classList.remove('active')
    pomodoroTimeInput.value = formatSeconds(pomodoroShortSeconds)
    window.keyrender.setPomodoroActiveTab('short')
})

tabLongBreak.addEventListener('click', () =>{

    tabLongBreak.classList.add('active')
    tabShortBreak.classList.remove('active')
    pomodoroTimeInput.value = formatSeconds(pomodoroLongSeconds)
    window.keyrender.setPomodoroActiveTab('long')


})

pomodoroTimeInput.addEventListener('change', () =>{
    const seconds = parseTimeToSeconds(pomodoroTimeInput.value)
    pomodoroTimeInput.value = formatSeconds(seconds)

    if(tabShortBreak.classList.contains('active')){
        pomodoroShortSeconds = seconds
        window.keyrender.setPomodoroShort(seconds)
    }else{
        pomodoroLongSeconds =seconds
        window.keyrender.setPomodoroLong(seconds)
    }




})


howItWorks.addEventListener('click', (e)=>{

    e.stopPropagation()
    e.preventDefault()
    window.keyrender.openGuide()





})

youtubeInput.addEventListener('change', () =>{
    window.keyrender.setYoutubeUrl(youtubeInput.value)
})