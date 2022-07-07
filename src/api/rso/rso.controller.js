/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const RsoService = require('./rso.service');
const wrapper = require('../../lib/request-handler');
const StringHandler = require('../../lib/string-handler');
const { BadRequestException } = require('../../common/exceptions');

class RsoController {
  /** @param { RsoService } rsoService */
  constructor(rsoService) {
    this.rsoService = rsoService;
    this.path = '/rso-params';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router
      .get('/:satelliteId', wrapper(this.getRsoParamById.bind(this)))
      .get('/', wrapper(this.getAllRsoParams.bind(this)));
  }

  async getRsoParamById(req, _res) {
    const { satelliteId } = req.params;
    if (!satelliteId || !StringHandler.isNumeric(satelliteId)) {
      throw new BadRequestException('Id is not number.');
    }
    const rawRsoParam = await this.rsoService.getRsoParams(satelliteId);
    const { id, objtype, rcssize, country } = rawRsoParam;
    const rsoParam = {
      id,
      objtype,
      rcssize,
      country,
    };
    return {
      data: {
        rsoParam,
      },
    };
  }

  async getAllRsoParams(req, _res) {
    const rsoParams = {};
    const rawRsoParams = await this.rsoService.getRsoParams();
    rawRsoParams.forEach(rawRsoParam => {
      rsoParams[rawRsoParam.id] = {
        objtype: rawRsoParam.objtype,
        rcssize: rawRsoParam.rcssize,
        country: rawRsoParam.country,
      };
    });
    return {
      data: {
        rsoParams,
      },
    };
  }
}

module.exports = RsoController;
