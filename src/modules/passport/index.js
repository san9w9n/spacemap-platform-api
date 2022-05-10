const passport = require('passport');
const UserModel = require('../../api/oauth/user/user.model');
const google = require('./google');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    UserModel.findById(id)
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });
  google();
};
