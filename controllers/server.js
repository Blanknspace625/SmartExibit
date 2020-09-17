var express = require('express'),
  app = express(),
  port = process.env.PORT || 80;

app.listen(port);

//register api routes
var routes = require('./routes')
routes(app);


console.log('server started on: ' + port);