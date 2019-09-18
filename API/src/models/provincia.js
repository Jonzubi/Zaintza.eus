const mongoose = require("../public/bdConnection");

var provincia = new mongoose.Schema({
    idProvincia : Number,
    nombre : String
});

var Provincia = mongoose.model("Provincia",provincia,"provincias");

module.exports = Provincia;