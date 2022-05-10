/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const RsoService = require('./rso.service');
const wrapper = require('../../lib/request-handler');

class TleController {
  /** @param { RsoService } rsoService */
  constructor(rsoService) {
    this.tleService = rsoService;
    this.path = '/rso-params';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // this.router.get('/', wrapper(this.home.bind(this)));
  }
}

module.exports = TleController;
