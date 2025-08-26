const express = require('express');
const movimientosRoutes = require('./modules/movimientos/routes');
const movimientosUbicacionRoutes = require('./modules/movimientos-ubicacion/routes');
const totalGrupoRoutes = require('./modules/total-grupo/routes');
const depositosRoutes = require('./modules/depositos/routes'); 
const pagoDifRoutes = require('./modules/pago-diferencia/routes');
const pruebasTecnicas = require('./modules/pruebas-tecnicas/routes');
const inventarioCorte = require('./modules/inventario-corte/routes');
const autoCompara = require('./modules/auto-compara/routes');
const autoconsumo = require('./modules/autoconsumo/routes'); 
const ventasRubroRoutes = require('./modules/ventas-rubro/routes');
const ventasMenosF = require('./modules/ventas-menos-f/routes');
const ventasFRoutes = require('./modules/ventas-f/routes');
const ventasRoutes = require('./modules/ventas/routes');

const router = express.Router();

router.use(movimientosRoutes);
router.use(movimientosUbicacionRoutes);
router.use(totalGrupoRoutes);
router.use(depositosRoutes);
router.use(pagoDifRoutes);
router.use(pruebasTecnicas);
router.use(inventarioCorte);
router.use(autoCompara);
router.use(autoconsumo);
router.use(ventasRubroRoutes);
router.use(ventasMenosF);
router.use(ventasFRoutes);
router.use(ventasRoutes);
// Aquí iremos agregando más módulos:
// router.use(require('./modules/otro/routes'));

module.exports = router;
