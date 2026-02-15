import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [permisos, setPermisos] = useState({});
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const userInfo = JSON.parse(localStorage.getItem('usuario') || '{}');
      setUsuario(userInfo);
      cargarPermisos(userInfo.id);
      configAxios();
    }
    setLoading(false);
  }, [token]);

  const configAxios = () => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const cargarPermisos = async (usuarioId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:5000/api/roles/usuario/${usuarioId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const permisosMap = {};
    response.data.forEach(p => {
      permisosMap[p.nombre] = {
        ver: p.puede_ver,
        crear: p.puede_crear,
        editar: p.puede_editar,
        eliminar: p.puede_eliminar
      };
    });
    
    setPermisos(permisosMap);
    localStorage.setItem('permisos', JSON.stringify(permisosMap));
  } catch (error) {
    console.error('Error al cargar permisos:', error);
    // Si es error 401, redirigir al login
    if (error.response?.status === 401) {
      logout();
    }
  }
};

  const login = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });

    const { token: newToken, usuario: userData } = response.data;
    
    // Guardar en localStorage
    localStorage.setItem('token', newToken);
    localStorage.setItem('usuario', JSON.stringify(userData));
    
    // Configurar axios para todas las peticiones futuras
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    // Actualizar estado
    setToken(newToken);
    setUsuario(userData);
    
    // Cargar permisos
    await cargarPermisos(userData.id);

    toast.success('¡Bienvenido a Farmacia No Te Enfermes!');
    return true;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error al iniciar sesión');
    return false;
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('permisos');
    setToken(null);
    setUsuario(null);
    setPermisos({});
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Sesión cerrada');
  };

  const tienePermiso = (modulo, accion = 'ver') => {
    if (!usuario) return false;
    if (usuario.rol === 'admin') return true;
    
    const permisoModulo = permisos[modulo];
    if (!permisoModulo) return false;
    
    switch(accion) {
      case 'ver': return permisoModulo.ver;
      case 'crear': return permisoModulo.crear;
      case 'editar': return permisoModulo.editar;
      case 'eliminar': return permisoModulo.eliminar;
      default: return false;
    }
  };

  const value = {
    usuario,
    permisos,
    login,
    logout,
    loading,
    tienePermiso,
    isAuthenticated: !!usuario
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};