/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
const { Router } = require('express');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const passport = require('passport');
const { UnauthorizedException } = require('../../common/exceptions');
const wrapper = require('../../lib/request-handler');
const {
  verifyUser,
  storeRedirectToInSession,
} = require('../../middlewares/auth.middleware');

class OauthController {
  constructor() {
    this.path = '/oauth';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router
      .get('/', wrapper(this.loginCheck.bind(this)))
      .get('/logout', verifyUser, wrapper(this.signOut.bind(this)))
      .get('/google', (req, res, next) => {
        req.session.currentUrl = req.query.host;
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
          const { currentUrl } = req.session;
          res.status(200).redirect(currentUrl);
        }
      );
  }

  async signOut(req, _res) {
    req.logout();
    const { currentUrl } = req.session;
    await req.session.destroy();
    return {};
  }

  async loginCheck(req, _res) {
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
