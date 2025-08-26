// src/modules/total-grupo/routes.js
const express = require('express');
const { totalGrupoJSON, totalGrupoHTML } = require('./controller');

const router = express.Router();

// Recuerda: el prefijo '/api' lo pone el index principal (app.use('/api', routes))
router.post('/upper/total-grupo', totalGrupoJSON);
router.post('/upper/total-grupo.html', totalGrupoHTML);

module.exports = router;
