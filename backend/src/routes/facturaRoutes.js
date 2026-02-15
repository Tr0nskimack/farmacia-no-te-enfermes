const express = require('express');
const router = express.Router();
const { crearFactura, obtenerFacturas } = require('../controllers/facturaController');

router.post('/', crearFactura);
router.get('/', obtenerFacturas);

module.exports = router;  // 👈 IMPORTANTE