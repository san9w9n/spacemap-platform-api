/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
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

  findConjunctions(req, _res) {
    const { limit = 100, start = 0, sort = 'date' } = req.query;
    this.ppdbService.getConjunctions(limit, start, undefined);
  }
}

module.exports = PpdbController;
