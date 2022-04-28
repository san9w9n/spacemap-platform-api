/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const passport = require('passport');
const wrapper = require('../../lib/request-handler');
const initializePassport = require('../../modules/passport/index');

class OauthController {
  constructor() {
    this.path = '/oauth';
    this.router = Router();
    initializePassport();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router
      .get('/google', function (req, res, next) {
        passport.authenticate('google', { scope: ['profile', 'email'] })(
          req,
          res,
          next
        );
      })
      .get(
        '/google/redirect',
        passport.authenticate('google', {
          failureRedirect: '/',
        }),
        async (req, res, next) => {
          return res.status(200).redirect('http://localhost:4032');
        }
      );
  }

  googleAuth(req, res, next) {
    passport.authenticate('google', { scope: ['profile', 'email'] })(
      req,
      res,
      next
    );
  }

  googleAuthRedirct(req, res) {
    console.log('redirect');
    passport.authenticate('google', {
      failureRedirect: '/',
    }),
      async (req, res, next) => {
        return res.status(200).redirect('http://localhost:4032');
      };
  }
}

module.exports = OauthController;
