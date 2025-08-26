// src/modules/auto-compara/routes.js
const express = require('express');
const { autoComparaJSON, autoComparaHTML } = require('./controller');

const router = express.Router();

// recuerdas: el prefijo global '/api' lo pone tu index
router.post('/upper/auto-compara',      autoComparaJSON);
router.post('/upper/auto-compara.html', autoComparaHTML);

module.exports = router;
