const { getRandomString } = require("../../util/funciones");

module.exports = conexion => {
  const Schema = conexion.Schema;

  var usuario = new Schema({
    email: {
      type: String,
      unique: true,
      required: true
    },
    contrasena: {
      type: String,
    },
    tipoUsuario: {
      type: String,
      enum: ['Cliente', 'Cuidador'],
      required: true
    },
    idPerfil: {
      type: String,
      refPath: 'tipoUsuario',
      required: true
    },
    validado: {
      type: Boolean,
      default: false
    },
    validationToken: {
      type: String,
      default: getRandomString(30)
    },
    bannedUntilDate: {
      type: Date,
      default: Date.now()
    }
  });

  return conexion.model("Usuario", usuario, "Usuarios");
};
