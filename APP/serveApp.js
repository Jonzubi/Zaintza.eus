const express = require("express");
const fs = require("fs");
const app = express();
const port = 80;

fs.readFile("./build/index.html", (err, html) => {
  if (err) {
    throw err;
  }

  app.get("/", (req, res) => {
    if (
      req.get("X-Forwarded-Proto") == "https" ||
      req.hostname == "localhost"
    ) {
      res.writeHeader(200, { "Content-Type": "text/html" });
      res.write(html);
      res.end();
    } else if (
      req.get("X-Forwarded-Proto") != "https" &&
      req.get("X-Forwarded-Port") != "443"
    ) {
      res.redirect("https://zaintza.eus");
    }
  });

  app.listen(port, () => console.log(`Zaintza => ${port}`));
});
