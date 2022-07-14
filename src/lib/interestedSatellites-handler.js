const moment = require('moment');
const fs = require('fs');
const AdmZip = require('adm-zip');

class InterestedSatellitesHandler {
  static conjunctionsToHtml(conjunctions, metadata) {
    const header = `
<!DOCTYPE html>
<html>
  <head style = "width: 100%"><meta charset="UTF-8" /><title>Dailty Conjunctions</title></head>
  <body style = "width: 100%">
    ${metadata}
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

  //   static conjunctionsToHtml(conjunctions, interestedArray) {
  //     const header = `
  // <!DOCTYPE html>
  // <html>
  //   <head style = "width: 100%"><meta charset="UTF-8" /><title>Dailty Conjunctions</title></head>
  //   <body style = "width: 100%">
  //     ${this.#getMetadata(conjunctions, interestedArray)}
  //     `;

  //     const body = conjunctions
  //       .map((satellitesId) => {
  //         const tableHeader = `
  //       <div style = "width: 100%; display: flex; justify-content: center">
  //         <div style = "width: 800px; border-radius: 6px; overflow: hidden">
  //           <table style = "width: 100%; background-color: rgb(235, 235, 235); border-collapse: collapse; border-style: hidden; margin-bottom: 20px">
  //             <tr style="background-color: rgb(212, 212, 212); font-size: 16px; height: 28px">
  //               <th>Index</th><th colspan="2">Primary</th><th colspan="2">Secondary</th><th>TCA</th><th>DCA</th>
  //             </tr>
  //       `;

  //         const style1 =
  //           ' style="height: 25px; text-align: center; font-size: 12px"';
  //         const style2 =
  //           ' style="height: 25px; text-align: center; font-size: 12px; border-right: 1px solid rgb(219, 219, 219)"';
  //         const tableBody = satellitesId
  //           .map(
  //             (conjunction, index) => `
  //           <tr${index % 2 ? '' : ' style="background-color: white"'}>
  //             <td${style2}>${index + 1}</td>
  //             <td${style1}>${conjunction.pid}</td>
  //             <td${style2}>${conjunction.pName}</td>
  //             <td${style1}>${conjunction.sid}</td>
  //             <td${style2}>${conjunction.sName}</td>
  //             <td${style2}>${moment
  //               .utc(conjunction.tcaTime)
  //               .format('MMM DD, YYYY HH:mm:ss')}</td>
  //             <td${style1}>${conjunction.dca}</td>
  //           </tr>
  //       `,
  //           )
  //           .reduce((acc, cur) => acc + cur, '');

  //         const tableFooter = `
  //         </table>
  //       </div>
  //     </div>
  //       `;

  //         return `${tableHeader}${tableBody}${tableFooter}`;
  //       })
  //       .reduce((acc, cur) => acc + cur, '');

  //     const footer = `
  //   </body>
  // </html>
  //     `;

  //     return `${header}${body}${footer}`;
  //   }

  static async conjunctionsToAttachment(conjunctions, email) {
    const date = moment.utc().format('YYYY-MM-DD');
    if (conjunctions.length == 0) {
      return undefined;
    }
    if (conjunctions.length == 1) {
      return {
        filename: `${conjunctions[0][0].pName}_${conjunctions[0][0].pid}_${date}.csv`,
        content: this.#conjunctionsToCsv(conjunctions[0]),
      };
    }
    const zip = new AdmZip();
    conjunctions.map((conjunction) => {
      zip.addFile(
        `${conjunction[0].pName}_${conjunction[0].pid}_${date}.csv`,
        Buffer.from(this.#conjunctionsToCsv(conjunction)),
      );
    });
    zip.writeZip(`public/zips/${email}.zip`);
    return {
      filename: `${date}.zip`,
      path: `public/zips/${email}.zip`,
    };
  }

  static #conjunctionsToCsv(conjunctions) {
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

  static removeAllZips() {
    const path = 'public/zips';
    fs.readdirSync(path).forEach((file, index) => {
      fs.unlinkSync(`${path}/${file}`);
    });
  }
}

module.exports = InterestedSatellitesHandler;
