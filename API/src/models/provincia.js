const mongoose = require("../../util/bdConnection");

var provincia = new mongoose.Schema({
    nombre : String
});

var Provincia = mongoose.model("Provincia",provincia,"provincias");

module.exports = Provincia;