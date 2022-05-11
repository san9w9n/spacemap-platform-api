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
      .get('/conjunctions', wrapper(this.readInterestedConjunctions.bind(this)))
      .get('/find/:option', wrapper(this.findInterestedSatellites.bind(this)))
      .post('/:id', wrapper(this.addToInterestedSatellites.bind(this)))
      .delete('/:id', wrapper(this.removeFromInterestedSatellites.bind(this)));
  }

  async readInterestedSatellites(req, _res) {
    if (true) {
      const email = 'shchoi.vdrc@gmail.com';
      const readInterestedSatellites =
        this.interestedSatellitesService.readInterestedSatellites(email);
      return readInterestedSatellites;
    }
    return {
      message: 'Sign in first',
    };
  }

  async findInterestedSatellites(req, _res) {
    const { option } = req.params;
    if (true && option) {
      const email = 'shchoi.vdrc@gmail.com';
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
    return {
      message: 'Sign in first',
    };
  }

  async readInterestedConjunctions(req, _res) {
    if (true) {
      const email = 'shchoi.vdrc@gmail.com';
      const queryResult =
        await this.interestedSatellitesService.readInterestedConjunctions(
          email
        );
      return { data: queryResult };
    }
    return {
      message: 'Sign in first',
    };
  }

  async addToInterestedSatellites(req, _res) {
    if (StringHandler.isNumeric(req.params.id)) {
      if (true) {
        const email = 'shchoi.vdrc@gmail.com';
        const queryResult =
          await this.interestedSatellitesService.createOrUpdateInterestedSatelliteId(
            email,
            req.params.id
          );
        return {
          data: queryResult,
        };
      }
    } else {
      return {
        message: 'Put in only number',
      };
    }
    return {
      message: 'Sign in first',
    };
  }

  async removeFromInterestedSatellites(req, _res) {
    if (StringHandler.isNumeric(req.params.id)) {
      if (true) {
        const email = 'shchoi.vdrc@gmail.com';
        const queryResult =
          await this.interestedSatellitesService.deleteInterestedSatelliteId(
            email,
            req.params.id
          );
        return {
          data: queryResult,
        };
      }
    } else {
      return {
        message: 'Put in only number',
      };
    }
    return {
      message: 'Sign in first',
    };
  }
}

module.exports = InterestedSatellitesController;
