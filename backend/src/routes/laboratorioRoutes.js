const express = require('express');
const router = express.Router();
const {
    obtenerLaboratorios,
    crearLaboratorio,
    actualizarLaboratorio,
    eliminarLaboratorio
} = require('../controllers/categoriaController'); // 👈 Importamos del mismo controller
const { verificarToken, verificarRol } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener todos los laboratorios
router.get('/', obtenerLaboratorios);

// Crear un nuevo laboratorio
router.post('/', verificarRol(['admin', 'farmaceutico']), crearLaboratorio);

// Actualizar un laboratorio
router.put('/:id', verificarRol(['admin', 'farmaceutico']), actualizarLaboratorio);

// Eliminar un laboratorio (solo admin)
router.delete('/:id', verificarRol(['admin']), eliminarLaboratorio);

module.exports = router;