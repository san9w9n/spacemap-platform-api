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
      .get(
        '/:year/:month/:date/:hours/:name',
        wrapper(this.findTles.bind(this))
      )
      .get('/:year/:month/:date/:hours', wrapper(this.findTles.bind(this)));
  }

  async findTles(req, _res) {
    const { name, year, month, date, hours } = req.params;
    if (!year || !month || !date || !hours) {
      throw new BadRequestException('Wrong params.');
    }
    const formatDate = DateHandler.getCertainFormatDate(
      year,
      month,
      date,
      hours
    );
    const tles = await this.tleService.getTlesByNameOrDateService(
      formatDate,
      name
    );
    return {
      data: {
        tles,
      },
    };
  }
}

module.exports = TleController;
