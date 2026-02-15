const bcrypt = require('bcryptjs');

async function generarHash() {
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    console.log('=== DATOS PARA INSERTAR EN phpMyAdmin ===\n');
    console.log('Contraseña original:', password);
    console.log('Hash generado:', hash);
    console.log('\n📝 SQL a ejecutar:');
    console.log(`INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Administrador', 'admin@farmacia.com', '${hash}', 'admin');`);
}

generarHash();