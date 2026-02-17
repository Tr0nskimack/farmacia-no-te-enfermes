const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { verificarToken } = require('./src/middleware/auth');

// Importar rutas
const authRoutes = require('./src/routes/authRoutes');
const productoRoutes = require('./src/routes/productoRoutes');
const facturaRoutes = require('./src/routes/facturaRoutes');
const pedidoRoutes = require('./src/routes/pedidoRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
// ... después de las otras importaciones
const rolRoutes = require('./src/routes/rolRoutes');
const backupRoutes = require('./src/routes/backupRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas públicas
app.use('/api/auth', authRoutes);

// Rutas protegidas
app.use('/api/productos', verificarToken, productoRoutes);
app.use('/api/facturas', verificarToken, facturaRoutes);
app.use('/api/pedidos', verificarToken, pedidoRoutes);
app.use('/api/clientes', verificarToken, clienteRoutes);
app.use('/api/usuarios', verificarToken, usuarioRoutes);
// ... después de las otras rutas
app.use('/api/roles', verificarToken, rolRoutes); // 👈 Agregar esta línea

// Agregar estas líneas
const categoriaRoutes = require('./src/routes/categoriaRoutes');
const laboratorioRoutes = require('./src/routes/laboratorioRoutes');

// Agregar después de las otras rutas
app.use('/api/categorias', verificarToken, categoriaRoutes);
app.use('/api/laboratorios', verificarToken, laboratorioRoutes);
// Agregar después de las otras importaciones


// Agregar después de las otras rutas
app.use('/api/backups', verificarToken, backupRoutes);
// En server.js, agregar:
const bcvRoutes = require('./src/routes/bcvRoutes');

// Esta ruta debe ser pública (sin verificarToken)
app.use('/api/bcv', bcvRoutes);

// Ruta para alertas
app.get('/api/alertas/bajo-stock', verificarToken, async (req, res) => {
    try {
        const db = require('./src/config/db');
        const [rows] = await db.query('SELECT * FROM productos WHERE stock <= stock_minimo ORDER BY stock ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener alertas' });
    }
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API de Farmacia funcionando' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});