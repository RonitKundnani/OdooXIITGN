require('dotenv').config();
const mysql = require('mysql2/promise');

// Create MySQL pool connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

// Test database connection
async function testConnection() {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
  console.log("✅ MySQL connection successful");
}

module.exports = { pool, testConnection };
