const db = require('../config/db');

const crearPedido = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { proveedor, productos, fecha_entrega, total } = req.body;
        const usuario_id = req.usuario.id;

        // Generar número de pedido
        const [pedidoCount] = await connection.query(
            'SELECT COUNT(*) as count FROM pedidos WHERE DATE(fecha_pedido) = CURDATE()'
        );
        const numeroPedido = `PED-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(pedidoCount[0].count + 1).padStart(4, '0')}`;

        const [pedidoResult] = await connection.query(
            'INSERT INTO pedidos (numero_pedido, usuario_id, proveedor, fecha_entrega, total) VALUES (?, ?, ?, ?, ?)',
            [numeroPedido, usuario_id, proveedor, fecha_entrega, total]
        );

        for (const item of productos) {
            await connection.query(
                'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_compra) VALUES (?, ?, ?, ?)',
                [pedidoResult.insertId, item.producto_id, item.cantidad, item.precio_compra]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: 'Pedido creado exitosamente',
            numero_pedido: numeroPedido,
            id: pedidoResult.insertId
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Error al crear pedido' });
    } finally {
        connection.release();
    }
};

const recibirPedido = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { id } = req.params;

        // Actualizar estado del pedido
        await connection.query(
            'UPDATE pedidos SET estado = "recibido" WHERE id = ?',
            [id]
        );

        // Obtener detalles del pedido
        const [detalles] = await connection.query(
            'SELECT * FROM detalles_pedido WHERE pedido_id = ?',
            [id]
        );

        // Actualizar stock de productos
        for (const detalle of detalles) {
            await connection.query(
                'UPDATE productos SET stock = stock + ? WHERE id = ?',
                [detalle.cantidad, detalle.producto_id]
            );
        }

        await connection.commit();

        res.json({ message: 'Pedido recibido y stock actualizado' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Error al recibir pedido' });
    } finally {
        connection.release();
    }
};

module.exports = { crearPedido, recibirPedido };