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

// TEMP DEV VARS
var userMe = new User('sebid','Sebastian','lstonl','regist','profPic','frnds','srvs');

console.log('Server running.');

// event fired every time a new client connects:
io.on('connection', (socket) => {
    console.log('Client connected '+socket.id);
    // initialize this client's sequence number
    sequenceNumberByClient.set(socket, 1);

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

// Custom Namespace 
var hci = server.of('/hci');

var hci = server.of('/mediengestaltung');

var hci = server.of('/eis');

for(var i=1;i<10;i++){

    hci.on('connection', function(socket){

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