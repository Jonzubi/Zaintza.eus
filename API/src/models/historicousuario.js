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
      }
    });
  
    return conexion.model("HistoricoUsuario", usuario, "HistoricoUsuarios");
  };
  