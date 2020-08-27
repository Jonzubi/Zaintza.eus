const express = require('express');
const path = require('path');
const app = express();
const port = 80;

app.use(express.static(path.join(__dirname, 'build')));
app.get('/', function(req, res) {
  console.log(req);
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => console.log(`Zaintza => ${port}`));