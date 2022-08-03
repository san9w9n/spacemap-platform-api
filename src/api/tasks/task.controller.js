const { Router } = require('express');
const wrapper = require('../../lib/request-handler');

class TaskController {
  constructor(interestedSatellitesTask) {
    this.path = '/tasks';
    this.router = Router();
    this.initializeRoutes(interestedSatellitesTask);
  }

  initializeRoutes(interestedSatellitesTask) {
    this.router.get(
      '/ser',
      wrapper(
        interestedSatellitesTask.doInterestedSatellitesTask.bind(
          interestedSatellitesTask,
        ),
      ),
    );
  }
}

module.exports = TaskController;
