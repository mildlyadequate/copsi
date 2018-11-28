var bcrypt = require('bcrypt');

var dbName = "copsi";

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/"+dbName;

let usrModule = require('../shared-objects/user-object.js');  
let User = usrModule.User;

var users = [];

bcrypt.hash("seb123", 10, function(err, hash) {
  var user1 = new User('sesc0043','Sebastian',hash,'27.11.2018','20.11.2014','profPic1',['hci','eis']);
  users.push(user1);

});

bcrypt.hash("phil123", 10, function(err, hash) {
  var user2 = new User('phsp0001','Philipp',hash,'23.11.2018','10.11.2014','profPic2',['hci','medges']);
  users.push(user2);
});


console.log(users);

MongoClient.connect(url, function(err, db) {
  if (err) throw err;

  console.log(users);


  // Erstele Datenbank
  var dbo = db.db(dbName);

  // Erstelle Tabelle
  dbo.createCollection("users", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");

    // Füge Daten hinzu
    dbo.collection("users").insertMany(users, function(err, res) {
      if (err) throw err;
      console.log("Number of documents inserted: " + res.insertedCount);
      db.close();
    });

    db.close();
  });

});