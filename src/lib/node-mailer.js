const nodemailer = require('nodemailer');

class SendEmailHandler {
  static #mailConfig = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: process.env.EMAIL || 'please update .env',
      pass: process.env.EMAIL_PW || 'please update .env',
    },
  };

  static async sendMail(email, title, message) {
    const transporter = nodemailer.createTransport(this.#mailConfig);
    const mailOptions = {
      from: process.env.EMAIL || 'please update .env',
      to: email,
      subject: title,
      html: message,
    };
    return transporter.sendMail(mailOptions);
  }
}

module.exports = SendEmailHandler;
