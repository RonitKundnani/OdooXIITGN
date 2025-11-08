require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function checkUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '2712',
    database: process.env.DB_NAME || 'workzen',
  });

  try {
    const [users] = await connection.query('SELECT id, first_name, last_name, email FROM users');
    console.log('Users:', JSON.stringify(users, null, 2));
    
    const [allocations] = await connection.query('SELECT * FROM leave_allocations');
    console.log('\nAllocations:', JSON.stringify(allocations, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkUsers();
