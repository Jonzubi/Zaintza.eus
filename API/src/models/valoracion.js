const mongoose = require("../../util/bdConnection");

var valoracion = new mongoose.Schema({
    idAcuerdo : String,
    deID : String,
    aID : String,
    comentario : String,
    nota : Number,
    cuidadorACliente : Boolean
});

var Valoracion = mongoose.model("Valoracion",valoracion);

module.exports = Valoracion;