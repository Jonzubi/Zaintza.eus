const nodemailer = require("nodemailer");
const headerResponse = require("../util/headerResponse");
const readHTMLFile = require("../util/functions");
const pswd = require("../util/smtpPSW");
const fromEmail = require("../util/smtpEmail");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: pswd
  }
});

exports.sendRegisterEmail = (req, res) => {
  const toEmail = req.body;
  if (toEmail) {
    readHTMLFile("verification", (err, html) => {
      const mailOptions = {
        from: fromEmail,
        to: toEmail,
        subject: "[Zaintza.eus] Egiaztatu kontua",
        html: html
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
