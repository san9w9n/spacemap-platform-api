const TleController = require('./api/tles/tle.controller');
const PpdbController = require('./api/ppdbs/ppdb.controller');
const App = require('./app');
const Database = require('./lib/database');
const TleTask = require('./api/tles/tle.task');
// const PpdbTask = require('./api/ppdbs/ppdb.task');

const main = async () => {
  await Database.initializeDatabase();
  const tleTask = new TleTask('0 0 0 * * *');
  const app = new App([new TleController(), new PpdbController()]);
  app.listen();
  tleTask.startTask();
};

main();
