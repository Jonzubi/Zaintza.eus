'use strict';
module.exports = function(app) {
    var controlador = require('../controllers/controlador');

    //TODO Hacer el ruteo de consumo de datos
    //Inicio es una prueba para comprobar la respuesta
    app.route("/Inicio/")
        .get(controlador.inicio);

    app.route("/getAll/:tabla/")
        .get(controlador.getAll);
    
    app.route("/getRow/:tabla/:id")
        .get(controlador.getRow);

    app.route("/getOne/:tabla/:id/:columna")
        .get(controlador.getOne);

    app.route("/getCol/:tabla/:columna")
        .get(controlador.getCol);
    
    app.route("/deleteRow/:tabla/:id")
        .delete(controlador.deleteRow);

    app.route("/insertRow/:tabla/")
        .post(controlador.insertRow);
    
    app.route("/updateRow/:tabla/:id")
        .patch(controlador.updateRow);    

}