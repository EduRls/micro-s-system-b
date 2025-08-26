require('dotenv').config();

const origins = process.env.ALLOW_ORIGIN
  ? process.env.ALLOW_ORIGIN.split(',').map(s => s.trim())
  : true;

module.exports = {
  ORIGINS: origins,
  UPPER_BASE_URL: 'https://system.upper-level.mx',
  DEFAULT_TIMEOUT_MS: Number(process.env.HTTP_TIMEOUT_MS || 25000),
  PORT: process.env.PORT || 4000,
  UPPER_USER: process.env.UPPER_USER || '',
  UPPER_PASS: process.env.UPPER_PASS || '',
};
