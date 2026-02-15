const express = require('express');
const router = express.Router();
const { crearPedido, recibirPedido } = require('../controllers/pedidoController');
const db = require('../config/db');
const { verificarRol } = require('../middleware/auth');

// Obtener todos los pedidos
router.get('/', async (req, res) => {
    try {
        const [pedidos] = await db.query(`
            SELECT p.*, u.nombre as usuario_nombre 
            FROM pedidos p
            LEFT JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.fecha_pedido DESC
        `);

        // Obtener detalles para cada pedido
        for (let pedido of pedidos) {
            const [detalles] = await db.query(`
                SELECT dp.*, pr.nombre 
                FROM detalles_pedido dp
                JOIN productos pr ON dp.producto_id = pr.id
                WHERE dp.pedido_id = ?
            `, [pedido.id]);
            pedido.detalles = detalles;
        }

        res.json(pedidos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener pedidos' });
    }
});

router.post('/', verificarRol(['admin', 'farmaceutico']), crearPedido);
router.put('/:id/recibir', verificarRol(['admin', 'farmaceutico']), recibirPedido);

module.exports = router;