module.exports = conexion => {
  const Schema = conexion.Schema;
  var cliente = new Schema({
    direcFoto: String,
    nombre: {
      type: String,
      required: true
    },
    telefonoMovil: {
      type: String,
      required: true
    },
    telefonoFijo: {
      type: String
    },
    apellido1: String,
    apellido2: String
  });
  return conexion.model("Cliente", cliente, "Clientes");
};
