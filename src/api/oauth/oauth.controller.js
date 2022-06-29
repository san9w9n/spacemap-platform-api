/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
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
        console.log('called google');
        console.log(req.originalUrl);
        console.log(req.session);
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
          console.log('called redirected google');
          console.log(req.originalUrl);
          res.status(200).redirect(process.env.REDIRECT_URL);
        }
      );
  }

  async signOut(req, _res) {
    req.logout();
    await req.session.destroy();
    return {};
  }

  loginCheck(req, _res) {
    // console.log(req.rawHeaders);
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
