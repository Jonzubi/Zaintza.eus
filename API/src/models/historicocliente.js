module.exports = conexion => {
    const Schema = conexion.Schema;
    var cliente = new Schema({
      direcFoto: String,
      nombre: {
        type: String,
        required: true
      },
      telefono: {
        type: Map,
        required: true
      },
      apellido1: String,
      apellido2: String
    });
    return conexion.model("HistoricoCliente", cliente, "HistoricoClientes");
  };