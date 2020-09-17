const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const port = 3003;
const fs = require("fs");

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

const routes = require("./routes/ruteo");
routes(app);

const https = require("https").createServer(
  {
    key: fs.readFileSync("./SSL/key.pem"),
    cert: fs.readFileSync("./SSL/cert.pem"),
  },
  app
);

https.listen(port, () => {
  console.log(`[SMTP] Escuchando el puerto : ${port}`);
});
