const HttpException = require('./http.exception');
const BadRequestException = require('./badRequest.exception');
const UnauthorizedException = require('./unauthorized.exception');
const NotFoundException = require('./notFound.exception');
const ForbiddenException = require('./forbid.exception');

module.exports = {
  HttpException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
};
