const express = require("express"),
  app = express(),
  cors = require("cors"),
  bodyParser = require("body-parser"),
  port = 3001,
  conexion = require("./util/bdConnection"),
  fs = require("fs"),
  https = require("https"),
  http = require("http");

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

var routes = require("./src/routes/ruteo");
let modelos = require("./util/requireAllModels")(conexion);
routes(app, modelos);
// El includes lo hago porque me está devolviendo production con un espacio en blanco al final
if (process.env.NODE_ENV.includes("production")) {
  https
    .createServer(
      {
        key: fs.readFileSync("/etc/letsencrypt/live/www.zaintza.eus/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/www.zaintza.eus/cert.pem"),
      },
      app
    )
    .listen(port, () =>
      console.log(`[API - HTTPS] Escuchando en el puerto : ${port}`)
    );
} else {
  http
    .createServer(app)
    .listen(port, () =>
      console.log(`[API - HTTP] Escuchando en el puerto : ${port}`)
    );
}
