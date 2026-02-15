const express = require('express');
const router = express.Router();
const {
    obtenerClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente
} = require('../controllers/clienteController');
const { verificarRol } = require('../middleware/auth');

router.get('/', obtenerClientes);
router.post('/', verificarRol(['admin', 'vendedor']), crearCliente);
router.put('/:id', verificarRol(['admin', 'vendedor']), actualizarCliente);
router.delete('/:id', verificarRol(['admin']), eliminarCliente);

module.exports = router;