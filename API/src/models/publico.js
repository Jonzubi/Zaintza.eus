const mongoose = require("../../util/bdConnection");

var publico = new mongoose.Schema({
    nombre : String,
    descripcion : String,
    direcFoto : String
});

var Publico = mongoose.model("Publico",publico);

module.exports = Publico