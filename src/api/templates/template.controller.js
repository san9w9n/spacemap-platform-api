const { Router } = require('express');

class TemplateController {
  constructor(interestedSatellitesTask, logTask) {
    this.path = '/templates';
    this.interestedSatellitesTask = interestedSatellitesTask;
    this.logTask = logTask;
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router
      .get(
        '/ser',
        this.interestedSatellitesTask.renderSpaceEventReport.bind(
          this.interestedSatellitesTask,
        ),
      )
      .get('/log', this.logTask.renderLogReport.bind(this.logTask));
  }
}

module.exports = TemplateController;
