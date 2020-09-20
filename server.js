const http = require('http');
const https = require('https');
const express = require('express');
const fs = require('fs');

const privKey = fs.readFileSync('/etc/letsencrypt/live/epf.johnnybread.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/epf.johnnybread.com/fullchain.pem', 'utf8');
const credentials = {
  key: privKey, cert: certificate
};

var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

//register api routes
var routes = require('./routes');
routes(app);

var httpServ = http.createServer(app);
var httpsServ = https.createServer(credentials, app);

httpServ.listen(80, "::");
httpsServ.listen(443, "::");
console.log('HTTP & HTTPS server started!');
