/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
const PpdbLib = require('../ppdbs/ppdb.lib');
const TleService = require('../tles/tle.service');
const WcdbModel = require('./wcdb.model');

class WcdbService {
  /** @param { TleService } tleService */
  constructor(tleService) {
    this.tleService = tleService;
  }

  async saveWcdbOnDatabase(wcdbPath, placeId) {
    const idNamePairs = await this.tleService.getIdNamePairs();
    const wcdbFile = await PpdbLib.readPpdbFileFromLocal(wcdbPath);
    const createdAt = new Date();
    const wcdbs = await PpdbLib.getPpdbObjectsArray(createdAt, wcdbFile);
    wcdbs.forEach((wcdb) => {
      const { pid, sid } = wcdb;
      wcdb.createdAt = createdAt;
      wcdb.placeId = placeId;
      wcdb.pName = 'Site';
      wcdb.sName = idNamePairs[sid] || 'UNKNOWN';
    });
    await WcdbModel.insertMany(wcdbs);
  }
}
module.exports = WcdbService;
