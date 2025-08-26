// src/modules/ventas-menos-f/routes.js
const express = require('express');
const { ventasMenosFJSON, ventasMenosFHTML } = require('./controller');

const router = express.Router();

// Recuerda: el prefijo global '/api' lo agrega tu index.js
router.post('/upper/ventas-menos-f',      ventasMenosFJSON);
router.post('/upper/ventas-menos-f.html', ventasMenosFHTML);

module.exports = router;
