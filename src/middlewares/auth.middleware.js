const { UnauthorizedException } = require('../common/exceptions');

const verifyUser = (req, res, next) => {
  const { user } = req;
  // req.user = {
  //   email: 'testemail',
  // };
  if (!user) {
    throw new UnauthorizedException('Login first.');
  }
  next();
};

module.exports = verifyUser;
