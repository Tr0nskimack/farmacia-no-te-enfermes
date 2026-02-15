import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PERMISOS } from '../utils/roles';

const Permiso = ({ children, permiso, fallback = null }) => {
  const { usuario } = useAuth();
  
  if (!usuario) return fallback;
  
  const tienePermiso = PERMISOS[permiso]?.includes(usuario.rol);
  
  return tienePermiso ? children : fallback;
};

export default Permiso;