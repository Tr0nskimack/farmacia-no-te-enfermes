import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Productos = () => {
  const { usuario, tienePermiso } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [showNuevaCategoria, setShowNuevaCategoria] = useState(false);
  const [showNuevoLaboratorio, setShowNuevoLaboratorio] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [nuevoLaboratorio, setNuevoLaboratorio] = useState("");
  const [codigoValido, setCodigoValido] = useState(true);
  const [codigoExists, setCodigoExists] = useState(false);

  // Verificar permisos de productos
  const puedeCrearProducto = tienePermiso("Productos", "crear");
  const puedeEditarProducto = tienePermiso("Productos", "editar");
  const puedeEliminarProducto = tienePermiso("Productos", "eliminar");
  const puedeVerProducto = tienePermiso("Productos", "ver");

  // Verificar permisos de categorías
  const puedeVerCategorias = tienePermiso("Categorías", "ver");
  const puedeCrearCategorias = tienePermiso("Categorías", "crear");

  // Verificar permisos de laboratorios
  const puedeVerLaboratorios = tienePermiso("Laboratorios", "ver");
  const puedeCrearLaboratorios = tienePermiso("Laboratorios", "crear");

  // Estado para el formulario
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    stock_minimo: "10",
    categoria: "",
    laboratorio: "",
    requiere_receta: false,
  });

  // Errores de validación
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (puedeVerProducto) {
      cargarProductos();
    }
    // Solo cargar categorías si tiene permiso para verlas
    if (puedeVerCategorias) {
      cargarCategorias();
    }
    // Solo cargar laboratorios si tiene permiso para verlos
    if (puedeVerLaboratorios) {
      cargarLaboratorios();
    }
  }, [puedeVerProducto, puedeVerCategorias, puedeVerLaboratorios]);

  // Efecto para validar código duplicado
  useEffect(() => {
    const validarCodigo = async () => {
      if (formData.codigo && formData.codigo.length >= 3) {
        if (editingProduct && editingProduct.codigo === formData.codigo) {
          setCodigoValido(true);
          setCodigoExists(false);
          return;
        }

        try {
          const response = await axios.get(
            `http://localhost:5000/api/productos/verificar-codigo/${formData.codigo}`,
          );
          setCodigoExists(response.data.exists);
          setCodigoValido(!response.data.exists);

          setErrores((prev) => ({
            ...prev,
            codigo: response.data.exists ? "Este código ya existe" : "",
          }));
        } catch (error) {
          console.error("Error al validar código:", error);
        }
      } else {
        setCodigoValido(formData.codigo.length >= 3);
        setCodigoExists(false);
      }
    };

    const timeoutId = setTimeout(validarCodigo, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.codigo, editingProduct]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/productos");
      setProductos(response.data);
    } catch (error) {
      toast.error("Error al cargar productos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/categorias");
      setCategorias(response.data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const cargarLaboratorios = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/laboratorios",
      );
      setLaboratorios(response.data);
    } catch (error) {
      console.error("Error al cargar laboratorios:", error);
    }
  };

  const agregarCategoria = async () => {
    if (!puedeCrearCategorias) {
      toast.error("No tienes permiso para crear categorías");
      return;
    }

    if (!nuevaCategoria.trim()) {
      toast.error("Ingrese un nombre para la categoría");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/categorias",
        {
          nombre: nuevaCategoria.trim(),
        },
      );

      setCategorias([...categorias, response.data]);
      setFormData({ ...formData, categoria: response.data.nombre });
      setNuevaCategoria("");
      setShowNuevaCategoria(false);
      toast.success("Categoría agregada");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al agregar categoría",
      );
    }
  };

  const agregarLaboratorio = async () => {
    if (!puedeCrearLaboratorios) {
      toast.error("No tienes permiso para crear laboratorios");
      return;
    }

    if (!nuevoLaboratorio.trim()) {
      toast.error("Ingrese un nombre para el laboratorio");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/laboratorios",
        {
          nombre: nuevoLaboratorio.trim(),
        },
      );

      setLaboratorios([...laboratorios, response.data]);
      setFormData({ ...formData, laboratorio: response.data.nombre });
      setNuevoLaboratorio("");
      setShowNuevoLaboratorio(false);
      toast.success("Laboratorio agregado");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al agregar laboratorio",
      );
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.codigo || formData.codigo.length < 3) {
      nuevosErrores.codigo = "El código debe tener al menos 3 caracteres";
    } else if (codigoExists) {
      nuevosErrores.codigo = "Este código ya existe";
    }

    if (!formData.nombre || formData.nombre.length < 3) {
      nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres";
    }

    if (!formData.precio || formData.precio <= 0) {
      nuevosErrores.precio = "El precio debe ser mayor a 0";
    }

    if (!formData.stock || formData.stock < 0) {
      nuevosErrores.stock = "El stock no puede ser negativo";
    }

    if (!formData.stock_minimo || formData.stock_minimo < 0) {
      nuevosErrores.stock_minimo = "El stock mínimo no puede ser negativo";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setErrores((prev) => ({ ...prev, [name]: "" }));

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      toast.error("Por favor, corrija los errores en el formulario");
      return;
    }

    try {
      if (editingProduct) {
        if (!puedeEditarProducto) {
          toast.error("No tienes permiso para editar productos");
          return;
        }
        await axios.put(
          `http://localhost:5000/api/productos/${editingProduct.id}`,
          formData,
        );
        toast.success("Producto actualizado exitosamente");
      } else {
        if (!puedeCrearProducto) {
          toast.error("No tienes permiso para crear productos");
          return;
        }
        await axios.post("http://localhost:5000/api/productos", formData);
        toast.success("Producto creado exitosamente");
      }
      setShowModal(false);
      resetForm();
      cargarProductos();
      cargarCategorias();
      cargarLaboratorios();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al guardar producto");
    }
  };

  const handleEdit = (producto) => {
    if (!puedeEditarProducto) {
      toast.error("No tienes permiso para editar productos");
      return;
    }
    setEditingProduct(producto);
    setFormData({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: producto.precio,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      categoria: producto.categoria || "",
      laboratorio: producto.laboratorio || "",
      requiere_receta: producto.requiere_receta,
    });
    setCodigoExists(false);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!puedeEliminarProducto) {
      toast.error("No tienes permiso para eliminar productos");
      return;
    }
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await axios.delete(`http://localhost:5000/api/productos/${id}`);
        toast.success("Producto eliminado");
        cargarProductos();
      } catch (error) {
        toast.error("Error al eliminar producto");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: "",
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      stock_minimo: "10",
      categoria: "",
      laboratorio: "",
      requiere_receta: false,
    });
    setErrores({});
    setCodigoExists(false);
    setCodigoValido(true);
    setEditingProduct(null);
    setShowNuevaCategoria(false);
    setShowNuevoLaboratorio(false);
  };

  const filteredProductos = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.laboratorio?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const productosBajoStock = productos.filter((p) => p.stock <= p.stock_minimo);

  // Si no tiene permiso para ver productos
  if (!puedeVerProducto) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p className="font-bold">Acceso Denegado</p>
          <p>No tienes permisos para ver esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header y tabla de productos (se mantiene igual) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
        {puedeCrearProducto && (
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors cursor-pointer"
          >
            <FaPlus className="mr-2" />
            Nuevo Producto
          </button>
        )}
      </div>

      {/* Alertas de bajo stock */}
      {productosBajoStock.length > 0 && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-yellow-400 mr-3" />
            <div>
              <p className="text-yellow-700 font-medium">
                Hay {productosBajoStock.length} productos con stock bajo
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="mb-6 relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, código, categoría o laboratorio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 cursor-text"
        />
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Laboratorio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Mínimo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receta
              </th>
              {(puedeEditarProducto || puedeEliminarProducto) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProductos.length > 0 ? (
              filteredProductos.map((producto) => (
                <tr
                  key={producto.id}
                  className={`hover:bg-gray-50 ${producto.stock <= producto.stock_minimo ? "bg-red-50" : ""}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {producto.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {producto.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {producto.categoria || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {producto.laboratorio || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${Number(producto.precio).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`font-medium ${
                        producto.stock <= producto.stock_minimo
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {producto.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {producto.stock_minimo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {producto.requiere_receta ? "Sí" : "No"}
                  </td>
                  {(puedeEditarProducto || puedeEliminarProducto) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-3">
                        {puedeEditarProducto && (
                          <button
                            onClick={() => handleEdit(producto)}
                            className="text-blue-600 hover:text-blue-900 transition-colors cursor-pointer"
                            title="Editar producto"
                          >
                            <FaEdit size={18} />
                          </button>
                        )}
                        {puedeEliminarProducto && (
                          <button
                            onClick={() => handleDelete(producto.id)}
                            className="text-red-600 hover:text-red-900 transition-colors cursor-pointer"
                            title="Eliminar producto"
                          >
                            <FaTrash size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                  No se encontraron productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de creación/edición */}
      {showModal && (puedeCrearProducto || puedeEditarProducto) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Código */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código *
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  required
                  minLength="3"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 cursor-text ${
                    errores.codigo ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ingrese código único"
                />
                {errores.codigo && (
                  <p className="mt-1 text-xs text-red-600">{errores.codigo}</p>
                )}
                {formData.codigo && !errores.codigo && codigoValido && (
                  <p className="mt-1 text-xs text-green-600">
                    ✓ Código disponible
                  </p>
                )}
              </div>

              {/* Nombre */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 cursor-text ${
                    errores.nombre ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ingrese nombre del producto"
                />
                {errores.nombre && (
                  <p className="mt-1 text-xs text-red-600">{errores.nombre}</p>
                )}
              </div>

              {/* Descripción */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 cursor-text"
                  placeholder="Descripción del producto (opcional)"
                />
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 cursor-text ${
                      errores.precio ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                  {errores.precio && (
                    <p className="mt-1 text-xs text-red-600">
                      {errores.precio}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 cursor-text ${
                      errores.stock ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0"
                  />
                  {errores.stock && (
                    <p className="mt-1 text-xs text-red-600">{errores.stock}</p>
                  )}
                </div>
              </div>

              {/* Stock Mínimo */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Mínimo *
                </label>
                <input
                  type="number"
                  name="stock_minimo"
                  value={formData.stock_minimo}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 cursor-text ${
                    errores.stock_minimo ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="10"
                />
                {errores.stock_minimo && (
                  <p className="mt-1 text-xs text-red-600">
                    {errores.stock_minimo}
                  </p>
                )}
              </div>

              {puedeVerCategorias && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <div className="flex space-x-2">
                    <select
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="">Seleccione categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.nombre}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>

                    {/* Botón de nueva categoría - Misma lógica que funcionó para acciones */}
                    {puedeCrearCategorias === true && (
                      <button
                        type="button"
                        onClick={() => setShowNuevaCategoria(true)}
                        className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors cursor-pointer"
                        title="Agregar nueva categoría"
                      >
                        <FaPlus />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Laboratorio */}
              {puedeVerLaboratorios && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Laboratorio
                  </label>
                  <div className="flex space-x-2">
                    <select
                      name="laboratorio"
                      value={formData.laboratorio}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="">Seleccione laboratorio</option>
                      {laboratorios.map((lab) => (
                        <option key={lab.id} value={lab.nombre}>
                          {lab.nombre}
                        </option>
                      ))}
                    </select>

                    {/* Botón de nuevo laboratorio - Misma lógica que funcionó para acciones */}
                    {puedeCrearLaboratorios === true && (
                      <button
                        type="button"
                        onClick={() => setShowNuevoLaboratorio(true)}
                        className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors cursor-pointer"
                        title="Agregar nuevo laboratorio"
                      >
                        <FaPlus />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Requiere receta */}
              <div className="mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="requiere_receta"
                    checked={formData.requiere_receta}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700 cursor-pointer">
                    Requiere receta médica
                  </span>
                </label>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!!errores.codigo || codigoExists}
                  className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer ${
                    errores.codigo || codigoExists
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {editingProduct ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nueva Categoría */}
      {showNuevaCategoria && puedeCrearCategorias === true && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-40 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Nueva Categoría
            </h3>
            <input
              type="text"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 mb-4 cursor-text"
              placeholder="Nombre de la categoría"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNuevaCategoria(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={agregarCategoria}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Laboratorio */}
      {showNuevoLaboratorio && puedeCrearLaboratorios === true && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-40 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Nuevo Laboratorio
            </h3>
            <input
              type="text"
              value={nuevoLaboratorio}
              onChange={(e) => setNuevoLaboratorio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 mb-4 cursor-text"
              placeholder="Nombre del laboratorio"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNuevoLaboratorio(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={agregarLaboratorio}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;
