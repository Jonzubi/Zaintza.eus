var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000;

var routes = require('./src/routes/ruteo');
routes(app);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
});

app.listen(port);
console.log("Escuchando en el puerto : " + port);
