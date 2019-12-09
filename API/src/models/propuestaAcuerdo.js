const mongoose = require("../../util/bdConnection");

var propuestaAcuerdo = new mongoose.Schema({
    idCuidador : String,
    idCliente : String,
    diasDisponible : Map,
    estadoPropuesta : Number,
    caducidad : Date,
    datePropuesta : Date
});

var PropuestaAcuerdo = mongoose.model("PropuestaAcuerdo", propuestaAcuerdo, "PropuestaAcuerdos");
module.exports = PropuestaAcuerdo;