/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const TleService = require('./tle.service');
const wrapper = require('../../lib/request-handler');
const { BadRequestException } = require('../../common/exceptions');
const { getFormatDate } = require('../../lib/date-handler');

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
        '/:name/:year/:month/:date/:hours',
        wrapper(this.getTlesByNameAndDateController.bind(this))
      )
      .get(
        '/:year/:month/:date/:hours',
        wrapper(this.getTlesByDateController.bind(this))
      );
  }

  async getTlesByNameAndDateController(req, _res) {
    const { name, year, month, date, hours } = req.params;
    if (!name || !year || !month || !date || !hours) {
      throw new BadRequestException('Wrong params.');
    }
    const stringDate = getFormatDate(year, month, date, hours);
    const tles = await this.tleService.getTlesByNameOrDateService(
      stringDate,
      name
    );
    return {
      date: tles,
    };
  }

  async getTlesByDateController(req, res) {
    const { year, month, date, hours } = req.params;
    if (!year || !month || !date || !hours) {
      throw new BadRequestException('Wrong params.');
    }
    const stringDate = getFormatDate(year, month, date, hours);
    const tles = await this.tleService.getTlesByNameOrDateService(stringDate);
    return {
      date: tles,
    };
  }
}

module.exports = TleController;
