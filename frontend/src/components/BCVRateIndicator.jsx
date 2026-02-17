import React, { useState } from 'react';
import { FaDollarSign, FaEuroSign, FaSync, FaClock, FaInfoCircle } from 'react-icons/fa';
import useBCVRate from '../hooks/useBCVRate';

const BCVRateIndicator = () => {
    const { tasa, loading, lastUpdate, refresh, formatTasa } = useBCVRate();
    const [showTooltip, setShowTooltip] = useState(false);

    if (loading && !tasa) {
        return (
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-600">Cargando tasa...</span>
            </div>
        );
    }

    return (
        <div className="relative">
            <div 
                className="flex items-center space-x-3 linear-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-4 py-2 border border-blue-200 cursor-pointer hover:shadow-md transition-shadow"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={refresh}
            >
                {/* Icono y tasa USD */}
                <div className="flex items-center space-x-1">
                    <FaDollarSign className="text-green-600" size={18} />
                    <span className="font-bold text-gray-800">
                        {formatTasa(tasa?.usd)}
                    </span>
                    <span className="text-xs text-gray-500">Bs.</span>
                </div>

                {/* Separador */}
                <div className="w-px h-6 bg-gray-300"></div>

                {/* Tasa EUR (opcional) */}
                {/* <div className="flex items-center space-x-1">
                    <FaEuroSign className="text-blue-600" size={18} />
                    <span className="font-bold text-gray-800">
                        {formatTasa(tasa?.eur)}
                    </span>
                    <span className="text-xs text-gray-500">Bs.</span>
                </div> */}

                {/* Indicador de actualización */}
                <div className="flex items-center text-gray-400 hover:text-blue-500">
                    <FaSync size={14} className="hover:rotate-180 transition-transform duration-500" />
                </div>
            </div>

            {/* Tooltip con información detallada */}
            {showTooltip && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl p-3 z-50 w-64 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">Tasa BCV</span>
                        <FaInfoCircle className="text-blue-500" size={14} />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Dólar (USD):</span>
                            <span className="font-bold text-green-600">
                                {formatTasa(tasa?.usd)} Bs.
                            </span>
                        </div>
                        
                        <div className="flex justify-between">
                            <span className="text-gray-600">Euro (EUR):</span>
                            <span className="font-bold text-blue-600">
                                {formatTasa(tasa?.eur)} Bs.
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
                            <div className="flex items-center">
                                <FaClock className="mr-1" size={10} />
                                <span>
                                    {lastUpdate 
                                        ? lastUpdate.toLocaleTimeString() 
                                        : 'Actualizado'}
                                </span>
                            </div>
                            <span className="bg-gray-100 px-2 py-1 rounded-full">
                                {tasa?.fuente || 'BCV'}
                            </span>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-1">
                            Haz clic para actualizar manualmente
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BCVRateIndicator;