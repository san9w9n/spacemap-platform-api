/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

// eslint-disable-next-line no-unused-vars
const TleService = require('../tles/tle.service');
const PpdbHandler = require('../../lib/ppdb-handler');
const PpdbModel = require('./ppdb.model');

class PpdbService {
  /** @param { TleService } tleService */
  constructor(tleService) {
    this.tleService = tleService;
  }

  async savePpdbOnDatabase(createdDateObj, ppdbTexts) {
    const idNamePairs = await this.tleService.getIdNamePairs();
    const ppdbs = await PpdbHandler.getPpdbObjectsArray(
      createdDateObj,
      ppdbTexts
    );
    ppdbs.forEach((ppdb) => {
      const { pid, sid } = ppdb;
      ppdb.pName = idNamePairs[pid] || 'UNKNOWN';
      ppdb.sName = idNamePairs[sid] || 'UNKNOWN';
    });
    PpdbModel.insertMany(ppdbs);
    PpdbModel.createIndexes({ tcaTime: 1, probability: 1, dca: 1 });
  }

  async clearPpdbDatabase() {
    return PpdbModel.deleteMany({}).exec();
  }

  async findConjunctionsService(limit, page, sort) {
    const totalcount = await PpdbModel.count().exec();
    const conjunctions = await PpdbModel.find()
      .skip(limit * page)
      .limit(limit)
      .sort(sort)
      .exec();
    return {
      totalcount,
      conjunctions,
    };
  }

  async findConjunctionsByIdService(limit, page, sort, id) {
    const queryOption = {
      $or: [{ pid: id }, { sid: id }],
    };
    const totalcount = await PpdbModel.countDocuments(queryOption).exec();
    const conjunctions = await PpdbModel.find(queryOption)
      .skip(limit * page)
      .limit(limit)
      .sort(sort)
      .exec();
    return {
      totalcount,
      conjunctions,
    };
  }

  async findConjunctionsByNameService(limit, page, sort, name) {
    const queryOption = {
      $or: [
        { pName: { $regex: name, $options: 'i' } },
        { sName: { $regex: name, $options: 'i' } },
      ],
    };
    const totalcount = await PpdbModel.countDocuments(queryOption).exec();
    const conjunctions = await PpdbModel.find(queryOption)
      .skip(limit * page)
      .limit(limit)
      .sort(sort)
      .exec();
    return {
      totalcount,
      conjunctions,
    };
  }
}

module.exports = PpdbService;
