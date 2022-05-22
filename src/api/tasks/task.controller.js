const { Router } = require('express');
const wrapper = require('../../lib/request-handler');

class TaskController {
  constructor(tleTask, rsoParamsTask, ppdbTask) {
    this.path = '/tasks';
    this.router = Router();
    this.initializeRoutes(tleTask, rsoParamsTask, ppdbTask);
  }

  initializeRoutes(tleTask, rsoParamsTask, ppdbTask) {
    this.router
      .get('/tles', wrapper(tleTask.doTleTask.bind(tleTask)))
      .get('/rso-params', wrapper(rsoParamsTask.doRsoTask.bind(rsoParamsTask)))
      .get('/ppdbs', wrapper(ppdbTask.doPpdbTask.bind(ppdbTask)));
  }
}

module.exports = TaskController;
