const App = require('./app');
const DataBase = require('./lib/database');

const TleService = require('./api/tles/tle.service');
const PpdbService = require('./api/ppdbs/ppdb.service');
const LpdbService = require('./api/lpdb/lpdb.service');
const WcdbService = require('./api/wcdb/wcdb.service');
const LaunchConjunctionsService = require('./api/launchConjunctions/launchConjunctions.service');
const WatcherCatchersService = require('./api/watcherCatchers/watcherCatchers.service');
const InterestedSatellitesService = require('./api/interestedSatellites/interestedSatellites.service');
const RsoService = require('./api/rso/rso.service');

const TleController = require('./api/tles/tle.controller');
const PpdbController = require('./api/ppdbs/ppdb.controller');
const LaunchConjunctionsController = require('./api/launchConjunctions/launchConjunctions.controller');
const WatcherCatchersController = require('./api/watcherCatchers/watcherCatchers.controller');
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
const InterestedSatellitesTask = require('./api/interestedSatellites/interestedSatellites.task');
const WatcherCatchersTask = require('./api/watcherCatchers/watcherCatchers.task');

const instanceName = process.env.name || 'UNKNOWN';

const { initializePassport } = require('./middlewares/auth.middleware');

const getServices = () => {
  const tleService = new TleService();
  const ppdbService = new PpdbService(tleService);
  const lpdbService = new LpdbService(tleService);
  const wcdbService = new WcdbService(tleService);
  const interestedSatellitesService = new InterestedSatellitesService();
  const launchConjunctionsService = new LaunchConjunctionsService(lpdbService);
  const watcherCatchersService = new WatcherCatchersService(wcdbService);
  const rsoService = new RsoService();

  return {
    ppdbService,
    lpdbService,
    wcdbService,
    tleService,
    interestedSatellitesService,
    launchConjunctionsService,
    watcherCatchersService,
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
    watcherCatchersService,
    lpdbService,
    wcdbService,
    rsoService,
  } = getServices();

  const tleTask = new TleTask(tleService);
  const ppdbTask = new PpdbTask(ppdbService);
  const rsoParamsTask = new RsoParamsTask(rsoService);
  const launchConjunctionTask = new LaunchConjunctionTask(
    launchConjunctionsService,
    lpdbService,
  );
  const interestedSatellitesTask = new InterestedSatellitesTask(
    interestedSatellitesService,
  );

  const watcherCatchersTask = new WatcherCatchersTask(
    watcherCatchersService,
    wcdbService,
  );

  const eventSeqTask = new EventseqTask();

  if (instanceName === 'spacemap-platform-api-services-tasks') {
    const schedulers = new CronScheduler([
      launchConjunctionTask,
      watcherCatchersTask,
    ]);
    schedulers.startAllSchedule();
  } else if (instanceName === 'spacemap-platform-api-daily-tasks') {
    const schedulers = new CronScheduler([
      tleTask,
      eventSeqTask,
      ppdbTask,
      rsoParamsTask,
    ]);
    schedulers.startAllSchedule();
  } else if (instanceName === 'spacemap-platform-api-mailing-task') {
    const schedulers = new CronScheduler([interestedSatellitesTask]);
    schedulers.startAllSchedule();
  } else {
    const app = new App([
      new TleController(tleService),
      new PpdbController(ppdbService),
      new InterestedSatellitesController(interestedSatellitesService),
      new LaunchConjunctionsController(launchConjunctionsService),
      new WatcherCatchersController(watcherCatchersService),
      new OauthController(),
      new RsoController(rsoService),
      new TaskController(tleTask, rsoParamsTask, ppdbTask, eventSeqTask),
    ]);
    app.listen();
  }
};

main();
