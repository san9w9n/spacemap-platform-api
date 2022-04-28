const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const { NotFoundException } = require('./common/exceptions');
const errorMiddleware = require('./middlewares/error.middleware');

require('dotenv').config();

const PORT = process.env.PORT || 3003;
// const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_ID;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_SECRET;

class App {
  constructor(controllers) {
    this.app = express();

    this.#initializePassport();
    this.#initializeCors();
    this.#initializeMiddlewares();
    this.#initialzeControllers(controllers);
    this.#initializeNotFoundMiddleware();
    this.#initializeErrorHandling();
  }

  listen() {
    this.app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`App listening on ${PORT}`);
    });
  }

  #initializePassport() {
    this.app.use(
      session({ secret: 'SECRET_CODE', resave: true, saveUninitialized: false })
    );
    this.app.use(passport.initialize());
    this.app.use(passport.session());
  }

  #initializeCors() {
    const domains = ['http://localhost:4032', 'http://localhost:3002'];
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

  #initializeMiddlewares() {
    this.app.use(morgan('common'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  #initialzeControllers(controllers) {
    controllers.forEach((controller) => {
      this.app.use(controller.path, controller.router);
    });
  }

  #initializeNotFoundMiddleware() {
    this.app.use((req, _res, next) => {
      if (!req.route) next(new NotFoundException());
      next();
    });
  }

  #initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

module.exports = App;
