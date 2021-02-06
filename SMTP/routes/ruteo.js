"use strict";
module.exports = (app) => {
    const mainControlador = require("../controllers/mainControlador");

    app.route("/smtp/registerEmail").post((req, res) => mainControlador.sendRegisterEmail(req, res));
    app.route("/smtp/reSendRegisterEmail").post((req, res) => mainControlador.reSendRegisterEmail(req, res));
    app.route("/smtp/sendResetPasswordEmail").post((req, res) => mainControlador.sendResetPasswordEmail(req, res));
}