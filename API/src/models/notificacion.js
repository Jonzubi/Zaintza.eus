const mongoose = require("../../util/bdConnection");

var notificacion = new mongoose.Schema({
  idUsuario: {
    type: String,
    required: true
  },
  idRemitente:{
    type: String,
    required: true
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
  valorGestion: Boolean
});

var Notificacion = mongoose.model("Notificacion", notificacion, "Notificaciones");

module.exports = Notificacion;