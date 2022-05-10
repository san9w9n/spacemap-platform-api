/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const wrapper = require('../../lib/request-handler');
const InterestedSatellitesService = require('./interestedSatellites.service');

class InterestedSatellitesController {
  /** @param { TleService } tleService */
  constructor(interestedSatellitesService) {
    this.interestedSatellitesService = interestedSatellitesService;
    this.path = '/interested-satellites';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router
      .get('/', wrapper(this.interestedSatellites.bind(this)))
      .post('/:id', wrapper(this.addToInterestedSatellites.bind(this)));
  }

  interestedSatellites(req, res) {
    console.log(req.user);
    return {};
  }

  addToInterestedSatellites(req, res) {
    console.log(req.user);
    return {};
  }
}

module.exports = InterestedSatellitesController;
