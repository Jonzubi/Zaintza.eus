const mongoose = require("../../util/bdConnection");

var usuario = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    contrasena: {
        type: String,
        required: true
    },
    tipoUsuario: {
        type: String,
        required: true
    },
    idPerfil: {
        type: String,
        required: true
    }
});

var Usuario = mongoose.model("Usuario", usuario, "Usuarios");

module.exports = Usuario;