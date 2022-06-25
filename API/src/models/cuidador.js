module.exports = conexion => {
  const Schema = conexion.Schema;

  var cuidador = new Schema({
    nombre: {
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
    },
    fechaNacimiento: {
      type: String,
      default: ""
    },
    sexo: {
      type: String,
      default: ""
    },
    direcFoto: {
      type: String,
      default: ""
    },
    direcFotoContacto: {
      type: String,
      default: ""
    },
    descripcion: {
      type: String,
      default: ""
    },
    ubicaciones: {
      type: [String],
      default: []
    },
    publicoDisponible: {
      nino: Boolean,
      terceraEdad: Boolean,
      necesidadEspecial: Boolean
    },
    telefonoMovil: {
      type: String,
      default: ""
    },
    telefonoFijo: {
      type: String,
      default: ""
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    precioPorPublico: {
      nino: String,
      terceraEdad: String,
      necesidadEspecial: String
    },
    diasDisponible: [{
      dia: String,
      horaInicio: String,
      horaFin: String
    }],
    valoracionMedia: Number
  });
  return conexion.model("Cuidador", cuidador, "Cuidadores");
};
