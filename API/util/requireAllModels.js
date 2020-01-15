module.exports = conexion => {
    let modelos = {};

    modelos.acuerdo = require("../src/models/acuerdo")(conexion);
    modelos.cliente = require("../src/models/cliente")(conexion);
    modelos.cuidador = require("../src/models/cuidador")(conexion);
    modelos.historicoAcuerdo = require("../src/models/historicoAcuerdo")(conexion);
    modelos.notificacion = require("../src/models/notificacion")(conexion);
    modelos.propuestaAcuerdo = require("../src/models/propuestaAcuerdo")(conexion);
    modelos.usuario = require("../src/models/usuario")(conexion);

    return modelos;
}