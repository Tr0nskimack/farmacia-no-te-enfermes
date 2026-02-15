import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaFlask, FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Laboratorios = () => {
    const { tienePermiso } = useAuth();
    const [laboratorios, setLaboratorios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingLaboratorio, setEditingLaboratorio] = useState(null);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

    const puedeCrear = tienePermiso('Laboratorios', 'crear');
    const puedeEditar = tienePermiso('Laboratorios', 'editar');
    const puedeEliminar = tienePermiso('Laboratorios', 'eliminar');

    useEffect(() => {
        cargarLaboratorios();
    }, []);

    const cargarLaboratorios = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/laboratorios');
            setLaboratorios(response.data);
        } catch (error) {
            toast.error('Error al cargar laboratorios');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre.trim()) {
            toast.error('El nombre es requerido');
            return;
        }

        try {
            if (editingLaboratorio) {
                await axios.put(`http://localhost:5000/api/laboratorios/${editingLaboratorio.id}`, formData);
                toast.success('Laboratorio actualizado');
            } else {
                await axios.post('http://localhost:5000/api/laboratorios', formData);
                toast.success('Laboratorio creado');
            }
            setShowModal(false);
            resetForm();
            cargarLaboratorios();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al guardar');
        }
    };

    const handleDelete = async (id, nombre, totalProductos) => {
        if (totalProductos > 0) {
            toast.error(`No se puede eliminar: ${totalProductos} producto(s) lo usan`);
            return;
        }

        if (!window.confirm(`¿Eliminar laboratorio "${nombre}"?`)) return;

        try {
            await axios.delete(`http://localhost:5000/api/laboratorios/${id}`);
            toast.success('Laboratorio eliminado');
            cargarLaboratorios();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const resetForm = () => {
        setFormData({ nombre: '', descripcion: '' });
        setEditingLaboratorio(null);
    };

    const filteredLaboratorios = laboratorios.filter(l =>
        l.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <FaFlask className="mr-3 text-blue-500" />
                    Laboratorios
                </h1>
                {puedeCrear && (
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                        <FaPlus className="mr-2" />
                        Nuevo Laboratorio
                    </button>
                )}
            </div>

            {/* Buscador */}
            <div className="mb-6 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar laboratorios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
            </div>

            {/* Grid de laboratorios - Versión corregida */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {filteredLaboratorios.length > 0 ? (
    filteredLaboratorios.map(laboratorio => {
        const puedeEditarEste = puedeEditar === true;
        const puedeEliminarEste = puedeEliminar === true;
        const hayAcciones = puedeEditarEste || puedeEliminarEste;

        return (
            <div key={laboratorio.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{laboratorio.nombre}</h3>
                        {laboratorio.descripcion && (
                            <p className="text-sm text-gray-600 mt-1">{laboratorio.descripcion}</p>
                        )}
                        <div className="mt-3 flex items-center">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {laboratorio.total_productos || 0} productos
                            </span>
                        </div>
                    </div>
                    
                    {hayAcciones ? (
                        <div className="flex space-x-2 ml-4">
                            {puedeEditarEste && (
                                <button
                                    onClick={() => {
                                        setEditingLaboratorio(laboratorio);
                                        setFormData({
                                            nombre: laboratorio.nombre,
                                            descripcion: laboratorio.descripcion || ''
                                        });
                                        setShowModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                                    title="Editar laboratorio"
                                >
                                    <FaEdit size={18} />
                                </button>
                            )}
                            {puedeEliminarEste && (
                                <button
                                    onClick={() => handleDelete(laboratorio.id, laboratorio.nombre, laboratorio.total_productos)}
                                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                                    title="Eliminar laboratorio"
                                >
                                    <FaTrash size={18} />
                                </button>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        );
    })
) : (
    <div className="col-span-3 text-center py-12 text-gray-500">
        No se encontraron laboratorios
    </div>
)}
</div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                            {editingLaboratorio ? 'Editar Laboratorio' : 'Nuevo Laboratorio'}
                        </h3>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                    placeholder="Ej: Genfar"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                    placeholder="Descripción del laboratorio (opcional)"
                                />
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
                                    {editingLaboratorio ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Laboratorios;