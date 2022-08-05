const { Router } = require('express');
const wrapper = require('../../lib/request-handler');
const LogService = require('./log.service');

class LogController {
  /** @param { LogServcie } logService */
  constructor(logService) {
    this.logService = logService;
    this.path = 'log';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.logService();
  }
}

module.exports = LogController;
