const moment = require('moment');

class HtmlHandler {
  static header = `
  <!DOCTYPE html>
  <html>
    <head style = "width: 100%">
      <meta charset="UTF-8" />
      <title>Dailty Conjunctions</title>
    </head>
    <body style = "
    width: 100%">
      <div style = "
      width: 100%;
      display: flex;
      justify-content: center;
      ">
        <div style = "
        width: 800px;
        border-radius: 6px;
        overflow: hidden
        ">
          <table style = "
          width: 100%;
          background-color: rgb(235, 235, 235);
          border-collapse: collapse;
          border-style: hidden
          ">
            <tr style="
            background-color: rgb(212, 212, 212);
            font-size: 16px;
            height: 28px;
            ">
              <th>Index</th>
              <th colspan="2">Primary</th>
              <th colspan="2">Secondary</th>
              <th>TCA</th>
              <th>DCA</th>
            </tr>
    `;

  static footer = `
            </table>
          </div>
        </div>
      </body>
    </html>
    `;

  static #createBody(conjunctions) {
    const tr = ` style="background-color: white"`;
    const td1 = ` style="height: 25px; text-align: center; font-size: 12px"`;
    const td2 = ` style="height: 25px; text-align: center; font-size: 12px; border-right: 1px solid rgb(219, 219, 219)"`;

    const body = conjunctions
      .map((conjunction, index) => {
        return `
        <tr${index % 2 ? '' : tr}>
        <td${td2}>${index + 1}</td>
        <td${td1}>${conjunction.pid}</td>
        <td${td2}>${conjunction.pName}</td>
        <td${td1}>${conjunction.sid}</td>
        <td${td2}>${conjunction.sName}</td>
        <td${td2}>${moment
          .utc(conjunction.tcaTime)
          .format('MMM DD, YYYY HH:mm:ss')}</td>
        <td${td1}>${conjunction.dca}</td>
        </tr>
        `;
      })
      .reduce((prev, curr) => {
        return prev + curr;
      }, '');
    return body;
  }

  static jsonToHtml(conjunctions) {
    const body = this.#createBody(conjunctions);
    return `${this.header}${body}${this.footer}`;
  }
}

module.exports = HtmlHandler;
