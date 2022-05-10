const App = require('./app');
const DataBase = require('./lib/database');

const TleService = require('./api/tles/tle.service');
const PpdbService = require('./api/ppdbs/ppdb.service');
const InterestedSatellitesService = require('./api/interestedSatellites/interestedSatellites.service');

const TleController = require('./api/tles/tle.controller');
const PpdbController = require('./api/ppdbs/ppdb.controller');
const OauthController = require('./api/oauth/oauth.controller');
const InterestedSatellitesController = require('./api/interestedSatellites/interestedSatellites.controller');

const CronScheduler = require('./lib/cron-scheduler');
// const TleTask = require('./api/tles/tle.task');
// const PpdbTask = require('./api/ppdbs/ppdb.task');
const RsoParamsTask = require('./api/rsoParams/rso.task');

const getServices = () => {
  const tleService = new TleService();
  const ppdbService = new PpdbService(tleService);
  const interestedSatellitesService = new InterestedSatellitesService();

  return {
    ppdbService,
    tleService,
    interestedSatellitesService,
  };
};

const main = async () => {
  await DataBase.initializeDatabase();
  const { tleService, ppdbService, interestedSatellitesService } =
    getServices();
  const app = new App([
    new TleController(tleService),
    new PpdbController(ppdbService),
    new InterestedSatellitesController(interestedSatellitesService),
    new OauthController(),
  ]);
  const schedulers = new CronScheduler([
    // new TleTask(tleService),
    // new PpdbTask(ppdbService),
    new RsoParamsTask(),
  ]);

  app.listen();
  schedulers.startAllSchedule();
};

main();
