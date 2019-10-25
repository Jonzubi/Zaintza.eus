const mongoose = require("../../util/bdConnection");

var cliente = new mongoose.Schema({
    nombres : Map,
    ubicacion : String,
    precioPorHora : Number,
    elCuidado : Map,
    valoracionMedia : Number
});