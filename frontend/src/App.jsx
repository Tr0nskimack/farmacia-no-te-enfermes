import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Facturacion from './pages/Facturacion';
import Pedidos from './pages/Pedidos';
import Clientes from './pages/Clientes';
import Alertas from './pages/Alertas';
import Usuarios from './pages/Usuarios';
import Roles from './pages/Roles'; // 👈 Importar Roles
import Reportes from './pages/Reportes';

// Layout
import Layout from './components/Layout';

// Nuevas páginas
import Categorias from './pages/Categorias';
import Laboratorios from './pages/Laboratorios';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="productos" element={<Productos />} />
            <Route path="facturacion" element={<Facturacion />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="alertas" element={<Alertas />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="roles" element={<Roles />} /> {/* 👈 Agregar esta línea */}
            <Route path="reportes" element={<Reportes />} />

            {/* Nuevas rutas */}
            <Route path="categorias" element={<Categorias />} />
            <Route path="laboratorios" element={<Laboratorios />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;