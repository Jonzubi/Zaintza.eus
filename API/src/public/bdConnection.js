const mongoose = require("mongoose");
const ipMaquina = require("./ipMaquina");


mongoose.connect('mongodb://' + ipMaquina + ':27017/zainduz', {useNewUrlParser: true});

module.exports = mongoose;