let mongoose = require("mongoose");
const pwdAtlas = require("./mongoDBAtlasPWD");

//MODO PRODUCTION
let uri = `mongodb+srv://admin:${pwdAtlas}@cluster0-sfybj.mongodb.net/zaintza?retryWrites=true&w=majority`;

// MODO DEV
if (process.env.NODE_ENV.includes("production")) {
  uri = `mongodb+srv://admin:${pwdAtlas}@cluster0.6boix.mongodb.net/zaintza?retryWrites=true&w=majority`;
}


mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

module.exports = mongoose;
