/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const RsoModel = require('./rso.model');
const { BadRequestException } = require('../../common/exceptions');

class RsoService {
  async updateRsoParams(rsoParams) {
    const options = { upsert: true, setDefaultsOnInsert: true };
    const updateResult = rsoParams.map(async (rsoParam) => {
      const { id, objtype, objectname, rcssize, country } = rsoParam;
      if (!id) {
        return;
      }
      await RsoModel.findOneAndUpdate(
        { id },
        { id, objtype, objectname, rcssize, country },
        options
      );
    });
    await Promise.all(updateResult);
  }

  async getRsoParams(id = undefined) {
    const rsoParams = await (id
      ? RsoModel.findOne({ id }).exec()
      : RsoModel.find().exec());
    if (!rsoParams || (!id && rsoParams.length === 0)) {
      throw new BadRequestException('No rso.');
    }
    return rsoParams;
  }
}

module.exports = RsoService;
