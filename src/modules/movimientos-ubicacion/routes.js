// src/modules/movimientos-ubicacion/routes.js
const express = require('express');
const { ubicacionJSON, ubicacionHTML } = require('./controller');

const router = express.Router();

router.post('/upper/movimientos-ubicacion', ubicacionJSON);
router.post('/upper/movimientos-ubicacion.html', ubicacionHTML);

module.exports = router;
