const moment = require('moment');
const AdmZip = require('adm-zip');

class MailingServiceHandler {
  static async conjunctionsToHtml(conjunctionsForHtml, metadata) {
    const { totalcount, conjunctions } = conjunctionsForHtml;

    const header = `
<!DOCTYPE html>
<html>
  <head style = "width: 100%"><meta charset="UTF-8" /><title>Dailty Conjunctions</title></head>
  <body style = "width: 100%">
    ${this.#metadataToHtml(totalcount, metadata)}
    <div style = "width: 100%; display: flex">
      <div style = "width: 800px; border-radius: 6px; overflow: hidden">
        <table style = "width: 100%; background-color: rgb(235, 235, 235); border-collapse: collapse; border-style: hidden; margin-bottom: 20px">
          <tr style="background-color: rgb(212, 212, 212); font-size: 16px; height: 28px">
            <th>Index</th><th colspan="2">Primary</th><th colspan="2">Secondary</th><th>TCA</th><th>DCA</th>
          </tr>
    `;

    const style1 = ' style="height: 25px; text-align: center; font-size: 12px"';
    const style2 =
      ' style="height: 25px; text-align: center; font-size: 12px; border-right: 1px solid rgb(219, 219, 219)"';
    const body = conjunctions.reduce((accBody, conjunction, index) => {
      const newRow = `
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
      `;
      return accBody + newRow;
    }, '');

    const footer = `
        </table>
      </div>
    </div>
  </body>
</html>
    `;

    return `${header}${body}${footer}`;
  }

  static #metadataToHtml(totalcount, metadata) {
    const header = `
    <br>
    <b>There are ${totalcount} conjunctions.</b><br/>
    <br/>
    <table>
      <tr>
        <th>id</th>
        <th>name</th>
        <th>#conjunctions</th>
      </tr>
    `;

    const body = metadata.reduce((accBody, conjunction) => {
      const newRow = `
      <tr>
        <td style="padding-right: 10px; text-align: center">${conjunction.id}</td>
        <td style="padding-right: 20px; text-align: center">${conjunction.name}</td>
        <td style="text-align: center">${conjunction.numConjunctions}</td>
      </tr>
      `;
      return accBody + newRow;
    }, ``);

    const footer = `
    </table>
    <br/>
    <b>Please find below attachments for more information.</b><br/>
    <br/>
    `;

    return `${header}${body}${footer}`;
  }

  static async conjunctionsToAttachment(conjunctions, metadata) {
    const date = moment.utc().format('YYYY-MM-DD');
    if (conjunctions.length == 0) {
      return undefined;
    }
    if (conjunctions.length == 1) {
      return {
        filename: `${metadata[0].name}_${metadata[0].id}_${date}.csv`,
        content: this.#conjunctionsToCsv(conjunctions[0]),
      };
    }
    const zip = new AdmZip();
    conjunctions.map((conjunction, index) => {
      zip.addFile(
        `${metadata[index].name.replace('/', '_')}_${
          metadata[index].id
        }_${date}.csv`,
        Buffer.from(this.#conjunctionsToCsv(conjunction)),
      );
    });
    return {
      filename: `${date}.zip`,
      content: zip.toBuffer(),
    };
  }

  static #conjunctionsToCsv(conjunctionsForCsv) {
    const { conjunctions } = conjunctionsForCsv;

    const header = `"Index","Primary",,"Secondary",,"TCA","DCA"`;

    const body = conjunctions.reduce((accBody, conjunction, index) => {
      const newRow = `
      ${index + 1},"${conjunction.pid}","${conjunction.pName}","${
        conjunction.sid
      }","${conjunction.sName}","${moment
        .utc(conjunction.tcaTime)
        .format('MMM DD, YYYY HH:mm:ss')}","${conjunction.dca}"`;
      return accBody + newRow;
    }, '');

    return `${header}${body}`;
  }
}

module.exports = MailingServiceHandler;
