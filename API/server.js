var express = require("express"),
  app = express(),
  cors = require("cors"),
  bodyParser = require("body-parser"),
  port = 3001,
  conexion = require("./util/bdConnection")

app.use(cors());
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({extended: true, limit:"50mb"}));

var routes = require("./src/routes/ruteo");
let modelos = require("./util/requireAllModels")(conexion)
routes(app, modelos);

app.listen(port, function() {
  console.log("Escuchando en el puerto : " + port);
});
