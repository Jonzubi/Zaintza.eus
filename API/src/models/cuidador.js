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
    telefono : Map,
    isPublic : Boolean,
    precioPorPublico : Map,
    diasDisponible : Map,
    valoracionMedia : Number,
    puntosExp : Number
});

var Cuidador = mongoose.model("Cuidador",cuidador,"cuidadores");

module.exports = Cuidador;