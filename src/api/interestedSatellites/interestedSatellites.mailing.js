const moment = require('moment');
const AdmZip = require('adm-zip');

class MailingServiceHandler {
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
