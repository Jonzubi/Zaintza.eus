const mongoose = require('mongoose');

module.exports = conexion => {
  const Schema = mongoose.Schema;

  var notificacion = new Schema({
    idUsuario: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Usuario"
    },
    idRemitente: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Usuario"
    },
    tipoNotificacion: {
      type: String,
      required: true
    },
    visto: {
      type: Boolean,
      required: true
    },
    show: {
      type: Boolean,
      default: true
    },
    //Este es el acuerdo en caso de que la notificacion sea una propuesta de acuerdo
    acuerdo: Object,
    //Este es si el acuerdo ha sido aceptado o rechazado en el caso de
    //que la notificacion sea una decision de un usuario en una notificacion
    valorGestion: Boolean,
    //Valoracion es si la notificacion es de tipo valoracion, llegara un valor con la cantidad de estrellas
    valoracion: Number,
    valoracionDetalle: String,
    dateEnvioNotificacion: {
      type: Date,
      required: true
    }
  });

  return conexion.model("Notificacion", notificacion, "Notificaciones");
};
