const electron = require('electron');
const url = require('url');
const path = require('path');
const{app,BrowserWindow,Menu, ipcMain, dialog} = electron;

// SocketIO
const io = require("socket.io-client");
const ioClient = io.connect("http://localhost:8000");

// TODO 
// Serverliste werden mit anfrage vom server bekommen

var hci = io.connect("http://localhost:8000/hci");
let serverList = new Map();

// Custom Modules
let msgModule = require('../shared-objects/message-object.js');  
let Message = msgModule.Message;
let usrModule = require('../shared-objects/user-object.js');  
let User = usrModule.User;
var utils = require('./custom-modules/utils.js');

// Window Size
var currentWidth = 1024;
var currentHeight = 640;

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
        pathname: path.join(__dirname, 'main-window.html'),
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

ipcMain.on('message:all:send',function(e,msg){
    //ioClient.emit('message:datenbanken:send',msg); // everyone gets it but the sender
    hci.emit('message:send', msg);
});

// SOCKET IO

// Bei Verbindung
ioClient.on('connect', function () {
    // Login
    ioClient.emit('user:login',['testBenutzer','testPasswort']);
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

