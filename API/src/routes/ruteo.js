'use strict';
module.exports = function(app) {
    var controlador = require('../controllers/controlador');

    //Inicio es una prueba para comprobar la respuesta
    app.route("/Inicio/")
        .get(controlador.inicio);

    app.route("/:tabla/:id?")
        .get(controlador.get);
    
    app.route("/:tabla/:id")
        .delete(controlador.delete);

    app.route("/:tabla/")
        .post(controlador.insert);
    
    app.route("/:tabla/:id")
        .patch(controlador.update);

}