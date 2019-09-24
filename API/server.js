var express = require('express'),
  app = express(),
  cors = require("cors"),
  port = 3001;


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Access-Control-Allow-Origin");
  next();
});


var routes = require('./src/routes/ruteo');
routes(app);


app.listen(port,function(){
  console.log("Escuchando en el puerto : " + port);
});

