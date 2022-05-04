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

  async findConjunctionsService(limit, page, sort, id = undefined) {
    const totalcount = await PpdbModel.count().exec();
    console.log(id);
    const conjunctions = await (id
      ? PpdbModel.find({
          $or: [
            {
              pid: id,
            },
            {
              sid: id,
            },
          ],
        })
          .skip(limit * page)
          .limit(limit)
          .sort(sort)
          .exec()
      : PpdbModel.find()
          .skip(limit * page)
          .limit(limit)
          .sort(sort)
          .exec());
    return {
      totalcount,
      conjunctions,
    };
  }
}

module.exports = PpdbService;
