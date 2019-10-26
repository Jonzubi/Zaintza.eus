const mongoose = require("../../util/bdConnection");

var propuestaAcuerdo = new mongoose.Schema({
    idCuidador : String,
    idCliente : String,
    direccion : String,
    diasAAcordarse : Map,
    precioPorHora : Number,
    estadoPropuesta : Number,
    caducidad : Date,
    datePropuesta : Date
});

var PropuestaAcuerdo = mongoose.model("PropuestaAcuerdo", propuestaAcuerdo, "PropuestaAcuerdos");
module.exports = PropuestaAcuerdo;