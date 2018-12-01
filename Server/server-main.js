// Custom Modules
const msgModule = require('../shared-objects/message-object.js');  
const Message = msgModule.Message;
const usrModule = require('../shared-objects/user-object.js');  
const User = usrModule.User;

// Server
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
// Datenbank
const mongo = require('mongodb');
// Daten verschlüsselung
const bcrypt = require('bcryptjs');

// Listen auf Port
server.listen(8000);
console.log('Server running.');

// Datenbank Daten Maps
let userList = new Map();
let serverList = new Map();

// Verbinde DB
mongo.connect('mongodb://127.0.0.1/copsi',{useNewUrlParser: true}, function(err, db){
    // TODO Handle Error
    if (err) throw err;
    
    // Lade Copsi DB
    const copsiDB = db.db("copsi");
    console.log("DB connected");

    // Lade alle Server
    updateServerList(copsiDB);

    // Event für jeden neu verbundenen Client
    io.on('connection', (socket) => {
        console.log('Client connected '+socket.id);

        // Login Event
        socket.on('user:login', (loginData) => {

            // TODO Prüfen ob Daten korrekt
            // TODO Alle nötigen Daten des Nutzers sammeln und zurückschicken

            // Bestimmten Benutzer aus Datenbank laden
            let query = { username: loginData[0] };
            copsiDB.collection("users").find(query).toArray(function(err, result) {
                // TODO Handle Error
                if (err) throw err;

                // Check ob es genau einen user mit dem gegebenen usernamen gibt
                if(result.length<1){
                    socket.emit('user:wrong-login:username');
                }else if(result.length>1){
                    socket.emit('user:wrong-login:duplicate');
                }else{
                    // Check Passwort mit bcrypt
                    if(bcrypt.compareSync(loginData[1], result[0].password)){
                        // Sende Daten an Client
                        socket.emit('user:logged-in',[result[0]]);
                        // User der Map hinzufügen
                        userList.set(result[0].id, {socket:socket,user:result[0]});
                        console.log('Client logged in: '+result[0].username);
                    }else{
                        socket.emit('user:wrong-login:password');
                    }
                }
            });
        });

        // Wenn ein Client die Verbindung trennt
        socket.on('disconnect', () => {
            console.log('Client gone: '+socket.id);
            // TODO user von liste/map entfernen wenn disconnected
        });

        socket.on('message:hci:send', (msg) => {
            console.log(msg);
            socket.emit('message:hci:received',[userMe,msg]);
        });
    });

    // Erstelle Events für jeden Server der Servermap
    // TODO Listener aus Server Objekt erstellen
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

// Lade aktuelle Serverliste von der Datenbank
function updateServerList(copsiDB){
    copsiDB.collection("servers").find({}).toArray(function(err, result) {
        // TODO Handle Error
        if (err) throw err;

        for(var i=0;i<result.length;i++){
            // Serverlist Objekt = key: serverId, value: [serverObjekt,namespaceObjekt]
            serverList.set(result[i].id,[result[i],io.of('/'+result[i].id)]);
        }
    });
}