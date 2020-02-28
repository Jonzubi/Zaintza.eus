let mongoose = require("mongoose");
const pwdAtlas = require("./mongoDBAtlasPWD");
const ipMaquina = require("./ipMaquina");
//Esta es para el Atlas

const uri = `mongodb+srv://admin:${pwdAtlas}@cluster0-sfybj.mongodb.net/zaintza?retryWrites=true&w=majority`;
//Esta es la local
//const uri = 'mongodb://' + ipMaquina + ':27017/zaintza';
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

module.exports = mongoose;
