const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const mongo = require('mongodb');
const bcrypt = require('bcryptjs');

server.listen(8000);

// Custom Modules
const msgModule = require('../shared-objects/message-object.js');  
const Message = msgModule.Message;
const usrModule = require('../shared-objects/user-object.js');  
const User = usrModule.User;

let userList = new Map();
let serverList = new Map();

// Server objekte in Liste von Datenbank
serverList.set(0,io.of('/hci'));
serverList.set(1,io.of('/medges'));
serverList.set(2,io.of('/eis'));

console.log('Server running.');

// Verbinde DB
mongo.connect('mongodb://127.0.0.1/copsi', function(err, db){
    if (err) throw err;
    
    // Lade Copsi DB
    const copsiDB = db.db("copsi");

    // Lade Server Tabelle
    /*copsiDB.collection("users").find({}).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
    });*/
    console.log("DB connected");

    // event fired every time a new client connects:
    io.on('connection', (socket) => {
        console.log('Client connected '+socket.id);

        // LOGIN
        socket.on('user:login', (loginData) => {

            // TODO Prüfen ob Daten korrekt
            // TODO Alle nötigen Daten des Nutzers sammeln und zurückschicken

            // Bestimmten Benutzer aus Datenbank laden
            let query = { username: loginData[0] };
            copsiDB.collection("users").find(query).toArray(function(err, result) {
                if (err) throw err;

                // Check ob es genau einen user mit dem gegebenen usernamen gibt
                if(result.length<1){
                    socket.emit('user:wrong-login:username');
                }else if(result.length>1){
                    socket.emit('user:wrong-login:duplicate');
                }else{
                    // Check Passwort mit bcrypt
                    if(bcrypt.compareSync(loginData[1], result[0].password)){
                        socket.emit('user:logged-in',[result[0]]);
                    }else{
                        socket.emit('user:wrong-login:password');
                    }
                }
            });
        });

        // when socket disconnects, remove it from the list:
        socket.on('disconnect', () => {
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
});