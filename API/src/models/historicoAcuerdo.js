module.exports = conexion => {
  const Schema = conexion.Schema;

  var historicoAcuerdo = new mongoose.Schema({
    idCuidador: String,
    idCliente: String,
    direccion: String,
    diasAcordados: Map,
    precioPorHora: Number,
    estadoAcuerdo: Number,
    dateAcuerdo: Date,
    dateFinAcuerdo: Date
  });

  return conexion.model(
    "HistoricoAcuerdo",
    historicoAcuerdo,
    "HistoricoAcuerdos"
  );
};
