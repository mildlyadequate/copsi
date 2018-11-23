const electron = require('electron');
const url = require('url');
const path = require('path');
const{app,BrowserWindow,Menu, ipcMain, dialog} = electron;

// SocketIO
const io = require("socket.io-client");
const ioClient = io.connect("http://localhost:8000");

// Custom Modules
let msgModule = require('../shared-objects/message-object.js');  
let Message = msgModule.Message;
let usrModule = require('../shared-objects/user-object.js');  
let User = usrModule.User;
var utils = require('./custom_modules/utils.js');

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
    ioClient.emit('message:datenbanken:send',msg); // everyone gets it but the sender
});

// SOCKET IO

ioClient.on('connect', function () { // TIP: you can avoid listening on `connect` and listen on events directly too!
    
    utils.test();

});

ioClient.on("seq-num", function(e){
    //console.log(e);
});

ioClient.on('message:datenbank:received', (data) => {
    mainWindow.webContents.send('message:received', data);
});
  