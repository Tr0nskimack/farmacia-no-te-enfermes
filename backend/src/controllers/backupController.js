const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuración
const BACKUP_DIR = path.join(__dirname, '../../backups');
const DB_NAME = process.env.DB_NAME || 'farmacia_db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';

// Asegurar que el directorio de backups existe
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Obtener todas las configuraciones de respaldo
const obtenerConfiguraciones = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM backup_config ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener configuraciones' });
    }
};

// Obtener una configuración específica
const obtenerConfiguracion = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM backup_config WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Configuración no encontrada' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener configuración' });
    }
};

// Crear nueva configuración de respaldo
const crearConfiguracion = async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            tipo_programacion, // 'diario', 'semanal', 'mensual'
            hora,
            dia_semana, // 0-6 (domingo=0)
            dia_mes, // 1-31
            activo,
            incluir_estructura,
            incluir_datos,
            notificar_email,
            email_notificacion,
            comprimir,
            rotar_copias
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO backup_config 
            (nombre, descripcion, tipo_programacion, hora, dia_semana, dia_mes, activo, 
             incluir_estructura, incluir_datos, notificar_email, email_notificacion, 
             comprimir, rotar_copias, creado_por) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, descripcion, tipo_programacion, hora, dia_semana, dia_mes, activo,
             incluir_estructura, incluir_datos, notificar_email, email_notificacion,
             comprimir, rotar_copias, req.usuario.id]
        );

        res.status(201).json({
            message: 'Configuración creada exitosamente',
            id: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear configuración' });
    }
};

// Actualizar configuración
const actualizarConfiguracion = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            descripcion,
            tipo_programacion,
            hora,
            dia_semana,
            dia_mes,
            activo,
            incluir_estructura,
            incluir_datos,
            notificar_email,
            email_notificacion,
            comprimir,
            rotar_copias
        } = req.body;

        await db.query(
            `UPDATE backup_config SET 
            nombre = ?, descripcion = ?, tipo_programacion = ?, hora = ?, 
            dia_semana = ?, dia_mes = ?, activo = ?, incluir_estructura = ?, 
            incluir_datos = ?, notificar_email = ?, email_notificacion = ?, 
            comprimir = ?, rotar_copias = ?, updated_at = NOW()
            WHERE id = ?`,
            [nombre, descripcion, tipo_programacion, hora, dia_semana, dia_mes, activo,
             incluir_estructura, incluir_datos, notificar_email, email_notificacion,
             comprimir, rotar_copias, id]
        );

        res.json({ message: 'Configuración actualizada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar configuración' });
    }
};

// Eliminar configuración
const eliminarConfiguracion = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM backup_config WHERE id = ?', [id]);
        res.json({ message: 'Configuración eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar configuración' });
    }
};

// Ejecutar respaldo manual
const ejecutarRespaldo = async (req, res) => {
    try {
        const { configuracion_id, nombre_personalizado } = req.body;
        
        let config = null;
        let incluirEstructura = true;
        let incluirDatos = true;
        let comprimir = true;
        
        // Si se proporciona ID de configuración, usar sus parámetros
        if (configuracion_id) {
            const [configRows] = await db.query('SELECT * FROM backup_config WHERE id = ?', [configuracion_id]);
            if (configRows.length > 0) {
                config = configRows[0];
                incluirEstructura = config.incluir_estructura;
                incluirDatos = config.incluir_datos;
                comprimir = config.comprimir;
            }
        }
        
        // Generar nombre del archivo
        const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
        const nombreArchivo = nombre_personalizado 
            ? `${nombre_personalizado.replace(/\s+/g, '_')}_${timestamp}.sql`
            : `backup_${timestamp}.sql`;
        
        const rutaArchivo = path.join(BACKUP_DIR, nombreArchivo);
        
        // Construir comando mysqldump
        let dumpCommand = `mysqldump -h ${DB_HOST} -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} `;
        
        if (!incluirEstructura && incluirDatos) {
            dumpCommand += `--no-create-info `;
        } else if (incluirEstructura && !incluirDatos) {
            dumpCommand += `--no-data `;
        }
        
        dumpCommand += `${DB_NAME} > "${rutaArchivo}"`;
        
        // Ejecutar respaldo
        await execPromise(dumpCommand);
        
        // Comprimir si está configurado
        let archivoFinal = rutaArchivo;
        if (comprimir) {
            archivoFinal += '.gz';
            await execPromise(`gzip "${rutaArchivo}"`);
        }
        
        // Registrar en historial
        const stats = fs.statSync(comprimir ? archivoFinal : rutaArchivo);
        
        await db.query(
            `INSERT INTO backup_historial 
            (configuracion_id, nombre_archivo, ruta_archivo, tamaño_bytes, realizado_por, estado, mensaje) 
            VALUES (?, ?, ?, ?, ?, 'exitoso', ?)`,
            [configuracion_id || null, path.basename(archivoFinal), archivoFinal, 
             stats.size, req.usuario.id, 'Respaldo manual ejecutado']
        );
        
        // Verificar rotación si hay configuración
        if (config && config.rotar_copias > 0) {
            await rotarBackups(config);
        }
        
        res.json({
            message: 'Respaldo ejecutado exitosamente',
            archivo: path.basename(archivoFinal),
            tamaño: stats.size
        });
        
    } catch (error) {
        console.error('Error en respaldo:', error);
        
        // Registrar error
        await db.query(
            `INSERT INTO backup_historial 
            (configuracion_id, estado, mensaje) 
            VALUES (?, 'fallido', ?)`,
            [req.body.configuracion_id || null, error.message]
        );
        
        res.status(500).json({ message: 'Error al ejecutar respaldo: ' + error.message });
    }
};

