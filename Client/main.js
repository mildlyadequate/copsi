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
// Main Fenster Größe
let currentWidth = 1220;
let currentHeight = 630;

/*
//////////////////////////// Electron App Main ////////////////////////////////////////
*/

app.on('ready', function(){

    // Applikations Fenster
    mainWindow = new BrowserWindow({
        width: currentWidth, 
        height: currentHeight,
        backgroundColor:'#fff',
        show: false,
        title:'Copsi'
    });

    // Ready to show verhindert 'weißes aufblinken' wie man es vom browser kennt
    mainWindow.once('ready-to-show', ()=>{
        mainWindow.show();
    });

    // Lade Login Form zuerst
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'login-form.html'),
        protocol:'file:',
        slashes: true
    }));

    // Sende aktuelle Höhe an Html
    mainWindow.on('resize', function(e){
        var height = mainWindow.getSize()[1];
        if(currentHeight != height){
            currentHeight = height;
            mainWindow.webContents.send('window:resize', height);
        }
    })

    // Wenn Applikation geschlossen wird
    mainWindow.on('closed', function(){
        app.quit();
    })
});

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
ioClient.on("user:logged-in", function(userData){
    console.log('Logged in');

    // TODO Use userdata

    switchScreen('start-overview.html');
});

// Wird dem User nach einloggen geschickt, enthält Informationen über Server 
ioClient.on("user:personal-user-info", function(serverData){

    for(var i=0;i<serverData.length;i++){
        
        // Verbinde mit jedem Sub-Server aus der Liste und speichere in map
        var tmpServer = io.connect(ioUrl+'/'+serverData[i].id);
        serverList.set(serverData[i].id,[tmpServer,serverData[i]]);
    }

    mainWindow.webContents.send('user:personal-user-info',serverList);

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
