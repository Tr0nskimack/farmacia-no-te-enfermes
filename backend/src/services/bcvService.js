// backend/src/services/bcvService.js
const axios = require('axios');

class BCVService {
    constructor() {
        // Usar alguna API pública existente
        this.apiUrl = 'https://api.bcv.com.ve/rates'; // Ejemplo, buscar una real
        this.cacheTasa = null;
        this.cacheTime = null;
        this.cacheDuration = 60 * 60 * 1000; // 1 hora en milisegundos
    }

    async obtenerTasa() {
        // Verificar si hay cache válido
        if (this.cacheTasa && this.cacheTime && (Date.now() - this.cacheTime < this.cacheDuration)) {
            return this.cacheTasa;
        }

        try {
            // Intentar obtener de API
            const response = await axios.get(this.apiUrl, { timeout: 5000 });
            const tasa = response.data.rate || response.data.valor;
            
            // Actualizar cache
            this.cacheTasa = tasa;
            this.cacheTime = Date.now();
            
            return tasa;
        } catch (error) {
            console.error('Error al obtener tasa BCV:', error);
            
            // Si falla y hay cache, devolver cache aunque sea viejo
            if (this.cacheTasa) {
                return this.cacheTasa;
            }
            
            // Valor por defecto
            return 396.37; // Valor actual según búsqueda
        }
    }

    async obtenerTasaCompleta() {
        try {
            const response = await axios.get(this.apiUrl, { timeout: 5000 });
            return {
                usd: response.data.usd || response.data.dolar,
                eur: response.data.eur || response.data.euro,
                fecha: response.data.fecha || new Date().toISOString(),
                fuente: 'BCV'
            };
        } catch (error) {
            console.error('Error:', error);
            return {
                usd: 396.37,
                eur: 470.28,
                fecha: new Date().toISOString(),
                fuente: 'BCV (estimado)'
            };
        }
    }
}

module.exports = new BCVService();