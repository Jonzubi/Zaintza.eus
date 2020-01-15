const mongoose = require("../../util/bdConnection");
const Schema = mongoose.Schema;

var notificacion = new Schema({
  idUsuario: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Usuario'
  },
  idRemitente:{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Usuario'
  },
  tipoNotificacion:{
    type: String,
    required: true
  },
  visto:{
    type: Boolean,
    required: true
  },
  //Este es el acuerdo en caso de que la notificacion sea una propuesta de acuerdo
  acuerdo: Object,
  //Este es si el acuerdo ha sido aceptado o rechazado en el caso de 
  //que la notificacion sea una decision de un usuario en una notificacion
  valorGestion: Boolean,
  dateEnvioNotificacion: {
    type: Date,
    required: true
  }
});

var Notificacion = mongoose.model("Notificacion", notificacion, "Notificaciones");

module.exports = Notificacion;