const express = require("express"),
  app = express(),
  cors = require("cors"),
  bodyParser = require("body-parser"),
  port = 3001,
  conexion = require("./util/bdConnection"),
  fs = require('fs'),
  https = require('https');

app.use(cors());
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({extended: true, limit:"50mb"}));

var routes = require("./src/routes/ruteo");
let modelos = require("./util/requireAllModels")(conexion)
routes(app, modelos);

https.createServer({
  key: fs.readFileSync('./SSL/key.pem'),
  cert: fs.readFileSync('./SSL/cert.pem'),
  passphrase: 'jonzaintza'
}, app).listen(port, () => console.log(`[API] Escuchando en el puerto : ${port}`));