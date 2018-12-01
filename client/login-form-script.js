// Electron
const electron = require('electron');
const { ipcRenderer, shell, Menu } = electron;

// Inputs
var tfUsername = document.getElementById('tfUsername');
var tfPassword = document.getElementById('tfPassword');
// Controls
var ctUsername = document.getElementById('controlUsername');
var ctPassword = document.getElementById('controlPassword');

/*
//////////////////////////// Html Events ////////////////////////////////////////
*/

function handleLogin() {
    ipcRenderer.send('user:login',[tfUsername.value, tfPassword.value]);
}

/*
//////////////////////////// IPC Renderer ////////////////////////////////////////
*/

ipcRenderer.on('user:wrong-login:username',function(e,msg){
    addErrorMsg('Der eingegebene Benutzername existiert nicht.',0);
});

ipcRenderer.on('user:wrong-login:duplicate',function(e,msg){
    addErrorMsg('Es gibt mehrere Accounts mit diesem Benutzernamen. Wenden sie sich an einen Administrator.',0);
});

ipcRenderer.on('user:wrong-login:password',function(e,msg){
    addErrorMsg('Das Passwort für den eingegebenen Benutzer ist falsch.',1);
});

/*
//////////////////////////// Functions ////////////////////////////////////////
*/

// Entfernt alle Error Nachrichten von den Inputs
function clearErrorMsgs(){
    var errorMsgs = ctUsername.getElementsByTagName('p');
    for (var i=0;i<errorMsgs.length;i++){
        ctUsername.removeChild(errorMsgs[i]);
    }

    tfUsername.classList.remove('is-danger');
    tfPassword.classList.remove('is-danger');
}

// Fügt eine Errornachricht an entsprechendes Input an
function addErrorMsg(errorMsg,type){

    // Entferne alte Errors
    clearErrorMsgs();

    // Erstelle neues Error Element
    var errorP = document.createElement('p');
    errorP.classList.add('is-danger'); 
    errorP.classList.add('help');
    errorP.innerText = errorMsg;

    // username error
    if(type==0){
        tfUsername.classList.add('is-danger');
        ctUsername.appendChild(errorP);
        // passwort error
    }else if(type == 1){
        tfPassword.classList.add('is-danger');
        ctPassword.appendChild(errorP);
    }
}