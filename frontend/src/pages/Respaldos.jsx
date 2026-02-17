import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    FaDatabase, 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaPlay, 
    FaDownload, 
    FaHistory,
    FaClock,
    FaCalendarAlt,
    FaEnvelope,
    FaCompress,
    FaCheck,
    FaTimes,
    FaFileArchive,
    FaFile,
    FaExclamationTriangle
} from 'react-icons/fa';
import { FaRotate } from "react-icons/fa6";
import { useAuth } from '../context/AuthContext';

const Respaldos = () => {
    const { tienePermiso } = useAuth();
    const [configuraciones, setConfiguraciones] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showEjecutarModal, setShowEjecutarModal] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);
    const [tabActiva, setTabActiva] = useState('configuraciones'); // 'configuraciones' o 'historial'
    
    const puedeCrear = tienePermiso('Respaldos', 'crear');
    const puedeEditar = tienePermiso('Respaldos', 'editar');
    const puedeEliminar = tienePermiso('Respaldos', 'eliminar');
    const puedeVer = tienePermiso('Respaldos', 'ver');

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo_programacion: 'diario',
        hora: '02:00',
        dia_semana: '1', // Lunes
        dia_mes: '1',
        activo: true,
        incluir_estructura: true,
        incluir_datos: true,
        notificar_email: false,
        email_notificacion: '',
        comprimir: true,
        rotar_copias: '10'
    });

    useEffect(() => {
        if (puedeVer) {
            cargarDatos();
        }
    }, [puedeVer]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [configRes, historialRes] = await Promise.all([
                axios.get('http://localhost:5000/api/backups/configuraciones'),
                axios.get('http://localhost:5000/api/backups/historial')
            ]);
            setConfiguraciones(configRes.data);
            setHistorial(historialRes.data);
        } catch (error) {
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingConfig) {
                await axios.put(`http://localhost:5000/api/backups/configuraciones/${editingConfig.id}`, formData);
                toast.success('Configuración actualizada');
            } else {
                await axios.post('http://localhost:5000/api/backups/configuraciones', formData);
                toast.success('Configuración creada');
            }
            setShowModal(false);
            resetForm();
            cargarDatos();
        } catch (error) {
            toast.error('Error al guardar');
        }
    };

    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar la configuración "${nombre}"?`)) return;
        try {
            await axios.delete(`http://localhost:5000/api/backups/configuraciones/${id}`);
            toast.success('Configuración eliminada');
            cargarDatos();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const ejecutarRespaldo = async (configuracionId = null, nombrePersonalizado = '') => {
        try {
            const response = await axios.post('http://localhost:5000/api/backups/ejecutar', {
                configuracion_id: configuracionId,
                nombre_personalizado: nombrePersonalizado
            });
            toast.success(`Respaldo ejecutado: ${response.data.archivo}`);
            cargarDatos();
            setShowEjecutarModal(false);
        } catch (error) {
            toast.error('Error al ejecutar respaldo');
        }
    };

    const descargarRespaldo = async (id) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/backups/descargar/${id}`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Obtener nombre del archivo del header Content-Disposition
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'respaldo.sql';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('Descarga iniciada');
        } catch (error) {
            toast.error('Error al descargar');
        }
    };

    const restaurarRespaldo = async (id) => {
        if (!window.confirm('¿Estás seguro? Esta acción SOBREESCRIBIRÁ todos los datos actuales. Se recomienda hacer un respaldo antes.')) return;
        
        try {
            await axios.post(`http://localhost:5000/api/backups/restaurar/${id}`);
            toast.success('Base de datos restaurada exitosamente');
            cargarDatos();
        } catch (error) {
            toast.error('Error al restaurar');
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            tipo_programacion: 'diario',
            hora: '02:00',
            dia_semana: '1',
            dia_mes: '1',
            activo: true,
            incluir_estructura: true,
            incluir_datos: true,
            notificar_email: false,
            email_notificacion: '',
            comprimir: true,
            rotar_copias: '10'
        });
        setEditingConfig(null);
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getProgramacionTexto = (config) => {
        switch(config.tipo_programacion) {
            case 'diario':
                return `Diario a las ${config.hora}`;
            case 'semanal':
                const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                return `${dias[config.dia_semana]} a las ${config.hora}`;
            case 'mensual':
                return `Día ${config.dia_mes} a las ${config.hora}`;
            default:
                return 'No programado';
        }
    };

    if (!puedeVer) {
        return (
            <div className="p-6">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                    <p className="font-bold">Acceso Denegado</p>
                    <p>No tienes permisos para ver esta página.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <FaDatabase className="mr-3 text-blue-500" />
                    Respaldos
                </h1>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowEjecutarModal(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600 transition-colors cursor-pointer"
                    >
                        <FaPlay className="mr-2" />
                        Respaldo Manual
                    </button>
                    {puedeCrear && (
                        <button
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                            <FaPlus className="mr-2" />
                            Nueva Configuración
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex -mb-px">
                    <button
                        onClick={() => setTabActiva('configuraciones')}
                        className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                            tabActiva === 'configuraciones'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Configuraciones
                    </button>
                    <button
                        onClick={() => setTabActiva('historial')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            tabActiva === 'historial'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <FaHistory className="inline mr-2" />
                        Historial de Respaldos
                    </button>
                </nav>
            </div>

            {tabActiva === 'configuraciones' ? (
                <div className="grid grid-cols-1 gap-4">
                    {configuraciones.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <FaDatabase className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No hay configuraciones de respaldo</p>
                            {puedeCrear && (
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setShowModal(true);
                                    }}
                                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg inline-flex items-center hover:bg-blue-600"
                                >
                                    <FaPlus className="mr-2" />
                                    Crear primera configuración
                                </button>
                            )}
                        </div>
                    ) : (
                        configuraciones.map(config => (
                            <div key={config.id} className="bg-white rounded-lg shadow p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center">
                                            <h3 className="text-lg font-semibold text-gray-800">{config.nombre}</h3>
                                            {config.activo ? (
                                                <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                                                    <FaCheck className="mr-1" size={10} /> Activo
                                                </span>
                                            ) : (
                                                <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full flex items-center">
                                                    <FaTimes className="mr-1" size={10} /> Inactivo
                                                </span>
                                            )}
                                        </div>
                                        {config.descripcion && (
                                            <p className="text-sm text-gray-600 mt-1">{config.descripcion}</p>
                                        )}
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-500">Programación</p>
                                                <p className="text-sm font-medium flex items-center">
                                                    <FaClock className="mr-1 text-blue-500" size={12} />
                                                    {getProgramacionTexto(config)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Contenido</p>
                                                <p className="text-sm">
                                                    {config.incluir_estructura && config.incluir_datos && 'Estructura + Datos'}
                                                    {config.incluir_estructura && !config.incluir_datos && 'Solo estructura'}
                                                    {!config.incluir_estructura && config.incluir_datos && 'Solo datos'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Compresión</p>
                                                <p className="text-sm flex items-center">
                                                    {config.comprimir ? (
                                                        <><FaCompress className="mr-1 text-green-500" /> Sí</>
                                                    ) : 'No'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Rotación</p>
                                                <p className="text-sm">Mantener últimas {config.rotar_copias}</p>
                                            </div>
                                        </div>
                                        
                                        {config.notificar_email && config.email_notificacion && (
                                            <p className="text-xs text-gray-500 mt-2 flex items-center">
                                                <FaEnvelope className="mr-1" />
                                                Notificar a: {config.email_notificacion}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={() => ejecutarRespaldo(config.id)}
                                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors cursor-pointer"
                                            title="Ejecutar ahora"
                                        >
                                            <FaPlay size={16} />
                                        </button>
                                        {puedeEditar && (
                                            <button
                                                onClick={() => {
                                                    setEditingConfig(config);
                                                    setFormData({
                                                        nombre: config.nombre,
                                                        descripcion: config.descripcion || '',
                                                        tipo_programacion: config.tipo_programacion,
                                                        hora: config.hora,
                                                        dia_semana: config.dia_semana?.toString() || '1',
                                                        dia_mes: config.dia_mes?.toString() || '1',
                                                        activo: config.activo === 1,
                                                        incluir_estructura: config.incluir_estructura === 1,
                                                        incluir_datos: config.incluir_datos === 1,
                                                        notificar_email: config.notificar_email === 1,
                                                        email_notificacion: config.email_notificacion || '',
                                                        comprimir: config.comprimir === 1,
                                                        rotar_copias: config.rotar_copias?.toString() || '10'
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                                                title="Editar"
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                        )}
                                        {puedeEliminar && (
                                            <button
                                                onClick={() => handleDelete(config.id, config.nombre)}
                                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                                                title="Eliminar"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Archivo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Configuración</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamaño</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Realizado por</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {historial.map(backup => (
                                <tr key={backup.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(backup.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <div className="flex items-center">
                                            {backup.nombre_archivo?.endsWith('.gz') ? (
                                                <FaFileArchive className="mr-2 text-yellow-500" />
                                            ) : (
                                                <FaFile className="mr-2 text-blue-500" />
                                            )}
                                            {backup.nombre_archivo || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {backup.configuracion_nombre || 'Manual'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatBytes(backup.tamaño_bytes || 0)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {backup.estado === 'exitoso' && (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center w-fit">
                                                <FaCheck className="mr-1" size={10} /> Exitoso
                                            </span>
                                        )}
                                        {backup.estado === 'fallido' && (
                                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center w-fit">
                                                <FaExclamationTriangle className="mr-1" size={10} /> Fallido
                                            </span>
                                        )}
                                        {backup.estado === 'en_proceso' && (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center w-fit">
                                                <FaRotate className="mr-1 animate-spin" size={10} /> En proceso
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {backup.usuario_nombre || 'Sistema'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex space-x-2">
                                            {backup.estado === 'exitoso' && backup.ruta_archivo && (
                                                <>
                                                    <button
                                                        onClick={() => descargarRespaldo(backup.id)}
                                                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                                        title="Descargar"
                                                    >
                                                        <FaDownload size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => restaurarRespaldo(backup.id)}
                                                        className="text-yellow-600 hover:text-yellow-800 p-1 hover:bg-yellow-50 rounded transition-colors cursor-pointer"
                                                        title="Restaurar"
                                                    >
                                                        <FaRotate size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {historial.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No hay historial de respaldos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Configuración */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-150 shadow-lg rounded-lg bg-white max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                            {editingConfig ? 'Editar Configuración' : 'Nueva Configuración'}
                        </h3>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Programación</label>
                                <select
                                    name="tipo_programacion"
                                    value={formData.tipo_programacion}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                >
                                    <option value="diario">Diario</option>
                                    <option value="semanal">Semanal</option>
                                    <option value="mensual">Mensual</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                                    <input
                                        type="time"
                                        name="hora"
                                        value={formData.hora}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                    />
                                </div>

                                {formData.tipo_programacion === 'semanal' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Día de la semana</label>
                                        <select
                                            name="dia_semana"
                                            value={formData.dia_semana}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                        >
                                            <option value="1">Lunes</option>
                                            <option value="2">Martes</option>
                                            <option value="3">Miércoles</option>
                                            <option value="4">Jueves</option>
                                            <option value="5">Viernes</option>
                                            <option value="6">Sábado</option>
                                            <option value="0">Domingo</option>
                                        </select>
                                    </div>
                                )}

                                {formData.tipo_programacion === 'mensual' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Día del mes</label>
                                        <input
                                            type="number"
                                            name="dia_mes"
                                            min="1"
                                            max="31"
                                            value={formData.dia_mes}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="activo"
                                        checked={formData.activo}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Activo</span>
                                </label>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-4">
                                <h4 className="font-medium mb-2">Contenido del respaldo</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="incluir_estructura"
                                            checked={formData.incluir_estructura}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Incluir estructura de tablas</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="incluir_datos"
                                            checked={formData.incluir_datos}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Incluir datos</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="comprimir"
                                            checked={formData.comprimir}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Comprimir (.gz)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-4">
                                <h4 className="font-medium mb-2">Notificaciones</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="notificar_email"
                                            checked={formData.notificar_email}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Notificar por email</span>
                                    </label>
                                    
                                    {formData.notificar_email && (
                                        <div className="mt-2">
                                            <input
                                                type="email"
                                                name="email_notificacion"
                                                value={formData.email_notificacion}
                                                onChange={handleInputChange}
                                                placeholder="Email para notificaciones"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-4">
                                <h4 className="font-medium mb-2">Rotación</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Número de copias a mantener
                                    </label>
                                    <input
                                        type="number"
                                        name="rotar_copias"
                                        min="1"
                                        value={formData.rotar_copias}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Las copias más antiguas se eliminarán automáticamente
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
                                >
                                    {editingConfig ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Ejecutar Respaldo Manual */}
            {showEjecutarModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-40 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                            Ejecutar Respaldo Manual
                        </h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Configuración (opcional)
                            </label>
                            <select
                                id="configSelect"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                defaultValue=""
                            >
                                <option value="">Sin configuración (respaldo completo)</option>
                                {configuraciones.filter(c => c.activo).map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre personalizado (opcional)
                            </label>
                            <input
                                type="text"
                                id="nombrePersonalizado"
                                placeholder="ej: antes_de_actualizar"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowEjecutarModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    const select = document.getElementById('configSelect');
                                    const input = document.getElementById('nombrePersonalizado');
                                    ejecutarRespaldo(select.value || null, input.value);
                                }}
                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors cursor-pointer"
                            >
                                Ejecutar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Respaldos;