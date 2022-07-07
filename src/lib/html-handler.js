const moment = require('moment');

class HtmlHandler {
  static header = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>HTML Intro</title>
    </head>
  `;

  static tableHeader = `
    <body>
      <style>
        html, body {
          width: 100%;
        }
        .body-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .table-wrapper {
          width: 800px;
          border-radius: 6px;
          overflow: hidden;
        }
        table {
          width: 100%;
          background-color: rgb(235, 235, 235);
          border-collapse: collapse;
          border-style: hidden;
        }
        tr:first-child {
          background-color: rgb(212, 212, 212);
          font-size: 16px;
          height: 28px;
        }
        tr:nth-child(2n) {
          background-color: white;
        }
        td {
          height: 25px;
          text-align: center;
          font-size: 12px;
        }
        td:nth-child(2n+1) {
          border-right: 1px solid rgb(219, 219, 219);
        }
        td:nth-child(6) {
          border-right: 1px solid rgb(219, 219, 219);
        }
      </style>
      <div class="body-wrapper">
        <div class="table-wrapper">
          <table>
            <tr>
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

  static #createTableBody(conjunctions) {
    let body = ``;
    conjunctions.map((conjunction, index) => {
      body += `
        <tr>
        <td>${index + 1}</td>
        <td>${conjunction.pid}</td>
        <td>${conjunction.pName}</td>
        <td>${conjunction.sid}</td>
        <td>${conjunction.sName}</td>
        <td>${moment
          .utc(conjunction.tcaTime)
          .format('MMM DD, YYYY HH:mm:ss')}</td>
        <td>${conjunction.dca}</td>
        `;
    });
    return body;
  }

  static jsonToHtml(conjunctions) {
    const tableBody = this.#createTableBody(conjunctions);
    return `${this.header}${this.tableHeader}${tableBody}${this.footer}`;
  }
}

module.exports = HtmlHandler;
