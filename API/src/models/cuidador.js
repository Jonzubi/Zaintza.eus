const mongoose = require("../../util/bdConnection");

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
    email : String,
    telefono : String,
    isPublic : Boolean,
    precioPorPublico : Map
});

var Cuidador = mongoose.model("Cuidador",cuidador,"cuidadores");

module.exports = Cuidador;