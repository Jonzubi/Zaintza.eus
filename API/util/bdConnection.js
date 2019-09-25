const mongoose = require("mongoose");
const ipMaquina = require("./ipMaquina");


mongoose.connect('mongodb://' + ipMaquina + ':27017/zainduz', {useNewUrlParser: true, useUnifiedTopology: true});

module.exports = mongoose;