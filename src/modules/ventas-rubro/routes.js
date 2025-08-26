const express = require('express');
const { ventasRubroJSON, ventasRubroHTML } = require('./controller');

const router = express.Router();

// Nota: el prefijo '/api' lo agrega el index principal con app.use('/api', routes)
router.post('/upper/ventas-rubro',      ventasRubroJSON);
router.post('/upper/ventas-rubro.html', ventasRubroHTML);

module.exports = router;
