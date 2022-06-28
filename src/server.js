const App = require('./app');
const DataBase = require('./lib/database');

const TleService = require('./api/tles/tle.service');
const PpdbService = require('./api/ppdbs/ppdb.service');
const LpdbService = require('./api/lpdb/lpdb.service');
const LaunchConjunctionsService = require('./api/launchConjunctions/launchConjunctions.service');
const InterestedSatellitesService = require('./api/interestedSatellites/interestedSatellites.service');
const RsoService = require('./api/rso/rso.service');

const TleController = require('./api/tles/tle.controller');
const PpdbController = require('./api/ppdbs/ppdb.controller');
const LaunchConjunctionsController = require('./api/launchConjunctions/launchConjunctions.controller');
const OauthController = require('./api/oauth/oauth.controller');
const InterestedSatellitesController = require('./api/interestedSatellites/interestedSatellites.controller');
const RsoController = require('./api/rso/rso.controller');
const TaskController = require('./api/tasks/task.controller');

const CronScheduler = require('./lib/cron-scheduler');
const TleTask = require('./api/tles/tle.task');
const EventseqTask = require('./api/ppdbs/eventseq.task');
const PpdbTask = require('./api/ppdbs/ppdb.task');
const RsoParamsTask = require('./api/rso/rso.task');
const LaunchConjunctionTask = require('./api/launchConjunctions/launchConjunctions.task');

const instanceName = process.env.name || 'UNKNOWN';

const { initializePassport } = require('./middlewares/auth.middleware');

const getServices = () => {
  const tleService = new TleService();
  const ppdbService = new PpdbService(tleService);
  const lpdbService = new LpdbService(tleService);
  const interestedSatellitesService = new InterestedSatellitesService();
  const launchConjunctionsService = new LaunchConjunctionsService(lpdbService);
  const rsoService = new RsoService();

  return {
    ppdbService,
    lpdbService,
    tleService,
    interestedSatellitesService,
    launchConjunctionsService,
    rsoService,
  };
};

const main = async () => {
  await DataBase.initializeDatabase();
  await initializePassport();
  const {
    tleService,
    ppdbService,
    interestedSatellitesService,
    launchConjunctionsService,
    lpdbService,
    rsoService,
  } = getServices();

  const tleTask = new TleTask(tleService);
  const ppdbTask = new PpdbTask(ppdbService);
  const rsoParamsTask = new RsoParamsTask(rsoService);
  const launchConjunctionTask = new LaunchConjunctionTask(
    launchConjunctionsService,
    lpdbService
  );
  const eventSeqTask = new EventseqTask();

  if (instanceName === 'spacemap-platform-api-launch-conjunction') {
    const schedulers = new CronScheduler([launchConjunctionTask]);
    schedulers.startAllSchedule();
  } else if (instanceName === 'spacemap-platform-api-daily-tasks') {
    const schedulers = new CronScheduler([
      tleTask,
      eventSeqTask,
      ppdbTask,
      rsoParamsTask,
    ]);
    schedulers.startAllSchedule();
  } else {
    const app = new App([
      new TleController(tleService),
      new PpdbController(ppdbService),
      new InterestedSatellitesController(interestedSatellitesService),
      new LaunchConjunctionsController(launchConjunctionsService),
      new OauthController(),
      new RsoController(rsoService),
      new TaskController(tleTask, rsoParamsTask, ppdbTask, eventSeqTask),
    ]);
    app.listen();
  }
};

main();
