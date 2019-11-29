const mongoose = require("../../util/bdConnection");

var cliente = new mongoose.Schema({
    direcFoto: String,
    nombre : {
        type:String,
        required: true
    },
    telefono:{
        type: Map,
        required: true
    },
    apellido1 : String,
    apellido2: String,
});

var Cliente = mongoose.model("Cliente", cliente, "Clientes");

module.exports = Cliente;