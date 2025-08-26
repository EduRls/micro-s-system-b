// src/modules/depositos/routes.js
const express = require('express');
const { depositosJSON, depositosHTML } = require('./controller');

const router = express.Router();

// Nota: el prefijo '/api' lo agrega el index principal con app.use('/api', routes)
router.post('/upper/depositos',      depositosJSON);
router.post('/upper/depositos.html', depositosHTML);

module.exports = router;
