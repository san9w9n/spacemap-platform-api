const passport = require('passport');
const bcrypt = require('bcrypt');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const UserModel = require('../api/oauth/user/user.model');
const { UnauthorizedException } = require('../common/exceptions');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_SECRET;

const verifyUser = (req, res, next) => {
  const { user } = req;
  if (!user) {
    throw new UnauthorizedException('Login first.');
  }
  next();
};

const initializePassport = async () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await UserModel.findById(id);
    if (!user) {
      done(new UnauthorizedException('Login first.'));
    }
    done(null, user);
  });

  let callbackURL;
  switch (process.env.SPACEMAP_NODE_ENV) {
    case 'deployment':
      callbackURL = 'https://platformapi.spacemap42.com/oauth/google/redirect';
      break;
    case 'development':
      callbackURL =
        'https://platformapi-dev.spacemap42.com/oauth/google/redirect';
      break;
    case 'local':
      callbackURL = '/oauth/google/redirect';
      break;
    default:
      callbackURL = 'https://platformapi.spacemap42.com/oauth/google/redirect';
  }
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL,
        proxy: true,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        const exUser = await UserModel.findOne({
          $and: [{ email: profile?.emails[0].value }, { provider: 'google' }],
        });

        if (exUser) {
          return done(null, exUser);
        }

        const hashedPassword = await bcrypt.hash(profile?.displayName, 11);
        const newUser = await UserModel.create({
          email: profile.emails[0].value,
          password: hashedPassword,
          nickname: profile.displayName,
          snsId: profile.id,
          provider: 'google',
        });
        return done(null, newUser);
      },
    ),
  );
};

module.exports = {
  verifyUser,
  initializePassport,
};
