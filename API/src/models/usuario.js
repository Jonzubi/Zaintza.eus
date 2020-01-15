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
      required: true
    },
    idPerfil: {
      type: String,
      required: true
    }
  });

  return conexion.model("Usuario", usuario, "Usuarios");
};
