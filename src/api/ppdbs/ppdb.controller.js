/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const StringHandler = require('../../lib/string-handler');
const wrapper = require('../../lib/request-handler');
const PpdbService = require('./ppdb.service');

class PpdbController {
  /** @param {PpdbService} ppdbService */
  constructor(ppdbService) {
    this.ppdbService = ppdbService;
    this.path = '/ppdbs';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/conjunctions', wrapper(this.findConjunctions.bind(this)));
  }

  async findConjunctions(req, _res) {
    let {
      limit = 10,
      page = 0,
      sort = 'tcaTime',
      dec = '',
      satelite,
    } = req.query;

    if (page < 0) {
      page = 0;
    }
    if (limit <= 0) {
      limit = 10;
    }
    if (sort !== 'tcaTime' && sort !== 'dca' && sort !== 'probability') {
      sort = 'tcaTime';
    }
    if (dec !== '-') {
      dec = '';
    }
    sort = `${dec}${sort}`;
    if (satelite) {
      satelite = satelite.toUpperCase();
    }

    if (satelite) {
      const { conjunctions, totalcount } = await (StringHandler.isNumeric(
        satelite
      )
        ? this.ppdbService.findConjunctionsByIdService(
            limit,
            page,
            sort,
            satelite
          )
        : this.ppdbService.findConjunctionsByNameService(
            limit,
            page,
            sort,
            satelite
          ));
      return {
        data: {
          totalcount,
          conjunctions,
        },
      };
    }
    const { conjunctions, totalcount } =
      await this.ppdbService.findConjunctionsService(limit, page, sort);
    return {
      data: {
        totalcount,
        conjunctions,
      },
    };
  }
}

module.exports = PpdbController;
