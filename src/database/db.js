const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sugerencias (
                id VARCHAR(50) PRIMARY KEY,
                autor_id VARCHAR(50) NOT NULL,
                contenido TEXT NOT NULL,
                votos_positivos INT DEFAULT 0,
                votos_negativos INT DEFAULT 0,
                estado VARCHAR(20) DEFAULT 'pendiente',
                mensaje_id VARCHAR(50), -- Nueva columna
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS votos (
                sugerencia_id VARCHAR(50) REFERENCES sugerencias(id) ON DELETE CASCADE,
                usuario_id VARCHAR(50) NOT NULL,
                tipo_voto VARCHAR(10) NOT NULL CHECK (tipo_voto IN ('positivo', 'negativo')),
                PRIMARY KEY (sugerencia_id, usuario_id)
            );
            CREATE TABLE IF NOT EXISTS blacklist (
                usuario_id VARCHAR(50) PRIMARY KEY,
                razon TEXT,
                agregado_por VARCHAR(50),
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Base de datos PostgreSQL conectada e inicializada.');
    } catch (error) {
        console.error('❌ Error inicializando la base de datos:', error);
    }
}

module.exports = { pool, initDB };