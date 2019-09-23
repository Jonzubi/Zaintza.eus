var express = require('express'),
  app = express(),
  cors = require("cors"),
  port = 3001;

var routes = require('./src/routes/ruteo');
routes(app);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

app.listen(port,function(){
  console.log("Escuchando en el puerto : " + port);
});

