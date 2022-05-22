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

  static async sendMail(title, message) {
    const transporter = nodemailer.createTransport(this.#mailConfig);
    const email = {
      from: process.env.EMAIL || 'please update .env',
      to: 'shawn.choi@spacemap42.com',
      subject: title,
      html: message,
    };
    return transporter.sendMail(email);
  }
}

module.exports = SendEmailHandler;
