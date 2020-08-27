const express = require("express");
const path = require("path");
const app = express();
const port = 80;

app.use(express.static(path.join(__dirname, 'build')));
app.get("/", (req, res) => {
  if (req.get("X-Forwarded-Proto") == "https" || req.hostname == "localhost") {
    console.log("rspondifen");
    res.sendFile(path.join(__dirname + "/build/index.html"));
  } else if (
    req.get("X-Forwarded-Proto") != "https" &&
    req.get("X-Forwarded-Port") != "443"
  ) {
    res.redirect("https://www.zaintza.eus");
  }
});

app.listen(port, () => console.log(`Zaintza => ${port}`));
