const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { NotFoundException } = require('./common/exceptions');
const errorMiddleware = require('./middlewares/error.middleware');

class App {
  constructor(controllers) {
    this.app = express();

    this.initializeCors();
    this.initializeMiddlewares();
    this.initialzeControllers(controllers);
    this.initializeNotFoundMiddleware();
    this.initializeErrorHandling();
  }

  initializeCors() {
    const domains = ['http://localhost:4000', 'http://localhost:4007'];
    this.app.use(
      cors({
        origin(origin, callback) {
          const isTrue = domains.indexOf(origin) !== -1;
          callback(null, isTrue);
        },
        allowHeaders: 'Content-Type',
        methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
        preflightContinue: false,
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );
  }

  initializeMiddlewares() {
    this.app.use(morgan('common'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  initialzeControllers(controllers) {
    controllers.forEach((controller) => {
      this.app.use(controller.path, controller.router);
    });
  }

  initializeNotFoundMiddleware() {
    this.app.use((req, _res, next) => {
      if (!req.route) next(new NotFoundException());
      next();
    });
  }

  initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  listen() {
    const PORT = process.env.PORT || 3007;
    this.app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`App listening on ${PORT}`);
    });
  }
}

module.exports = App;
