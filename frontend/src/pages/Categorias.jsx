import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaTags, FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Categorias = () => {
    const { tienePermiso } = useAuth();
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategoria, setEditingCategoria] = useState(null);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

    const puedeCrear = tienePermiso('Categorías', 'crear');
    const puedeEditar = tienePermiso('Categorías', 'editar');
    const puedeEliminar = tienePermiso('Categorías', 'eliminar');
    const puedeVer = tienePermiso('Categorías', 'ver');

    useEffect(() => {
        if (puedeVer) {
            cargarCategorias();
        }
    }, [puedeVer]);

    const cargarCategorias = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/categorias');
            setCategorias(response.data);
        } catch (error) {
            toast.error('Error al cargar categorías');
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
            if (editingCategoria) {
                await axios.put(`http://localhost:5000/api/categorias/${editingCategoria.id}`, formData);
                toast.success('Categoría actualizada');
            } else {
                await axios.post('http://localhost:5000/api/categorias', formData);
                toast.success('Categoría creada');
            }
            setShowModal(false);
            resetForm();
            cargarCategorias();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al guardar');
        }
    };

    const handleDelete = async (id, nombre, totalProductos) => {
        if (totalProductos > 0) {
            toast.error(`No se puede eliminar: ${totalProductos} producto(s) la usan`);
            return;
        }

        if (!window.confirm(`¿Eliminar categoría "${nombre}"?`)) return;

        try {
            await axios.delete(`http://localhost:5000/api/categorias/${id}`);
            toast.success('Categoría eliminada');
            cargarCategorias();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const resetForm = () => {
        setFormData({ nombre: '', descripcion: '' });
        setEditingCategoria(null);
    };

    const filteredCategorias = categorias.filter(c =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Si no tiene permiso para ver
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
                    <FaTags className="mr-3 text-blue-500" />
                    Categorías de Productos
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
                        Nueva Categoría
                    </button>
                )}
            </div>

            {/* Buscador */}
            <div className="mb-6 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar categorías..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
            </div>

            {/* Grid de categorías */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {filteredCategorias.length > 0 ? (
        filteredCategorias.map(categoria => {
            // Variables booleanas explícitas
            const puedeEditarEste = puedeEditar === true;
            const puedeEliminarEste = puedeEliminar === true;
            const hayAcciones = puedeEditarEste || puedeEliminarEste;

            return (
                <div key={categoria.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800">{categoria.nombre}</h3>
                            {categoria.descripcion && (
                                <p className="text-sm text-gray-600 mt-1">{categoria.descripcion}</p>
                            )}
                            <div className="mt-3 flex items-center">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    {categoria.total_productos || 0} productos
                                </span>
                            </div>
                        </div>
                        
                        {/* ACCIONES - SOLO si hay al menos un permiso verdadero */}
                        {hayAcciones ? (
                            <div className="flex space-x-2 ml-4">
                                {puedeEditarEste && (
                                    <button
                                        onClick={() => {
                                            setEditingCategoria(categoria);
                                            setFormData({
                                                nombre: categoria.nombre,
                                                descripcion: categoria.descripcion || ''
                                            });
                                            setShowModal(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                                        title="Editar categoría"
                                    >
                                        <FaEdit size={18} />
                                    </button>
                                )}
                                {puedeEliminarEste && (
                                    <button
                                        onClick={() => handleDelete(categoria.id, categoria.nombre, categoria.total_productos)}
                                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                                        title="Eliminar categoría"
                                    >
                                        <FaTrash size={18} />
                                    </button>
                                )}
                            </div>
                        ) : null /* No renderiza nada si no hay acciones */}
                    </div>
                </div>
            );
        })
    ) : (
        <div className="col-span-3 text-center py-12 text-gray-500">
            No se encontraron categorías
        </div>
    )}
</div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                            {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
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
                                    placeholder="Ej: Analgésicos"
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
                                    placeholder="Descripción de la categoría (opcional)"
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
                                    {editingCategoria ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categorias;