const images = ['cat.gif','cutedog.gif','locked.jpg','demostration.jpg' ]

function chosenimage(){
const randomIndex = Math.floor(Math.random() * images.length)
let Image = images[randomIndex]
Image = "../images/" + Image

    return Image
}
 

document.getElementById('randomImg').src = chosenimage()



document.getElementById('startBtn').addEventListener('click', () => {

window.keyrender.startSession() 

})

document.getElementById('blackListBtn').addEventListener('click', () => {

window.keyrender.openBlackList() 

})

document.getElementById('settingBtn').addEventListener('click', () => {

window.keyrender.openSetting() 

})



