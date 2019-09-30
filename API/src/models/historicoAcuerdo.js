const mongoose = require("../../util/bdConnection");

var historicoAcuerdo = new mongoose.Schema({
    idCuidador : String,
    idCliente : String,
    direccion : String,
    diasAcordados : Map,
    precioPorHora : Number,
    estadoAcuerdo : Number,
    dateAcuerdo : Date,
    dateFinAcuerdo : Date
});

var HistoricoAcuerdo = mongoose.model("HistoricoAcuerdo", historicoAcuerdo);

module.exports = HistoricoAcuerdo;