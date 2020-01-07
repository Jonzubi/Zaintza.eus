const mongoose = require("../../util/bdConnection");

var notificacion = new mongoose.Schema({
  idUsuario: {
    type: String,
    required: true
  },
  tipoNotificacion:{
    type: String,
    required: true
  },
  acuerdo: Object
});

var Notificacion = mongoose.model("Notificacion", notificacion, "Notificaciones");

module.exports = Notificacion;