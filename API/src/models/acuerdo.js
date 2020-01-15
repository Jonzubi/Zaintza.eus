const mongoose = require('mongoose');
module.exports = (conexion) => {
  const Schema = mongoose.Schema;

  var acuerdo = new Schema({
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

  return conexion.model("Acuerdo", acuerdo, "Acuerdos");
}
