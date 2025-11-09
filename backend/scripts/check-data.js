require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function checkData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '2712',
    database: process.env.DB_NAME || 'workzen',
  });

  try {
    console.log('🔍 Checking Database Data\n');
    
    // Check users
    const [users] = await connection.query('SELECT id, first_name, last_name, email, role, company_id FROM users');
    console.log('👥 Users:', users.length);
    users.forEach(u => {
      console.log(`   - ${u.id}: ${u.first_name} ${u.last_name} (${u.role})`);
    });
    
    // Check salary structures
    const [structures] = await connection.query('SELECT * FROM salary_structures WHERE is_active = TRUE');
    console.log('\n💰 Salary Structures:', structures.length);
    structures.forEach(s => {
      console.log(`   - User ${s.user_id}: ₹${s.monthly_wage}/month`);
    });
    
    // Check salary components
    const [components] = await connection.query('SELECT * FROM salary_components');
    console.log('\n📊 Salary Components:', components.length);
    
    // Check payruns
    const [payruns] = await connection.query('SELECT * FROM payruns');
    console.log('\n📅 Payruns:', payruns.length);
    payruns.forEach(p => {
      console.log(`   - ${p.name} (${p.status})`);
    });
    
    // Check payslips
    const [payslips] = await connection.query('SELECT * FROM payslips');
    console.log('\n📄 Payslips:', payslips.length);
    
    // Check payslip details
    const [details] = await connection.query('SELECT * FROM payslip_details');
    console.log('\n📋 Payslip Details:', details.length);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkData();
