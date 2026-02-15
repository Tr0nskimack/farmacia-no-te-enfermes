import { useAuth } from '../context/AuthContext';

export const usePermiso = (modulo, accion = 'ver') => {
    const { tienePermiso } = useAuth();
    return tienePermiso(modulo, accion);
};