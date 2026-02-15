import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaSearch,
  FaPlus,
  FaTrash,
  FaFileInvoice,
  FaUser,
  FaBox,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Facturacion = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [searchCliente, setSearchCliente] = useState("");
  const [searchProducto, setSearchProducto] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { usuario } = useAuth();

  // Formulario nuevo cliente
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    documento: "",
    telefono: "",
    email: "",
    direccion: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [clientesRes, productosRes, facturasRes] = await Promise.all([
        axios.get("http://localhost:5000/api/clientes"),
        axios.get("http://localhost:5000/api/productos"),
        axios.get("http://localhost:5000/api/facturas"),
      ]);
      setClientes(clientesRes.data);
      setProductos(productosRes.data);
      setFacturas(facturasRes.data);
    } catch (error) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = (producto) => {
    const existente = carrito.find((item) => item.id === producto.id);

    if (existente) {
      if (existente.cantidad >= producto.stock) {
        toast.error("Stock insuficiente");
        return;
      }
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: (item.cantidad + 1) * Number(item.precio), // 👈 Convertir a número
              }
            : item,
        ),
      );
    } else {
      if (producto.stock < 1) {
        toast.error("Producto sin stock");
        return;
      }
      setCarrito([
        ...carrito,
        {
          id: producto.id,
          codigo: producto.codigo,
          nombre: producto.nombre,
          precio: Number(producto.precio), // 👈 Convertir a número
          cantidad: 1,
          subtotal: Number(producto.precio), // 👈 Convertir a número
          stock: producto.stock,
        },
      ]);
    }
    toast.success("Producto agregado");
  };

  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;

    const producto = carrito.find((item) => item.id === id);
    if (nuevaCantidad > producto.stock) {
      toast.error("Stock insuficiente");
      return;
    }

    setCarrito(
      carrito.map((item) =>
        item.id === id
          ? {
              ...item,
              cantidad: nuevaCantidad,
              subtotal: nuevaCantidad * Number(item.precio), // 👈 Convertir a número
            }
          : item,
      ),
    );
  };

 const calcularSubtotal = () => {
    return carrito.reduce((sum, item) => sum + Number(item.subtotal), 0);
};

const calcularIVA = () => {
    return Number(calcularSubtotal()) * 0.16;
};

