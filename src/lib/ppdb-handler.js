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
    const pName = await tleService.findNameById(pid);
    const sName = await tleService.findNameById(sid);
    const ppdbObj = {
      createdAt,
      standardTime,
      pid,
      pName,
      sid,
      sName,
      dca,
      tcaTime,
      tcaStartTime,
      tcaEndTime,
      probability,
    };
    return ppdbObj;
  }

  static async getPpdbObjectsArray(createdDateObj, ppdbTexts) {
    const ppdbArray = ppdbTexts.split('\n');
    const filteredPpdbs = ppdbArray.filter(this.#isNotComment).slice(0, 5);
    const ppdbs = await Promise.all(
      filteredPpdbs.map(async (rawPpdb) => {
        const ppdbObj = await this.#getPpdbObject(createdDateObj, rawPpdb);
        return ppdbObj;
      })
    );
    return ppdbs;
  }
}

module.exports = PpdbHandler;
