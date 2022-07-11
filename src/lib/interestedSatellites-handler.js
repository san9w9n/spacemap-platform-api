const moment = require('moment');

class HtmlHandler {
  static conjunctionsToHtml(conjunctions) {
    const header = `
<!DOCTYPE html>
<html>
  <head style = "width: 100%"><meta charset="UTF-8" /><title>Dailty Conjunctions</title></head>
  <body style = "width: 100%">
    <div style = "width: 100%; display: flex; justify-content: center">
      <div style = "width: 800px; border-radius: 6px; overflow: hidden">
        <table style = "width: 100%; background-color: rgb(235, 235, 235); border-collapse: collapse; border-style: hidden">
          <tr style="background-color: rgb(212, 212, 212); font-size: 16px; height: 28px">
            <th>Index</th><th colspan="2">Primary</th><th colspan="2">Secondary</th><th>TCA</th><th>DCA</th>
          </tr>
    `;

    const style1 = ' style="height: 25px; text-align: center; font-size: 12px"';
    const style2 =
      ' style="height: 25px; text-align: center; font-size: 12px; border-right: 1px solid rgb(219, 219, 219)"';
    const body = conjunctions
      .map(
        (conjunction, index) => `
          <tr${index % 2 ? '' : ' style="background-color: white"'}>
            <td${style2}>${index + 1}</td>
            <td${style1}>${conjunction.pid}</td>
            <td${style2}>${conjunction.pName}</td>
            <td${style1}>${conjunction.sid}</td>
            <td${style2}>${conjunction.sName}</td>
            <td${style2}>${moment
          .utc(conjunction.tcaTime)
          .format('MMM DD, YYYY HH:mm:ss')}</td>
            <td${style1}>${conjunction.dca}</td>
          </tr>
      `,
      )
      .reduce((acc, cur) => acc + cur, '');

    const footer = `
        </table>
      </div>
    </div>
  </body>
</html>
    `;

    return `${header}${body}${footer}`;
  }

  static conjunctionsToCsv(conjunctions) {
    return {
      filename: 'csvasdftest.csv',
      content: `"Index","Primary",,"Secondary",,"TCA","DCA"
"1","44238","STARLINK-24","46838","OBJECT M","Jul 10,2022 16:16:39","9.681"
"2","131","THOR ABLESTAR DEB","39967","COSMOS 1275 DEB","Jul 10, 2022 18:08:26","7.961"
`,
    };
  }
}

module.exports = HtmlHandler;
