import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaFileInvoice,
  FaClock
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    productos: 0,
    facturas: 0,
    clientes: 0,
    alertas: 0,
    ventasHoy: 0,
    ventasSemana: 0,
    totalVentasHoy: 0
  });
  const [alertasStock, setAlertasStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventasData, setVentasData] = useState({
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Ventas de la semana',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4
      }
    ]
  });

  const [categoriasData, setCategoriasData] = useState({
    labels: ['Analgésicos', 'Antibióticos', 'Vitaminas', 'Otros'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  });

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      
      // Cargar todos los datos necesarios
      const [productosRes, facturasRes, clientesRes, alertasRes] = await Promise.all([
        axios.get('http://localhost:5000/api/productos'),
        axios.get('http://localhost:5000/api/facturas'),
        axios.get('http://localhost:5000/api/clientes'),
        axios.get('http://localhost:5000/api/alertas/bajo-stock')
      ]);

      // Calcular ventas de hoy
      const hoy = new Date().toDateString();
      const facturasHoy = facturasRes.data.filter(f => 
        new Date(f.fecha).toDateString() === hoy
      );

      const totalVentasHoy = facturasHoy.reduce((sum, f) => sum + parseFloat(f.total), 0);

      // Calcular ventas de la semana
      const ventasSemana = [0, 0, 0, 0, 0, 0, 0];
      facturasRes.data.forEach(factura => {
        const fecha = new Date(factura.fecha);
        const dia = fecha.getDay(); // 0 = Domingo, 1 = Lunes, etc.
        // Ajustar para que Lunes sea 0
        const diaAjustado = dia === 0 ? 6 : dia - 1;
        ventasSemana[diaAjustado] += parseFloat(factura.total);
      });

      setVentasData({
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
          {
            label: 'Ventas de la semana ($)',
            data: ventasSemana,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            tension: 0.4
          }
        ]
      });

      // Calcular productos por categoría
      const categorias = {};
      productosRes.data.forEach(producto => {
        const cat = producto.categoria || 'Otros';
        categorias[cat] = (categorias[cat] || 0) + 1;
      });

      setCategoriasData({
        labels: Object.keys(categorias),
        datasets: [
          {
            data: Object.values(categorias),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)'
            ],
            borderWidth: 0
          }
        ]
      });

      setStats({
        productos: productosRes.data.length,
        facturas: facturasRes.data.length,
        clientes: clientesRes.data.length,
        alertas: alertasRes.data.length,
        ventasHoy: facturasHoy.length,
        ventasSemana: facturasRes.data.filter(f => {
          const fechaFactura = new Date(f.fecha);
          const hace7Dias = new Date();
          hace7Dias.setDate(hace7Dias.getDate() - 7);
          return fechaFactura >= hace7Dias;
        }).length,
        totalVentasHoy: totalVentasHoy
      });

      setAlertasStock(alertasRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const irAProductos = () => navigate('/productos');
  const irAFacturacion = () => navigate('/facturacion');
  const irAClientes = () => navigate('/clientes');
  const irAAlertas = () => navigate('/alertas');
  const irAPedidos = () => navigate('/pedidos');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        ¡Bienvenido, {usuario?.nombre}!
      </h1>
      <p className="text-gray-600 mb-8">Rol: {usuario?.rol}</p>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
        <div 
          onClick={irAProductos}
          className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Productos</p>
              <p className="text-2xl font-bold">{stats.productos}</p>
            </div>
            <FaBox className="text-3xl text-blue-500" />
          </div>
        </div>

        <div 
          onClick={irAFacturacion}
          className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Facturas</p>
              <p className="text-2xl font-bold">{stats.facturas}</p>
            </div>
            <FaFileInvoice className="text-3xl text-green-500" />
          </div>
        </div>

        <div 
          onClick={irAClientes}
          className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Clientes</p>
              <p className="text-2xl font-bold">{stats.clientes}</p>
            </div>
            <FaUsers className="text-3xl text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Ventas Hoy</p>
              <p className="text-2xl font-bold">{stats.ventasHoy}</p>
            </div>
            <FaMoneyBillWave className="text-3xl text-yellow-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">${stats.totalVentasHoy.toFixed(2)}</p>
        </div>

        <div 
          onClick={irAAlertas}
          className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Alertas Stock</p>
              <p className={`text-2xl font-bold ${stats.alertas > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {stats.alertas}
              </p>
            </div>
            <FaExclamationTriangle className={`text-3xl ${stats.alertas > 0 ? 'text-red-500' : 'text-green-500'}`} />
          </div>
        </div>

        <div 
          onClick={irAPedidos}
          className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pedidos Semana</p>
              <p className="text-2xl font-bold">{stats.ventasSemana}</p>
            </div>
            <FaShoppingCart className="text-3xl text-orange-500" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Ventas de la Semana</h2>
          <Line data={ventasData} options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: false
              }
            }
          }} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Productos por Categoría</h2>
          <Pie data={categoriasData} options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }} />
        </div>
      </div>

      {/* Alertas de stock bajo */}
      {stats.alertas > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-2" />
            Productos con Stock Bajo
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Producto</th>
                  <th className="text-left py-2">Código</th>
                  <th className="text-right py-2">Stock Actual</th>
                  <th className="text-right py-2">Stock Mínimo</th>
                  <th className="text-center py-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {alertasStock.map(producto => (
                  <tr key={producto.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{producto.nombre}</td>
                    <td className="py-2">{producto.codigo}</td>
                    <td className="text-right py-2 text-red-600 font-bold">{producto.stock}</td>
                    <td className="text-right py-2">{producto.stock_minimo}</td>
                    <td className="text-center py-2">
                      <button
                        onClick={() => navigate('/productos')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Ver producto
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;