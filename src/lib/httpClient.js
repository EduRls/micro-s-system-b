const { wrapper } = require('axios-cookiejar-support');
const axios = require('axios');
const tough = require('tough-cookie');
const { UPPER_BASE_URL, DEFAULT_TIMEOUT_MS } = require('../config/env');

function makeClient() {
  const jar = new tough.CookieJar();
  const client = wrapper(axios.create({
    baseURL: UPPER_BASE_URL,
    jar,
    withCredentials: true,
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Origin': UPPER_BASE_URL,
      'Referer': `${UPPER_BASE_URL}/butano/`,
    },
    timeout: DEFAULT_TIMEOUT_MS,
    maxRedirects: 0,
    validateStatus: s => (s >= 200 && s < 300) || s === 302,
  }));
  return { client, jar };
}

module.exports = { makeClient };
