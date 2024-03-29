"use strict";
module.exports = (app, modelos) => {
  let mainControlador = require("../controllers/mainControlador");
  let proceduresControlador = require('../controllers/proceduresControlador');

  //Inicio es una prueba para comprobar la respuesta
  app.route("/api/image/:id").post((req, res) => mainControlador.postImage(req, res));

  app.route("/api/image/:id").get((req, res) => mainControlador.getImage(req, res));

  app.route("/api/procedures/getAcuerdosConUsuarios").post((req, res) => proceduresControlador.getAcuerdosConUsuarios(req, res, modelos));

  app.route("/api/procedures/getNotificacionesConUsuarios").post((req, res) => proceduresControlador.getNotificacionesConUsuarios(req, res, modelos));

  app.route("/api/procedures/getUsuarioConPerfil").post((req, res) => proceduresControlador.getUsuarioConPerfil(req, res, modelos));

  app.route("/api/procedures/getAnunciosConPerfil").get((req, res) => proceduresControlador.getAnunciosConPerfil(req, res, modelos));

  app.route("/api/procedures/postNewCuidador").post((req, res) => proceduresControlador.postNewCuidador(req, res, modelos));

  app.route("/api/procedures/postNewCliente").post((req, res) => proceduresControlador.postNewCliente(req, res, modelos));

  app.route("/api/procedures/postNewUsuario").post((req, res) => proceduresControlador.postNewUsuario(req, res, modelos));

  app.route("/api/procedures/postNewUsuarioWithGoogle").post((req, res) => proceduresControlador.postNewUsuarioWithGoogle(req, res, modelos));

  app.route("/api/procedures/postAnuncio").post((req, res) => proceduresControlador.postAnuncio(req, res, modelos));

  app.route("/api/procedures/postPropuestaAcuerdo").post((req, res) => proceduresControlador.postPropuestaAcuerdo(req, res, modelos));

  app.route("/api/procedures/patchCuidador/:id").patch((req, res) => proceduresControlador.patchCuidador(req, res, modelos));

  app.route("/api/procedures/patchCliente/:id").patch((req, res) => proceduresControlador.patchCliente(req, res, modelos));

  app.route("/api/procedures/patchPredLang/:id").post((req, res) => proceduresControlador.patchPredLang(req, res, modelos));

  app.route("/api/procedures/confirmarEmail").get((req, res) => proceduresControlador.confirmarEmail(req, res, modelos));

  app.route("/api/procedures/getEmailWithIdPerfil/:idPerfil").get((req, res) => proceduresControlador.getEmailWithIdPerfil(req, res, modelos));

  app.route("/api/procedures/getNotificationsWithIdUsuario/:idUsuario").post((req, res) => proceduresControlador.getNotificationsWithIdUsuario(req, res, modelos));

  app.route("/api/procedures/getIdUsuarioConIdPerfil/:idPerfil").get((req, res) => proceduresControlador.getIdUsuarioConIdPerfil(req, res, modelos));

  app.route("/api/procedures/patchPassword/:idUsuario").patch((req, res) => proceduresControlador.patchPassword(req, res, modelos));

  app.route("/api/procedures/checkIfEmailExists/:email").get((req, res) => proceduresControlador.checkIfEmailExists(req, res, modelos));

  app.route("/api/procedures/newNotification").post((req, res) => proceduresControlador.newNotification(req, res, modelos));

  app.route("/api/procedures/getAcuerdoStatus/:idAcuerdo").post((req, res) => proceduresControlador.getAcuerdoStatus(req, res, modelos));

  app.route("/api/procedures/terminarAcuerdo/:idAcuerdo").patch((req, res) => proceduresControlador.terminarAcuerdo(req, res, modelos));

  app.route("/api/procedures/gestionarAcuerdo/:idAcuerdo").patch((req, res) => proceduresControlador.gestionarAcuerdo(req, res, modelos));

  app.route("/api/procedures/checkIfAcuerdoExists").post((req, res) => proceduresControlador.checkIfAcuerdoExists(req, res, modelos));

  app.route("/api/procedures/newAcuerdo").post((req, res) => proceduresControlador.newAcuerdo(req, res, modelos));

  app.route("/api/procedures/getMisAnuncios").post((req, res) => proceduresControlador.getMisAnuncios(req, res, modelos));

  app.route("/api/procedures/patchAnuncio/:idAnuncio").patch((req, res) => proceduresControlador.patchAnuncio(req, res, modelos));

  app.route("/api/procedures/deleteAnuncio/:idAnuncio").post((req, res) => proceduresControlador.deleteAnuncio(req, res, modelos))

  app.route("/api/procedures/registerAnuncioVisita/:idAnuncio").post((req, res) => proceduresControlador.registerAnuncioVisita(req, res, modelos));

  app.route("/api/procedures/getAnuncioVisitas/:idAnuncio").post((req, res) => proceduresControlador.getAnuncioVisitas(req, res, modelos));

  app.route("/api/procedures/registerCuidadorVisita/:idCuidador").post((req, res) => proceduresControlador.registerCuidadorVisita(req, res, modelos));

  app.route("/api/procedures/getCuidadorVisitas/:idCuidador").post((req, res) => proceduresControlador.getCuidadorVisitas(req, res, modelos));

  app.route("/api/procedures/getCuidadoresConValoraciones").get((req, res) => proceduresControlador.getCuidadoresConValoraciones(req, res, modelos));

  app.route("/api/procedures/postNewValoracion").post((req, res) => proceduresControlador.postNewValoracion(req, res, modelos));

  app.route("/api/procedures/getValoracionesDelCuidador/:idUsuario").get((req, res) => proceduresControlador.getValoracionesDelCuidador(req, res, modelos));

  app.route("/api/procedures/patchMaxDistance/:id").patch((req, res) => proceduresControlador.patchMaxDistance(req, res, modelos));

  app.route("/api/procedures/banUser").post((req, res) => proceduresControlador.banUser(req, res, modelos));

  app.route("/api/procedures/unBanUser").post((req, res) => proceduresControlador.unBanUser(req, res, modelos));

  app.route("/api/procedures/deleteCuidadorImg").post((req, res) => proceduresControlador.deleteCuidadorImg(req, res, modelos));

  app.route("/api/procedures/isUserBanned/:idPerfil").get((req, res) => proceduresControlador.isUserBanned(req, res, modelos));

  app.route("/api/procedures/newResetPasswordRequest").post((req, res) => proceduresControlador.newResetPasswordRequest(req, res, modelos));

  app.route("/api/procedures/formResetPassword").get((req, res) => proceduresControlador.formResetPassword(req, res, modelos));

  app.route("/api/procedures/resetPassword").post((req, res) => proceduresControlador.resetPassword(req, res, modelos));

  app.route("/api/getLogo").get((req, res) => mainControlador.getLogo(req, res));
  
  app.route("/Inicio/").get(mainControlador.inicio);

  app.route("/api/:tabla/:id?").get((req, res) => mainControlador.get(req, res, modelos));

  app.route("/api/:tabla/:id").delete((req, res) => mainControlador.delete(req, res, modelos));

  app.route("/api/:tabla/").post((req, res) => mainControlador.insert(req, res, modelos));

  app.route("/api/:tabla/:id").patch((req, res) => mainControlador.update(req, res, modelos));
};
