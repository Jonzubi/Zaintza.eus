const express = require('express');
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const port = 3003;

app.use(cors());
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({extended: true, limit:"50mb"}));

const routes = require("./routes/ruteo");
routes(app);

app.listen(port, () => {
    console.log(`[SMTP] Escuchando el puerto : ${port}`);
})