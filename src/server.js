const TleController = require('./api/tles/tle.controller');
const PpdbController = require('./api/ppdbs/ppdb.controller');
const App = require('./app');
const Database = require('./lib/database');

const CronScheduler = require('./lib/cron-scheduler');
const TleTask = require('./api/tles/tle.task');
const PpdbTask = require('./api/ppdbs/ppdb.task');

const main = async () => {
  await Database.initializeDatabase();
  const app = new App([new TleController(), new PpdbController()]);
  const schedulers = new CronScheduler([new TleTask(), new PpdbTask()]);

  app.listen();
  schedulers.startAllScheduler();
};

main();
