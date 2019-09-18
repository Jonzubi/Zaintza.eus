const mongoose = require("../public/bdConnection");

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
    publicoCuidar : Map,
    email : String
});

var Cuidador = mongoose.model("Cuidador",cuidador,"cuidadores");

module.exports = Cuidador;