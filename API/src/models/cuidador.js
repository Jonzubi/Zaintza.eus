const conexion = require("../public/bdConnection");
const mongoose = require("mongoose");

var cuidador = new mongoose.Schema({
    idCuidador : Number,
    nombre : String,
    apellido1 : String,
    apellido2 : String,
    fechaNacimiento : Date,
    sexo : String,
    direcFoto : String,
    descripcion : String,
    ubicaciones : Map,
    publicoCuidar : Map
});

var Cuidador = conexion.model("Cuidador",cuidador);

module.exports = Cuidador;