import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaUser, FaBell } from 'react-icons/fa';
import BCVRateIndicator from './BCVRateIndicator'; // Importar el componente

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-xl font-semibold text-gray-800">
          Farmacia No Te Enfermes
        </h1>
        
        <div className="flex items-center space-x-4">
          {/* TASA BCV - AQUÍ LO INTEGRAMOS */}
          <BCVRateIndicator />
          
          {/* Notificaciones (opcional) */}
          <button className="relative text-gray-600 hover:text-blue-600 transition-colors">
            <FaBell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>
          
          {/* Usuario */}
          <div className="flex items-center space-x-2">
            <FaUser className="text-gray-600" />
            <span className="text-sm text-gray-700">
              {usuario?.nombre} ({usuario?.rol})
            </span>
          </div>
          
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors cursor-pointer"
          >
            <FaSignOutAlt />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;