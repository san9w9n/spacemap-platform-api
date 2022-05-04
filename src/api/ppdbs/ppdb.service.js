/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
const PpdbModel = require('./ppdb.model');
const PpdbHandler = require('../../lib/ppdb-handler');

class PpdbService {
  async savePpdbOnDatabase(createdDateObj, ppdbTexts) {
    const ppdbs = await PpdbHandler.getPpdbObjectsArray(
      createdDateObj,
      ppdbTexts
    );
    return PpdbModel.insertMany(ppdbs);
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
      $or: [
        {
          pid: id,
        },
        {
          sid: id,
        },
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

  async findConjunctionsByNameService(limit, page, sort, name) {
    const queryOption = {
      $or: [
        {
          pName: { $regex: name, $options: 'i' },
        },
        {
          sName: { $regex: name, $options: 'i' },
        },
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
