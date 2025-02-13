const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    password: 'Aryan_123',
    host: 'localhost',
    port: 5432,
    database: 'qr_scanner'
});

module.exports = pool;
