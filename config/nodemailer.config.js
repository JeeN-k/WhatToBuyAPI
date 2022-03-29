require("dotenv").config();
const nodemailer = require("nodemailer");
const handlebars = require('handlebars');
const fs = require('fs');

const emailTemplate = fs.readFileSync(__dirname + '/page/confirmEmail.html', 'utf-8')
const template = handlebars.compile(emailTemplate)

let user = process.env.userMail
const transport = nodemailer.createTransport({
  service: "Mail.ru",
  secure: true,
  auth: {
    user: process.env.userMail,
    pass: process.env.passMail
  },
});

module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
  var replaces = {
    link: `${process.env.url}/api/auth/confirm/${confirmationCode}`,
    name: name
  }
  var htmlToSend = template(replaces)
  transport.sendMail({
    from: user,
    to: email,
    subject: "Please, confirm your account",
    html: htmlToSend,
  }).catch(err => console.log(err));
};