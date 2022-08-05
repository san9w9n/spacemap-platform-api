const { Router } = require('express');
const wrapper = require('../../lib/request-handler');

class TaskController {
  constructor(interestedSatellitesTask) {
    this.path = '/templates';
    this.router = Router();
    this.initializeRoutes(interestedSatellitesTask);
  }

  initializeRoutes(interestedSatellitesTask) {
    this.router.get(
      '/ser',
      interestedSatellitesTask.renderSpaceEventReport.bind(
        interestedSatellitesTask,
      ),
    );
  }
}

module.exports = TaskController;
