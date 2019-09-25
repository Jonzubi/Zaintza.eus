var express = require("express"),
  app = express(),
  cors = require("cors"),
  bodyParser = require("body-parser"),
  port = 3001;
//app.use((req, res, next) => {
//  res.header("Access-Control-Allow-Origin", "*");
//  res.header(
//    "Access-Control-Allow-Headers",
//    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
//  );
//  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
//  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
//  next();
//});

app.use(cors());
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: true}));

var routes = require("./src/routes/ruteo");
routes(app);

app.listen(port, function() {
  console.log("Escuchando en el puerto : " + port);
});
