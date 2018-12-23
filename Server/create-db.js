// Requirements
const bcrypt = require('bcryptjs');
const shortid = require('shortid');

// Eigene Objekte
// User
const usrModule = require('../shared-objects/user-object.js');  
const User = usrModule.User;
// Server
const serverModule = require('../shared-objects/server-object.js');  
const Server = serverModule.Server;
// Server User Ability
const ServerUserAbility = serverModule.UserAbility;
// Channel
const channelModule = require('../shared-objects/channel-object.js');  
const Channel = channelModule.Channel;
// Channel Ability
const RoleAbility = channelModule.RoleAbility;
// Role
const roleModule = require('../shared-objects/role-object.js');  
const Role = roleModule.Role;
// Server User Role Kombo Objekt
const surModule = require('../shared-objects/server-user-role-object.js');  
const Sur = surModule.Sur;

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
let surObjekte = [];

// User
let user1 = new User(shortid.generate(),'sesc0043','Sebastian Schuler',undefined,'27.11.2018','20.11.2014','profPic1');
let user2 = new User(shortid.generate(),'phsp0001','Philipp Spandl',undefined,'23.11.2018','10.11.2015','profPic2');
let user3 = new User(shortid.generate(),'diwa0015','Dieter Wallach',undefined,'29.11.2018','10.11.2013','profPic3');
users.push(user1);
users.push(user2);
users.push(user3);

// User Passwort verschlüsseln und hinzufügen
bcrypt.hash("123", 10, function(err, hash) {
  users[0].password = hash;
});
bcrypt.hash("123", 10, function(err, hash) {
  users[1].password = hash;
});
bcrypt.hash("123", 10, function(err, hash) {
  users[2].password = hash;
});

// Role Objekte - id, name, color
let roleProf = new Role(shortid.generate(),'Professor','FFFFFF');
let roleStud = new Role(shortid.generate(),'Student','10FFFF');

// Role Ability - read, write, fileupload, manageMsgs
let rfChannel1 = new RoleAbility([roleProf.id,roleStud.id],[roleProf.id],[roleProf.id],[roleProf.id]);

// Server 1 Channel
let cat1sub1 = new Channel(shortid.generate(),'Neuigkeiten',channelModule.type.news,[],false,'fa-file-alt',rfChannel1,[]);
let category1 = new Channel(shortid.generate(),'Allgemein',channelModule.type.chat,[],true,'',rfChannel1,[cat1sub1]);
let cat2sub1 = new Channel(shortid.generate(),'Skripte',channelModule.type.doc,[],false,'fa-book',rfChannel1,[]);
let cat2sub2 = new Channel(shortid.generate(),'Übungen',channelModule.type.doc,[],false,'fa-graduation-cap',rfChannel1,[]);
let cat2sub3 = new Channel(shortid.generate(),'Beispiele',channelModule.type.doc,[],false,'fa-folder-open',rfChannel1,[]);
let category2 = new Channel(shortid.generate(),'Grundlagen',channelModule.type.chat,[],true,'',rfChannel1,[cat2sub1,cat2sub2,cat2sub3]);
let cat3sub1 = new Channel(shortid.generate(),'Anonym',channelModule.type.chat,[],false,'fa-ghost',rfChannel1,[]);
let cat3sub2 = new Channel(shortid.generate(),'Diskussion',channelModule.type.chat,[],false,'fa-question-circle',rfChannel1,[]);
let category3 = new Channel(shortid.generate(),'Fragen & Antworten',channelModule.type.chat,[],true,'',rfChannel1,[cat3sub1,cat3sub2]);

// Channel Objekte - id, name, type, msg, role
let channel2 = new Channel(shortid.generate(),'News',channelModule.type.news,[],false,'fa-file-alt',rfChannel1,[]);

// Server User Ability - admin, moderator, announcement
let serverUserAbility = new ServerUserAbility([roleProf.id],[roleProf.id],[roleProf.id]);

// Server Objekte - id, shortname, name, subjectArea, user, channel
let server1 = new Server(shortid.generate(),'HCI',undefined,'Entwicklung Interaktiver Systeme','IMST',[category1,category2,category3],[roleProf,roleStud],serverUserAbility);
let server2 = new Server(shortid.generate(),'MGS',undefined,'Mediengestaltung','IMST',[channel2],[roleProf,roleStud],serverUserAbility);

// Server Passwort verschlüsseln und hinzufügen
bcrypt.hash("eis2018", 10, function(err, hash) {
  server1.password = hash;
});

// Kombo Objekte
let sur1 = new Sur(server1.id,user1.id,roleStud.id);
let sur2 = new Sur(server1.id,user2.id,roleStud.id);
let sur3 = new Sur(server1.id,user3.id,roleProf.id);

let sur4 = new Sur(server2.id,user1.id,roleStud.id);
let sur5 = new Sur(server2.id,user2.id,roleStud.id);
let sur6 = new Sur(server2.id,user3.id,roleProf.id);


// Zu Array hinzufügen
servers.push(server1);
servers.push(server2);

// Sur Objekte zu Array
surObjekte.push(sur1);
surObjekte.push(sur2);
surObjekte.push(sur3);
surObjekte.push(sur4);
surObjekte.push(sur5);
surObjekte.push(sur6);

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

    // Füge Sur hinzu
    dbo.collection("sur").insertMany(surObjekte, function(err, res) {
      if (err) throw err;
      console.log("Number of surs inserted: " + res.insertedCount);
    });

    db.close();
  });
});