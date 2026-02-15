const db = require('../config/db');

const obtenerProductos = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos ORDER BY nombre');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
};

const obtenerProductosBajoStock = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM productos WHERE stock <= stock_minimo ORDER BY stock ASC'
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener productos con bajo stock' });
    }
};

const crearProducto = async (req, res) => {
    try {
        const { codigo, nombre, descripcion, precio, stock, stock_minimo, categoria, laboratorio, requiere_receta } = req.body;

        const [result] = await db.query(
            `INSERT INTO productos 
            (codigo, nombre, descripcion, precio, stock, stock_minimo, categoria, laboratorio, requiere_receta) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [codigo, nombre, descripcion, precio, stock, stock_minimo, categoria, laboratorio, requiere_receta]
        );

        res.status(201).json({
            message: 'Producto creado exitosamente',
            id: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear producto' });
    }
};



const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock, stock_minimo, categoria, laboratorio, requiere_receta } = req.body;

        await db.query(
            `UPDATE productos SET 
            nombre = ?, descripcion = ?, precio = ?, stock = ?, 
            stock_minimo = ?, categoria = ?, laboratorio = ?, requiere_receta = ?
            WHERE id = ?`,
            [nombre, descripcion, precio, stock, stock_minimo, categoria, laboratorio, requiere_receta, id]
        );

        res.json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar producto' });
    }
};

// Verificar si código existe
const verificarCodigo = async (req, res) => {
    try {
        const { codigo } = req.params;
        const [rows] = await db.query('SELECT id FROM productos WHERE codigo = ?', [codigo]);
        res.json({ exists: rows.length > 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al verificar código' });
    }
};

// Obtener categorías únicas
const obtenerCategorias = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT DISTINCT categoria as nombre FROM productos WHERE categoria IS NOT NULL AND categoria != "" ORDER BY categoria'
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener categorías' });
    }
};

// Obtener laboratorios únicos
const obtenerLaboratorios = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT DISTINCT laboratorio as nombre FROM productos WHERE laboratorio IS NOT NULL AND laboratorio != "" ORDER BY laboratorio'
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener laboratorios' });
    }
};

const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si el producto tiene detalles de factura
        const [detalles] = await db.query(
            'SELECT id FROM detalles_factura WHERE producto_id = ? LIMIT 1',
            [id]
        );

        if (detalles.length > 0) {
            return res.status(400).json({ 
                message: 'No se puede eliminar porque tiene facturas asociadas' 
            });
        }

        await db.query('DELETE FROM productos WHERE id = ?', [id]);
        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar producto' });
    }
};

// Y asegúrate que esté en el module.exports
module.exports = {
    obtenerProductos,
    obtenerProductosBajoStock,
    crearProducto,
    actualizarProducto,
    eliminarProducto,  // 👈 Esta línea debe existir
    obtenerCategorias,
    obtenerLaboratorios,
    verificarCodigo
};

