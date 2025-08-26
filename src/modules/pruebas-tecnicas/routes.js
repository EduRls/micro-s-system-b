// src/modules/pruebas-tecnicas/routes.js
const express = require('express');
const router = express.Router();
const { pruebasTecJSON, pruebasTecHTML } = require('./controller');

// Recuerda: el prefijo global '/api' lo pone tu index principal
router.post('/upper/pruebas-tecnicas',      pruebasTecJSON);
router.post('/upper/pruebas-tecnicas.html', pruebasTecHTML);

module.exports = router;
