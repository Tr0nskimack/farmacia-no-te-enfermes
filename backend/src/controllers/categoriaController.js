const db = require('../config/db');

// CATEGORÍAS
const obtenerCategorias = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                c.*, 
                COUNT(p.id) as total_productos 
            FROM categorias c
            LEFT JOIN productos p ON c.nombre = p.categoria
            GROUP BY c.id
            ORDER BY c.nombre
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener categorías' });
    }
};

const crearCategoria = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        
        // Verificar si ya existe
        const [existente] = await db.query('SELECT id FROM categorias WHERE nombre = ?', [nombre]);
        if (existente.length > 0) {
            return res.status(400).json({ message: 'La categoría ya existe' });
        }

        const [result] = await db.query(
            'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
            [nombre, descripcion || '']
        );

        res.status(201).json({
            message: 'Categoría creada',
            id: result.insertId,
            nombre,
            descripcion: descripcion || ''
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear categoría' });
    }
};

const actualizarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        // Verificar si el nuevo nombre ya existe (excepto la actual)
        if (nombre) {
            const [existente] = await db.query(
                'SELECT id FROM categorias WHERE nombre = ? AND id != ?',
                [nombre, id]
            );
            if (existente.length > 0) {
                return res.status(400).json({ message: 'Ya existe otra categoría con ese nombre' });
            }
        }

        await db.query(
            'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?',
            [nombre, descripcion || '', id]
        );

        res.json({ message: 'Categoría actualizada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar categoría' });
    }
};

const eliminarCategoria = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si tiene productos asociados
        const [categoria] = await db.query('SELECT nombre FROM categorias WHERE id = ?', [id]);
        if (categoria.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        const [productos] = await db.query(
            'SELECT COUNT(*) as total FROM productos WHERE categoria = ?',
            [categoria[0].nombre]
        );

        if (productos[0].total > 0) {
            return res.status(400).json({ 
                message: `No se puede eliminar: ${productos[0].total} producto(s) usan esta categoría` 
            });
        }

        await db.query('DELETE FROM categorias WHERE id = ?', [id]);
        res.json({ message: 'Categoría eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar categoría' });
    }
};

// LABORATORIOS
const obtenerLaboratorios = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                l.*, 
                COUNT(p.id) as total_productos 
            FROM laboratorios l
            LEFT JOIN productos p ON l.nombre = p.laboratorio
            GROUP BY l.id
            ORDER BY l.nombre
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener laboratorios' });
    }
};

const crearLaboratorio = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        
        const [existente] = await db.query('SELECT id FROM laboratorios WHERE nombre = ?', [nombre]);
        if (existente.length > 0) {
            return res.status(400).json({ message: 'El laboratorio ya existe' });
        }

        const [result] = await db.query(
            'INSERT INTO laboratorios (nombre, descripcion) VALUES (?, ?)',
            [nombre, descripcion || '']
        );

        res.status(201).json({
            message: 'Laboratorio creado',
            id: result.insertId,
            nombre,
            descripcion: descripcion || ''
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear laboratorio' });
    }
};

const actualizarLaboratorio = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        if (nombre) {
            const [existente] = await db.query(
                'SELECT id FROM laboratorios WHERE nombre = ? AND id != ?',
                [nombre, id]
            );
            if (existente.length > 0) {
                return res.status(400).json({ message: 'Ya existe otro laboratorio con ese nombre' });
            }
        }

        await db.query(
            'UPDATE laboratorios SET nombre = ?, descripcion = ? WHERE id = ?',
            [nombre, descripcion || '', id]
        );

        res.json({ message: 'Laboratorio actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar laboratorio' });
    }
};

const eliminarLaboratorio = async (req, res) => {
    try {
        const { id } = req.params;

        const [laboratorio] = await db.query('SELECT nombre FROM laboratorios WHERE id = ?', [id]);
        if (laboratorio.length === 0) {
            return res.status(404).json({ message: 'Laboratorio no encontrado' });
        }

        const [productos] = await db.query(
            'SELECT COUNT(*) as total FROM productos WHERE laboratorio = ?',
            [laboratorio[0].nombre]
        );

        if (productos[0].total > 0) {
            return res.status(400).json({ 
                message: `No se puede eliminar: ${productos[0].total} producto(s) usan este laboratorio` 
            });
        }

        await db.query('DELETE FROM laboratorios WHERE id = ?', [id]);
        res.json({ message: 'Laboratorio eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar laboratorio' });
    }
};

module.exports = {
    obtenerCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    obtenerLaboratorios,
    crearLaboratorio,
    actualizarLaboratorio,
    eliminarLaboratorio
};