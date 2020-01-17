let mongoose = require("mongoose");
const pwdAtlas = require("./mongoDBAtlasPWD");
const ipMaquina = require("./ipMaquina");
//Esta es para el Atlas
const uri =
  "mongodb+srv://admin:" +
  pwdAtlas +
  "@jonzubicloud-7eg52.azure.mongodb.net/zaintza?retryWrites=true&w=majority";
//Esta es la local
//const uri = 'mongodb://' + ipMaquina + ':27017/zaintza';
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

module.exports = mongoose;
