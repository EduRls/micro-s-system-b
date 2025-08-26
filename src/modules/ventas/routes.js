// src/modules/ventas-detallado/routes.js
const express = require('express');
const { ventasDetJSON, ventasDetHTML } = require('./controller');

const router = express.Router();

// recuerda: el prefijo global '/api' lo pone tu index
router.post('/upper/ventas-detallado',      ventasDetJSON);
router.post('/upper/ventas-detallado.html', ventasDetHTML);

module.exports = router;
