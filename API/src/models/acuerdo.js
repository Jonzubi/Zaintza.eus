const mongoose = require("../../util/bdConnection");

var acuerdo = new mongoose.Schema({
  idCuidador: {
    type: String,
    required: true
  },
  idCliente: {
    type: String,
    required: true
  },
  diasAcordados: {
    type: [Map],
    required: true
  },
  tituloAcuerdo: {
    type: String,
    required: true
  },
  descripcionAcuerdo: {
    type:String,
    required:true
  },
  pueblo: { type: [String], required: true },
  estadoAcuerdo: { type: Number, required: true },
  dateAcuerdo: { type: Date, required: true },
  dateFinAcuerdo: Date,
  origenAcuerdo:{
    type: String,
    required: true
  }
});

var Acuerdo = mongoose.model("Acuerdo", acuerdo, "Acuerdos");

module.exports = Acuerdo;
