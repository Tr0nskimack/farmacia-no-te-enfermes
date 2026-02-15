import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaExclamationTriangle,
  FaFileInvoice,
  FaUserCog,
  FaChartBar,
  FaShieldAlt,
  FaTags,
  FaFlask,
  FaCog,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { useState } from 'react';

const Sidebar = () => {
  const { usuario, tienePermiso } = useAuth();
  const [configuracionOpen, setConfiguracionOpen] = useState(false);

  const menuItems = [
    { 
      path: '/dashboard', 
      name: 'Dashboard', 
      icon: FaHome, 
      modulo: 'Dashboard'
    },
    { 
      path: '/productos', 
      name: 'Productos', 
      icon: FaBox, 
      modulo: 'Productos'
    },
    { 
      path: '/facturacion', 
      name: 'Facturación', 
      icon: FaFileInvoice, 
      modulo: 'Facturación'
    },
    { 
      path: '/pedidos', 
      name: 'Pedidos', 
      icon: FaShoppingCart, 
      modulo: 'Pedidos'
    },
    { 
      path: '/clientes', 
      name: 'Clientes', 
      icon: FaUsers, 
      modulo: 'Clientes'
    },
    { 
      path: '/alertas', 
      name: 'Alertas', 
      icon: FaExclamationTriangle, 
      modulo: 'Alertas'
    },
    { 
      path: '/reportes', 
      name: 'Reportes', 
      icon: FaChartBar, 
      modulo: 'Reportes'
    },
  ];

  // Items de configuración (agrupados)
  const configItems = [
    { 
      path: '/categorias', 
      name: 'Categorías', 
      icon: FaTags, 
      modulo: 'Categorías'
    },
    { 
      path: '/laboratorios', 
      name: 'Laboratorios', 
      icon: FaFlask, 
      modulo: 'Laboratorios'
    },
    { 
      path: '/usuarios', 
      name: 'Usuarios', 
      icon: FaUserCog, 
      modulo: 'Usuarios'
    },
    { 
      path: '/roles', 
      name: 'Roles y Permisos', 
      icon: FaShieldAlt, 
      modulo: 'Roles'
    },
  ];

  // Filtrar items del menú principal
  const filteredMenu = menuItems.filter(item => 
    tienePermiso(item.modulo, 'ver')
  );

  // Filtrar items de configuración
  const filteredConfig = configItems.filter(item => 
    tienePermiso(item.modulo, 'ver')
  );

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-screen">
      {/* Logo y usuario */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-blue-600">Farmacia NTE</h2>
        <p className="text-sm text-gray-600 mt-1">Bienvenido, {usuario?.nombre}</p>
        <p className="text-xs text-gray-500 mt-1">Rol: {usuario?.rol}</p>
      </div>

      {/* Menú principal */}
      <nav className="flex-1 overflow-y-auto py-4">
        {filteredMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`
            }
          >
            <item.icon className="mr-3" />
            {item.name}
          </NavLink>
        ))}

        {/* Sección de Configuración (solo si hay items) */}
        {filteredConfig.length > 0 && (
          <div className="mt-4">
            {/* Título de la sección */}
            <div className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Configuración
            </div>

            {filteredConfig.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                  }`
                }
              >
                <item.icon className="mr-3" />
                {item.name}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Versión del sistema */}
      <div className="p-4 border-t text-xs text-gray-400 text-center">
        v2.0.0 - Sistema de Gestión
      </div>
    </div>
  );
};

export default Sidebar;