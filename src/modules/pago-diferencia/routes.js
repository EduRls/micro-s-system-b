// src/modules/pago-diferencia/routes.js
const express = require('express');
const { pagoDifJSON, pagoDifHTML } = require('./controller');

const router = express.Router();

// Recuerda: el prefijo global '/api' lo pone tu index principal
router.post('/upper/pago-diferencia',      pagoDifJSON);
router.post('/upper/pago-diferencia.html', pagoDifHTML);

module.exports = router;
