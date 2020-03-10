"use strict";
module.exports = (app) => {
    const mainControlador = require("../controllers/mainControlador");

    app.route("/smtp/registerEmail").post((req, res) => mainControlador.sendRegisterEmail(req, res));
}