import { useAuth } from '../context/AuthContext'; // 👈 IMPORTANTE: agregar esta línea
// Definición de permisos por rol
export const ROLES = {
    ADMIN: 'admin',
    FARMACEUTICO: 'farmaceutico',
    VENDEDOR: 'vendedor'
};

export const PERMISOS = {
    // Productos
    VER_PRODUCTOS: [ROLES.ADMIN, ROLES.FARMACEUTICO, ROLES.VENDEDOR],
    CREAR_PRODUCTOS: [ROLES.ADMIN, ROLES.FARMACEUTICO],
    EDITAR_PRODUCTOS: [ROLES.ADMIN, ROLES.FARMACEUTICO],
    ELIMINAR_PRODUCTOS: [ROLES.ADMIN],
    
    // Usuarios
    VER_USUARIOS: [ROLES.ADMIN],
    CREAR_USUARIOS: [ROLES.ADMIN],
    EDITAR_USUARIOS: [ROLES.ADMIN],
    ELIMINAR_USUARIOS: [ROLES.ADMIN],
    
    // Facturación
    VER_FACTURAS: [ROLES.ADMIN, ROLES.FARMACEUTICO, ROLES.VENDEDOR],
    CREAR_FACTURAS: [ROLES.ADMIN, ROLES.VENDEDOR],
    ANULAR_FACTURAS: [ROLES.ADMIN],
    
    // Clientes
    VER_CLIENTES: [ROLES.ADMIN, ROLES.FARMACEUTICO, ROLES.VENDEDOR],
    CREAR_CLIENTES: [ROLES.ADMIN, ROLES.VENDEDOR],
    EDITAR_CLIENTES: [ROLES.ADMIN, ROLES.VENDEDOR],
    ELIMINAR_CLIENTES: [ROLES.ADMIN],
    
    // Pedidos
    VER_PEDIDOS: [ROLES.ADMIN, ROLES.FARMACEUTICO],
    CREAR_PEDIDOS: [ROLES.ADMIN, ROLES.FARMACEUTICO],
    RECIBIR_PEDIDOS: [ROLES.ADMIN, ROLES.FARMACEUTICO],
    
    // Alertas
    VER_ALERTAS: [ROLES.ADMIN, ROLES.FARMACEUTICO, ROLES.VENDEDOR],
    
    // Dashboard
    VER_DASHBOARD: [ROLES.ADMIN, ROLES.FARMACEUTICO, ROLES.VENDEDOR],
    
    // Reportes
    VER_REPORTES: [ROLES.ADMIN, ROLES.FARMACEUTICO]
};

// Hook personalizado para verificar permisos
export const usePermiso = (permiso) => {
    const { usuario } = useAuth();
    
    if (!usuario) return false;
    
    const rolesPermitidos = PERMISOS[permiso];
    return rolesPermitidos?.includes(usuario.rol) || false;
};