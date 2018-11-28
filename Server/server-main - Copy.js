var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8000);

// Custom Modules
let msgModule = require('../shared-objects/message-object.js');  
let Message = msgModule.Message;
let usrModule = require('../shared-objects/user-object.js');  
let User = usrModule.User;

let sequenceNumberByClient = new Map();
let serverList = new Map();

// Server objekte in Liste von Datenbank

serverList.set(0,io.of('/hci'));
serverList.set(1,io.of('/mediengestaltung'));
serverList.set(2,io.of('/eis'));

// TEMP DEV VARS
var userMe = new User('sebid','Sebastian','27.11.2018','20.11.2014','profPic',['hci','eis']);

console.log('Server running.');

// event fired every time a new client connects:
io.on('connection', (socket) => {
    console.log('Client connected '+socket.id);
    // initialize this client's sequence number
    sequenceNumberByClient.set(socket, 1);

    // LOGIN
    socket.on('user:login', (loginData) => {

        // TODO Prüfen ob Daten korrekt
        // TODO Alle nötigen Daten des Nutzers sammeln und zurückschicken

        socket.emit('user:logged-in',[userMe]);

    });

    // when socket disconnects, remove it from the list:
    socket.on('disconnect', () => {
        sequenceNumberByClient.delete(socket);
        console.log('Client gone: '+socket.id);
    });

    socket.on('message:hci:send', (msg) => {
        console.log(msg);
        socket.emit('message:hci:received',[userMe,msg]);
    });
});

for(var i=0;i<serverList.size;i++){

    serverList.get(i).on('connection', function(socket){

        socket.on('message:send', (msg) => {
            console.log(msg);
            socket.emit('message:hci:received',[userMe,msg]);
        });

        socket.on('prof:msg', (msg) => {
            console.log(msg);
            socket.emit('message:prof:received',[userMe,msg]);
        });

        console.log('Client '+socket.id+' connected to HCI.');
    });

}

// sends each client its current sequence number
setInterval(() => {
    for (const [client, sequenceNumber] of sequenceNumberByClient.entries()) {
        client.emit('seq-num', sequenceNumber);

        sequenceNumberByClient.set(client, sequenceNumber + 1);
    }
}, 1000);