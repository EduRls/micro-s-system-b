const express = require('express');
const { movimientosJSON, movimientosHTML } = require('./controller');

const router = express.Router();

router.post('/upper/movimientos', movimientosJSON);
router.post('/upper/movimientos.html', movimientosHTML);

module.exports = router;
