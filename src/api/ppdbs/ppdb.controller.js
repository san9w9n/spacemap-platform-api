/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const { isNumeric } = require('../../lib/ppdb-handler');
const wrapper = require('../../lib/request-handler');
const PpdbService = require('./ppdb.service');

class PpdbController {
  constructor() {
    this.ppdbService = new PpdbService();
    this.path = '/ppdbs';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/conjunctions', wrapper(this.findConjunctions.bind(this)));
  }

  async findConjunctions(req, _res) {
    let { limit, page, sort, id } = req.query;
    if (!limit || limit >= 50) limit = 10;
    if (!page || page < 0) page = 0;
    if (
      !sort ||
      sort !== 'tcaTime' ||
      sort !== 'dca' ||
      sort !== 'probability'
    ) {
      sort = 'tcaTime';
    }
    if (id && !isNumeric(id)) {
      id = undefined;
    }
    const { conjunctions, totalcount } =
      await this.ppdbService.findConjunctionsService(limit, page, sort, id);
    return {
      data: {
        totalcount,
        conjunctions,
      },
    };
  }
}

module.exports = PpdbController;
