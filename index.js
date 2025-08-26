require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ORIGINS, PORT } = require('./src/config/env');
const routes = require('./src/routes');

const app = express();

// Middlewares base
app.use(cors({ origin: ORIGINS, credentials: true }));
app.use(express.json());

// Rutas de módulos
app.use('/api', routes);

// healthcheck
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.listen(PORT, () => {
  console.log(`Upper proxy listo en http://localhost:${PORT}`);
});
