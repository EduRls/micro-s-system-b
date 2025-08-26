const { UPPER_BASE_URL } = require('../config/env');

/**
 * Login al sistema, devuelve { ok, phpsessid }
 */
async function login(client, jar, { user, pass, verifyCode = '' }) {
  // Sembrar cookie anónima
  await client.get('/butano/');
  const body = new URLSearchParams({
    'LoginForm[username]': user,
    'LoginForm[password]': pass,
    // 'LoginForm[verifyCode]': verifyCode
  });

  const r = await client.post('/butano/', body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  const cookies = await jar.getCookies(`${UPPER_BASE_URL}/butano/`);
  const sess = cookies.find(c => c.key.toUpperCase() === 'PHPSESSID')?.value || null;
  const ok = r.status === 302 || r.status === 200;
  return { ok, phpsessid: sess };
}

module.exports = { login };
