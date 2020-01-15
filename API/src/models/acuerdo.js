const mongoose = require("../../util/bdConnection");
const Schema = mongoose.Schema;

var acuerdo = new mongoose.Schema({
  idCuidador: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Cuidador'
  },
  idCliente: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Cliente'
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
