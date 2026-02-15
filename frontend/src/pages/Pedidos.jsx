import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaShoppingCart, FaPlus, FaCheck, FaClock, FaTruck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { usuario } = useAuth();

  const [nuevoPedido, setNuevoPedido] = useState({
    proveedor: '',
    fecha_entrega: '',
    productos: [],
    total: 0
  });

  const [productoSeleccionado, setProductoSeleccionado] = useState({
    producto_id: '',
    cantidad: 1,
    precio_compra: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [pedidosRes, productosRes] = await Promise.all([
        axios.get('http://localhost:5000/api/pedidos'),
        axios.get('http://localhost:5000/api/productos')
      ]);
      setPedidos(pedidosRes.data);
      setProductos(productosRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const agregarProductoPedido = () => {
    if (!productoSeleccionado.producto_id || productoSeleccionado.cantidad < 1) {
      toast.error('Seleccione un producto y cantidad válida');
      return;
    }

    const producto = productos.find(p => p.id === parseInt(productoSeleccionado.producto_id));
    
    setNuevoPedido({
      ...nuevoPedido,
      productos: [
        ...nuevoPedido.productos,
        {
          producto_id: producto.id,
          nombre: producto.nombre,
          cantidad: productoSeleccionado.cantidad,
          precio_compra: productoSeleccionado.precio_compra || producto.precio * 0.7,
          subtotal: (productoSeleccionado.precio_compra || producto.precio * 0.7) * productoSeleccionado.cantidad
        }
      ],
      total: nuevoPedido.total + ((productoSeleccionado.precio_compra || producto.precio * 0.7) * productoSeleccionado.cantidad)
    });

    setProductoSeleccionado({
      producto_id: '',
      cantidad: 1,
      precio_compra: 0
    });
  };

  const quitarProductoPedido = (index) => {
    const nuevosProductos = [...nuevoPedido.productos];
    const productoRemovido = nuevosProductos.splice(index, 1)[0];
    
    setNuevoPedido({
      ...nuevoPedido,
      productos: nuevosProductos,
      total: nuevoPedido.total - productoRemovido.subtotal
    });
  };

  const handleSubmitPedido = async (e) => {
    e.preventDefault();
    
    if (nuevoPedido.productos.length === 0) {
      toast.error('Agregue al menos un producto');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/pedidos', nuevoPedido);
      toast.success('Pedido creado exitosamente');
      setShowModal(false);
      setNuevoPedido({
        proveedor: '',
        fecha_entrega: '',
        productos: [],
        total: 0
      });
      cargarDatos();
    } catch (error) {
      toast.error('Error al crear pedido');
    }
  };

  const recibirPedido = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/pedidos/${id}/recibir`);
      toast.success('Pedido recibido y stock actualizado');
      cargarDatos();
    } catch (error) {
      toast.error('Error al recibir pedido');
    }
  };

  const getStatusIcon = (estado) => {
    switch(estado) {
      case 'pendiente': return <FaClock className="text-yellow-500" />;
      case 'en_proceso': return <FaTruck className="text-blue-500" />;
      case 'recibido': return <FaCheck className="text-green-500" />;
      default: return null;
    }
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'en_proceso': return 'bg-blue-100 text-blue-800';
      case 'recibido': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Pedidos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600"
        >
          <FaPlus className="mr-2" />
          Nuevo Pedido
        </button>
      </div>

      {/* Lista de pedidos */}
      <div className="grid grid-cols-1 gap-4">
        {pedidos.map(pedido => (
          <div key={pedido.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-3">
                  <FaShoppingCart className="text-gray-500" />
                  <h3 className="text-lg font-semibold">{pedido.numero_pedido}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(pedido.estado)}`}>
                    {pedido.estado}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">Proveedor: {pedido.proveedor || 'No especificado'}</p>
                <p className="text-gray-600">Fecha pedido: {new Date(pedido.fecha_pedido).toLocaleDateString()}</p>
                {pedido.fecha_entrega && (
                  <p className="text-gray-600">Fecha entrega: {new Date(pedido.fecha_entrega).toLocaleDateString()}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">${pedido.total || 0}</p>
                {pedido.estado !== 'recibido' && pedido.estado !== 'cancelado' && (
                  <button
                    onClick={() => recibirPedido(pedido.id)}
                    className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
                  >
                    Marcar como Recibido
                  </button>
                )}
              </div>
            </div>

            {/* Detalles del pedido */}
            {pedido.detalles && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold mb-2">Productos:</h4>
                <div className="space-y-2">
                  {pedido.detalles.map((detalle, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{detalle.nombre} x {detalle.cantidad}</span>
                      <span>${detalle.subtotal || (detalle.cantidad * detalle.precio_compra)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal nuevo pedido */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-2/3 shadow-lg rounded-lg bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Nuevo Pedido
            </h3>
            
            <form onSubmit={handleSubmitPedido}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proveedor
                  </label>
                  <input
                    type="text"
                    value={nuevoPedido.proveedor}
                    onChange={(e) => setNuevoPedido({...nuevoPedido, proveedor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de entrega
                  </label>
                  <input
                    type="date"
                    value={nuevoPedido.fecha_entrega}
                    onChange={(e) => setNuevoPedido({...nuevoPedido, fecha_entrega: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Agregar productos */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Agregar Productos</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Producto</label>
                    <select
                      value={productoSeleccionado.producto_id}
                      onChange={(e) => setProductoSeleccionado({
                        ...productoSeleccionado,
                        producto_id: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Seleccionar...</option>
                      {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={productoSeleccionado.cantidad}
                      onChange={(e) => setProductoSeleccionado({
                        ...productoSeleccionado,
                        cantidad: parseInt(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Precio compra</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productoSeleccionado.precio_compra}
                      onChange={(e) => setProductoSeleccionado({
                        ...productoSeleccionado,
                        precio_compra: parseFloat(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={agregarProductoPedido}
                  className="mt-3 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Agregar al Pedido
                </button>
              </div>

              {/* Lista de productos del pedido */}
              {nuevoPedido.productos.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Productos del Pedido</h4>
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Producto</th>
                        <th className="text-center py-2">Cantidad</th>
                        <th className="text-right py-2">Precio Compra</th>
                        <th className="text-right py-2">Subtotal</th>
                        <th className="text-center py-2">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nuevoPedido.productos.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.nombre}</td>
                          <td className="text-center py-2">{item.cantidad}</td>
                          <td className="text-right py-2">${item.precio_compra}</td>
                          <td className="text-right py-2">${item.subtotal}</td>
                          <td className="text-center py-2">
                            <button
                              type="button"
                              onClick={() => quitarProductoPedido(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="text-right font-bold py-2">Total:</td>
                        <td className="text-right font-bold py-2">${nuevoPedido.total}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Crear Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;