// Función para rotar backups (mantener solo las últimas N copias)
const rotarBackups = async (config) => {
    try {
        const [backups] = await db.query(
            `SELECT * FROM backup_historial 
             WHERE configuracion_id = ? AND estado = 'exitoso' 
             ORDER BY created_at DESC`,
            [config.id]
        );
        
        if (backups.length > config.rotar_copias) {
            const aEliminar = backups.slice(config.rotar_copias);
            
            for (const backup of aEliminar) {
                // Eliminar archivo físico
                if (backup.ruta_archivo && fs.existsSync(backup.ruta_archivo)) {
                    fs.unlinkSync(backup.ruta_archivo);
                }
                // Eliminar registro
                await db.query('DELETE FROM backup_historial WHERE id = ?', [backup.id]);
            }
        }
    } catch (error) {
        console.error('Error en rotación de backups:', error);
    }
};

// Obtener historial de respaldos
const obtenerHistorial = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT h.*, c.nombre as configuracion_nombre, u.nombre as usuario_nombre
            FROM backup_historial h
            LEFT JOIN backup_config c ON h.configuracion_id = c.id
            LEFT JOIN usuarios u ON h.realizado_por = u.id
            ORDER BY h.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener historial' });
    }
};

// Descargar archivo de respaldo
const descargarRespaldo = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await db.query('SELECT * FROM backup_historial WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Respaldo no encontrado' });
        }
        
        const backup = rows[0];
        
        if (!fs.existsSync(backup.ruta_archivo)) {
            return res.status(404).json({ message: 'Archivo de respaldo no encontrado en el servidor' });
        }
        
        res.download(backup.ruta_archivo, backup.nombre_archivo);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al descargar respaldo' });
    }
};

// Restaurar desde respaldo
const restaurarRespaldo = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await db.query('SELECT * FROM backup_historial WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Respaldo no encontrado' });
        }
        
        const backup = rows[0];
        
        if (!fs.existsSync(backup.ruta_archivo)) {
            return res.status(404).json({ message: 'Archivo de respaldo no encontrado en el servidor' });
        }
        
        // Descomprimir si está comprimido
        let archivoRestore = backup.ruta_archivo;
        if (backup.ruta_archivo.endsWith('.gz')) {
            archivoRestore = backup.ruta_archivo.replace('.gz', '');
            await execPromise(`gunzip -c "${backup.ruta_archivo}" > "${archivoRestore}"`);
        }
        
        // Construir comando mysql para restaurar
        const restoreCommand = `mysql -h ${DB_HOST} -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} ${DB_NAME} < "${archivoRestore}"`;
        
        await execPromise(restoreCommand);
        
        // Limpiar archivo descomprimido temporal
        if (backup.ruta_archivo.endsWith('.gz') && fs.existsSync(archivoRestore)) {
            fs.unlinkSync(archivoRestore);
        }
        
        res.json({ message: 'Base de datos restaurada exitosamente' });
        
    } catch (error) {
        console.error('Error en restauración:', error);
        res.status(500).json({ message: 'Error al restaurar: ' + error.message });
    }
};

module.exports = {
    obtenerConfiguraciones,
    obtenerConfiguracion,
    crearConfiguracion,
    actualizarConfiguracion,
    eliminarConfiguracion,
    ejecutarRespaldo,
    obtenerHistorial,
    descargarRespaldo,
    restaurarRespaldo
};