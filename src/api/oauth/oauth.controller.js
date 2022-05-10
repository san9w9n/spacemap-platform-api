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
      .get('/', this.loginCheck)
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
          return res.status(200).redirect(process.env.REDIRECT_URL);
        }
      )
      .get('/logout', this.signOut);
  }

  signOut(req, res) {
    req.logout();
    req.session.save(function () {
      return res.send(200).json();
    });
  }

  loginCheck(req, res) {
    if (!req.isAuthenticated()) {
      return res.status(401).send({
        data: {
          login: 'fail',
          message: 'Unauthorization',
        },
      });
    }
    const { email, nickname, provider } = req.user;
    return res.status(200).send({
      data: { login: 'success', data: { email, nickname, provider } },
    });
  }
}

module.exports = OauthController;
