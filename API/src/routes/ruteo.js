"use strict";
module.exports = (app, conexion) => {
  let mainControlador = require("../controllers/mainControlador");
  let proceduresControlador = require('../controllers/proceduresControlador');

  //Inicio es una prueba para comprobar la respuesta
  app.route("/api/image/:id").post((req, res) => mainControlador.postImage(req, res));

  app.route("/api/image/:id").get((req, res) => mainControlador.getImage(req, res));

  app.route("/api/procedures/getAcuerdosConUsuarios").get((req, res) => proceduresControlador.getAcuerdosConUsuarios(req, res, conexion));
  
  app.route("/Inicio/").get(mainControlador.inicio);

  app.route("/api/:tabla/:id?").get((req, res) => mainControlador.get(req, res, conexion));

  app.route("/api/:tabla/:id").delete((req, res) => mainControlador.delete(req, res, conexion));

  app.route("/api/:tabla/").post((req, res) => mainControlador.insert(req, res, conexion));

  app.route("/api/:tabla/:id").patch((req, res) => mainControlador.update(req, res, conexion));
};
