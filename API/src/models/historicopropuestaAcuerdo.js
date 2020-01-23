module.exports = conexion => {
    const Schema = conexion.Schema;
  
    var propuestaAcuerdo = new Schema({
      idCuidador: String,
      idCliente: String,
      diasDisponible: Map,
      estadoPropuesta: Number,
      caducidad: Date,
      datePropuesta: Date
    });
  
    return conexion.model(
      "HistoricoPropuestaAcuerdo",
      propuestaAcuerdo,
      "HistoricoPropuestaAcuerdos"
    );
  };
  