/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const TleService = require('./tle.service');
const wrapper = require('../../lib/request-handler');
const DateHandler = require('../../lib/date-handler');
const { BadRequestException } = require('../../common/exceptions');

class TleController {
  constructor() {
    this.tleService = new TleService();
    this.path = '/tles';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router
      .get('/:year/:month/:date/:hours/:id', wrapper(this.findTles.bind(this)))
      .get('/:year/:month/:date/:hours', wrapper(this.findTles.bind(this)));
  }

  async findTles(req, _res) {
    const { id, year, month, date, hours } = req.params;
    if (!year || !month || !date || !hours) {
      throw new BadRequestException('Wrong params.');
    }
    let stringId = '';
    if (id) {
      stringId = id.replace(/^\s*|\s*$/g, ''); // 좌우 공백 제거
      if (stringId === '' || Number.isNaN(stringId)) {
        throw new BadRequestException('Wrong params.');
      }
    }

    const requestDate = DateHandler.getCertainUTCDate(year, month, date, hours);
    const requestTles = await this.tleService.findTlesByIdOrDate(
      requestDate,
      id ? Number(stringId) : undefined
    );
    return {
      data: {
        tles: requestTles,
      },
    };
  }
}

module.exports = TleController;
