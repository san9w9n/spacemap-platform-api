const passport = require('passport');
const bcrypt = require('bcrypt');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const UserModel = require('../../api/oauth/user/user.model');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_SECRET;

module.exports = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: '/oauth/google/redirect',
      },
      async (accessToken, refreshToken, profile, done) => {
        const exUser = await UserModel.findOne({
          $and: [{ email: profile.emails[0].value }, { provider: 'google' }],
        });

        if (exUser) {
          return done(null, exUser);
        }

        const hashedPassword = await bcrypt.hash(profile.displayName, 11);
        const newUser = await UserModel.create({
          email: profile.emails[0].value,
          password: hashedPassword,
          nickname: profile.displayName,
          snsId: profile.id,
          provider: 'google',
        });
        return done(null, newUser);
      }
    )
  );
};
