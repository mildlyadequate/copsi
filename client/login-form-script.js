// Electron
const electron = require('electron');
const { ipcRenderer, shell, Menu } = electron;



var txtLoginUsername = document.getElementById('txtLoginUsername');
var txtLoginPassword = document.getElementById('txtLoginPassword')

function handleLogin() {
    ipcRenderer.send('user:login',[txtLoginUsername.value, txtLoginPassword.value]);
}