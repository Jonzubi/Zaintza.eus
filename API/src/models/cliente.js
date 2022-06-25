module.exports = conexion => {
  const Schema = conexion.Schema;
  var cliente = new Schema({
    direcFoto: {
      type: String,
      default: ""
    },
    nombre: {
      type: String,
      default: ""
    },
    telefonoMovil: {
      type: String,
      default: ""
    },
    telefonoFijo: {
      type: String,
      default: ""
    },
    apellido1: {
      type: String,
      default: ""
    },
    apellido2: {
      type: String,
      default: ""
    }
  });
  return conexion.model("Cliente", cliente, "Clientes");
};
