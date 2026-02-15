import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    FaChartBar, 
    FaFileExcel, 
    FaFilePdf, 
    FaCalendarAlt,
    FaBox,
    FaShoppingCart,
    FaUsers,
    FaMoneyBillWave,
    FaDownload,
    FaPrint,
    FaFilter,
    FaSync
} from 'react-icons/fa';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Reportes = () => {
    const { usuario } = useAuth();
    const [loading, setLoading] = useState(true);
    const [fechaInicio, setFechaInicio] = useState(() => {
        const date = new Date();
        date.setDate(1); // Primer día del mes
        return date.toISOString().split('T')[0];
    });
    const [fechaFin, setFechaFin] = useState(() => {
        const date = new Date();
        return date.toISOString().split('T')[0];
    });
    const [reporteActivo, setReporteActivo] = useState('ventas');
    const [datosVentas, setDatosVentas] = useState([]);
    const [datosProductos, setDatosProductos] = useState([]);
    const [datosClientes, setDatosClientes] = useState([]);
    const [resumen, setResumen] = useState({
        totalVentas: 0,
        totalProductos: 0,
        totalClientes: 0,
        ticketPromedio: 0,
        productosMasVendidos: [],
        clientesFrecuentes: []
    });

    const reportes = [
        { id: 'ventas', nombre: 'Ventas', icono: FaMoneyBillWave, color: 'bg-green-500' },
        { id: 'productos', nombre: 'Productos', icono: FaBox, color: 'bg-blue-500' },
        { id: 'clientes', nombre: 'Clientes', icono: FaUsers, color: 'bg-purple-500' },
        { id: 'inventario', nombre: 'Inventario', icono: FaShoppingCart, color: 'bg-yellow-500' }
    ];

    useEffect(() => {
        cargarDatos();
    }, [fechaInicio, fechaFin, reporteActivo]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            
            // Cargar datos según el reporte activo
            const [ventasRes, productosRes, clientesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/facturas'),
                axios.get('http://localhost:5000/api/productos'),
                axios.get('http://localhost:5000/api/clientes')
            ]);

            // Filtrar ventas por fecha
            const ventasFiltradas = ventasRes.data.filter(venta => {
                const fechaVenta = new Date(venta.fecha).toISOString().split('T')[0];
                return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
            });

            setDatosVentas(ventasFiltradas);
            setDatosProductos(productosRes.data);
            setDatosClientes(clientesRes.data);

            // Calcular resumen
            calcularResumen(ventasFiltradas, productosRes.data, clientesRes.data);

        } catch (error) {
            toast.error('Error al cargar datos');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const calcularResumen = (ventas, productos, clientes) => {
        const totalVentas = ventas.reduce((sum, v) => sum + parseFloat(v.total), 0);
        const ticketPromedio = ventas.length > 0 ? totalVentas / ventas.length : 0;

        // Productos más vendidos
        const ventasPorProducto = {};
        ventas.forEach(venta => {
            // Aquí deberías tener los detalles de la venta
            // Por ahora es un ejemplo
        });

        setResumen({
            totalVentas,
            totalProductos: productos.length,
            totalClientes: clientes.length,
            ticketPromedio,
            productosMasVendidos: [],
            clientesFrecuentes: []
        });
    };

    const exportarExcel = () => {
        try {
            let data = [];
            let nombreArchivo = '';

            switch(reporteActivo) {
                case 'ventas':
                    data = datosVentas.map(v => ({
                        'N° Factura': v.numero_factura,
                        'Cliente': v.cliente_nombre || 'Consumidor final',
                        'Fecha': new Date(v.fecha).toLocaleDateString(),
                        'Subtotal': v.subtotal,
                        'IVA': v.iva,
                        'Total': v.total,
                        'Estado': v.estado
                    }));
                    nombreArchivo = 'reporte_ventas.xlsx';
                    break;
                    
                case 'productos':
                    data = datosProductos.map(p => ({
                        'Código': p.codigo,
                        'Producto': p.nombre,
                        'Categoría': p.categoria || '-',
                        'Laboratorio': p.laboratorio || '-',
                        'Stock': p.stock,
                        'Stock Mínimo': p.stock_minimo,
                        'Precio': p.precio,
                        'Requiere Receta': p.requiere_receta ? 'Sí' : 'No'
                    }));
                    nombreArchivo = 'reporte_productos.xlsx';
                    break;
                    
                case 'clientes':
                    data = datosClientes.map(c => ({
                        'Nombre': c.nombre,
                        'Documento': c.documento || '-',
                        'Teléfono': c.telefono || '-',
                        'Email': c.email || '-',
                        'Dirección': c.direccion || '-',
                        'Fecha Registro': new Date(c.created_at).toLocaleDateString()
                    }));
                    nombreArchivo = 'reporte_clientes.xlsx';
                    break;
            }

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
            XLSX.writeFile(wb, nombreArchivo);
            
            toast.success('Reporte exportado a Excel');
        } catch (error) {
            toast.error('Error al exportar a Excel');
        }
    };

    const exportarPDF = () => {
        try {
            const doc = new jsPDF();
            
            // Título
            doc.setFontSize(18);
            doc.text('Farmacia No Te Enfermes', 14, 22);
            doc.setFontSize(12);
            doc.text(`Reporte de ${reportes.find(r => r.id === reporteActivo)?.nombre}`, 14, 32);
            doc.text(`Período: ${new Date(fechaInicio).toLocaleDateString()} - ${new Date(fechaFin).toLocaleDateString()}`, 14, 42);

            let headers = [];
            let data = [];

            switch(reporteActivo) {
                case 'ventas':
                    headers = [['N° Factura', 'Cliente', 'Fecha', 'Total']];
                    data = datosVentas.map(v => [
                        v.numero_factura,
                        v.cliente_nombre || 'Consumidor final',
                        new Date(v.fecha).toLocaleDateString(),
                        `$${parseFloat(v.total).toFixed(2)}`
                    ]);
                    break;
                    
                case 'productos':
                    headers = [['Código', 'Producto', 'Stock', 'Precio']];
                    data = datosProductos.map(p => [
                        p.codigo,
                        p.nombre,
                        p.stock,
                        `$${parseFloat(p.precio).toFixed(2)}`
                    ]);
                    break;
                    
                case 'clientes':
                    headers = [['Nombre', 'Documento', 'Teléfono']];
                    data = datosClientes.map(c => [
                        c.nombre,
                        c.documento || '-',
                        c.telefono || '-'
                    ]);
                    break;
            }

            doc.autoTable({
                head: headers,
                body: data,
                startY: 50,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [41, 128, 185] }
            });

            doc.save(`reporte_${reporteActivo}.pdf`);
            toast.success('Reporte exportado a PDF');
        } catch (error) {
            toast.error('Error al exportar a PDF');
        }
    };

    const getChartData = () => {
        switch(reporteActivo) {
            case 'ventas':
                // Ventas por día
                const ventasPorDia = {};
                datosVentas.forEach(venta => {
                    const fecha = new Date(venta.fecha).toLocaleDateString();
                    ventasPorDia[fecha] = (ventasPorDia[fecha] || 0) + parseFloat(venta.total);
                });

                return {
                    labels: Object.keys(ventasPorDia),
                    datasets: [
                        {
                            label: 'Ventas ($)',
                            data: Object.values(ventasPorDia),
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.5)',
                            tension: 0.4
                        }
                    ]
                };

            case 'productos':
                // Productos por categoría
                const categorias = {};
                datosProductos.forEach(p => {
                    const cat = p.categoria || 'Otros';
                    categorias[cat] = (categorias[cat] || 0) + 1;
                });

                return {
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
                };

            default:
                return {
                    labels: [],
                    datasets: []
                };
        }
    };

    const getChartOptions = () => {
        return {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: reportes.find(r => r.id === reporteActivo)?.nombre || 'Reporte'
                }
            }
        };
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <FaChartBar className="mr-3 text-blue-500" />
                Reportes y Estadísticas
            </h1>

            {/* Filtros de fecha */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha Inicio
                        </label>
                        <div className="relative">
                            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha Fin
                        </label>
                        <div className="relative">
                            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={cargarDatos}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center cursor-pointer"
                    >
                        <FaSync className="mr-2" />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* Selector de reportes */}
            <div className="flex flex-wrap gap-4 mb-6">
                {reportes.map(reporte => (
                    <button
                        key={reporte.id}
                        onClick={() => setReporteActivo(reporte.id)}
                        className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 cursor-pointer ${
                            reporteActivo === reporte.id
                                ? `${reporte.color} text-white shadow-lg`
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        <reporte.icono className="mr-2" />
                        {reporte.nombre}
                    </button>
                ))}
            </div>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Ventas</p>
                            <p className="text-2xl font-bold text-green-600">
                                ${resumen.totalVentas.toFixed(2)}
                            </p>
                        </div>
                        <FaMoneyBillWave className="text-3xl text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Ticket Promedio</p>
                            <p className="text-2xl font-bold text-blue-600">
                                ${resumen.ticketPromedio.toFixed(2)}
                            </p>
                        </div>
                        <FaChartBar className="text-3xl text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Productos</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {resumen.totalProductos}
                            </p>
                        </div>
                        <FaBox className="text-3xl text-purple-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Clientes</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {resumen.totalClientes}
                            </p>
                        </div>
                        <FaUsers className="text-3xl text-yellow-500" />
                    </div>
                </div>
            </div>

            {/* Gráfico principal */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                {reporteActivo === 'ventas' && (
                    <Line data={getChartData()} options={getChartOptions()} />
                )}
                {reporteActivo === 'productos' && (
                    <Pie data={getChartData()} options={getChartOptions()} />
                )}
                {reporteActivo === 'clientes' && (
                    <Bar data={getChartData()} options={getChartOptions()} />
                )}
                {reporteActivo === 'inventario' && (
                    <Bar data={getChartData()} options={getChartOptions()} />
                )}
            </div>

            {/* Tabla de datos */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold">
                        Detalle de {reportes.find(r => r.id === reporteActivo)?.nombre}
                    </h2>
                    
                    <div className="flex space-x-2">
                        <button
                            onClick={exportarExcel}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center cursor-pointer"
                        >
                            <FaFileExcel className="mr-2" />
                            Excel
                        </button>
                        <button
                            onClick={exportarPDF}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center cursor-pointer"
                        >
                            <FaFilePdf className="mr-2" />
                            PDF
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center cursor-pointer"
                        >
                            <FaPrint className="mr-2" />
                            Imprimir
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {reporteActivo === 'ventas' && (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Factura</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                    </>
                                )}
                                
                                {reporteActivo === 'productos' && (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                                    </>
                                )}
                                
                                {reporteActivo === 'clientes' && (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reporteActivo === 'ventas' && datosVentas.map(venta => (
                                <tr key={venta.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {venta.numero_factura}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {venta.cliente_nombre || 'Consumidor final'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(venta.fecha).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                                        ${parseFloat(venta.total).toFixed(2)}
                                    </td>
                                </tr>
                            ))}

                            {reporteActivo === 'productos' && datosProductos.map(producto => (
                                <tr key={producto.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {producto.codigo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {producto.nombre}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {producto.categoria || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                        <span className={`font-medium ${
                                            producto.stock <= producto.stock_minimo 
                                                ? 'text-red-600' 
                                                : 'text-green-600'
                                        }`}>
                                            {producto.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                        ${parseFloat(producto.precio).toFixed(2)}
                                    </td>
                                </tr>
                            ))}

                            {reporteActivo === 'clientes' && datosClientes.map(cliente => (
                                <tr key={cliente.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {cliente.nombre}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {cliente.documento || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {cliente.telefono || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {cliente.email || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reportes;