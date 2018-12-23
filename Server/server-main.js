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
let onlineUserList = new Map();
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

    // Lade alle Daten (Methoden rufen sich gegenseitig auf um Reihenfolge zu garantieren)
    updateUserList(copsiDB);

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
                        onlineUserList.set(result[0].id, {socket:socket,user:result[0]});
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
    });
});

function initServerFunction(){

    // Erstelle Events für jeden Server der Servermap
    // TODO Listener aus Server Objekt erstellen
    var serverConnections = Array.from(serverList.values());
    for(var x=0;x<serverConnections.length;x++){

        // Für jeden Server
        serverConnections[x][1].on('connection', function(socket){

            // Server Objekt und ID mit this von map bekommen
            var srvId = this.name.substring(1, this.name.length);
            var srv = serverList.get(srvId)[0];

            // Iteration durch Channels
            for(var i=0;i<srv.channels.length;i++){

                // Iteration durch Sub Channels
                for(var j=0;j<srv.channels[i].childChannels.length;j++){

                    // ID des aktuellen Sub Channels
                    let childID = srv.channels[i].childChannels[j].id;

                    // Join Room TODO NUR DANN wenn der user zugriff auf channel hat
                    socket.join(srvId+childID, () => {
                        // Aufgerufen nachdem der Raum betreten wurde
                    });

                    // innere Funktion benötigt um Variable childID in diesem scope zu speichern
                    // -> https://stackoverflow.com/questions/2900839/how-to-structure-javascript-callback-so-that-function-scope-is-maintained-proper
                    (function(obj) { 
                        socket.on('server:message:'+obj[0], (msg) => {
  
                        serverList.get(msg.serverId)[1].to(obj[1]+obj[0]).emit('server:message',msg);
                        //TODO sende nur an user die zugriff auf den channel haben

                        });
                    })([childID,srvId]);
                }
            }

            console.log('Client '+socket.id+' connected to '+srv.shortName);
        });
    }
}

/*
//////////////////////////// Datenbank Server Init ////////////////////////////////////////
*/

// Lade aktuelle UserListe von der Datenbank
// Wird beim Server start einmal ausgeführt, ab dann nur noch geupdated
function updateUserList(copsiDB){
    copsiDB.collection("users").find({}).toArray(function(err, result) {
        // TODO Handle Error
        if (err) throw err;

        for(var i=0;i<result.length;i++){
            userList.set(result[i].id,result[i]);
        }
        updateServerList(copsiDB);
    });
}

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

        updateSurList(copsiDB);
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

        initServerFunction();
    });
}

/*
//////////////////////////// Datenbank Funktionen ////////////////////////////////////////
*/

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

                // Check ob user ID mit dem aktuellen User und Server ID mit dem aktuell angeschauten Server übereinstimmen
                if(surList[j].serverid===result[i].id){

                    // Erstellt und fügt User zum Server Objekt hinzu. In der DB werden diese nur durch Sur verbunden
                    var tmpUser = userList.get(surList[j].userid);
                    // Entferne private Daten des Benutzers (PW)
                    delete tmpUser.password;
                    tmpUser['role'] = surList[j].roleid;

                    serverObject.users.push(tmpUser);
                }
            }
            
            // Speichere Server Objekt in Liste die später dem Client geschickt wird
            tmpUserServerList.push(serverObject);

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