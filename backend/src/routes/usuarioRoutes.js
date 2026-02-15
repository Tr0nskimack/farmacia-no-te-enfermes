const express = require('express');
const router = express.Router();
const {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    cambiarPassword,
    toggleActivo,
    eliminarUsuario
} = require('../controllers/usuarioController');
const { verificarToken, verificarRol } = require('../middleware/auth');

// Todas las rutas de usuarios requieren rol de administrador
router.use(verificarToken);
router.use(verificarRol(['admin']));

router.get('/', obtenerUsuarios);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.put('/:id/password', cambiarPassword);
router.put('/:id/toggle', toggleActivo);
router.delete('/:id', eliminarUsuario);

module.exports = router;