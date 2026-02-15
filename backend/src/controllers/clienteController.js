const db = require('../config/db');

const obtenerClientes = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM clientes ORDER BY nombre');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener clientes' });
    }
};

const crearCliente = async (req, res) => {
    try {
        const { nombre, documento, telefono, email, direccion } = req.body;

        const [result] = await db.query(
            'INSERT INTO clientes (nombre, documento, telefono, email, direccion) VALUES (?, ?, ?, ?, ?)',
            [nombre, documento, telefono, email, direccion]
        );

        res.status(201).json({
            message: 'Cliente creado exitosamente',
            id: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear cliente' });
    }
};

const actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, documento, telefono, email, direccion } = req.body;

        await db.query(
            'UPDATE clientes SET nombre = ?, documento = ?, telefono = ?, email = ?, direccion = ? WHERE id = ?',
            [nombre, documento, telefono, email, direccion, id]
        );

        res.json({ message: 'Cliente actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar cliente' });
    }
};

const eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el cliente tiene facturas
        const [facturas] = await db.query(
            'SELECT id FROM facturas WHERE cliente_id = ? LIMIT 1',
            [id]
        );

        if (facturas.length > 0) {
            return res.status(400).json({
                message: 'No se puede eliminar el cliente porque tiene facturas asociadas'
            });
        }

        await db.query('DELETE FROM clientes WHERE id = ?', [id]);
        res.json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar cliente' });
    }
};

module.exports = {
    obtenerClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente
};