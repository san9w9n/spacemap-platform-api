/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const StringHandler = require('../../lib/string-handler');
const wrapper = require('../../lib/request-handler');
const InterestedSatellitesService = require('./interestedSatellites.service');
const PpdbService = require('../ppdbs/ppdb.service');
const { verifyUser } = require('../../middlewares/auth.middleware');
const {
  BadRequestException,
  UnauthorizedException,
} = require('../../common/exceptions');

class InterestedSatellitesController {
  /**
   * @param { InterestedSatellitesService } interestedSatellitesService
   * @param { PpdbService } ppdbService
   */
  constructor(interestedSatellitesService, ppdbService) {
    this.interestedSatellitesService = interestedSatellitesService;
    this.ppdbService = ppdbService;
    this.path = '/interested-satellites';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // this.router.use(verifyUser);
    this.router
      .get('/', wrapper(this.readInterestedSatellites.bind(this)))
      .get('/conjunctions', wrapper(this.readInterestedConjunctions.bind(this)))
      .get('/find/:option', wrapper(this.findInterestedSatellites.bind(this)))
      .get(
        '/autocomplete/:option',
        wrapper(this.findInterestedSatellitesAutocomplete.bind(this)),
      )
      .post('/:id', wrapper(this.addToInterestedSatellites.bind(this)))
      .delete('/:id', wrapper(this.removeFromInterestedSatellites.bind(this)))
      .post('/settings/subscribe', wrapper(this.updateSettings.bind(this)));
  }

  async readInterestedSatellites(req, _res) {
    const { email } = req.user;
    if (!email) {
      throw new UnauthorizedException('Login first.');
    }
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
          option,
        )
      : this.interestedSatellitesService.findSatellitesByNameService(
          email,
          option,
        ));
    return {
      data: searchedSatellites,
    };
  }

  async findInterestedSatellitesAutocomplete(req, _res) {
    const { option } = req.params;
    if (!option) {
      throw new BadRequestException('Wrong params.');
    }
    const email = 'contact@spacemap42.com';
    const searchedSatellites = await (StringHandler.isNumeric(option)
      ? this.interestedSatellitesService.findSatellitesByIdServiceAutocomplete(
          email,
          option,
        )
      : this.interestedSatellitesService.findSatellitesByNameServiceAutocomplete(
          email,
          option,
        ));
    return {
      data: searchedSatellites,
    };
  }

  async readInterestedConjunctions(req, _res) {
    let { limit = 10, page = 0, sort = 'tcaTime', dec = '' } = req.query;
    const { satellite } = req.query;

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
    const interestedSatellites =
      await this.interestedSatellitesService.readInterestedSatellites(email);
    let { interestedArray } = interestedSatellites;

    if (satellite) {
      if (StringHandler.isNumeric(satellite)) {
        interestedArray = interestedArray.filter(
          (s) => s.id == Number(satellite),
        );
      } else {
        interestedArray = interestedArray.filter((s) =>
          new RegExp(satellite, 'i').test(s.name),
        );
      }
    }
    const satellitesIds = interestedArray.map((s) => s.id);

    const { totalcount, conjunctions } =
      await this.ppdbService.findConjunctionsByIdsService(
        limit,
        page,
        sort,
        satellitesIds,
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
    if (!id || !StringHandler.isNumeric(id)) {
      throw new BadRequestException('Wrong params');
    }
    const { email } = req.user;
    const queryResult =
      await this.interestedSatellitesService.createOrUpdateInterestedSatelliteId(
        email,
        id,
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
        req.params.id,
      );
    return {
      data: queryResult,
    };
  }

  async updateSettings(req, _res) {
    let { subscribe } = req.query;
    if (!subscribe || (subscribe !== 'true' && subscribe !== 'false')) {
      subscribe = 'false';
    }

    const { email } = req.user;
    const queryResult = await this.interestedSatellitesService.updateSubscribe(
      email,
      JSON.parse(subscribe),
    );
    return {
      data: queryResult,
    };
  }
}

module.exports = InterestedSatellitesController;
