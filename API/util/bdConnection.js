const mongoose = require("mongoose");
const ipMaquina = require("./ipMaquina");


mongoose.connect('mongodb://' + ipMaquina + ':27017/zainduz', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});

module.exports = mongoose;