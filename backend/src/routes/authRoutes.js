const express = require('express');
const router = express.Router();
const { login, registrar } = require('../controllers/authController');
const { verificarToken, verificarRol } = require('../middleware/auth');

router.post('/login', login);
router.post('/registrar', verificarToken, verificarRol(['admin']), registrar);

module.exports = router;