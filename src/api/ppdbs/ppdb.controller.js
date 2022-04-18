/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const wrapper = require('../../lib/request-handler');
const PpdbService = require('./ppdb.service');

class TemplateController {
  constructor() {
    this.templateService = new PpdbService();
    this.path = '/template';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router
      .get('/', wrapper(this.template1.bind(this)))
      .post('/', wrapper(this.template2.bind(this)));
  }

  template1(req, res) {
    return {};
  }

  template2(req, res) {
    return {};
  }
}

module.exports = TemplateController;
