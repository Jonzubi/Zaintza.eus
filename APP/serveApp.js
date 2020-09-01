const express = require("express");
const path = require("path");
const app = express();
const https = require('https');
const http = require('http');
const fs = require('fs');

app.use(express.static(path.join(__dirname, 'build')));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/build/index.html"), () => {
    res.sendFile(path.join(__dirname + "/developing.html"))
  });
});
app.get("/robots.txt", (req, res) => {
  res.sendFile(path.join(__dirname, '/robots.txt'));
});
app.get("/sitemap.xml", (req, res) => {
  res.sendFile(path.join(__dirname, '/sitemap.xml'));
});
app.get("*", (req, res) => {
  res.writeHead(404);
  res.sendFile(path.join(__dirname, '/notFound.html'));
})

https.createServer({
  key: fs.readFileSync('./src/SSL/key.pem'),
  cert: fs.readFileSync('./src/SSL/cert.pem')
}, app).listen(443);

http.createServer((req, res) => {
  res.writeHead(301,
    {Location: 'https://www.zaintza.eus'}
  );
  res.end();
  return;
}).listen(80);
