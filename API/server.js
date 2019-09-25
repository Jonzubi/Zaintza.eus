var express = require("express"),
  app = express(),
  cors = require("cors"),
  bodyParser = require("body-parser"),
  port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var routes = require("./src/routes/ruteo");
routes(app);

app.listen(port, function() {
  console.log("Escuchando en el puerto : " + port);
});
