var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8080);

// Alle User
let sequenceNumberByClient = new Map();

// event fired every time a new client connects:
io.on('connection', (socket) => {

    var infos;
    io.emit('message:datenbank:received',[infos]);

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

    socket.on('message:datenbanken:send'), (msg) =>{
        socket.emit('message:datenbank:received',[userMe,msg]);
    }
});