module.exports = (conexion) => {
  const Schema = conexion.Schema;

  var valoracion = new Schema({
    idUsuario: {
      type: String,
      required: true,
      ref: "Usuario",
    },
    //idValorador es el idUsuario del valorador
    idValorador: {
      type: String,
      required: true,
      ref: "Usuario",
    },
    //idAcuerdo es el acuerdo del que proviene la valoracion
    // ya que las valoraciones se podran hacer despues de terminar un acuerdo
    idAcuerdo: {
      type: String,
      required: true,
      ref: "Acuerdo",
    },
    valor: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    comentario: String,
    fechaValorado: Date,
    // Una valoración se puede hacer de forma anónima o no
    esAnonimo: {
      type: Boolean,
      required: true,
      default: false
    }
  });

  return conexion.model("Valoracion", valoracion, "Valoraciones");
};
