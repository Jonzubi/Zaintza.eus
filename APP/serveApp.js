const express = require('express');
const path = require('path');
const app = express();
const port = 80;

app.use(express.static(path.join(__dirname, 'build')));
app.get('/', function(req, res) {
  const port = req.socket.localPort;
  if (port === 80) {
    res.redirect('https://www.zaintza.eus');
    return;
  }
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => console.log(`Zaintza => ${port}`));