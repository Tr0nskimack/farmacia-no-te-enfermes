const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = verified;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};

const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ message: 'No tienes permiso para esta acción' });
        }

        next();
    };
};

module.exports = { verificarToken, verificarRol };