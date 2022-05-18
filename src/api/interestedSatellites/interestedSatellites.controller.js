/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const StringHandler = require('../../lib/string-handler');
const wrapper = require('../../lib/request-handler');
const InterestedSatellitesService = require('./interestedSatellites.service');
const verifyUser = require('../../middlewares/auth.middleware');
const { BadRequestException } = require('../../common/exceptions');

class InterestedSatellitesController {
  /** @param { InterestedSatellitesService } interestedSatellitesService */
  constructor(interestedSatellitesService) {
    this.interestedSatellitesService = interestedSatellitesService;
    this.path = '/interested-satellites';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.use(verifyUser);
    this.router
      .get('/', wrapper(this.readInterestedSatellites.bind(this)))
      .get('/conjunctions', wrapper(this.readInterestedConjunctions.bind(this)))
      .get('/find/:option', wrapper(this.findInterestedSatellites.bind(this)))
      .post('/:id', wrapper(this.addToInterestedSatellites.bind(this)))
      .delete('/:id', wrapper(this.removeFromInterestedSatellites.bind(this)));
  }

  async readInterestedSatellites(req, _res) {
    const { email } = req.user;
    const readInterestedSatellites =
      await this.interestedSatellitesService.readInterestedSatellites(email);
    return {
      data: readInterestedSatellites,
    };
  }

  async findInterestedSatellites(req, _res) {
    const { option } = req.params;
    if (!option) {
      throw new BadRequestException('Wrong params.');
    }
    const { email } = req.user;
    const searchedSatellites = await (StringHandler.isNumeric(option)
      ? this.interestedSatellitesService.findSatellitesByIdService(
          email,
          option
        )
      : this.interestedSatellitesService.findSatellitesByNameService(
          email,
          option
        ));
    return {
      data: searchedSatellites,
    };
  }

  async readInterestedConjunctions(req, _res) {
    let { limit = 10, page = 0, sort = 'tcaTime', dec = '' } = req.query;
    const { satellite } = req.query;
    if (satellite && !StringHandler.isNumeric(satellite)) {
      throw BadRequestException('satellite id is not number.');
    }

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

    const { email } = req.user;
    if (satellite) {
      const { conjunctions, totalcount } =
        await this.interestedSatellitesService.readInterestedConjunctions(
          email,
          limit,
          page,
          sort,
          Number(satellite)
        );
      return {
        data: {
          totalcount,
          conjunctions,
        },
      };
    }
    const { conjunctions, totalcount } =
      await this.interestedSatellitesService.readInterestedConjunctions(
        email,
        limit,
        page,
        sort,
        undefined
      );
    return {
      data: {
        totalcount,
        conjunctions,
      },
    };
  }

  async addToInterestedSatellites(req, _res) {
    const { id } = req.params;
    console.log(id);
    if (!id || !StringHandler.isNumeric(id)) {
      throw new BadRequestException('Wrong params');
    }
    const { email } = req.user;
    const queryResult =
      await this.interestedSatellitesService.createOrUpdateInterestedSatelliteId(
        email,
        id
      );
    return {
      data: queryResult,
    };
  }

  async removeFromInterestedSatellites(req, _res) {
    const { id } = req.params;
    if (!id || !StringHandler.isNumeric(id)) {
      throw new BadRequestException('Wrong params');
    }

    const { email } = req.user;
    const queryResult =
      await this.interestedSatellitesService.deleteInterestedSatelliteId(
        email,
        req.params.id
      );
    return {
      data: queryResult,
    };
  }
}

module.exports = InterestedSatellitesController;
