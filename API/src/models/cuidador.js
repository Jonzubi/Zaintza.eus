module.exports = conexion => {
  const Schema = conexion.Schema;

  var cuidador = new Schema({
    nombre: {
      type: String,
      required: true
    },
    apellido1: String,
    apellido2: String,
    fechaNacimiento: {
      type: String,
      required: true
    },
    sexo: {
      type: String,
      required: true
    },
    direcFoto: String,
    direcFotoContacto: {
      type: String,
      required: true
    },
    descripcion: {
      type: String,
      required: true
    },
    ubicaciones: {
      type: [String],
      required: true
    },
    publicoDisponible: Map,
    telefonoMovil: {
      type: String,
      required: true
    },
    telefonoFijo: {
      type: String
    },
    isPublic: Boolean,
    precioPorPublico: Map,
    diasDisponible: [Map],
    valoracionMedia: Number
  });
  return conexion.model("Cuidador", cuidador, "Cuidadores");
};
