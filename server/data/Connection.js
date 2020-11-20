const mysql2 = require('mysql2/promise');

const pool = mysql2.createPool({
	connectionLimit: 10,
	host: 'localhost',
	user: 'root',
	password: 'admin',
	database: 'neshap',
});

module.exports = {
	pool: pool,
};