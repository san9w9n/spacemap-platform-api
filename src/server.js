const App = require('./app');
const DataBase = require('./lib/database');

const TleService = require('./api/tles/tle.service');
const PpdbService = require('./api/ppdbs/ppdb.service');
const LaunchConjunctionsService = require('./api/launchConjunctions/launchConjunctions.service');
const WatcherCatcherService = require('./api/watcherCatcher/watcherCatcher.service');
const InterestedSatellitesService = require('./api/interestedSatellites/interestedSatellites.service');
const RsoService = require('./api/rso/rso.service');
const CollisionAvoidanceService = require('./api/collisionAvoidance/collisionAvoidance.service');

const TleController = require('./api/tles/tle.controller');
const PpdbController = require('./api/ppdbs/ppdb.controller');
const LaunchConjunctionsController = require('./api/launchConjunctions/launchConjunctions.controller');
const WatcherCatcherController = require('./api/watcherCatcher/watcherCatcher.controller');
const OauthController = require('./api/oauth/oauth.controller');
const InterestedSatellitesController = require('./api/interestedSatellites/interestedSatellites.controller');
const RsoController = require('./api/rso/rso.controller');
const CollisionAvoidanceController = require('./api/collisionAvoidance/collisionAvoidance.controller');
const TaskController = require('./api/tasks/task.controller');
const TemplateController = require('./api/templates/template.controller');

const CronScheduler = require('./lib/cron-scheduler');
const InterestedSatellitesTask = require('./api/interestedSatellites/interestedSatellites.task');

const instanceName = process.env.name || 'UNKNOWN';

const { initializePassport } = require('./middlewares/auth.middleware');

const getServices = () => {
  const tleService = new TleService();
  const collisionAvoidanceService = new CollisionAvoidanceService();
  const interestedSatellitesService = new InterestedSatellitesService();
  const ppdbService = new PpdbService(tleService, interestedSatellitesService);
  const launchConjunctionsService = new LaunchConjunctionsService();
  const watcherCatcherService = new WatcherCatcherService();
  const rsoService = new RsoService();

  return {
    ppdbService,
    tleService,
    interestedSatellitesService,
    launchConjunctionsService,
    watcherCatcherService,
    rsoService,
    collisionAvoidanceService,
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
    watcherCatcherService,
    rsoService,
    collisionAvoidanceService,
  } = getServices();

  const interestedSatellitesTask = new InterestedSatellitesTask(
    interestedSatellitesService,
    ppdbService,
  );

  if (instanceName === 'spacemap-platform-api-daily-tasks') {
    const schedulers = new CronScheduler([interestedSatellitesTask]);
    schedulers.startAllSchedule();
  } else {
    const app = new App([
      new TleController(tleService),
      new PpdbController(ppdbService),
      new InterestedSatellitesController(
        interestedSatellitesService,
        ppdbService,
      ),
      new LaunchConjunctionsController(launchConjunctionsService),
      new WatcherCatcherController(watcherCatcherService),
      new OauthController(),
      new RsoController(rsoService),
      new CollisionAvoidanceController(collisionAvoidanceService, ppdbService),
      new TaskController(interestedSatellitesTask),
      new TemplateController(interestedSatellitesTask),
    ]);
    app.listen();
  }
};

main();
