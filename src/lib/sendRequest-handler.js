const request = require('request');
const { promisify } = require('util');
const { Cookie } = require('request-cookies');

const promiseRequest = promisify(request);

class SendRequestHandler {
  static async getLoginCookie(url, body) {
    const res = await promiseRequest({
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    if (!res) {
      throw new Error('Login request failed.');
    }
    const rawCookies = res.headers['set-cookie'];
    if (!rawCookies) {
      throw new Error('Login request failed.');
    }

    const parsedCookies = await Promise.all(
      rawCookies.map(rawCookie => {
        const parsedCookie = new Cookie(rawCookie);
        return `${parsedCookie.key}=${parsedCookie.value}`;
      }),
    );
    return parsedCookies.join('; ');
  }

  static async getContentsRequest(url, cookie) {
    const headers = {
      Cookie: cookie,
    };
    const res = await promiseRequest({
      url,
      headers,
    });
    if (!res || res.statusCode !== 200) {
      throw new Error('Response status code is not 200. (spacetrack)');
    }
    return res.body;
  }
}

module.exports = SendRequestHandler;
