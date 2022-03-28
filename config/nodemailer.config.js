require("dotenv").config();
const nodemailer = require("nodemailer");

const user = process.env.userMail;
const pass = process.env.passMail;

const transport = nodemailer.createTransport({
  service: "Mail.ru",
  secure: true,
  auth: {
    user: user,
    pass: pass,
  },
});

module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
  transport.sendMail({
    from: user,
    to: email,
    subject: "Please confirm your account",
    html: `<h1>Email Confirmation</h1>
        <h2>Hello ${name}</h2>
        <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
        <a href=${process.env.url}:${process.env.port}/api/auth/confirm/${confirmationCode}> Подтвердить почту</a>
        </div>`,
  }).catch(err => console.log(err));
};