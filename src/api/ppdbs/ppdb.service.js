/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

// eslint-disable-next-line no-unused-vars
const TleService = require('../tles/tle.service');
const PpdbModel = require('./ppdb.model');

class PpdbService {
  /** @param { TleService } tleService */
  constructor(tleService) {
    this.tleService = tleService;
  }

  async findConjunctionsService(limit, page, sort) {
    const queryOption = {
      tcaTime: { $gte: new Date() },
    };
    const totalcount = await PpdbModel.countDocuments(queryOption).exec();
    const conjunctions = await PpdbModel.find(queryOption)
      .sort(sort)
      .skip(limit * page)
      .limit(limit)
      .exec();
    return {
      totalcount,
      conjunctions,
    };
  }

  async findConjunctionsByIdsService(limit, page, sort, ids, future = true) {
    const queryOption = {
      $and: [
        { $or: [{ pid: { $in: ids } }, { sid: { $in: ids } }] },
        future ? { tcaTime: { $gte: new Date() } } : {},
      ],
    };
    const totalcount = await PpdbModel.countDocuments(queryOption).exec();
    const conjunctions = await PpdbModel.find(queryOption)
      .sort(sort)
      .skip(limit * page)
      .limit(limit)
      .exec();
    conjunctions.map((conjunction) => {
      if (ids.some((id) => id == conjunction.sid)) {
        [conjunction.pid, conjunction.sid] = [conjunction.sid, conjunction.pid];
        [conjunction.pName, conjunction.sName] = [
          conjunction.sName,
          conjunction.pName,
        ];
      }
    });
    return {
      totalcount,
      conjunctions,
    };
  }

  async findConjunctionsByNameService(limit, page, sort, name) {
    const queryOption = {
      $and: [
        {
          $or: [
            { pName: { $regex: name, $options: 'i' } },
            { sName: { $regex: name, $options: 'i' } },
          ],
        },
        { tcaTime: { $gte: new Date() } },
      ],
    };
    const totalcount = await PpdbModel.countDocuments(queryOption).exec();
    const conjunctions = await PpdbModel.find(queryOption)
      .sort(sort)
      .skip(limit * page)
      .limit(limit)
      .exec();
    conjunctions.map((conjunction) => {
      if (new RegExp(name, 'i').test(conjunction.sName)) {
        [conjunction.pid, conjunction.sid] = [conjunction.sid, conjunction.pid];
        [conjunction.pName, conjunction.sName] = [
          conjunction.sName,
          conjunction.pName,
        ];
      }
    });
    return {
      totalcount,
      conjunctions,
    };
  }
}

module.exports = PpdbService;
