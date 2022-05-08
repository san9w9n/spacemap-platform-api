const TleController = require('./api/tles/tle.controller');
const PpdbController = require('./api/ppdbs/ppdb.controller');
const App = require('./app');
const DataBase = require('./lib/database');

const CronScheduler = require('./lib/cron-scheduler');
const TleTask = require('./api/tles/tle.task');
const PpdbTask = require('./api/ppdbs/ppdb.task');
const OauthController = require('./api/oauth/oauth.controller');

const TleService = require('./api/tles/tle.service');
const PpdbService = require('./api/ppdbs/ppdb.service');

const getServices = () => {
  const tleService = new TleService();
  const ppdbService = new PpdbService(tleService);

  return {
    ppdbService,
    tleService,
  };
};

const main = async () => {
  await DataBase.initializeDatabase();
  const { tleService, ppdbService } = getServices();
  const app = new App([
    new TleController(tleService),
    new PpdbController(ppdbService),
    new OauthController(),
  ]);
  const schedulers = new CronScheduler([
    new TleTask(tleService),
    new PpdbTask(ppdbService),
  ]);

  app.listen();
  schedulers.startAllSchedule();
};

main();
