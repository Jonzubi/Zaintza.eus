const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const headerResponse = require("../util/headerResponse");
const readHTMLFile = require("../util/functions");
const pswd = require("../util/smtpPSW");
const fromEmail = require("../util/smtpEmail");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: fromEmail,
    pass: pswd
  }
});

exports.sendRegisterEmail = (req, res) => {
  const { toEmail, nombre, apellido } = req.body;
  if (toEmail) {
    readHTMLFile("verification", (err, html) => {
      const template = handlebars.compile(html);
      const htmlToSend = template({
        nombre,
        apellido
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
