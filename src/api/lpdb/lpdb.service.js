/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
const TleService = require('../tles/tle.service');

class LpdbService {
  /** @param { TleService } tleService */
  constructor(tleService) {
    this.tleService = tleService;
  }
}
module.exports = LpdbService;
