const display = document.getElementById('display')
const label = document.getElementById('label')

function formatSeconds(sec){
    const h = Math.floor(sec/3600)
    const m = Math.floor((sec % 3600)/ 60)
    const s = sec % 60
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
}

window.keyrender.onUpdateTime((data) =>{
    if(typeof data === 'object'){
        if(label){
            label.textContent = data.label || ''
        }
        display.textContent = formatSeconds(data.remaining)
    }else{
        if(label){
            label.textContent = 'Work'
        }
          display.textContent = formatSeconds(data)
    }
    
})