import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaExclamationTriangle, 
  FaBox, 
  FaClock, 
  FaCheckCircle,
  FaEye,
  FaShoppingCart
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Alertas = () => {
  const [productosBajoStock, setProductosBajoStock] = useState([]);
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {
    try {
      setLoading(true);
      
      // Cargar productos con bajo stock
      const productosRes = await axios.get('http://localhost:5000/api/alertas/bajo-stock');
      setProductosBajoStock(productosRes.data);

      // Cargar pedidos pendientes
      const pedidosRes = await axios.get('http://localhost:5000/api/pedidos');
      const pendientes = pedidosRes.data.filter(p => 
        p.estado === 'pendiente' || p.estado === 'en_proceso'
      );
      setPedidosPendientes(pendientes);

    } catch (error) {
      toast.error('Error al cargar alertas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getNivelAlerta = (stock, stockMinimo) => {
    const porcentaje = (stock / stockMinimo) * 100;
    if (porcentaje <= 30) return 'critico';
    if (porcentaje <= 60) return 'medio';
    return 'bajo';
  };

  const getColorAlerta = (nivel) => {
    switch(nivel) {
      case 'critico': return 'text-red-600 bg-red-100';
      case 'medio': return 'text-yellow-600 bg-yellow-100';
      case 'bajo': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIconoAlerta = (nivel) => {
    switch(nivel) {
      case 'critico': return <FaExclamationTriangle className="text-red-500" />;
      case 'medio': return <FaClock className="text-yellow-500" />;
      case 'bajo': return <FaCheckCircle className="text-blue-500" />;
      default: return null;
    }
  };

  const irAProductos = () => {
    navigate('/productos');
  };

  const irAPedidos = () => {
    navigate('/pedidos');
  };

  const crearPedidoUrgente = (producto) => {
    navigate('/pedidos', { 
      state: { 
        productoParaPedido: producto,
        accion: 'crearPedido'
      } 
    });
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Alertas y Notificaciones</h1>

      {/* Resumen de alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Productos con stock bajo</p>
              <p className="text-3xl font-bold text-red-500">{productosBajoStock.length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FaExclamationTriangle className="text-red-500 text-2xl" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {productosBajoStock.length > 0 
              ? 'Requieren atención inmediata' 
              : 'Todo en orden'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pedidos pendientes</p>
              <p className="text-3xl font-bold text-yellow-500">{pedidosPendientes.length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaClock className="text-yellow-500 text-2xl" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {pedidosPendientes.length > 0 
              ? 'Esperando recepción' 
              : 'Sin pedidos pendientes'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Stock crítico</p>
              <p className="text-3xl font-bold text-orange-500">
                {productosBajoStock.filter(p => getNivelAlerta(p.stock, p.stock_minimo) === 'critico').length}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FaExclamationTriangle className="text-orange-500 text-2xl" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Productos que necesitan pedido urgente
          </p>
        </div>
      </div>

      {/* Productos con bajo stock */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-2" />
            Productos con Stock Bajo
          </h2>
        </div>

        {productosBajoStock.length === 0 ? (
          <div className="p-12 text-center">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay productos con stock bajo</p>
            <p className="text-gray-400">Todos los productos tienen stock suficiente</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Mínimo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diferencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productosBajoStock.map(producto => {
                  const nivel = getNivelAlerta(producto.stock, producto.stock_minimo);
                  const colorClase = getColorAlerta(nivel);
                  const diferencia = producto.stock_minimo - producto.stock;
                  
                  return (
                    <tr key={producto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center px-3 py-1 rounded-full ${colorClase}`}>
                          {getIconoAlerta(nivel)}
                          <span className="ml-2 text-sm font-medium">
                            {nivel === 'critico' ? 'Crítico' : nivel === 'medio' ? 'Medio' : 'Bajo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                        <div className="text-sm text-gray-500">{producto.categoria || 'Sin categoría'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {producto.codigo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold ${
                          nivel === 'critico' ? 'text-red-600' : 
                          nivel === 'medio' ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          {producto.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {producto.stock_minimo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          diferencia > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {diferencia > 0 ? `Faltan ${diferencia}` : 'Suficiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(producto);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalles"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => crearPedidoUrgente(producto)}
                            className="text-green-600 hover:text-green-900"
                            title="Crear pedido"
                          >
                            <FaShoppingCart />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pedidos pendientes */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <FaClock className="text-yellow-500 mr-2" />
            Pedidos Pendientes
          </h2>
        </div>

        {pedidosPendientes.length === 0 ? (
          <div className="p-12 text-center">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay pedidos pendientes</p>
            <p className="text-gray-400">Todos los pedidos han sido procesados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Entrega
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días Restantes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pedidosPendientes.map(pedido => {
                  const fechaEntrega = pedido.fecha_entrega ? new Date(pedido.fecha_entrega) : null;
                  const hoy = new Date();
                  const diasRestantes = fechaEntrega 
                    ? Math.ceil((fechaEntrega - hoy) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <tr key={pedido.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/pedidos')}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pedido.numero_pedido}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pedido.proveedor || 'No especificado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(pedido.fecha_pedido).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pedido.fecha_entrega 
                          ? new Date(pedido.fecha_entrega).toLocaleDateString()
                          : 'No definida'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          pedido.estado === 'pendiente' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {pedido.estado === 'pendiente' ? 'Pendiente' : 'En Proceso'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${pedido.total || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {diasRestantes !== null && (
                          <span className={`text-sm font-medium ${
                            diasRestantes < 0 ? 'text-red-600' :
                            diasRestantes < 3 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {diasRestantes < 0 
                              ? 'Atrasado' 
                              : diasRestantes === 0 
                                ? 'Hoy' 
                                : `${diasRestantes} días`}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalles del producto */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Detalles del Producto
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Código:</label>
                <p className="text-gray-900">{selectedProduct.codigo}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre:</label>
                <p className="text-gray-900">{selectedProduct.nombre}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Descripción:</label>
                <p className="text-gray-900">{selectedProduct.descripcion || 'Sin descripción'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Categoría:</label>
                <p className="text-gray-900">{selectedProduct.categoria || 'Sin categoría'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Laboratorio:</label>
                <p className="text-gray-900">{selectedProduct.laboratorio || 'No especificado'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Stock Actual:</label>
                  <p className="text-xl font-bold text-red-600">{selectedProduct.stock}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Stock Mínimo:</label>
                  <p className="text-xl font-bold text-gray-900">{selectedProduct.stock_minimo}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Requiere Receta:</label>
                <p className="text-gray-900">{selectedProduct.requiere_receta ? 'Sí' : 'No'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Precio:</label>
                <p className="text-lg font-bold text-blue-600">${selectedProduct.precio}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  crearPedidoUrgente(selectedProduct);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Crear Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alertas;