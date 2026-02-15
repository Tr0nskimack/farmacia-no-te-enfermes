const db = require('../config/db');

const obtenerModulos = async (req, res) => {
    try {
        const [modulos] = await db.query('SELECT * FROM modulos WHERE activo = true ORDER BY orden');
        res.json(modulos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener módulos' });
    }
};

const obtenerPermisosPorRol = async (req, res) => {
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
};

const actualizarPermiso = async (req, res) => {
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
};

const obtenerPermisosUsuario = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        
        // Obtener rol del usuario
        const [usuario] = await db.query('SELECT rol FROM usuarios WHERE id = ?', [usuarioId]);
        
        if (usuario.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        const rol = usuario[0].rol;
        
        // Obtener permisos del rol
        const [permisos] = await db.query(`
            SELECT m.ruta, m.nombre, p.puede_ver, p.puede_crear, p.puede_editar, p.puede_eliminar
            FROM permisos_rol p
            JOIN modulos m ON p.modulo_id = m.id
            WHERE p.rol = ? AND m.activo = true
        `, [rol]);
        
        res.json(permisos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener permisos del usuario' });
    }
};

module.exports = {
    obtenerModulos,
    obtenerPermisosPorRol,
    actualizarPermiso,
    obtenerPermisosUsuario
};