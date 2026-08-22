const display = document.getElementById('display')


function formatSeconds(sec){
    const h = Math.floor(sec/3600)
    const m = Math.floor((sec % 3600)/ 60)
    const s = sec % 60
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
}

window.keyrender.onUpdateTime((remaining) =>{
    display.textContent = formatSeconds(remaining)
})