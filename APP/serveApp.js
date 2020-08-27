const express = require('express');
const fs = require('fs');
const app = express();
const port = 80;

fs.readFile('./build/index.html', (err, html) => {
  if (err) {
    throw err;
  }
  app.get('/', function(req, res) {
    const secure = req.secure;
    if (!secure) {
      res.redirect('https://www.zaintza.eus');
      return;
    }
    res.writeHeader(200, {"Content-Type": "text/html"});  
    res.write(html);  
    res.end();  
  });

  app.listen(port, () => console.log(`Zaintza => ${port}`));
});