const mongoose = require("../../util/bdConnection");

var acuerdo = new mongoose.Schema({
    idCuidador : String,
    idCliente : String,
    direccion : String,
    diasAcordados : Map,
    precioPorHora : Number,
    estadoAcuerdo : Number,
    dateAcuerdo : Date,
    dateFinAcuerdo : Date
});

var Acuerdo = mongoose.model("Acuerdo", acuerdo, "Acuerdos");

module.exports = Acuerdo;