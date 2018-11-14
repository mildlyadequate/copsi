// Electron
const electron = require('electron');
const {ipcRenderer,shell,Menu} = electron;

const chatDiv = document.getElementById('chatDiv');
const chatContainer = document.getElementById('chatContainer');

const txtMessageInput = document.getElementById('message-input');

// IPC 

ipcRenderer.on('message:received',function(e,msg){
    appendChatMessage(msg);
});

// FUNCTIONS

function test(){
    if(txtMessageInput.value.length>0){
        var msg = txtMessageInput.value;
        ipcRenderer.send('message:all:send',msg);
    }
}

function appendChatMessage(data){

    var usr = data[0];
    var msg = data[1];

    var textTag = document.createElement('p');
    textTag.innerHTML = '<span class="red-text">'+usr.nickname+'</span>'+'</br>'+msg;

    chatDiv.appendChild(textTag);
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

