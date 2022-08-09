const nodemailer = require('nodemailer');
const ejs = require('ejs');
const juice = require('juice');

class SendEmailHandler {
  static #mailConfig = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PW,
    },
  };

  static async sendMail(email, title, message, attachments = undefined) {
    const transporter = nodemailer.createTransport(this.#mailConfig);
    const mailOptions = {
      from: {
        name: 'SPACEMAP',
        address: process.env.EMAIL,
      },
      bcc: email,
      subject: title,
      html: message,
      attachments,
    };
    return transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });
  }

  static async renderHtml(template, context) {
    const renderedHtml = await ejs.renderFile(
      `src/templates/${template}.ejs`,
      context,
    );

    return new Promise((resolve, reject) => {
      juice.juiceResources(String(renderedHtml), {}, (err, html) => {
        if (err) reject(err);
        resolve(html);
      });
    });
  }
}

module.exports = SendEmailHandler;
