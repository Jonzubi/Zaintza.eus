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

  app.route("/api/procedures/getAnunciosConPerfil").get((req, res) => proceduresControlador.getAnunciosConPerfil(req, res, modelos));

  app.route("/api/procedures/postNewCuidador").post((req, res) => proceduresControlador.postNewCuidador(req, res, modelos));

  app.route("/api/procedures/postNewCliente").post((req, res) => proceduresControlador.postNewCliente(req, res, modelos));

  app.route("/api/procedures/postAnuncio").post((req, res) => proceduresControlador.postAnuncio(req, res, modelos));

  app.route("/api/procedures/postPropuestaAcuerdo").post((req, res) => proceduresControlador.postPropuestaAcuerdo(req, res, modelos));

  app.route("/api/procedures/patchCuidador/:id").patch((req, res) => proceduresControlador.patchCuidador(req, res, modelos));

  app.route("/api/procedures/patchCliente/:id").patch((req, res) => proceduresControlador.patchCliente(req, res, modelos));

  app.route("/api/procedures/patchPredLang/:id").post((req, res) => proceduresControlador.patchPredLang(req, res, modelos));
  
  app.route("/Inicio/").get(mainControlador.inicio);

  app.route("/api/:tabla/:id?").get((req, res) => mainControlador.get(req, res, modelos));

  app.route("/api/:tabla/:id").delete((req, res) => mainControlador.delete(req, res, modelos));

  app.route("/api/:tabla/").post((req, res) => mainControlador.insert(req, res, modelos));

  app.route("/api/:tabla/:id").patch((req, res) => mainControlador.update(req, res, modelos));
};
