const DateHandler = require('./date-handler');

class PpdbHandler {
  static #isNotComment(rawPpdb) {
    if (!rawPpdb || rawPpdb.length === 0) {
      return false;
    }
    return rawPpdb[0] !== '%';
  }

  static #parseRawPpdb(createdAt, rawPpdb) {
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
      pdate,
      hrs,
      min,
      sec,
      probability,
    ] = splitPpdb;
    const date = DateHandler.getCertainFormatDate(
      year,
      month,
      pdate,
      0
    ).substring(0, 10);
    const time = `${hrs}:${min}:${sec}`;
    return {
      createdAt,
      date,
      time,
      pid,
      sid,
      dca,
      tca,
      tcaStart,
      tcaEnd,
      probability,
    };
  }

  static getPpdbObjectsArray(createdAt, ppdbTexts) {
    const ppdbArray = ppdbTexts.split('\n');
    const ppdbs = ppdbArray
      .filter(this.#isNotComment)
      .map((rawPpdb) => this.#parseRawPpdb(createdAt, rawPpdb));
    return ppdbs;
  }
}

module.exports = PpdbHandler;
