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

const CronScheduler = require('./lib/cron-scheduler');
const TleTask = require('./api/tles/tle.task');
const PpdbTask = require('./api/ppdbs/ppdb.task');
const RsoParamsTask = require('./api/rso/rso.task');

const schedulerEnabled = process.env.SCHEDULER_ENABLE || false;

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
  const {
    tleService,
    ppdbService,
    interestedSatellitesService,
    launchConjunctionsService,
    rsoService,
  } = getServices();
  const app = new App([
    new TleController(tleService),
    new PpdbController(ppdbService),
    new InterestedSatellitesController(interestedSatellitesService),
    new LaunchConjunctionsController(launchConjunctionsService),
    new OauthController(),
    new RsoController(rsoService),
  ]);

  const schedulers = new CronScheduler([
    new TleTask(tleService),
    new PpdbTask(ppdbService),
    new RsoParamsTask(rsoService),
  ]);

  app.listen();

  if (schedulerEnabled) {
    schedulers.startAllSchedule();
  }
};

main();
