module.exports = conexion => {
  const Schema = conexion.Schema;

  var usuario = new Schema({
    email: {
      type: String,
      required: true,
      unique: true
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
    validationToken: {
      type: String,
      required: true
    },
    bannedUntilDate: {
      type: Date,
      default: Date.now()
    }
  });

  return conexion.model("Usuario", usuario, "Usuarios");
};
