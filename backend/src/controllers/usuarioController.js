const db = require('../config/db');
const bcrypt = require('bcryptjs');

const obtenerUsuarios = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY nombre'
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

const crearUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        // Verificar si el email ya existe
        const [existing] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, passwordHash, rol]
        );

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            id: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear usuario' });
    }
};

const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, password, rol } = req.body;

        // Verificar si el email ya existe para otro usuario
        const [existing] = await db.query(
            'SELECT id FROM usuarios WHERE email = ? AND id != ?',
            [email, id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        let query = 'UPDATE usuarios SET nombre = ?, email = ?, rol = ?';
        let params = [nombre, email, rol];

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            query += ', password = ?';
            params.push(passwordHash);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.query(query, params);

        res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
};

const cambiarPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [passwordHash, id]);

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cambiar contraseña' });
    }
};

const toggleActivo = async (req, res) => {
    try {
        const { id } = req.params;

        const [usuario] = await db.query('SELECT activo FROM usuarios WHERE id = ?', [id]);
        const nuevoEstado = !usuario[0].activo;

        await db.query('UPDATE usuarios SET activo = ? WHERE id = ?', [nuevoEstado, id]);

        res.json({ 
            message: `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente` 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cambiar estado' });
    }
};

const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el usuario tiene facturas
        const [facturas] = await db.query(
            'SELECT id FROM facturas WHERE usuario_id = ? LIMIT 1',
            [id]
        );

        if (facturas.length > 0) {
            return res.status(400).json({ 
                message: 'No se puede eliminar el usuario porque tiene facturas asociadas' 
            });
        }

        await db.query('DELETE FROM usuarios WHERE id = ?', [id]);

        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
};

module.exports = {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    cambiarPassword,
    toggleActivo,
    eliminarUsuario
};