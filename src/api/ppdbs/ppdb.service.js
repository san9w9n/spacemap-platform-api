/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

const { getFormatDate } = require('../../lib/date-handler');
const PpdbModel = require('./ppdb.model');

class PpdbService {
  async savePpdbOnDatabase(createdAt, ppdbTexts) {
    console.log(createdAt);
    /** @type [String] */
    const ppdbArray = ppdbTexts.split('\n');
    const ppdbs = ppdbArray
      .filter((rawPpdb) => rawPpdb[0] !== '%')
      .map((rawPpdb) => {
        const parsedPpdb = rawPpdb.split('\t');
        const date = getFormatDate(
          parsedPpdb[6],
          parsedPpdb[7],
          parsedPpdb[8],
          0
        ).substring(0, 10);
        const ppdb = {
          createdAt,
          date,
          time: `${parsedPpdb[9]}:${parsedPpdb[10]}:${parsedPpdb[11]}`,
          pid: Number(parsedPpdb[0]),
          sid: Number(parsedPpdb[1]),
          pdca: Number(parsedPpdb[2]),
          sdca: Number(parsedPpdb[3]),
          ptca: Number(parsedPpdb[4]),
          stca: Number(parsedPpdb[5]),
        };
        return ppdb;
      });
    await PpdbModel.insertMany(ppdbs);
  }
}

module.exports = PpdbService;
