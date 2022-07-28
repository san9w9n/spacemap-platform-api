/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const wrapper = require('../../lib/request-handler');
const DateHandler = require('../../lib/date-handler');
const CollisionAvoidanceService = require('./collisionAvoidance.service');
const {
  BadRequestException,
  ForbiddenException,
} = require('../../common/exceptions');
const { verifyUser } = require('../../middlewares/auth.middleware');

class CollisionAvoidanceController {
  /** @param { CollisionAvoidanceService } collisionAvoidanceService */
  constructor(collisionAvoidanceService) {
    this.collisionAvoidanceService = collisionAvoidanceService;
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
    const data = await this.collisionAvoidancesService.readCollisionAvoidances(
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
    const data = await this.collisionAvoidancesService.findCollisionAvoidances(
      dbId,
    );
    return { data };
  }

  async deleteCollisionAvoidance(req, _res) {
    const { dbId } = req.params;
    if (!dbId) {
      throw new BadRequestException('Wrong param.');
    }
    const data = await this.collisionAvoidancesService.deleteCollisionAvoidance(
      dbId,
    );
    return { data };
  }

  async predictCollisionAvoidance(req, _res) {
    if (!DateHandler.isCalculatableDate()) {
      throw new ForbiddenException('Not available time.');
    }
    const { email } = req.user;

    const startMomentOfPredictionWindow =
      await DateHandler.getStartMomentOfPredictionWindow();

    const threshold = 50; // km
    const { longitude, latitude, altitude, fieldOfView, epochTime, endTime } =
      req.body;

    const taskId = await this.collisionAvoidanceService.enqueTask(
      email,
      Number(latitude),
      Number(longitude),
      altitude,
      fieldOfView,
      epochTime,
      endTime,
      startMomentOfPredictionWindow,
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
