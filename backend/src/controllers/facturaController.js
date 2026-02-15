const db = require('../config/db');

const crearFactura = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { cliente_id, productos, subtotal, iva, total } = req.body;
        const usuario_id = req.usuario.id;

        // Generar número de factura
        const [facturaCount] = await connection.query(
            'SELECT COUNT(*) as count FROM facturas WHERE DATE(fecha) = CURDATE()'
        );
        const numeroFactura = `FAC-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(facturaCount[0].count + 1).padStart(4, '0')}`;

        // Crear factura
        const [facturaResult] = await connection.query(
            'INSERT INTO facturas (numero_factura, cliente_id, usuario_id, subtotal, iva, total) VALUES (?, ?, ?, ?, ?, ?)',
            [numeroFactura, cliente_id, usuario_id, subtotal, iva, total]
        );

        // Crear detalles y actualizar stock
        for (const item of productos) {
            await connection.query(
                'INSERT INTO detalles_factura (factura_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
                [facturaResult.insertId, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal]
            );

            await connection.query(
                'UPDATE productos SET stock = stock - ? WHERE id = ?',
                [item.cantidad, item.producto_id]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: 'Factura creada exitosamente',
            numero_factura: numeroFactura,
            id: facturaResult.insertId
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Error al crear factura' });
    } finally {
        connection.release();
    }
};

const obtenerFacturas = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT f.*, c.nombre as cliente_nombre, u.nombre as usuario_nombre 
            FROM facturas f
            LEFT JOIN clientes c ON f.cliente_id = c.id
            LEFT JOIN usuarios u ON f.usuario_id = u.id
            ORDER BY f.fecha DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener facturas' });
    }
};

module.exports = { crearFactura, obtenerFacturas };