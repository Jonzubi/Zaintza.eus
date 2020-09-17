const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const headerResponse = require("../util/headerResponse");
const { readHTMLFile, caesarShift } = require("../util/functions");
const pswd = require("../util/smtpPSW");
const fromEmail = require("../util/smtpEmail");
const ipMaquina = require("../util/ipMaquinaAPI");

const transporter = nodemailer.createTransport({
  host: 'SMTP:SSL0.OVH.NET',
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
