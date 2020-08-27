const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");

fs.readFile("./build/index.html", (err, html) => {
  if (err) {
    throw err;
  }

  https.createServer((req, res) => {
    res.writeHeader(200, { "Content-Type": "text/html" });
    res.write(html);
    res.end();
  }).listen(443);

  http
    .createServer(function (req, res) {
      res.writeHead(301, { Location: "https://www.zaintza.eus" });
      res.end();
    })
    .listen(80);
});
