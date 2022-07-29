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
    // this.router.use(verifyUser);
    this.router
      .get('/search', wrapper(this.findConjunctions.bind(this)))
      .get('/', wrapper(this.readCollisionAvoidance.bind(this)))
      .get('/:dbId', wrapper(this.findCollisionAvoidance.bind(this)))
      .delete('/:dbId', wrapper(this.deleteCollisionAvoidance.bind(this)))
      .post('/', wrapper(this.predictCollisionAvoidance.bind(this)));
  }

  async findConjunctions(req, _res) {
    let { limit = 10, page = 0, sort = 'tcaTime', dec = '' } = req.query;
    const { satellite } = req.query;

    if (page < 0) {
      page = 0;
    }
    if (limit <= 0) {
      limit = 10;
    }
    if (sort !== 'tcaTime' && sort !== 'dca' && sort !== 'probability') {
      sort = 'tcaTime';
    }
    if (dec !== '-') {
      dec = '';
    }
    sort = `${dec}${sort}`;

    if (satellite) {
      if (!StringHandler.isNumeric(satellite)) {
        throw new BadRequestException('Invalid ID.');
      }
      const { conjunctions, totalcount } =
        await this.ppdbService.findConjunctionsByIdsService(limit, page, sort, [
          satellite,
        ]);
      return {
        data: {
          totalcount,
          conjunctions,
        },
      };
    }
    return {
      data: {
        totalcount: 0,
        conjunctions: undefined,
      },
    };
  }

  async readCollisionAvoidance(req, _res) {
    // const { email } = req.user;
    const email = 'sjb990221@gmail.com';
    const data = await this.collisionAvoidanceService.readCollisionAvoidance(
      email,
    );
    return { data };
  }

  async findCollisionAvoidance(req, _res) {
    // const { email } = req.user;
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
    // const { email } = req.user;
    const email = 'sjb990221@gmail.com';

    const threshold = 200; // km

    const {
      pidOfConjunction,
      sidOfConjunction,
      // startDate,
      // endDate,
      amountOfLevel,
      numberOfPaths,
    } = req.body;

    const startDate = new Date('2022-07-27 02:01:00');
    const endDate = new Date('2022-07-27 02:04:00');

    const predictionEpochTime = new Date(
      await DateHandler.getStartMomentOfPredictionWindow(),
    );

    // const predictionEpochTime = new Date('2022-07-27T03:49:19.832Z');

    const colaEpochTime = new Date(startDate);

    const startMomentOfCola = await DateHandler.diffSeconds(colaEpochTime);
    const endMomentOfCola = await DateHandler.diffSeconds(endDate);

    // const startMomentOfCola = 700;
    // const endMomentOfCola = 900;

    const avoidanceLength = endMomentOfCola - startMomentOfCola;
    const tle = await TleModel.findOne({
      id: pidOfConjunction,
    })
      .sort({ date: -1 })
      .exec();

    const firstLineOfPrimary = tle.firstline;
    const secondLineOfPrimary = tle.secondline;

    console.log(firstLineOfPrimary);
    console.log(secondLineOfPrimary);
    // const firstLineOfPrimary =
    //   '1 39227U 13042A   21095.17409619 -.00000399  00000-0 -24191-4 0  9991';
    // const secondLineOfPrimary =
    //   '2 39227  97.6263 281.4463 0002157  81.7764  51.1935 15.04505553418385';

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
