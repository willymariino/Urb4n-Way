const mysql = require('mysql2');

// Configurazione del Connection Pool per la gestione del database
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,

    // Ottimizzazione delle connessioni simultanee per prevenire il sovraccarico di RAM
    connectionLimit: 3,
    queueLimit: 0,
    waitForConnections: true
});

// Esportazione del pool per l'utilizzo nei controller tramite la sintassi standard
module.exports = pool;