const calcularTotal = () => {
    return Number(calcularSubtotal()) + Number(calcularIVA());
};

  const handleCrearCliente = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/clientes",
        nuevoCliente,
      );
      toast.success("Cliente creado exitosamente");
      setShowClienteModal(false);
      setNuevoCliente({
        nombre: "",
        documento: "",
        telefono: "",
        email: "",
        direccion: "",
      });
      cargarDatos();
    } catch (error) {
      toast.error("Error al crear cliente");
    }
  };

  const procesarFactura = async () => {
    if (!clienteSeleccionado) {
        toast.error('Seleccione un cliente');
        return;
    }

    if (carrito.length === 0) {
        toast.error('Agregue productos al carrito');
        return;
    }

    try {
        const facturaData = {
            cliente_id: clienteSeleccionado.id,
            productos: carrito.map(item => ({
                producto_id: item.id,
                cantidad: item.cantidad,
                precio_unitario: Number(item.precio),
                subtotal: Number(item.subtotal)
            })),
            subtotal: Number(calcularSubtotal()),
            iva: Number(calcularIVA()),
            total: Number(calcularTotal())
        };

        await axios.post('http://localhost:5000/api/facturas', facturaData);
        toast.success('Factura creada exitosamente');
        
        setCarrito([]);
        setClienteSeleccionado(null);
        cargarDatos();
    } catch (error) {
        toast.error('Error al crear factura');
    }
};

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchCliente.toLowerCase()) ||
      cliente.documento?.includes(searchCliente),
  );

  const filteredProductos = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(searchProducto.toLowerCase()) ||
      producto.codigo.toLowerCase().includes(searchProducto.toLowerCase()),
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Facturación</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo - Clientes y Productos */}
        <div className="lg:col-span-1 space-y-6">
          {/* Selección de cliente */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaUser className="mr-2 text-blue-500" />
              Cliente
            </h2>

            {clienteSeleccionado ? (
              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                <p className="font-medium">{clienteSeleccionado.nombre}</p>
                <p className="text-sm text-gray-600">
                  {clienteSeleccionado.documento}
                </p>
                <button
                  onClick={() => setClienteSeleccionado(null)}
                  className="text-red-600 text-sm mt-2 hover:text-red-700"
                >
                  Cambiar cliente
                </button>
              </div>
            ) : (
              <>
                <div className="relative mb-3">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={searchCliente}
                    onChange={(e) => setSearchCliente(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {filteredClientes.map((cliente) => (
                    <div
                      key={cliente.id}
                      onClick={() => setClienteSeleccionado(cliente)}
                      className="p-2 hover:bg-gray-50 cursor-pointer border-b"
                    >
                      <p className="font-medium">{cliente.nombre}</p>
                      <p className="text-sm text-gray-600">
                        {cliente.documento}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowClienteModal(true)}
                  className="mt-3 w-full bg-green-500 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-green-600"
                >
                  <FaPlus className="mr-2" />
                  Nuevo Cliente
                </button>
              </>
            )}
          </div>

          {/* Búsqueda de productos */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaBox className="mr-2 text-green-500" />
              Productos
            </h2>

            <div className="relative mb-3">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchProducto}
                onChange={(e) => setSearchProducto(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredProductos.map((producto) => (
                <div
                  key={producto.id}
                  onClick={() => agregarAlCarrito(producto)}
                  className="p-2 hover:bg-gray-50 cursor-pointer border-b"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{producto.nombre}</p>
                      <p className="text-sm text-gray-600">
                        Código: {producto.codigo}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        ${producto.precio}
                      </p>
                      <p className="text-sm text-gray-500">
                        Stock: {producto.stock}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel derecho - Carrito de compras */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Carrito de compras</h2>

            {carrito.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay productos en el carrito
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Producto</th>
                        <th className="text-center py-2">Cantidad</th>
                        <th className="text-right py-2">Precio</th>
                        <th className="text-right py-2">Subtotal</th>
                        <th className="text-center py-2">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrito.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2">
                            <p className="font-medium">{item.nombre}</p>
                            <p className="text-sm text-gray-500">
                              {item.codigo}
                            </p>
                          </td>
                          <td className="py-2">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() =>
                                  actualizarCantidad(item.id, item.cantidad - 1)
                                }
                                className="w-8 h-8 bg-gray-200 rounded-l hover:bg-gray-300"
                              >
                                -
                              </button>
                              <span className="w-10 text-center">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() =>
                                  actualizarCantidad(item.id, item.cantidad + 1)
                                }
                                className="w-8 h-8 bg-gray-200 rounded-r hover:bg-gray-300"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="text-right py-2">
                            ${Number(item.precio).toFixed(2)}
                          </td>
                          <td className="text-right py-2">
                            ${Number(item.subtotal).toFixed(2)}
                          </td>
                          <td className="text-center py-2">
                            <button
                              onClick={() => quitarDelCarrito(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totales */}
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      ${calcularSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>IVA (16%):</span>
                    <span className="font-medium">
                      ${calcularIVA().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">
                      ${calcularTotal().toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={procesarFactura}
                    className="mt-4 w-full bg-blue-500 text-white px-6 py-3 rounded-lg flex items-center justify-center hover:bg-blue-600"
                  >
                    <FaFileInvoice className="mr-2" />
                    Procesar Factura
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Historial de facturas */}
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Últimas facturas</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">N° Factura</th>
                    <th className="text-left py-2">Cliente</th>
                    <th className="text-left py-2">Fecha</th>
                    <th className="text-right py-2">Total</th>
                    <th className="text-center py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {facturas.slice(0, 5).map((factura) => (
                    <tr key={factura.id} className="border-b">
                      <td className="py-2">{factura.numero_factura}</td>
                      <td className="py-2">
                        {factura.cliente_nombre || "Consumidor final"}
                      </td>
                      <td className="py-2">
                        {new Date(factura.fecha).toLocaleDateString()}
                      </td>
                      <td className="text-right py-2">${factura.total}</td>
                      <td className="text-center py-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {factura.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal nuevo cliente */}
      {showClienteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Nuevo Cliente
            </h3>

            <form onSubmit={handleCrearCliente}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={nuevoCliente.nombre}
                  onChange={(e) =>
                    setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documento
                </label>
                <input
                  type="text"
                  value={nuevoCliente.documento}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      documento: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={nuevoCliente.telefono}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      telefono: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={nuevoCliente.email}
                  onChange={(e) =>
                    setNuevoCliente({ ...nuevoCliente, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <textarea
                  value={nuevoCliente.direccion}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      direccion: e.target.value,
                    })
                  }
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowClienteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturacion;
