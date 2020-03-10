const nodemailer = require('nodemailer');
const headerResponse = require("../util/headerResponse");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jonzubi97@gmail.com',
    pass: 'EuskalHerria-34'
  }
});

exports.sendRegisterEmail = (req, res) => {
    const mailOptions = {
        from: 'jonzubi97@gmail.com',
        to: 'jonzubi97@gmail.com',
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          res.writeHead(500, headerResponse);
          res.end();
        } else {
          console.log('Email sent: ' + info.response);
          res.writeHead(200, headerResponse);
          res.end();
        }
      });
}