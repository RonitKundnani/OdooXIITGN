require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function setupSampleSalaries() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '2712',
    database: process.env.DB_NAME || 'workzen',
  });

  try {
    console.log('🔧 Setting up sample salary structures...\n');
    
    // Get all users
    const [users] = await connection.query('SELECT id, first_name, last_name, role FROM users WHERE is_active = TRUE');
    console.log(`Found ${users.length} active users\n`);
    
    for (const user of users) {
      console.log(`Setting up salary for: ${user.first_name} ${user.last_name} (${user.role})`);
      
      // Different salaries based on role
      let monthlyWage = 30000;
      if (user.role === 'admin') monthlyWage = 80000;
      else if (user.role === 'hr_officer') monthlyWage = 60000;
      else if (user.role === 'payroll_officer') monthlyWage = 60000;
      else monthlyWage = 40000;
      
      const yearlyWage = monthlyWage * 12;
      
      // Check if salary structure already exists
      const [existing] = await connection.query(
        'SELECT id FROM salary_structures WHERE user_id = ? AND is_active = TRUE',
        [user.id]
      );
      
      if (existing.length > 0) {
        console.log(`  ⏭️  Already has salary structure\n`);
        continue;
      }
      
      // Create salary structure
      const [structureResult] = await connection.query(
        `INSERT INTO salary_structures 
         (user_id, monthly_wage, yearly_wage, working_days_per_week, break_time_hours, effective_from, is_active) 
         VALUES (?, ?, ?, 5, 1, '2025-01-01', TRUE)`,
        [user.id, monthlyWage, yearlyWage]
      );
      
      const structureId = structureResult.insertId;
      console.log(`  ✅ Created structure (ID: ${structureId})`);
      console.log(`     Monthly: ₹${monthlyWage.toLocaleString()}, Yearly: ₹${yearlyWage.toLocaleString()}`);
      
      // Create salary components
      const components = [
        { name: 'Basic Salary', type: 'earning', calc_type: 'percentage_of_wage', value: 50 },
        { name: 'House Rent Allowance', type: 'earning', calc_type: 'percentage_of_basic', value: 50 },
        { name: 'Standard Allowance', type: 'earning', calc_type: 'percentage_of_wage', value: 16.67 },
        { name: 'Performance Bonus', type: 'earning', calc_type: 'percentage_of_wage', value: 8.33 },
        { name: 'Leave Travel Allowance', type: 'earning', calc_type: 'percentage_of_wage', value: 8.33 },
        { name: 'Fixed Allowance', type: 'earning', calc_type: 'fixed', value: monthlyWage * 0.1667 }
      ];
      
      for (const comp of components) {
        await connection.query(
          `INSERT INTO salary_components 
           (salary_structure_id, component_name, component_type, calculation_type, value) 
           VALUES (?, ?, ?, ?, ?)`,
          [structureId, comp.name, comp.type, comp.calc_type, comp.value]
        );
      }
      
      console.log(`  ✅ Created ${components.length} components\n`);
    }
    
    // Summary
    const [finalStructures] = await connection.query('SELECT COUNT(*) as count FROM salary_structures WHERE is_active = TRUE');
    const [finalComponents] = await connection.query('SELECT COUNT(*) as count FROM salary_components');
    
    console.log('📊 Summary:');
    console.log(`   Total Salary Structures: ${finalStructures[0].count}`);
    console.log(`   Total Components: ${finalComponents[0].count}`);
    console.log('\n✅ Sample salary structures created successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

setupSampleSalaries();
