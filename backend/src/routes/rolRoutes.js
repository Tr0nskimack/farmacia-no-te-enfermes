const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verificarToken, verificarRol } = require('../middleware/auth');

// Obtener todos los módulos
router.get('/modulos', verificarToken, verificarRol(['admin']), async (req, res) => {
    try {
        const [modulos] = await db.query('SELECT * FROM modulos WHERE activo = true ORDER BY orden');
        res.json(modulos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener módulos' });
    }
});

// Obtener permisos por rol
router.get('/permisos/:rol', verificarToken, verificarRol(['admin']), async (req, res) => {
    try {
        const { rol } = req.params;
        const [permisos] = await db.query(`
            SELECT p.*, m.nombre as modulo_nombre, m.ruta, m.icono 
            FROM permisos_rol p
            JOIN modulos m ON p.modulo_id = m.id
            WHERE p.rol = ?
        `, [rol]);
        res.json(permisos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener permisos' });
    }
});

// Actualizar un permiso
router.put('/permiso/:id', verificarToken, verificarRol(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { puede_ver, puede_crear, puede_editar, puede_eliminar } = req.body;
        
        await db.query(`
            UPDATE permisos_rol 
            SET puede_ver = ?, puede_crear = ?, puede_editar = ?, puede_eliminar = ?
            WHERE id = ?
        `, [puede_ver, puede_crear, puede_editar, puede_eliminar, id]);
        
        res.json({ message: 'Permiso actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar permiso' });
    }
});

// Obtener permisos de un usuario específico (NUEVA RUTA)
router.get('/usuario/:usuarioId', verificarToken, async (req, res) => {
    try {
        const { usuarioId } = req.params;
        
        // Obtener rol del usuario
        const [usuario] = await db.query('SELECT rol FROM usuarios WHERE id = ?', [usuarioId]);
        
        if (usuario.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        const rol = usuario[0].rol;
        
        // Si es admin, devolver todos los permisos como true
        if (rol === 'admin') {
            const [modulos] = await db.query('SELECT nombre FROM modulos WHERE activo = true');
            const permisosAdmin = modulos.map(m => ({
                nombre: m.nombre,
                puede_ver: true,
                puede_crear: true,
                puede_editar: true,
                puede_eliminar: true
            }));
            return res.json(permisosAdmin);
        }
        
        // Obtener permisos del rol
        const [permisos] = await db.query(`
            SELECT m.nombre, p.puede_ver, p.puede_crear, p.puede_editar, p.puede_eliminar
            FROM permisos_rol p
            JOIN modulos m ON p.modulo_id = m.id
            WHERE p.rol = ? AND m.activo = true
        `, [rol]);
        
        res.json(permisos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener permisos del usuario' });
    }
});

// Crear un nuevo permiso (POST)
router.post('/permiso', verificarToken, verificarRol(['admin']), async (req, res) => {
    try {
        const { rol, modulo_id, puede_ver, puede_crear, puede_editar, puede_eliminar } = req.body;
        
        const [result] = await db.query(
            `INSERT INTO permisos_rol 
            (rol, modulo_id, puede_ver, puede_crear, puede_editar, puede_eliminar) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [rol, modulo_id, puede_ver, puede_crear, puede_editar, puede_eliminar]
        );
        
        res.status(201).json({ 
            message: 'Permiso creado', 
            id: result.insertId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear permiso' });
    }
});

module.exports = router;