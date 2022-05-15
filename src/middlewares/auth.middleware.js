const { UnauthorizedException } = require('../common/exceptions');

const verifyUser = (req, res, next) => {
  const { user } = req;
  // req.user = {
  //   email: 'qudwo09@gmail.com',
  // };
  if (!user) {
    throw new UnauthorizedException('Login first.');
  }
  next();
};

module.exports = verifyUser;
