-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-02-2026 a las 19:11:11
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `farmacia_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `descripcion`, `created_at`) VALUES
(1, 'Analgésicos', NULL, '2026-02-15 16:22:01'),
(2, 'Antiinflamatorios', NULL, '2026-02-15 16:22:01'),
(3, 'Antibióticos', NULL, '2026-02-15 16:22:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `documento` varchar(20) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `nombre`, `documento`, `telefono`, `email`, `direccion`, `created_at`) VALUES
(1, 'Juan Pérez', '12345678', '555-1234', 'juan@email.com', 'Calle Principal 123', '2026-02-15 02:38:50'),
(2, 'María García', '87654321', '555-5678', 'maria@email.com', 'Avenida Central 456', '2026-02-15 02:38:50'),
(3, 'Carlos López', '11223344', '555-9012', 'carlos@email.com', 'Plaza Mayor 789', '2026-02-15 02:38:50');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalles_factura`
--

CREATE TABLE `detalles_factura` (
  `id` int(11) NOT NULL,
  `factura_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalles_pedido`
--

CREATE TABLE `detalles_pedido` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_compra` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalles_pedido`
--

INSERT INTO `detalles_pedido` (`id`, `pedido_id`, `producto_id`, `cantidad`, `precio_compra`) VALUES
(1, 1, 3, 12, 10.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturas`
--

CREATE TABLE `facturas` (
  `id` int(11) NOT NULL,
  `numero_factura` varchar(20) NOT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `subtotal` decimal(10,2) NOT NULL,
  `iva` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','pagada','anulada') DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `laboratorios`
--

CREATE TABLE `laboratorios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `laboratorios`
--

INSERT INTO `laboratorios` (`id`, `nombre`, `descripcion`, `created_at`) VALUES
(1, 'Genfar', NULL, '2026-02-15 16:22:01'),
(2, 'MK', NULL, '2026-02-15 16:22:01'),
(3, 'Bayer', NULL, '2026-02-15 16:22:01'),
(4, 'Pfizer', '', '2026-02-15 16:22:01'),
(8, 'Leti', 'labortarios', '2026-02-15 16:39:48'),
(9, 'Ronava', 'tratamientos para colesterol\n', '2026-02-15 17:19:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modulos`
--

CREATE TABLE `modulos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  `icono` varchar(50) DEFAULT NULL,
  `ruta` varchar(100) DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `modulos`
--

INSERT INTO `modulos` (`id`, `nombre`, `descripcion`, `icono`, `ruta`, `orden`, `activo`) VALUES
(1, 'Dashboard', 'Panel principal', 'FaHome', '/dashboard', 1, 1),
(2, 'Productos', 'Gestión de inventario', 'FaBox', '/productos', 2, 1),
(3, 'Facturación', 'Punto de venta', 'FaFileInvoice', '/facturacion', 3, 1),
(4, 'Pedidos', 'Pedidos a proveedores', 'FaShoppingCart', '/pedidos', 4, 1),
(5, 'Clientes', 'Administración de clientes', 'FaUsers', '/clientes', 5, 1),
(6, 'Alertas', 'Notificaciones y alertas', 'FaExclamationTriangle', '/alertas', 6, 1),
(7, 'Usuarios', 'Gestión de usuarios', 'FaUserCog', '/usuarios', 7, 1),
(8, 'Roles', 'Configuración de permisos', 'FaShieldAlt', '/roles', 8, 1),
(9, 'Reportes', 'Informes y estadísticas', 'FaChartBar', '/reportes', 9, 1),
(10, 'Categorías', 'Gestión de categorías de productos', 'FaTags', '/categorias', 10, 1),
(11, 'Laboratorios', 'Gestión de laboratorios', 'FaFlask', '/laboratorios', 11, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `numero_pedido` varchar(20) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `proveedor` varchar(200) DEFAULT NULL,
  `fecha_pedido` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_entrega` date DEFAULT NULL,
  `estado` enum('pendiente','en_proceso','recibido','cancelado') DEFAULT 'pendiente',
  `total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `numero_pedido`, `usuario_id`, `proveedor`, `fecha_pedido`, `fecha_entrega`, `estado`, `total`) VALUES
(1, 'PED-20260215-0001', 4, 'La Santé', '2026-02-15 04:03:18', '2026-02-16', 'recibido', 120.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permisos_rol`
--

CREATE TABLE `permisos_rol` (
  `id` int(11) NOT NULL,
  `rol` enum('admin','vendedor','farmaceutico') NOT NULL,
  `modulo_id` int(11) NOT NULL,
  `puede_ver` tinyint(1) DEFAULT 0,
  `puede_crear` tinyint(1) DEFAULT 0,
  `puede_editar` tinyint(1) DEFAULT 0,
  `puede_eliminar` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `permisos_rol`
--

INSERT INTO `permisos_rol` (`id`, `rol`, `modulo_id`, `puede_ver`, `puede_crear`, `puede_editar`, `puede_eliminar`) VALUES
(1, 'admin', 1, 1, 1, 1, 1),
(2, 'admin', 2, 1, 1, 1, 1),
(3, 'admin', 3, 1, 1, 1, 1),
(4, 'admin', 4, 1, 1, 1, 1),
(5, 'admin', 5, 1, 1, 1, 1),
(6, 'admin', 6, 1, 1, 1, 1),
(7, 'admin', 7, 1, 1, 1, 1),
(8, 'admin', 8, 1, 1, 1, 1),
(9, 'admin', 9, 1, 1, 1, 1),
(16, 'vendedor', 1, 1, 0, 0, 0),
(17, 'vendedor', 3, 1, 1, 0, 0),
(18, 'vendedor', 5, 1, 1, 1, 0),
(19, 'farmaceutico', 1, 1, 0, 0, 0),
(20, 'farmaceutico', 2, 1, 1, 1, 1),
(21, 'farmaceutico', 4, 1, 1, 1, 0),
(22, 'farmaceutico', 6, 1, 0, 0, 0),
(23, 'vendedor', 2, 0, 0, 0, 0),
(24, 'vendedor', 6, 1, 1, 1, 1),
(25, 'farmaceutico', 3, 1, 0, 0, 0),
(26, 'farmaceutico', 5, 1, 0, 0, 0),
(27, 'farmaceutico', 8, 0, 0, 0, 0),
(28, 'farmaceutico', 9, 1, 1, 1, 0),
(29, 'admin', 10, 1, 1, 1, 1),
(30, 'admin', 11, 1, 1, 1, 1),
(32, 'farmaceutico', 10, 1, 1, 0, 0),
(33, 'farmaceutico', 11, 1, 1, 0, 0),
(35, 'vendedor', 10, 1, 0, 0, 0),
(36, 'vendedor', 11, 1, 0, 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL,
  `stock_minimo` int(11) DEFAULT 10,
  `categoria` varchar(100) DEFAULT NULL,
  `laboratorio` varchar(100) DEFAULT NULL,
  `requiere_receta` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `codigo`, `nombre`, `descripcion`, `precio`, `stock`, `stock_minimo`, `categoria`, `laboratorio`, `requiere_receta`, `created_at`, `updated_at`) VALUES
(1, 'MED001', 'Paracetamol 500mg', 'Analgésico y antipirético', 5.99, 50, 10, 'Analgésicos', 'Genfar', 0, '2026-02-15 02:36:35', '2026-02-15 02:36:35'),
(2, 'MED002', 'Ibuprofeno 400mg', 'Antiinflamatorio', 7.50, 30, 10, 'Antiinflamatorios', 'MK', 0, '2026-02-15 02:36:35', '2026-02-15 02:36:35'),
(3, 'MED003', 'Amoxicilina 500mg', 'Antibiótico', 12.00, 32, 5, 'Antibióticos', 'Bayer', 0, '2026-02-15 02:36:35', '2026-02-15 04:22:55'),
(16, 'MED006', 'avendasol', 'producto ', 3.25, 20, 10, 'Antibióticos', 'Bayer', 0, '2026-02-15 16:28:33', '2026-02-15 16:28:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','vendedor','farmaceutico') DEFAULT 'vendedor',
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `activo`, `created_at`) VALUES
(4, 'Administrador', 'admin@farmacia.com', '$2b$10$q9Tmxb6HPZ9QigXQiGVKaufFNdLvmOWOcl.IMybNMQdNzN8dyZiEu', 'admin', 1, '2026-02-15 03:41:38'),
(5, 'Jaira Marcano', 'jairamarcano@gmail.com', '$2b$10$46t2/CumDyNrNsSr/rxIwOj5yclkcBG4R0vRm2r/oLLHPjvdIrBgK', 'vendedor', 1, '2026-02-15 03:55:14'),
(6, 'Liz Guerrero', 'lgvaldez3030@gmail.com', '$2b$10$IcjtEitSU6CLH8GnsB6Su.n/9ahDCXkyeGSzC6Jg9xgn55jpY4MD6', 'farmaceutico', 1, '2026-02-15 15:40:28');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `documento` (`documento`);

--
-- Indices de la tabla `detalles_factura`
--
ALTER TABLE `detalles_factura`
  ADD PRIMARY KEY (`id`),
  ADD KEY `factura_id` (`factura_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_factura` (`numero_factura`),
  ADD KEY `cliente_id` (`cliente_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `laboratorios`
--
ALTER TABLE `laboratorios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `modulos`
--
ALTER TABLE `modulos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_pedido` (`numero_pedido`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `permisos_rol`
--
ALTER TABLE `permisos_rol`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_rol_modulo` (`rol`,`modulo_id`),
  ADD KEY `modulo_id` (`modulo_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `detalles_factura`
--
ALTER TABLE `detalles_factura`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `facturas`
--
ALTER TABLE `facturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `laboratorios`
--
ALTER TABLE `laboratorios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `modulos`
--
ALTER TABLE `modulos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `permisos_rol`
--
ALTER TABLE `permisos_rol`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalles_factura`
--
ALTER TABLE `detalles_factura`
  ADD CONSTRAINT `detalles_factura_ibfk_1` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`),
  ADD CONSTRAINT `detalles_factura_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  ADD CONSTRAINT `detalles_pedido_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  ADD CONSTRAINT `detalles_pedido_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  ADD CONSTRAINT `facturas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `permisos_rol`
--
ALTER TABLE `permisos_rol`
  ADD CONSTRAINT `permisos_rol_ibfk_1` FOREIGN KEY (`modulo_id`) REFERENCES `modulos` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
