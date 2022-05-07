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
    passport.authenticate('google', {
      failureRedirect: '/',
    }),
      async (req, res, next) => {
        return res
          .status(200)
          .redirect('http://localhost:4032');
      };
  }

  signOut(req, res) {
    req.logout();
    req.session.save(function(){
      res.redirect('/')
    })
  }

  loginCheck(req, res) {
    if (!req.isAuthenticated()) {
      res.status(401)
    }else{
      res.status(200)
    }
  }
}

module.exports = OauthController;
