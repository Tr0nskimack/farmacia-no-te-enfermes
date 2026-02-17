import { useState, useEffect } from 'react';
import axios from 'axios';

const useBCVRate = () => {
    const [tasa, setTasa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    const fetchTasa = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/bcv/tasa', {
                timeout: 5000
            });
            
            setTasa(response.data);
            setLastUpdate(new Date());
            setError(null);
        } catch (err) {
            console.error('Error al obtener tasa BCV:', err);
            setError('No se pudo obtener la tasa');
            
            // Valores de respaldo
            setTasa({
                usd: 396.37,
                eur: 470.28,
                fecha: new Date().toISOString(),
                fuente: 'Respaldo'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasa();
        
        // Actualizar cada 30 minutos
        const interval = setInterval(fetchTasa, 30 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, []);

    const formatTasa = (valor) => {
        return new Intl.NumberFormat('es-VE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        }).format(valor);
    };

    return {
        tasa,
        loading,
        error,
        lastUpdate,
        refresh: fetchTasa,
        formatTasa
    };
};

export default useBCVRate;