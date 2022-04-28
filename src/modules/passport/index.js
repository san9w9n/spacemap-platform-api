const passport = require('passport');

const User = require('../../models/user.model');
const google = require('./google');

module.exports = () => {
  passport.serializeUser((user, done) => {
    // console.log(user);
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findOne({ where: { id } })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });
  google();
};
