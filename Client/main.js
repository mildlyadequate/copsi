const electron = require('electron');
const url = require('url');
const path = require('path');
const{app,BrowserWindow,Menu, ipcMain, dialog} = electron;

// SocketIO
const io = require("socket.io-client");
const ioClient = io.connect("http://localhost:8000");

// TODO 
// Serverliste werden mit anfrage vom server bekommen

const hci = io.connect("http://localhost:8000/hci");
let serverList = new Map();

// Custom Modules
const msgModule = require('../shared-objects/message-object.js');  
const Message = msgModule.Message;
const usrModule = require('../shared-objects/user-object.js');  
const User = usrModule.User;
const utils = require('./custom-modules/utils.js');

// Window Size
let currentWidth = 1024;
let currentHeight = 640;

// Listen for app to be ready
app.on('ready', function(){

    mainWindow = new BrowserWindow({
        width: currentWidth, 
        height: currentHeight,
        backgroundColor:'#fff',
        show: false,
        title:'Studienprojekt'
    });

    mainWindow.once('ready-to-show', ()=>{
        mainWindow.show();
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'login-form.html'),
        protocol:'file:',
        slashes: true
    }));

    // Send current height on resize to adjust components
    mainWindow.on('resize', function(e){
        var height = mainWindow.getSize()[1];
        if(currentHeight != height){
            currentHeight = height;
            mainWindow.webContents.send('window:resize', height);
        }
    })

    // Quit App when closed
    mainWindow.on('closed', function(){
        app.quit();
    })

});

// IPC

ipcMain.on('user:login',function(e,loginData){
    ioClient.emit('user:login',[loginData[0],loginData[1]]);
});

// SOCKET IO

// Bei Verbindung
ioClient.on('connect', function () {
    // Login
    
});

// Wenn eingeloggt
ioClient.on("user:logged-in", function(userData){
    console.log('Logged in');
    console.log(userData[0].servers);

    for(var i=0;i<userData[0].servers.length;i++){
        
        // Verbinde mit jedem Sub-Server aus der Liste und speichere in map
        var tmpServer = io.connect("http://localhost:8000/"+userData[0].servers[i]);
        serverList.set(userData[0].servers[i],tmpServer);
    }

    console.log(serverList);
});

ioClient.on('message:datenbank:received', (data) => {
    mainWindow.webContents.send('message:received', data);
});
  
// FUNCTIONS

