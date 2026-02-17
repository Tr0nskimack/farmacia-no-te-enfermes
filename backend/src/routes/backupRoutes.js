const express = require('express');
const router = express.Router();
const {
    obtenerConfiguraciones,
    obtenerConfiguracion,
    crearConfiguracion,
    actualizarConfiguracion,
    eliminarConfiguracion,
    ejecutarRespaldo,
    obtenerHistorial,
    descargarRespaldo,
    restaurarRespaldo
} = require('../controllers/backupController');
const { verificarToken, verificarRol } = require('../middleware/auth');

// Todas las rutas requieren autenticación y rol admin
router.use(verificarToken);
router.use(verificarRol(['admin']));

// Configuraciones
router.get('/configuraciones', obtenerConfiguraciones);
router.get('/configuraciones/:id', obtenerConfiguracion);
router.post('/configuraciones', crearConfiguracion);
router.put('/configuraciones/:id', actualizarConfiguracion);
router.delete('/configuraciones/:id', eliminarConfiguracion);

// Ejecutar respaldo
router.post('/ejecutar', ejecutarRespaldo);

// Historial
router.get('/historial', obtenerHistorial);

// Descargar/Restaurar
router.get('/descargar/:id', descargarRespaldo);
router.post('/restaurar/:id', restaurarRespaldo);

module.exports = router;