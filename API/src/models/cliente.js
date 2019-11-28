const mongoose = require("../../util/bdConnection");

var cliente = new mongoose.Schema({
    direcFoto: String,
    nombre : String,
    apellido1 : String,
    apellido2: String,
    email : String,
    contrasena: String
});

var Cliente = mongoose.model("Cliente", cliente, "Clientes");

module.exports = Cliente;