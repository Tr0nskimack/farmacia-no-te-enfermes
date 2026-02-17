// backend/src/routes/bcvRoutes.js
const express = require('express');
const router = express.Router();
const bcvService = require('../services/bcvService');

// Endpoint público (no requiere autenticación)
router.get('/tasa', async (req, res) => {
    try {
        const tasa = await bcvService.obtenerTasaCompleta();
        res.json(tasa);
    } catch (error) {
        console.error('Error en endpoint BCV:', error);
        res.status(500).json({ 
            usd: 396.37, 
            eur: 470.28,
            fecha: new Date().toISOString(),
            error: 'No se pudo obtener la tasa actual'
        });
    }
});

module.exports = router;