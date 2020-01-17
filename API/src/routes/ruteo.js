"use strict";
module.exports = (app, modelos) => {
  let mainControlador = require("../controllers/mainControlador");
  let proceduresControlador = require('../controllers/proceduresControlador');

  //Inicio es una prueba para comprobar la respuesta
  app.route("/api/image/:id").post((req, res) => mainControlador.postImage(req, res));

  app.route("/api/image/:id").get((req, res) => mainControlador.getImage(req, res));

  app.route("/api/procedures/getAcuerdosConUsuarios").get((req, res) => proceduresControlador.getAcuerdosConUsuarios(req, res, modelos));

  app.route("/api/procedures/getNotificacionesConUsuarios").get((req, res) => proceduresControlador.getNotificacionesConUsuarios(req, res, modelos));

  app.route("/api/procedures/getUsuarioConPerfil").get((req, res) => proceduresControlador.getUsuarioConPerfil(req, res, modelos));
  
  app.route("/Inicio/").get(mainControlador.inicio);

  app.route("/api/:tabla/:id?").get((req, res) => mainControlador.get(req, res, modelos));

  app.route("/api/:tabla/:id").delete((req, res) => mainControlador.delete(req, res, modelos));

  app.route("/api/:tabla/").post((req, res) => mainControlador.insert(req, res, modelos));

  app.route("/api/:tabla/:id").patch((req, res) => mainControlador.update(req, res, modelos));
};
