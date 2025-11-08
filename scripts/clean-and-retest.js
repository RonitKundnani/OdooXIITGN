require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function cleanAndRetest() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '2712',
    database: process.env.DB_NAME || 'workzen',
  });

  try {
    console.log('🧹 Cleaning old payroll data...\n');
    
    // Delete all payslip details
    await connection.query('DELETE FROM payslip_details');
    console.log('✅ Deleted payslip details');
    
    // Delete all payslips
    await connection.query('DELETE FROM payslips');
    console.log('✅ Deleted payslips');
    
    // Delete all payruns
    await connection.query('DELETE FROM payruns');
    console.log('✅ Deleted payruns');
    
    console.log('\n✅ Database cleaned successfully!');
    console.log('\n📝 Now you can:');
    console.log('   1. Go to frontend: http://localhost:3000');
    console.log('   2. Navigate to Payroll → Run Payroll');
    console.log('   3. Create a new payrun');
    console.log('   4. The calculations will be correct now!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

cleanAndRetest();
