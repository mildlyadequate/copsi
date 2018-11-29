// Requirements
const bcrypt = require('bcryptjs');
const shortid = require('shortid');

// Eigene Objekte
const usrModule = require('../shared-objects/user-object.js');  
const User = usrModule.User;
const serverModule = require('../shared-objects/server-object.js');  
const Server = serverModule.Server;
const channelModule = require('../shared-objects/channel-object.js');  
const Channel = channelModule.Channel;
const RoleAbility = channelModule.RoleAbility;
const roleModule = require('../shared-objects/role-object.js');  
const Role = roleModule.Role;

// Datenbank
const dbName = "copsi";
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/"+dbName;

/*
//////////////////////////// Create Objects ////////////////////////////////////////
*/

// Daten Arrays
let users = [];
let servers = [];

let user1 = new User(shortid.generate(),'sesc0043','Sebastian',undefined,'27.11.2018','20.11.2014','profPic1',['hci','eis']);
let user2 = new User(shortid.generate(),'phsp0001','Philipp',undefined,'23.11.2018','10.11.2014','profPic2',['hci','medges']);
users.push(user1);
users.push(user2);

// User Passwort verschlüsseln und hinzufügen
bcrypt.hash("seb123", 10, function(err, hash) {
  users[0].password = hash;
});
bcrypt.hash("phil123", 10, function(err, hash) {
  users[1].password = hash;
});

// Role Objekte - id, name, color
let roleProf = new Role(shortid.generate(),'Professor','FFFFFF');
let roleStud = new Role(shortid.generate(),'Student','10FFFF');

// Role Ability - read, write, fileupload, manageMsgs
let rfChannel1 = new RoleAbility([roleProf.id,roleStud.id],[roleProf.id],[roleProf.id],[roleProf.id]);

// Channel Objekte - id, name, type, msg, role
let channel1 = new Channel(shortid.generate(),'Allgemein',channelModule.type.chat,[],rfChannel1);
let channel2 = new Channel(shortid.generate(),'News',channelModule.type.news,[],rfChannel1);

// User Objekt in server - user,rollenID
let user1Server = {user:users[0].id,role:roleProf.id};
let user2Server = {user:users[1].id,role:roleStud.id};
// Server Objekte - id, shortname, name, subjectArea, user, channel
let server1 = new Server(shortid.generate(),'EIS','Entwicklung Interaktiver Systeme','IMST',[user1Server],[channel1],[roleProf,roleStud]);
let server2 = new Server(shortid.generate(),'MGS','Mediengestaltung','IMST',[user1Server,user2Server],[channel2],[roleProf,roleStud]);

// Zu Array hinzufügen
servers.push(server1);
servers.push(server2);

/*
//////////////////////////// Create Database ////////////////////////////////////////
*/

MongoClient.connect(url, function(err, db) {
  if (err) throw err;

  // Erstele Datenbank
  let dbo = db.db(dbName);

  // Erstelle Tabelle
  dbo.createCollection("users", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");

    // Füge User hinzu
    dbo.collection("users").insertMany(users, function(err, res) {
      if (err) throw err;
      console.log("Number of users inserted: " + res.insertedCount);
    });

    // Füge Server hinzu
    dbo.collection("servers").insertMany(servers, function(err, res) {
      if (err) throw err;
      console.log("Number of servers inserted: " + res.insertedCount);
    });

    db.close();
  });
});