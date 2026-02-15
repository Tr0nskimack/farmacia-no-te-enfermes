const db = require('./src/config/db.js');

async function testConnection() {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        console.log('✅ Conexión a MySQL exitosa!');
        console.log('Resultado:', rows[0].solution);
        
        const [tablas] = await db.query('SHOW TABLES');
        console.log('\n📊 Tablas en la base de datos:');
        tablas.forEach(tabla => console.log(`   - ${Object.values(tabla)[0]}`));
        
    } catch (error) {
        console.error('❌ Error de conexión:', error);
    } finally {
        process.exit();
    }
}

testConnection();