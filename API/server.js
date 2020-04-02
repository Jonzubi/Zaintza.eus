const express = require("express"),
  app = express(),
  cors = require("cors"),
  bodyParser = require("body-parser"),
  port = 3001,
  conexion = require("./util/bdConnection");

const whitelist = ['http://www.zaintza.eus', 'http://localhost'];
app.use(cors({
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}));
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({extended: true, limit:"50mb"}));

var routes = require("./src/routes/ruteo");
let modelos = require("./util/requireAllModels")(conexion)
routes(app, modelos);

app.listen(port, function() {
  console.log("[API] Escuchando en el puerto : " + port);
});
