// Electron
const electron = require('electron');
const url = require('url');
const path = require('path');
const{app,BrowserWindow,Menu, ipcMain, dialog} = electron;

// SocketIO
const ioUrl = "http://localhost:8000";
const io = require("socket.io-client");
const ioClient = io.connect(ioUrl);

// Variables
let serverList = new Map();
let userMe;

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

    require('devtron').install();

    // ----- MAIN WINDOW -----

    // Applikations Fenster
    mainWindow = createMainWindow();

    // Ready to show verhindert 'weißes aufblinken' wie man es vom browser kennt
    mainWindow.once('ready-to-show', ()=>{
       mainWindow.show();
       mainWindow.webContents.send('window:resize', currentHeight);
       mainWindow.webContents.openDevTools();
    });

    // Wenn Applikation geschlossen wird
    mainWindow.on('closed', function(){
        app.quit();
    });
});

function createMainWindow(){

    var wndw = new BrowserWindow({
        width: currentWidth, 
        height: currentHeight,
        minHeight: 550,
        minWidth: 1050,
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

    // Send current height on resize to adjust scrollbar
    wndw.on('resize', function(e){
        var height = mainWindow.getSize()[1];
        if(currentHeight != height){
            currentHeight = height;
            mainWindow.webContents.send('window:resize', height);
        }
    });

    return wndw;
}

/*
//////////////////////////// IPC MAIN ////////////////////////////////////////
*/

// Wenn User versucht sich einzuloggen sende Loginversuch an Server weiter
ipcMain.on('user:login',function(e,loginData){
    ioClient.emit('user:login',[loginData[0],loginData[1]]);
});

// Wenn User eine Nachricht sendet, leite sie an Server weiter
ipcMain.on('server:message:send',function(e,msg){
    
    // Server aus Serverliste finden mithilfe der ID obj[0]
    serverList.get(msg.serverId)[0].emit('server:message:'+msg.channelId, msg);
    
});

// Wenn ein Channel geladen werden soll fordert dieses Event den Server auf
ipcMain.on('channel:get:old-messages',function(e,tmpInfo){
    
    // tmpInfo = [serverId,channelId]
    serverList.get(tmpInfo[0])[0].emit('channel:get:old-messages',tmpInfo);

});

/*
//////////////////////////// SOCKET.IO EVENTS ////////////////////////////////////////
*/

// Bei Verbindung
ioClient.on('connect', function () {
    mainWindow.webContents.send('server:connected');

    //TODO Dev / Remove
    ioClient.emit('user:login',['sesc0043','123']);
});

// Wenn eingeloggt
ioClient.on("user:logged-in:personal-info", function(userData){

    userMe = userData[0];
    var serverData = userData[1];

    console.log('Logged in as '+userMe.nickname);

    // Iteration durch alle Server dieses Users
    for(var i=0;i<serverData.length;i++){
        
        // Verbinde mit jedem Sub-Server aus der Liste und speichere in map
        var tmpServer = io.connect(ioUrl+'/'+serverData[i].id);

        /*
        for(var x=0;x<serverData[i].channels.length;x++){
            for(var y=0;y<serverData[i].channels[x].childChannels.length;y++){
                tmpServer.join(serverData[i].channels[x].childChannels[y].id, () => {
                    //let rooms = Object.keys(socket.rooms);
                    console.log("HAHA XD"); // [ <socket.id>, 'room 237' ]
                    //io.to('room 237').emit('a new user has joined the room'); // broadcast to everyone in the room
                });
            }
        }*/

        // Wenn eine Nachricht auf diesem Server empfangen wird
        tmpServer.on('server:message', (msg) => {
            // Sende via ipc
            mainWindow.webContents.send('server:message',msg);
        });

        // Bekomme alte Nachrichten des aktuell selektierten Channels
        tmpServer.on('channel:receive:old-messages', (messages) => {
            mainWindow.webContents.send('channel:receive:old-messages',messages);
        });

        // Zur Server Map hinzufügen
        serverList.set(serverData[i].id,[tmpServer,serverData[i]]);
    }

    switchScreen('start-overview.html');

    // Sende ServerDaten via ipc wenn Fenster fertig geladen hat
    mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.webContents.send('user:personal-user-info',[serverData,userMe]);
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
