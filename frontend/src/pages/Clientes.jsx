import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const { usuario } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    documento: '',
    telefono: '',
    email: '',
    direccion: ''
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/clientes');
      setClientes(response.data);
    } catch (error) {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCliente) {
        await axios.put(`http://localhost:5000/api/clientes/${editingCliente.id}`, formData);
        toast.success('Cliente actualizado exitosamente');
      } else {
        await axios.post('http://localhost:5000/api/clientes', formData);
        toast.success('Cliente creado exitosamente');
      }
      setShowModal(false);
      resetForm();
      cargarClientes();
    } catch (error) {
      toast.error('Error al guardar cliente');
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nombre: cliente.nombre,
      documento: cliente.documento || '',
      telefono: cliente.telefono || '',
      email: cliente.email || '',
      direccion: cliente.direccion || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await axios.delete(`http://localhost:5000/api/clientes/${id}`);
        toast.success('Cliente eliminado');
        cargarClientes();
      } catch (error) {
        toast.error('Error al eliminar cliente');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      documento: '',
      telefono: '',
      email: '',
      direccion: ''
    });
    setEditingCliente(null);
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefono?.includes(searchTerm)
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600"
        >
          <FaPlus className="mr-2" />
          Nuevo Cliente
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6 relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, documento, email o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Grid de clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClientes.map(cliente => (
          <div key={cliente.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaUser className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{cliente.nombre}</h3>
                  <p className="text-sm text-gray-500">{cliente.documento || 'Sin documento'}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(cliente)}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer transition-all"
                  disabled={usuario?.rol === 'vendedor'}
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(cliente.id)}
                  className="text-red-600 hover:text-red-800 cursor-pointer transition-all"
                  disabled={usuario?.rol !== 'admin'}
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {cliente.telefono && (
                <div className="flex items-center text-sm text-gray-600">
                  <FaPhone className="mr-2 text-gray-400" />
                  {cliente.telefono}
                </div>
              )}
              {cliente.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <FaEnvelope className="mr-2 text-gray-400" />
                  {cliente.email}
                </div>
              )}
              {cliente.direccion && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Dirección:</span> {cliente.direccion}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t text-xs text-gray-400">
              Registrado: {new Date(cliente.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de creación/edición */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documento
                </label>
                <input
                  type="text"
                  name="documento"
                  value={formData.documento}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <textarea
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editingCliente ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;