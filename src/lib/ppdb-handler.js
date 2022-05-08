const DateHandler = require('./date-handler');
const StringHandler = require('./string-handler');
const { promiseReadFile } = require('./promise-io');

class PpdbHandler {
  static async #getPpdbObject(createdAt, rawPpdb) {
    const splitPpdb = rawPpdb.split('\t');
    const [
      pid,
      sid,
      dca,
      tca,
      tcaStart,
      tcaEnd,
      year,
      month,
      date,
      hours,
      min,
      sec,
      probability,
    ] = splitPpdb;

    const standardTime = DateHandler.getCertainUTCDate(
      year,
      month,
      date,
      hours,
      min,
      sec
    );
    const tcaTime = DateHandler.getRelativeUTCDate(
      Number(tca),
      year,
      month,
      date,
      hours,
      min,
      sec,
      DateHandler.getMilliSecondFromSecond(tca)
    );
    const tcaStartTime = DateHandler.getRelativeUTCDate(
      Number(tcaStart),
      year,
      month,
      date,
      hours,
      min,
      sec,
      DateHandler.getMilliSecondFromSecond(tcaStart)
    );
    const tcaEndTime = DateHandler.getRelativeUTCDate(
      Number(tcaEnd),
      year,
      month,
      date,
      hours,
      min,
      sec,
      DateHandler.getMilliSecondFromSecond(tcaEnd)
    );
    return {
      createdAt,
      pid,
      sid,
      dca,
      tcaTime,
      tcaStartTime,
      tcaEndTime,
      standardTime,
      probability,
    };
  }

  static async getPpdbObjectsArray(createdDateObj, ppdbTexts) {
    const ppdbArray = ppdbTexts.split('\n');
    const filteredPpdbs = ppdbArray.filter(StringHandler.isNotComment);
    const ppdbs = await Promise.all(
      filteredPpdbs.map(async (rawPpdb) => {
        return this.#getPpdbObject(createdDateObj, rawPpdb);
      })
    );
    return ppdbs;
  }

  static async readPpdbFileFromLocal(path) {
    return promiseReadFile(path, {
      encoding: 'utf-8',
    });
  }
}

module.exports = PpdbHandler;
