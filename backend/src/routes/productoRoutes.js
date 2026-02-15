const express = require('express');
const router = express.Router();
const { 
    obtenerProductos, 
    obtenerProductosBajoStock,
    crearProducto, 
    actualizarProducto,
    eliminarProducto,
    obtenerLaboratorios,
    obtenerCategorias,
    verificarCodigo
} = require('../controllers/productoController');

// Rutas
router.get('/', obtenerProductos);
router.get('/bajo-stock', obtenerProductosBajoStock);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);  // 👈 Esta es la línea 16
router.get('/verificar-codigo/:codigo', verificarCodigo);
router.get('/categorias', obtenerCategorias);
router.get('/laboratorios', obtenerLaboratorios);

module.exports = router;