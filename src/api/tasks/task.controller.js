const { Router } = require('express');
const wrapper = require('../../lib/request-handler');

class TaskController {
  constructor(interestedSatellitesTask, logTask) {
    this.path = '/tasks';
    this.interestedSatellitesTask = interestedSatellitesTask;
    this.logTask = logTask;
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router
      .get(
        '/ser',
        wrapper(
          this.interestedSatellitesTask.doInterestedSatellitesTask.bind(
            this.interestedSatellitesTask,
          ),
        ),
      )
      .get('/log', wrapper(this.logTask.doLogTask.bind(this.logTask)));
  }
}

module.exports = TaskController;
