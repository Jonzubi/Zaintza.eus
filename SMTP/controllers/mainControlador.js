const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const headerResponse = require("../util/headerResponse");
const { readHTMLFile, caesarShift } = require("../util/functions");
const pswd = require("../util/smtpPSW");
const fromEmail = require("../util/smtpEmail");
const ipMaquina = require("../util/ipMaquinaAPI");
const conexion = require('../../API/util/bdConnection');
const modelos = require('../../API/util/requireAllModels')(conexion);
const moment = require('moment');

const transporter = nodemailer.createTransport({
  host: 'ssl0.ovh.net',
  secure: true,
  port: 465,
  auth: {
    user: fromEmail,
    pass: pswd
  }
});

exports.sendRegisterEmail = (req, res) => {
  const { toEmail, nombre, apellido, validationToken } = req.body;
  if (toEmail) {
    readHTMLFile("verification", (err, html) => {
      const template = handlebars.compile(html);
      const htmlToSend = template({
        nombre,
        apellido,
        validationToken: caesarShift(validationToken, 10),
        ipMaquina
      });
      const mailOptions = {
        from: fromEmail,
        to: toEmail,
        subject: "[Zaintza.eus] Egiaztatu kontua",
        html: htmlToSend
      };

      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
          res.writeHead(500, headerResponse);
          res.end();
        } else {
          console.log("Email sent: " + info.response);
          res.writeHead(200, headerResponse);
          res.end();
        }
      });
    });
  } else {
    console.log("Falta el toEmail");
    res.writeHead(500, headerResponse);
    res.end();
  }
};

exports.sendResetPasswordEmail = async (req, res) => {
  const { email } = req.body;

  const modeloUsuario = modelos.resetPasswordRequest;
  const foundRequest = await modeloUsuario.find({ email }).sort({ _id: -1 }).limit(1);

  if (!foundRequest) {
    res.writeHead(400, headerResponse);
    res.write('No user found');
    res.end();
    return;
  } else {
    if (moment().isAfter(moment(foundRequest.fechaRequest))) {
      res.writeHead(400, headerResponse);
      res.write('Request caducado');
      res.end();
      return;
    }

    readHTMLFile("resetPassword", (err, html) => {
      const template = handlebars.compile(html);
      const htmlToSend = template({

      });
      const mailOptions = {
        from: fromEmail,
        to: toEmail,
        subject: "[Zaintza.eus] Pasahitza berrezarri",
        html: htmlToSend
      };
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
          res.writeHead(500, headerResponse);
          res.end();
        } else {
          console.log("Email sent: " + info.response);
          res.writeHead(200, headerResponse);
          res.end();
        }
      });
    });
  }
}
