// src/modules/autoconsumo/routes.js
const express = require('express');
const { autoconsumoJSON, autoconsumoHTML } = require('./controller');

const router = express.Router();

// Nota: el prefijo '/api' lo agrega el index principal con app.use('/api', routes)
router.post('/upper/autoconsumo',      autoconsumoJSON);
router.post('/upper/autoconsumo.html', autoconsumoHTML);

module.exports = router;
