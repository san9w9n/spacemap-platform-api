/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
const PpdbLib = require('../ppdbs/ppdb.lib');
const TleService = require('../tles/tle.service');
const LpdbModel = require('./lpdb.model');

class LpdbService {
  /** @param { TleService } tleService */
  constructor(tleService) {
    this.tleService = tleService;
  }

  async saveLpdbOnDatabase(lpdbPath, placeId) {
    const idNamePairs = await this.tleService.getIdNamePairs();
    const lpdbFile = await PpdbLib.readPpdbFileFromLocal(lpdbPath);
    const createdAt = new Date();
    const lpdbs = await PpdbLib.getPpdbObjectsArray(createdAt, lpdbFile);
    lpdbs.forEach((lpdb) => {
      const { pid, sid } = lpdb;
      lpdb.createdAt = createdAt;
      lpdb.placeId = placeId;
      lpdb.pName = 'Launch Vehicle';
      lpdb.sName = idNamePairs[sid] || 'UNKNOWN';
    });
    await LpdbModel.insertMany(lpdbs);
  }
}
module.exports = LpdbService;
