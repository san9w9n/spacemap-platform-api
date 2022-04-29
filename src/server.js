const TleController = require('./api/tles/tle.controller');
const PpdbController = require('./api/ppdbs/ppdb.controller');
const App = require('./app');
const DataBase = require('./lib/database');

const CronScheduler = require('./lib/cron-scheduler');
const TleTask = require('./api/tles/tle.task');
// const PpdbTask = require('./api/ppdbs/ppdb.task'); => 아직 미완료

const main = async () => {
  await DataBase.initializeDatabase();
  const app = new App([new TleController(), new PpdbController()]);
  const schedulers = new CronScheduler([new TleTask()]);

  app.listen();
  schedulers.startAllSchedule();
};

main();
