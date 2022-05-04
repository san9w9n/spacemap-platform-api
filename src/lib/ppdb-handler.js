const DateHandler = require('./date-handler');
const TleService = require('../api/tles/tle.service');

const tleService = new TleService();

class PpdbHandler {
  static #isNotComment(rawPpdb) {
    if (!rawPpdb || rawPpdb.length === 0) {
      return false;
    }
    return rawPpdb[0] !== '%';
  }

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
    const idNamePairs = await tleService.getIdNamePairs();
    const ppdbArray = ppdbTexts.split('\n');
    const filteredPpdbs = ppdbArray.filter(this.#isNotComment);
    const ppdbs = await Promise.all(
      filteredPpdbs.map(async (rawPpdb) => {
        const ppdbObj = await this.#getPpdbObject(createdDateObj, rawPpdb);
        const { pid, sid } = ppdbObj;
        ppdbObj.pName = idNamePairs[pid] || 'UNKNOWN';
        ppdbObj.sName = idNamePairs[sid] || 'UNKNOWN';
        return ppdbObj;
      })
    );
    return ppdbs;
  }
}

module.exports = PpdbHandler;
