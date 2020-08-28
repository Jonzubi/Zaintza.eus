const express = require("express");
const path = require("path");
const app = express();
const https = require('https');
const fs = require('fs');
const port = 80;

app.use(express.static(path.join(__dirname, 'build')));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/build/index.html"));
});

https.createServer({
  key: fs.readFileSync('./src/SSL/key.pem'),
  cert: fs.readFileSync('./src/SSL/cert.pem')
}, app).listen(443, () => console.log("listening"));
//app.listen(port, () => console.log(`Zaintza => ${port}`));
