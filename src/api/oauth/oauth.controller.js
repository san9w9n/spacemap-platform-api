/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
const { Router } = require('express');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const passport = require('passport');
const { UnauthorizedException } = require('../../common/exceptions');
const wrapper = require('../../lib/request-handler');
const { verifyUser } = require('../../middlewares/auth.middleware');

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
        console.log('dlsds');
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
          console.log('login');
          res.status(200).redirect(req.session.currentUrl);
        }
      );
  }

  async signOut(req, _res) {
    req.logout();
    const { currentUrl } = req.session;
    await req.session.destroy();
    return {};
  }

  loginCheck(req, _res) {
    req.session.currentUrl = req.headers.origin;
    console.log(req.session);
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
