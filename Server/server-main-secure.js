/*var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var http = require('http');
var https = require('https');

var privateKey  = fs.readFileSync('./certificate/key.pem', 'utf8');
var certificate = fs.readFileSync('./certificate/cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

var io = require('socket.io')(server);




// your express configuration here

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

// For http
httpServer.listen(8080);
// For https
httpsServer.listen(8443);
*/

var fs = require( 'fs' );
var app = require('express')();
var https        = require('https');
var server = https.createServer({
    key: fs.readFileSync('./test_key.key'),
    cert: fs.readFileSync('./test_cert.crt'),
    ca: fs.readFileSync('./test_ca.crt'),
    requestCert: false,
    rejectUnauthorized: false
},app);
server.listen(8080);

var io = require('socket.io').listen(server);


app.get('/', function (req, res) {
    res.header('Content-type', 'text/html');
    return res.end('<h1>Hello, Secure World!</h1>');
});

let sequenceNumberByClient = new Map();

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