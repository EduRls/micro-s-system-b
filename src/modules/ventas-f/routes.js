// src/modules/ventas-f/routes.js
const express = require('express');
const { ventasFJSON, ventasFHTML } = require('./controller');

const router = express.Router();

// recuerda: el prefijo global '/api' lo pone tu index
router.post('/upper/ventas-f',      ventasFJSON);
router.post('/upper/ventas-f.html', ventasFHTML);

module.exports = router;
