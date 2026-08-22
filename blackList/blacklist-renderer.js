
const input = document.getElementById('url') 
const appInput  = document.getElementById('app')

function createListItem(text, onRemove){
    const itemDiv = document.createElement('div')
    itemDiv.className = 'list-item'

    const label = document.createElement('span')
    label.textContent = text

    const deleteBtn = document.createElement('button')
    deleteBtn.textContent = 'x'
    deleteBtn.style.color = 'red'
    deleteBtn.style.fontWeight = 'bold'
    deleteBtn.addEventListener('click', () => {
        onRemove()
        itemDiv.remove()
    })

    itemDiv.appendChild(label)
    itemDiv.appendChild(deleteBtn)
    return itemDiv

}




window.addEventListener('DOMContentLoaded' , () => {

    window.keyrender.getSites().then((sites) => {

        sites.forEach(site => {
            const item = createListItem(site, () => window.keyrender.removeSite(site))
            document.getElementById('sitesList').appendChild(item)
        });


    })

    window.keyrender.getApps().then((apps) =>{
        
        apps.forEach(app =>{
            const item = createListItem(app, () => window.keyrender.removeApp(app))
            document.getElementById('appsList').appendChild(item)
        });

    })

})



input.addEventListener('keydown', (e) => {

    if (e.key == 'Enter'){
        if(input.checkValidity()){
            e.preventDefault()
            const site = document.getElementById('url').value
            const cleanSite = site
                .replace('https://' , '')
                .replace('http://', '')
                .replace('www.' ,'')
                .split('.')[0]
                .split('/')[0]
                const row = document.createElement('tr')
                const cell = document.createElement('td')
        
            window.keyrender.addSite(cleanSite)
            const item = createListItem(cleanSite , () => window.keyrender.removeSite(cleanSite))
            document.getElementById('sitesList').appendChild(item)
            input.value = ''
       
        }

    }

})



document.getElementById('backBtn').addEventListener('click' , () => {

window.keyrender.back()


})


appInput.addEventListener('keydown', (e)=>{

    if (e.key == 'Enter'){

        if(appInput.checkValidity()){
            e.preventDefault()
            const app = appInput.value
            const cleanApp = app.replace('.exe','')
    
            window.keyrender.addApp(cleanApp)
            const item = createListItem(cleanApp , () => window.keyrender.removeApp(cleanApp))
            document.getElementById('appsList').appendChild(item)
            appInput.value =''


        }


    }





})