const mongoose = require("../../util/bdConnection");

var cuidador = new mongoose.Schema({
    nombre : String,
    apellido1 : String,
    apellido2 : String,
    fechaNacimiento : Date,
    sexo : String,
    direcFoto : [String],
    descripcion : String,
    ubicaciones : [String],
    publicoCuidar : [String],
    email : String,
    contrasena : String,
    telefono : Map,
    isPublic : Boolean,
    precioPorPublico : Map,
    diasDisponible : [Map],
    valoracionMedia : Number
});

var Cuidador = mongoose.model("Cuidador",cuidador, "Cuidadores");

module.exports = Cuidador;