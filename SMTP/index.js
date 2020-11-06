const express = require("express");
const app = express();
const cors = require("cors");
const https = require("https");
const http = require("http");
const bodyParser = require("body-parser");
const port = 3003;
const fs = require("fs");

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

const routes = require("./routes/ruteo");
routes(app);

if (process.env.NODE_ENV.includes("production")) {
  https
    .createServer(
      {
        key: fs.readFileSync("/etc/letsencrypt/live/www.zaintza.eus/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/www.zaintza.eus/cert.pem"),
      },
      app
    )
    .listen(port, () => {
      console.log(`[SMTP - HTTPS] Escuchando el puerto : ${port}`);
    });
} else {
  http.createServer(app).listen(port, () => {
    console.log(`[SMTP - HTTP] Escuchando el puerto : ${port}`);
  });
}
