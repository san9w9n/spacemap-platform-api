const TleController = require('./api/tles/tle.controller');
const App = require('./app');
const Database = require('./lib/database');
const tleTask = require('./api/tles/tle.task');

const main = async () => {
  await Database.initializeDatabase();
  const app = new App([new TleController()]);
  app.listen();
  tleTask.start();
};

main();
