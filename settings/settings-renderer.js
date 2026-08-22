let totalSeconds = 300
const timeInput = document.getElementById('timeInput')
const timerContent = document.getElementById('timerContent')
const tabTimer = document.getElementById('tabTimer')
const tabNoTimer = document.getElementById('tabNoTimer')

function setTimerMode(enabled){
    if(enabled){
        tabTimer.classList.add('active');
        tabNoTimer.classList.remove('active');
        timeInput.disabled =false;
        timerContent.classList.remove('disabled');
        window.keyrender.setTimerMode(enabled)
    }
    else{
        tabNoTimer.classList.add('active');
        tabTimer.classList.remove('active')
        timeInput.disabled = true;
        timerContent.classList.add('disabled')
        window.keyrender.setTimerMode(enabled)
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


    })




})