const http = require('http');
const https = require('https');
const express = require('express');
const session = require('express-session');
const fs = require('fs');

//const privKey = fs.readFileSync('/etc/letsencrypt/live/epf.johnnybread.com/privkey.pem', 'utf8');
//const certificate = fs.readFileSync('/etc/letsencrypt/live/epf.johnnybread.com/fullchain.pem', 'utf8');
//const credentials = {
//  key: privKey, cert: certificate
//};

var app = express();
app.use(express.static(__dirname + '/'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/Public'));

app.use(session({
  name: 'default',
  secret: 'itsasecret',
  resave: true,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
//    secure: true,
    maxAge : 1000 * 60 * 15
  }
}));

var routes = require('./routes');
routes(app);

var httpServ = http.createServer(app);
//var httpsServ = https.createServer(credentials, app);

//httpServ.get('*', function(req, res) {
//  res.redirect('https://' + req.headers.host + req.url);
//});

httpServ.listen(80, "::");
//httpsServ.listen(443, "::");
console.log('Web server started!');