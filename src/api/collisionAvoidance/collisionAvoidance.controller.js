/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const wrapper = require('../../lib/request-handler');
const DateHandler = require('../../lib/date-handler');
const CollisionAvoidanceService = require('./collisionAvoidance.service');
const PpdbService = require('../ppdbs/ppdb.service');
const TleModel = require('../tles/tle.model');
const StringHandler = require('../../lib/string-handler');
const {
  BadRequestException,
  ForbiddenException,
} = require('../../common/exceptions');
const { verifyUser } = require('../../middlewares/auth.middleware');

class CollisionAvoidanceController {
  /**
   * @param { CollisionAvoidanceService } collisionAvoidanceService
   * @param { PpdbService } ppdbService
   */
  constructor(collisionAvoidanceService, ppdbService) {
    this.collisionAvoidanceService = collisionAvoidanceService;
    this.ppdbService = ppdbService;
    this.path = '/collision-avoidance';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.use(verifyUser);
    this.router
      .get('/', wrapper(this.readCollisionAvoidance.bind(this)))
      .get('/:dbId', wrapper(this.findCollisionAvoidance.bind(this)))
      .delete('/:dbId', wrapper(this.deleteCollisionAvoidance.bind(this)))
      .post('/', wrapper(this.predictCollisionAvoidance.bind(this)));
  }

  async readCollisionAvoidance(req, _res) {
    const { email } = req.user;
    const data = await this.collisionAvoidanceService.readCollisionAvoidance(
      email,
    );
    return { data };
  }

  async findCollisionAvoidance(req, _res) {
    const { email } = req.user;
    const { dbId } = req.params;
    if (!dbId) {
      throw new BadRequestException('Param is empty.');
    }
    const data = await this.collisionAvoidanceService.findCollisionAvoidance(
      dbId,
    );
    return { data };
  }

  async deleteCollisionAvoidance(req, _res) {
    const { dbId } = req.params;
    if (!dbId) {
      throw new BadRequestException('Wrong param.');
    }
    const data = await this.collisionAvoidanceService.deleteCollisionAvoidance(
      dbId,
    );
    return { data };
  }

  async predictCollisionAvoidance(req, _res) {
    if (!DateHandler.isCalculatableDate()) {
      throw new ForbiddenException('Not available time.');
    }
    const { email } = req.user;

    const {
      pidOfConjunction,
      sidOfConjunction,
      startDate,
      endDate,
      amountOfLevel,
      numberOfPaths,
      threshold,
    } = req.body;

    const predictionEpochTime =
      await DateHandler.getStartMomentOfPredictionWindow();

    const colaEpochTime = new Date(startDate);

    // 음수일 때 에러 반환
    const startMomentOfCola = await DateHandler.diffSeconds(colaEpochTime);
    const endMomentOfCola = await DateHandler.diffSeconds(endDate);

    const avoidanceLength = endMomentOfCola - startMomentOfCola;
    const tle = await TleModel.findOne({
      id: pidOfConjunction,
    })
      .sort({ date: -1 })
      .exec();

    // 해당하는 tle 정보가 없다면 에러 반환
    const firstLineOfPrimary = tle.firstline;
    const secondLineOfPrimary = tle.secondline;

    const taskId = await this.collisionAvoidanceService.enqueTask(
      email,
      predictionEpochTime,
      colaEpochTime,
      pidOfConjunction,
      sidOfConjunction,
      firstLineOfPrimary,
      secondLineOfPrimary,
      startMomentOfCola,
      endMomentOfCola,
      amountOfLevel,
      numberOfPaths,
      avoidanceLength,
      threshold,
    );

    return {
      message: 'Request success.',
      data: {
        taskId,
      },
    };
  }
}

module.exports = CollisionAvoidanceController;
