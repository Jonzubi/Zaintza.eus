module.exports = conexion => {
  const Schema = conexion.Schema;

  var propuestaAcuerdo = new Schema({
    idCuidador: String,
    idCliente: String,
    diasDisponible: {
      dia: String,
      horaInicio: String,
      horaFin: String
    },
    estadoPropuesta: Number,
    caducidad: Date,
    datePropuesta: Date
  });

  return conexion.model(
    "PropuestaAcuerdo",
    propuestaAcuerdo,
    "PropuestaAcuerdos"
  );
};
