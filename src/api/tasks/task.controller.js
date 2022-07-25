const { Router } = require('express');
const wrapper = require('../../lib/request-handler');

class TaskController {
  constructor(
    tleTask,
    rsoParamsTask,
    ppdbTask,
    eventSeqTask,
    interestedSatellitesTask,
  ) {
    this.path = '/tasks';
    this.router = Router();
    this.initializeRoutes(
      tleTask,
      rsoParamsTask,
      ppdbTask,
      eventSeqTask,
      interestedSatellitesTask,
    );
  }

  initializeRoutes(
    tleTask,
    rsoParamsTask,
    ppdbTask,
    eventSeqTask,
    interestedSatellitesTask,
  ) {
    this.router
      .get('/tles', wrapper(tleTask.doTleTask.bind(tleTask)))
      .get('/rso-params', wrapper(rsoParamsTask.doRsoTask.bind(rsoParamsTask)))
      .get('/ppdbs', wrapper(ppdbTask.doPpdbTask.bind(ppdbTask)))
      .get(
        '/event-seq',
        wrapper(eventSeqTask.doEventSeqTask.bind(eventSeqTask)),
      )
      .get(
        '/mailing',
        wrapper(
          interestedSatellitesTask.doInterestedSatellitesTask.bind(
            interestedSatellitesTask,
          ),
        ),
      );
  }
}

module.exports = TaskController;
