import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaShieldAlt, FaCheck, FaTimes, FaEye, FaPlus, FaEdit, FaTrash, FaSave, FaUndo } from 'react-icons/fa';

const Roles = () => {
    const [modulos, setModulos] = useState([]);
    const [permisos, setPermisos] = useState({});
    const [permisosOriginales, setPermisosOriginales] = useState({});
    const [nuevosPermisos, setNuevosPermisos] = useState([]);
    const [rolSeleccionado, setRolSeleccionado] = useState('vendedor');
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [hayCambios, setHayCambios] = useState(false);

    const roles = [
        { id: 'admin', nombre: 'Administrador', color: 'bg-red-100 text-red-800', descripcion: 'Acceso total al sistema' },
        { id: 'farmaceutico', nombre: 'Farmacéutico', color: 'bg-blue-100 text-blue-800', descripcion: 'Gestión de productos y pedidos' },
        { id: 'vendedor', nombre: 'Vendedor', color: 'bg-green-100 text-green-800', descripcion: 'Facturación y clientes' }
    ];

    useEffect(() => {
        cargarModulos();
    }, []);

    useEffect(() => {
        if (modulos.length > 0) {
            cargarPermisos(rolSeleccionado);
        }
    }, [rolSeleccionado, modulos]);

    const cargarModulos = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/roles/modulos');
            setModulos(response.data);
        } catch (error) {
            toast.error('Error al cargar módulos');
        }
    };

    const cargarPermisos = async (rol) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/roles/permisos/${rol}`);
            
            const permisosMap = {};
            response.data.forEach(p => {
                permisosMap[p.modulo_id] = p;
            });
            setPermisos(permisosMap);
            setPermisosOriginales(JSON.parse(JSON.stringify(permisosMap)));
            setNuevosPermisos([]);
            setHayCambios(false);
        } catch (error) {
            toast.error('Error al cargar permisos');
        } finally {
            setLoading(false);
        }
    };

    // En togglePermiso, asegura que si no existe el permiso, se cree con id temporal
const togglePermiso = (moduloId, campo) => {
    if (rolSeleccionado === 'admin') {
        toast.error('Los permisos del Administrador no pueden modificarse');
        return;
    }

    // Si no existe, crear objeto base con id temporal
    const permisoActual = permisos[moduloId] || {
        modulo_id: moduloId,
        puede_ver: false,
        puede_crear: false,
        puede_editar: false,
        puede_eliminar: false,
        id: `temp_${moduloId}_${Date.now()}`
    };

    const nuevoValor = !permisoActual[campo];
    const permisoActualizado = { ...permisoActual, [campo]: nuevoValor };

    setPermisos({
        ...permisos,
        [moduloId]: permisoActualizado
    });

    setHayCambios(true);
};

// Guardar cambios (crear y actualizar)
const guardarCambios = async () => {
    if (rolSeleccionado === 'admin') {
        toast.error('Los permisos del Administrador no pueden modificarse');
        return;
    }

    setGuardando(true);
    let errores = 0;
    let exitos = 0;

    // 1. Actualizar permisos existentes (con id numérico)
    for (const moduloId in permisos) {
        const permiso = permisos[moduloId];
        const permisoOriginal = permisosOriginales[moduloId];
        
        if (permiso.id && !isNaN(permiso.id) && 
            JSON.stringify(permiso) !== JSON.stringify(permisoOriginal)) {
            try {
                await axios.put(`http://localhost:5000/api/roles/permiso/${permiso.id}`, {
                    puede_ver: permiso.puede_ver,
                    puede_crear: permiso.puede_crear,
                    puede_editar: permiso.puede_editar,
                    puede_eliminar: permiso.puede_eliminar
                });
                exitos++;
            } catch (error) {
                console.error('Error al actualizar permiso:', error);
                errores++;
            }
        }
    }

    // 2. Crear nuevos permisos (los que tienen id temporal)
    for (const moduloId in permisos) {
        const permiso = permisos[moduloId];
        // Si tiene id temporal y al menos un permiso activo (o incluso si todos false, pero queremos crearlo igual)
        if (permiso.id && permiso.id.toString().startsWith('temp_')) {
            try {
                const response = await axios.post('http://localhost:5000/api/roles/permiso', {
                    rol: rolSeleccionado,
                    modulo_id: moduloId,
                    puede_ver: permiso.puede_ver,
                    puede_crear: permiso.puede_crear,
                    puede_editar: permiso.puede_editar,
                    puede_eliminar: permiso.puede_eliminar
                });
                // Actualizar el id real en el estado
                setPermisos(prev => ({
                    ...prev,
                    [moduloId]: { ...prev[moduloId], id: response.data.id }
                }));
                exitos++;
            } catch (error) {
                console.error('Error al crear permiso:', error);
                errores++;
            }
        }
    }

    setGuardando(false);

    if (errores === 0) {
        toast.success(`✅ Permisos guardados correctamente`);
        // Recargar permisos para tener los IDs reales
        cargarPermisos(rolSeleccionado);
        setHayCambios(false);
    } else {
        toast.error(`❌ Error al guardar algunos permisos (${errores} errores, ${exitos} exitosos)`);
    }
};

    const cancelarCambios = () => {
        setPermisos(JSON.parse(JSON.stringify(permisosOriginales)));
        setNuevosPermisos([]);
        setHayCambios(false);
        toast.success('Cambios descartados');
    };

    const seleccionarTodos = () => {
        if (rolSeleccionado === 'admin') {
            toast.error('Los permisos del Administrador no pueden modificarse');
            return;
        }
        
        const nuevosPermisosMap = { ...permisos };
        Object.keys(nuevosPermisosMap).forEach(moduloId => {
            if (nuevosPermisosMap[moduloId]) {
                nuevosPermisosMap[moduloId] = {
                    ...nuevosPermisosMap[moduloId],
                    puede_ver: true,
                    puede_crear: true,
                    puede_editar: true,
                    puede_eliminar: true
                };
            }
        });
        setPermisos(nuevosPermisosMap);
        setHayCambios(true);
    };

    const deseleccionarTodos = () => {
        if (rolSeleccionado === 'admin') {
            toast.error('Los permisos del Administrador no pueden modificarse');
            return;
        }
        
        const nuevosPermisosMap = { ...permisos };
        Object.keys(nuevosPermisosMap).forEach(moduloId => {
            if (nuevosPermisosMap[moduloId]) {
                nuevosPermisosMap[moduloId] = {
                    ...nuevosPermisosMap[moduloId],
                    puede_ver: false,
                    puede_crear: false,
                    puede_editar: false,
                    puede_eliminar: false
                };
            }
        });
        setPermisos(nuevosPermisosMap);
        setHayCambios(true);
    };

    const getBotonEstilo = (activo, deshabilitado = false) => {
        if (deshabilitado) {
            return 'p-2 rounded-lg opacity-50 cursor-not-allowed bg-gray-100 text-gray-400';
        }
        return `p-2 rounded-lg transition-all transform hover:scale-110 cursor-pointer ${
            activo
                ? 'bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
        }`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <FaShieldAlt className="mr-3 text-blue-500" />
                Configuración de Roles y Permisos
            </h1>
            <p className="text-gray-600 mb-6">
                Personaliza los permisos para cada rol del sistema. Los cambios se aplican inmediatamente.
            </p>

            {/* Selector de roles */}
            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Seleccionar Rol para configurar:
                </label>
                <div className="flex flex-wrap gap-4">
                    {roles.map(rol => (
                        <button
                            key={rol.id}
                            onClick={() => {
                                if (hayCambios) {
                                    if (window.confirm('Hay cambios sin guardar. ¿Deseas descartarlos?')) {
                                        setRolSeleccionado(rol.id);
                                    }
                                } else {
                                    setRolSeleccionado(rol.id);
                                }
                            }}
                            className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 cursor-pointer ${
                                rolSeleccionado === rol.id
                                    ? 'bg-blue-500 text-white shadow-lg'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <div className="text-center">
                                <div className="font-bold">{rol.nombre}</div>
                                <div className="text-xs mt-1 opacity-75">{rol.descripcion}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Barra de herramientas */}
            {rolSeleccionado !== 'admin' && (
                <div className="mb-4 flex flex-wrap justify-between items-center gap-4">
                    <div className="space-x-2">
                        <button
                            onClick={seleccionarTodos}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer inline-flex items-center"
                        >
                            <FaPlus className="mr-2" size={14} />
                            Seleccionar Todos
                        </button>
                        <button
                            onClick={deseleccionarTodos}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer inline-flex items-center"
                        >
                            <FaTimes className="mr-2" size={14} />
                            Deseleccionar Todos
                        </button>
                    </div>
                    
                    <div className="space-x-2">
                        {hayCambios && (
                            <button
                                onClick={cancelarCambios}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer inline-flex items-center"
                            >
                                <FaUndo className="mr-2" size={14} />
                                Cancelar
                            </button>
                        )}
                        <button
                            onClick={guardarCambios}
                            disabled={guardando || !hayCambios}
                            className={`px-6 py-2 bg-blue-500 text-white rounded-lg transition-colors inline-flex items-center ${
                                guardando || !hayCambios 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:bg-blue-600 cursor-pointer'
                            }`}
                        >
                            <FaSave className="mr-2" size={14} />
                            {guardando ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            )}

            {/* Tabla de permisos */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Módulo
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <FaEye className="inline mr-1" /> Ver
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <FaPlus className="inline mr-1" /> Crear
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <FaEdit className="inline mr-1" /> Editar
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <FaTrash className="inline mr-1" /> Eliminar
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {modulos.map(modulo => {
                            const permiso = permisos[modulo.id] || {
                                puede_ver: false,
                                puede_crear: false,
                                puede_editar: false,
                                puede_eliminar: false
                            };
                            
                            const deshabilitado = rolSeleccionado === 'admin';
                            
                            return (
                                <tr key={modulo.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {modulo.nombre}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {modulo.descripcion}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => togglePermiso(modulo.id, 'puede_ver')}
                                            className={getBotonEstilo(permiso.puede_ver, deshabilitado)}
                                            title={deshabilitado ? 'No se puede modificar' : 'Haz clic para cambiar'}
                                        >
                                            {permiso.puede_ver ? <FaCheck size={18} /> : <FaTimes size={18} />}
                                        </button>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => togglePermiso(modulo.id, 'puede_crear')}
                                            className={getBotonEstilo(permiso.puede_crear, deshabilitado)}
                                            title={deshabilitado ? 'No se puede modificar' : 'Haz clic para cambiar'}
                                        >
                                            {permiso.puede_crear ? <FaCheck size={18} /> : <FaTimes size={18} />}
                                        </button>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => togglePermiso(modulo.id, 'puede_editar')}
                                            className={getBotonEstilo(permiso.puede_editar, deshabilitado)}
                                            title={deshabilitado ? 'No se puede modificar' : 'Haz clic para cambiar'}
                                        >
                                            {permiso.puede_editar ? <FaCheck size={18} /> : <FaTimes size={18} />}
                                        </button>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => togglePermiso(modulo.id, 'puede_eliminar')}
                                            className={getBotonEstilo(permiso.puede_eliminar, deshabilitado)}
                                            title={deshabilitado ? 'No se puede modificar' : 'Haz clic para cambiar'}
                                        >
                                            {permiso.puede_eliminar ? <FaCheck size={18} /> : <FaTimes size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mensajes informativos */}
            <div className="mt-6 space-y-4">
                {rolSeleccionado === 'admin' ? (
                    <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                        <p className="text-blue-700 text-sm">
                            <strong className="font-medium">🔒 Rol Administrador:</strong> Tiene todos los permisos por defecto y no pueden modificarse por seguridad.
                        </p>
                    </div>
                ) : (
                    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <div className="flex">
                            <div className="shrink-0">
                                <FaShieldAlt className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <strong className="font-medium">📝 Editando rol {roles.find(r => r.id === rolSeleccionado)?.nombre}:</strong> Haz clic en cualquier botón para cambiar los permisos. Los cambios se guardarán cuando presiones "Guardar Cambios".
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Roles;