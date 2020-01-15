"use strict";
module.exports = function(app) {
  var controlador = require("../controllers/controlador");

  //Inicio es una prueba para comprobar la respuesta
  app.route("/api/image/:id").post(controlador.postImage);

  app.route("/api/image/:id").get(controlador.getImage);
  
  app.route("/Inicio/").get(controlador.inicio);

  app.route("/api/:tabla/:id?").get(controlador.get);

  app.route("/api/:tabla/:id").delete(controlador.delete);

  app.route("/api/:tabla/").post(controlador.insert);

  app.route("/api/:tabla/:id").patch(controlador.update);
};
