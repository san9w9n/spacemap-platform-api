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

  static async sendMail(email, title, message, attachments = undefined) {
    const transporter = nodemailer.createTransport(this.#mailConfig);
    const mailOptions = {
      from: {
        name: 'SPACEMAP',
        address: process.env.EMAIL || 'please update .env',
      },
      to: email,
      subject: title,
      html: message,
      attachments,
    };
    return transporter.sendMail(mailOptions);
  }
}

module.exports = SendEmailHandler;
