module.exports = conexion => {
    const Schema = conexion.Schema;
  
    var valoracion = new Schema({
      idUsuario: {
          type: String,
          required: true,
          ref: 'Usuario'
      },
      //idValorador es el idUsuario del valorador
      idValorador: {
        type: String,
        required: true,
        ref: 'Usuario'
      },
      valor: {
          type: Number,
          required: true,
          min: 0,
          max: 5
      },
      comentario: String
    });
  
    return conexion.model("Valoracion", valoracion, "valoraciones");
  };