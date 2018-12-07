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
let surList = [];

// TODO Check ASYNC DB Anfragen

/*
//////////////////////////// Connect ////////////////////////////////////////
*/

// Verbinde DB
mongo.connect('mongodb://127.0.0.1/copsi',{useNewUrlParser: true}, function(err, db){
    // TODO Handle Error
    if (err) throw err;
    
    // Lade Copsi DB
    const copsiDB = db.db("copsi");
    console.log("DB connected");

    // Lade alle Server
    updateServerList(copsiDB);
    updateSurList(copsiDB);

    // Event für jeden neu verbundenen Client
    io.on('connection', (socket) => {
        console.log('Client connected '+socket.id);

        // Login Event
        socket.on('user:login', (loginData) => {

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
                        //socket.emit('user:logged-in',[result[0]]);

                        // Sende Daten an Client
                        sendUserServerInfo(copsiDB,result[0],socket);

                        // User der Map hinzufügen
                        userList.set(result[0].id, {socket:socket,user:result[0]});
                        console.log('Client logged in: '+result[0].username);

                       // TODO getServerUserList();
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

/*
//////////////////////////// Datenbank Funktionen ////////////////////////////////////////
*/

// Lade aktuelle Serverliste von der Datenbank
// Wird beim Server start einmal ausgeführt, ab dann nur noch geupdated
function updateServerList(copsiDB){
    copsiDB.collection("servers").find({}).toArray(function(err, result) {
        // TODO Handle Error
        if (err) throw err;

        // Für alle Server aus result Objekt
        for(var i=0;i<result.length;i++){

            // Wenn Server noch nicht in Map vorhanden ist
            if(!serverList.has(result[i].id)){
                // Serverlist Objekt = key: serverId, value: [serverObjekt,namespaceObjekt]
                serverList.set(result[i].id,[result[i],io.of('/'+result[i].id)]);
            }

        }
    });
}

// Lade aktuelle SurListe von der Datenbank
// Wird beim Server start einmal ausgeführt, ab dann nur noch geupdated
function updateSurList(copsiDB){
    copsiDB.collection("sur").find({}).toArray(function(err, result) {
        // TODO Handle Error
        if (err) throw err;

        for(var i=0;i<result.length;i++){
            surList.push(result[i]);
        }
    });
}

// Erstellt Paket von Informationen für einen individuellen Benutzer
function sendUserServerInfo(copsiDB,user,socket){
    copsiDB.collection("servers").find({}).toArray(function(err, result) {
        // TODO Handle Error
        if (err) throw err;
    
        var tmpUserServerList = [];

        // Server
        for(var i=0;i<result.length;i++){

            var serverObject = result[i];
            // Sensitive Daten von Objekt löschen bevor es gesendet wird
            delete serverObject.password;
            serverObject['users'] = [];

            // Sur
            for(var j=0;j<surList.length;j++){



                if(surList[j].userid === user.id && surList[j].serverid===result[i].id){
                    var tmpUser = userList.get(user.id).user;
                    delete tmpUser.password;
                    serverObject.users.push(tmpUser);
                    tmpUserServerList.push(serverObject);
                }
            }

        }

        // TODO Mit Sur Liste ein users objekt in das tmp server objekt einfügen das komplette benutzer ausgenommen pw usw enthält
        
        // passwort wird nicht benötigt
        delete user.password;

        // TODO im user objekt sollte der komplette user mitgesendet werden anstatt nur der ID
        socket.emit('user:logged-in:personal-info',[user,tmpUserServerList]);
    });
}

// Gibt eine Liste aller User auf einem Server zurück, ohne persönliche Daten (Pw)
function getServerUserList(){
    // TODO Schleife durch userliste um server attribut zu checken
    console.log(userList);
    for(var i;i<userList.length;i++){
        console.log(userList[i]);
    }
}

/*
//////////////////////////// Funktionen ////////////////////////////////////////
*/