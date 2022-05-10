/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const passport = require('passport');
const { UnauthorizedException } = require('../../common/exceptions');
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
      .get('/', wrapper(this.loginCheck.bind(this)))
      .get('/logout', wrapper(this.signOut.bind(this)))
      .get('/google', (req, res, next) => {
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
        (req, res, next) => {
          res.status(200).redirect('http://localhost:4032');
        }
      );
  }

  signOut(req, res) {
    req.logout();
    req.session.save(() => {
      return {};
    });
  }

  loginCheck(req, res) {
    if (!req.isAuthenticated()) {
      throw new UnauthorizedException('Login failed.');
    }
    const { email, nickname, provider } = req.user;
    return {
      data: {
        email,
        nickname,
        provider,
      },
    };
  }
}

module.exports = OauthController;
