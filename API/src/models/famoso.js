var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var famosoSchema = new Schema({
  idFamoso: Number,
  nombre: String,
  apellido: String,
  apodo: Boolean,
  fechaNacimiento: String,
  descripcion: String,
  biografia: String,
  direcFoto: String
});

var Famoso = mongoose.model('famoso', famosoSchema);

module.exports = Famoso;