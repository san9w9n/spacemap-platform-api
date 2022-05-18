const HttpException = require('./http.exception');

class ForbiddenException extends HttpException {
  constructor(message = '요청을 받을 수  없습니다.') {
    super(403, message);
  }
}

module.exports = ForbiddenException;
