let mongoose = require("mongoose");
const pwdAtlas = require("./mongoDBAtlasPWD");
const ipMaquina = require("./ipMaquina");
//Esta es para el Atlas
//MODO PRODUCTION
let uri = `mongodb+srv://admin:${pwdAtlas}@cluster0-sfybj.mongodb.net/zaintza?retryWrites=true&w=majority`;

// MODO DEV
uri = `mongodb+srv://admin:${pwdAtlas}@cluster0.6boix.mongodb.net/zaintza?retryWrites=true&w=majority`

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

module.exports = mongoose;
