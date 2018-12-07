// Electron
const electron = require('electron');
const url = require('url');
const path = require('path');
const{app,BrowserWindow,Menu, ipcMain, dialog} = electron;

// SocketIO
const ioUrl = "http://localhost:8000";
const io = require("socket.io-client");
const ioClient = io.connect(ioUrl);
// TODO zu speicherendes Server Objekt anpassen
let serverList = new Map();

// Custom Modules
const msgModule = require('../shared-objects/message-object.js');  
const Message = msgModule.Message;
const usrModule = require('../shared-objects/user-object.js');  
const User = usrModule.User;
const utils = require('./custom-modules/utils.js');

// Main Fenster
let mainWindow;
let loginWindow;

// Main Fenster Größe
let currentWidth = 1220;
let currentHeight = 630;


/*
//////////////////////////// Electron App Main ////////////////////////////////////////
*/

app.on('ready', function(){

    require('devtron').install();

    // ----- LOGIN WINDOW -----

    loginWindow = createLoginWindow();

    // Ready to show verhindert 'weißes aufblinken' wie man es vom browser kennt
    loginWindow.once('ready-to-show', ()=>{
        //loginWindow.show();
    });

    // Wenn Applikation geschlossen wird
    loginWindow.on('closed', function(){
    });

    // ----- MAIN WINDOW -----

    // Applikations Fenster
    mainWindow = createMainWindow();

    // Ready to show verhindert 'weißes aufblinken' wie man es vom browser kennt
    mainWindow.once('ready-to-show', ()=>{
       mainWindow.show();
       mainWindow.webContents.openDevTools();
    });

    // Wenn Applikation geschlossen wird
    mainWindow.on('closed', function(){
        app.quit();
    });
});

function createLoginWindow(){

    var wndw = new BrowserWindow({
        width: currentWidth, 
        height: currentHeight,
        backgroundColor:'#fff',
        show: false,
        title:'Copsi Login'
    });

    // Lade Login Form zuerst
    wndw.loadURL(url.format({
        pathname: path.join(__dirname, 'login-form.html'),
        protocol:'file:',
        slashes: true
    }));

    return wndw;
}

function createMainWindow(){

    var wndw = new BrowserWindow({
        width: currentWidth, 
        height: currentHeight,
        backgroundColor:'#fff',
        show: false,
        title:'Copsi'
    });

    // Lade Login Form zuerst
    wndw.loadURL(url.format({
        pathname: path.join(__dirname, 'login-form.html'),
        protocol:'file:',
        slashes: true
    }));

    return wndw;
}

/*
//////////////////////////// IPC MAIN ////////////////////////////////////////
*/

ipcMain.on('user:login',function(e,loginData){
    ioClient.emit('user:login',[loginData[0],loginData[1]]);
});

/*
//////////////////////////// SOCKET.IO EVENTS ////////////////////////////////////////
*/

// Bei Verbindung
ioClient.on('connect', function () {
    mainWindow.webContents.send('server:connected');

    //TODO Dev / Remove
    ioClient.emit('user:login',['sesc0043','seb123']);
});

// Wenn eingeloggt
ioClient.on("user:logged-in:personal-info", function(userData){

    var user = userData[0];
    var serverData = userData[1];

    console.log('Logged in');

    // Iteration durch alle Server dieses Users
    for(var i=0;i<serverData.length;i++){
        
        // Verbinde mit jedem Sub-Server aus der Liste und speichere in map
        var tmpServer = io.connect(ioUrl+'/'+serverData[i].id);
        serverList.set(serverData[i].id,[tmpServer,serverData[i]]);
    }

    // TODO Use userdata

    // TODO kombiniere beide in die gleiche function / in das gleiche 

    //mainWindow.show();
    //loginWindow.close();
    switchScreen('start-overview.html');

    // Sende ServerDaten via ipc wenn Fenster fertig geladen hat
    mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.webContents.send('user:personal-user-info',serverData);
    });
});

// Leite falsche Loginversuch Events weiter an Html
ioClient.on('user:wrong-login:username', () => {
    mainWindow.webContents.send('user:wrong-login:username');
});

ioClient.on('user:wrong-login:duplicate', () => {
    mainWindow.webContents.send('user:wrong-login:duplicate');
});

ioClient.on('user:wrong-login:password', () => {
    mainWindow.webContents.send('user:wrong-login:password');
});
  
/*
//////////////////////////// FUNCTIONS ////////////////////////////////////////
*/

// Wechsel aktives Html zum startscreen
function switchScreen(screenHtml) {
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, screenHtml),
        protocol:'file:',
        slashes: true
    }));
}
