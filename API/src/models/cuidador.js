const mongoose = require("../../util/bdConnection");

var cuidador = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  apellido1: String,
  apellido2: String,
  fechaNacimiento: {
    type: String,
    required: true
  },
  sexo: {
    type: String,
    required: true
  },
  direcFoto: String,
  direcFotoContacto: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  ubicaciones: {
    type: [String],
    required: true
  },
  publicoDisponible: Map,
  telefono: {
    type: Map,
    required: true
  },
  isPublic: Boolean,
  precioPorPublico: Map,
  diasDisponible: [Map],
  valoracionMedia: Number
});

var Cuidador = mongoose.model("Cuidador", cuidador, "Cuidadores");

module.exports = Cuidador;
