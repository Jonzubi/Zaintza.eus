module.exports = conexion => {
    let modelos = {};

    modelos.acuerdo = require("../src/models/acuerdo")(conexion);
    modelos.anuncio = require("../src/models/anuncio")(conexion);
    modelos.historicoacuerdo = require("../src/models/historicoAcuerdo")(conexion);
    modelos.cliente = require("../src/models/cliente")(conexion);
    modelos.historicocliente = require("../src/models/historicocliente")(conexion);
    modelos.cuidador = require("../src/models/cuidador")(conexion);
    modelos.historicocuidador = require("../src/models/historicocuidador")(conexion);
    modelos.notificacion = require("../src/models/notificacion")(conexion);
    modelos.historiconotificacion = require("../src/models/historiconotificacion")(conexion);
    modelos.propuestaAcuerdo = require("../src/models/propuestaAcuerdo")(conexion);
    modelos.historicopropuestaAcuerdo = require("../src/models/historicopropuestaAcuerdo")(conexion);
    modelos.usuario = require("../src/models/usuario")(conexion);
    modelos.historicousuario = require("../src/models/historicousuario")(conexion);
    modelos.ajuste = require("../src/models/ajustes")(conexion);
    modelos.invalidRequest = require("../src/models/invalidRequest")(conexion);

    return modelos;
}