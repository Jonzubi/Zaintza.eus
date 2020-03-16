module.exports = conexion => {
  const Schema = conexion.Schema;

  var usuario = new Schema({
    email: {
      type: String,
      required: true
    },
    contrasena: {
      type: String,
      required: true
    },
    tipoUsuario: {
      type: String,
      required: true,
      enum: ['Cliente', 'Cuidador']
    },
    idPerfil: {
      type: String,
      required: true,
      refPath: 'tipoUsuario'
    },
    validado: {
      type: Boolean,
      required: true
    },
    validation_token: {
      type: String,
      required: true
    }
  });

  return conexion.model("Usuario", usuario, "Usuarios");
};
