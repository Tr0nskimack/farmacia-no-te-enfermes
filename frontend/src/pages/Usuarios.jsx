import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaUser, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSearch,
  FaUserShield,
  FaUserTie,
  FaUserMd,
  FaToggleOn,
  FaToggleOff,
  FaKey
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const { usuario: currentUser } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'vendedor'
  });

  const [passwordData, setPasswordData] = useState({
    nuevaPassword: '',
    confirmarPassword: ''
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
      console.error(error);
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!editingUser && formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      if (editingUser) {
        // Para edición, no enviamos password si está vacío
        const dataToSend = { ...formData };
        if (!dataToSend.password) {
          delete dataToSend.password;
        }
        
        await axios.put(`http://localhost:5000/api/usuarios/${editingUser.id}`, dataToSend);
        toast.success('Usuario actualizado exitosamente');
      } else {
        await axios.post('http://localhost:5000/api/usuarios', formData);
        toast.success('Usuario creado exitosamente');
      }
      
      setShowModal(false);
      resetForm();
      cargarUsuarios();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.nuevaPassword !== passwordData.confirmarPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.nuevaPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/usuarios/${selectedUser.id}/password`, {
        password: passwordData.nuevaPassword
      });
      
      toast.success('Contraseña actualizada exitosamente');
      setShowPasswordModal(false);
      setPasswordData({ nuevaPassword: '', confirmarPassword: '' });
      setSelectedUser(null);
    } catch (error) {
      toast.error('Error al actualizar contraseña');
    }
  };

  const handleEdit = (usuario) => {
    setEditingUser(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      toast.error('No puedes eliminar tu propio usuario');
      return;
    }

    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await axios.delete(`http://localhost:5000/api/usuarios/${id}`);
        toast.success('Usuario eliminado');
        cargarUsuarios();
      } catch (error) {
        toast.error('Error al eliminar usuario');
      }
    }
  };

  const toggleActivo = async (usuario) => {
    if (usuario.id === currentUser?.id) {
      toast.error('No puedes desactivar tu propio usuario');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/usuarios/${usuario.id}/toggle`);
      toast.success(`Usuario ${usuario.activo ? 'desactivado' : 'activado'}`);
      cargarUsuarios();
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'vendedor'
    });
    setEditingUser(null);
  };

  const getRolIcon = (rol) => {
    switch(rol) {
      case 'admin': return <FaUserShield className="text-red-500" />;
      case 'farmaceutico': return <FaUserMd className="text-blue-500" />;
      default: return <FaUserTie className="text-green-500" />;
    }
  };

  const getRolBadge = (rol) => {
    switch(rol) {
      case 'admin':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Administrador</span>;
      case 'farmaceutico':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Farmacéutico</span>;
      default:
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Vendedor</span>;
    }
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.rol.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600"
        >
          <FaPlus className="mr-2" />
          Nuevo Usuario
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6 relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o rol..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Registro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsuarios.map((usuario) => (
              <tr key={usuario.id} className={`hover:bg-gray-50 ${!usuario.activo ? 'bg-gray-100' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {getRolIcon(usuario.rol)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {usuario.nombre}
                        {usuario.id === currentUser?.id && (
                          <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">(Tú)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {usuario.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRolBadge(usuario.rol)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    usuario.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(usuario.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(usuario)}
                      className="text-blue-600 hover:text-blue-900 cursor-pointer transition-all"
                      title="Editar usuario"
                      disabled={usuario.id === currentUser?.id}
                    >
                      <FaEdit />
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedUser(usuario);
                        setShowPasswordModal(true);
                      }}
                      className="text-yellow-600 hover:text-yellow-900 cursor-pointer transition-all"
                      title="Cambiar contraseña"
                      disabled={usuario.id === currentUser?.id}
                    >
                      <FaKey />
                    </button>

                    <button
                      onClick={() => toggleActivo(usuario)}
                      className={`${
                        usuario.activo ? 'text-green-600 hover:text-green-900 cursor-pointer transition-all' : 'text-gray-600 hover:text-gray-900 cursor-pointer transition-all'
                      }`}
                      title={usuario.activo ? 'Desactivar usuario' : 'Activar usuario'}
                    >
                      {usuario.activo ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                    </button>

                    <button
                      onClick={() => handleDelete(usuario.id)}
                      className="text-red-600 hover:text-red-900 cursor-pointer transition-all"
                      title="Eliminar usuario"
                      disabled={usuario.id === currentUser?.id}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de creación/edición */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {editingUser ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingUser}
                  minLength="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
                {editingUser && (
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo 6 caracteres. Dejar vacío para mantener la actual.
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol *
                </label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="farmaceutico">Farmacéutico</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
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
                  {editingUser ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de cambio de contraseña */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Cambiar Contraseña - {selectedUser.nombre}
            </h3>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña *
                </label>
                <input
                  type="password"
                  name="nuevaPassword"
                  value={passwordData.nuevaPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  name="confirmarPassword"
                  value={passwordData.confirmarPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ nuevaPassword: '', confirmarPassword: '' });
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;