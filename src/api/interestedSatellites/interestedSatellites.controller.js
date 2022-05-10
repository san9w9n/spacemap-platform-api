/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const StringHandler = require('../../lib/string-handler');
const wrapper = require('../../lib/request-handler');
const InterestedSatellitesService = require('./interestedSatellites.service');

class InterestedSatellitesController {
  /** @param { InterestedSatellitesService } interestedSatellitesService */
  constructor(interestedSatellitesService) {
    this.interestedSatellitesService = interestedSatellitesService;
    this.path = '/interested-satellites';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router
      .get('/', wrapper(this.readInterestedSatellites.bind(this)))
      .get('/:option', wrapper(this.findInterestedSatellites.bind(this)))
      .post('/:id', wrapper(this.addToInterestedSatellites.bind(this)))
      .delete('/:id', wrapper(this.removeFromInterestedSatellites.bind(this)));
  }

  async readInterestedSatellites(req, _res) {
    if (req.user) {
      const readInterestedSatellites =
        this.interestedSatellitesService.readInterestedSatellites(
          req.user.email
        );
      return readInterestedSatellites;
    }
    return {
      message: 'Sign in first',
    };
  }

  async findInterestedSatellites(req, _res) {
    const { option } = req.params;

    if (option) {
      const { searchedSatellites } = await (StringHandler.isNumeric(option)
        ? this.interestedSatellitesService.findSatellitesByIdService(option)
        : this.interestedSatellitesService.findSatellitesByNameService(option));
      return {
        data: searchedSatellites,
      };
    }
    return {
      message: 'Sign in first',
    };
  }

  async addToInterestedSatellites(req, _res) {
    if (req.user) {
      const queryResult =
        await this.interestedSatellitesService.createOrUpdateInterestedSatelliteID(
          req.user.email,
          req.params.id
        );
      return {
        data: queryResult,
      };
    }
    return {
      message: 'Sign in first',
    };
  }

  async removeFromInterestedSatellites(req, _res) {
    if (req.user) {
      const queryResult =
        await this.interestedSatellitesService.deleteInterestedSatelliteID(
          req.user.email,
          req.params.id
        );
      return {
        data: queryResult,
      };
    }
    return {
      message: 'Sign in first',
    };
  }
}

module.exports = InterestedSatellitesController;
