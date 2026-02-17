import React, { useState } from 'react';
import { 
    FaMoneyBill, 
    FaCreditCard, 
    FaMobile, 
    FaQrcode, 
    FaUniversity,
    FaCheck,
    FaTimes,
    FaArrowLeft
} from 'react-icons/fa';
import { BiBoltCircle  } from 'react-icons/bi';
import toast from 'react-hot-toast';

const MetodoPagoModal = ({ isOpen, onClose, total, onConfirm }) => {
    const [metodoPago, setMetodoPago] = useState('');
    const [referencia, setReferencia] = useState('');
    const [montoRecibido, setMontoRecibido] = useState('');
    const [banco, setBanco] = useState('');
    const [telefono, setTelefono] = useState('');
    const [cedula, setCedula] = useState('');

    const metodosPago = [
        { 
            id: 'efectivo', 
            nombre: 'Efectivo', 
            icono: FaMoneyBill, 
            color: 'bg-green-500',
            requiereReferencia: false,
            requiereVuelto: true
        },
        { 
            id: 'debito', 
            nombre: 'Débito', 
            icono: FaCreditCard, 
            color: 'bg-blue-500',
            requiereReferencia: true,
            placeholderRef: 'Número de tarjeta/transacción'
        },
        { 
            id: 'biopago', 
            nombre: 'BioPago', 
            icono: BiBoltCircle , 
            color: 'bg-purple-500',
            requiereReferencia: true,
            placeholderRef: 'Código de operación BioPago'
        },
        { 
            id: 'pago_movil', 
            nombre: 'Pago Móvil', 
            icono: FaMobile, 
            color: 'bg-yellow-500',
            requiereReferencia: true,
            requiereTelefono: true,
            requiereCedula: true,
            placeholderRef: 'Número de referencia'
        },
        { 
            id: 'qr', 
            nombre: 'Pago QR', 
            icono: FaQrcode, 
            color: 'bg-indigo-500',
            requiereReferencia: true,
            placeholderRef: 'Código de autorización'
        },
        { 
            id: 'transferencia', 
            nombre: 'Transferencia', 
            icono: FaUniversity, 
            color: 'bg-cyan-500',
            requiereReferencia: true,
            requiereBanco: true,
            placeholderRef: 'Número de referencia'
        },
        { 
            id: 'credito', 
            nombre: 'Crédito', 
            icono: FaCreditCard, 
            color: 'bg-orange-500',
            requiereReferencia: false,
            requiereAprobacion: true
        }
    ];

    const bancos = [
        'Banco de Venezuela',
        'Banesco',
        'Mercantil',
        'Provincial',
        'Venezolano de Crédito',
        'Banco Exterior',
        'Banco Nacional de Crédito',
        'Banco Bicentenario',
        'Bancaribe',
        'Banplus'
    ];

    const calcularVuelto = () => {
        if (metodoPago === 'efectivo' && montoRecibido) {
            const vuelto = parseFloat(montoRecibido) - total;
            return vuelto > 0 ? vuelto : 0;
        }
        return 0;
    };

    const handleConfirmar = () => {
        if (!metodoPago) {
            toast.error('Seleccione un método de pago');
            return;
        }

        const metodo = metodosPago.find(m => m.id === metodoPago);
        
        if (metodo.requiereReferencia && !referencia) {
            toast.error('Ingrese la referencia de pago');
            return;
        }

        if (metodo.requiereBanco && !banco) {
            toast.error('Seleccione el banco');
            return;
        }

        if (metodo.requiereTelefono && !telefono) {
            toast.error('Ingrese el teléfono');
            return;
        }

        if (metodo.requiereCedula && !cedula) {
            toast.error('Ingrese la cédula');
            return;
        }

        if (metodoPago === 'efectivo') {
            if (!montoRecibido || parseFloat(montoRecibido) < total) {
                toast.error('El monto recibido debe ser mayor o igual al total');
                return;
            }
        }

        const datosPago = {
            metodo_pago: metodoPago,
            referencia_pago: referencia || null,
            monto_recibido: metodoPago === 'efectivo' ? parseFloat(montoRecibido) : total,
            vuelto: metodoPago === 'efectivo' ? calcularVuelto() : 0,
            banco: banco || null,
            telefono: telefono || null,
            cedula: cedula || null
        };

        onConfirm(datosPago);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-lg bg-white">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Método de Pago</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Total a pagar */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-blue-600 font-medium">Total a pagar:</p>
                    <p className="text-3xl font-bold text-blue-700">${total.toFixed(2)}</p>
                </div>

                {/* Métodos de pago */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {metodosPago.map(metodo => {
                        const Icono = metodo.icono;
                        const isSelected = metodoPago === metodo.id;
                        
                        return (
                            <button
                                key={metodo.id}
                                onClick={() => setMetodoPago(metodo.id)}
                                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                    isSelected 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className={`${metodo.color} w-8 h-8 rounded-full flex items-center justify-center text-white mx-auto mb-2`}>
                                    <Icono size={16} />
                                </div>
                                <p className="text-xs font-medium text-center">{metodo.nombre}</p>
                                {isSelected && (
                                    <FaCheck className="text-green-500 absolute top-1 right-1" size={12} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Campos específicos según método */}
                {metodoPago && (
                    <div className="space-y-4">
                        {/* Para todos los métodos excepto efectivo */}
                        {metodoPago !== 'efectivo' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Referencia / Número de transacción
                                </label>
                                <input
                                    type="text"
                                    value={referencia}
                                    onChange={(e) => setReferencia(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 cursor-text"
                                    placeholder={metodosPago.find(m => m.id === metodoPago)?.placeholderRef || 'Ingrese referencia'}
                                />
                            </div>
                        )}

                        {/* Para transferencia */}
                        {metodoPago === 'transferencia' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Banco
                                </label>
                                <select
                                    value={banco}
                                    onChange={(e) => setBanco(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 cursor-pointer"
                                >
                                    <option value="">Seleccione banco</option>
                                    {bancos.map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Para pago móvil */}
                        {metodoPago === 'pago_movil' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 cursor-text"
                                        placeholder="0412-1234567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cédula
                                    </label>
                                    <input
                                        type="text"
                                        value={cedula}
                                        onChange={(e) => setCedula(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 cursor-text"
                                        placeholder="V-12345678"
                                    />
                                </div>
                            </>
                        )}

                        {/* Para efectivo */}
                        {metodoPago === 'efectivo' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Monto recibido
                                    </label>
                                    <input
                                        type="number"
                                        min={total}
                                        step="0.01"
                                        value={montoRecibido}
                                        onChange={(e) => setMontoRecibido(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 cursor-text"
                                        placeholder="0.00"
                                    />
                                </div>
                                {montoRecibido && parseFloat(montoRecibido) > total && (
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <p className="text-sm text-green-600 font-medium">Vuelto:</p>
                                        <p className="text-xl font-bold text-green-700">
                                            ${calcularVuelto().toFixed(2)}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Botones */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors cursor-pointer flex items-center"
                    >
                        <FaArrowLeft className="mr-2" size={14} />
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirmar}
                        className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer flex items-center"
                    >
                        <FaCheck className="mr-2" size={14} />
                        Confirmar Pago
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MetodoPagoModal;