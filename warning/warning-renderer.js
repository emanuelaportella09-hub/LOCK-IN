window.addEventListener('DOMContentLoaded',async() =>{
    const fileName = await window.warningAPI.getSavedAudio()
    if(fileName){
        const audio = document.getElementById('warningSound')
        audio.src = `../sound/${fileName}`
        audio.play().catch(err => console.error('Error', err))
    }
})