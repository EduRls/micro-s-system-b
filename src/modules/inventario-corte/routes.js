// src/modules/inventario-corte/routes.js
const express = require('express');
const { inventarioJSON, inventarioHTML } = require('./controller');

const router = express.Router();

// prefijo global '/api' lo pone tu index principal
router.post('/upper/inventario-corte',      inventarioJSON);
router.post('/upper/inventario-corte.html', inventarioHTML);

module.exports = router;
