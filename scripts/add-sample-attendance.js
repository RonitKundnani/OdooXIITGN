require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function addSampleAttendance() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '2712',
    database: process.env.DB_NAME || 'workzen',
  });

  try {
    console.log('📅 Adding sample attendance data...\n');
    
    // Get all users
    const [users] = await connection.query('SELECT id, first_name, last_name FROM users WHERE is_active = TRUE');
    
    // Add attendance for December 2025 (1st to 31st)
    const year = 2025;
    const month = 12; // December
    const daysInMonth = 31;
    const company_id = 1;
    
    for (const user of users) {
      console.log(`Adding attendance for: ${user.first_name} ${user.last_name}`);
      let presentDays = 0;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        
        // Skip weekends (Saturday = 6, Sunday = 0)
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
        
        // Random attendance (90% present)
        const isPresent = Math.random() > 0.1;
        
        if (isPresent) {
          const checkIn = new Date(date);
          checkIn.setHours(9, Math.floor(Math.random() * 30), 0); // 9:00-9:30 AM
          
          const checkOut = new Date(date);
          checkOut.setHours(18, Math.floor(Math.random() * 30), 0); // 6:00-6:30 PM
          
          const workHours = (checkOut - checkIn) / (1000 * 60 * 60);
          
          // Check if attendance already exists
          const [existing] = await connection.query(
            'SELECT id FROM attendance WHERE user_id = ? AND date = ?',
            [user.id, date.toISOString().split('T')[0]]
          );
          
          if (existing.length === 0) {
            await connection.query(
              `INSERT INTO attendance 
               (user_id, company_id, check_in, check_out, work_hours, date, status) 
               VALUES (?, ?, ?, ?, ?, ?, 'present')`,
              [user.id, company_id, checkIn, checkOut, workHours.toFixed(2), date.toISOString().split('T')[0]]
            );
            presentDays++;
          }
        }
      }
      
      console.log(`  ✅ Added ${presentDays} days of attendance\n`);
    }
    
    // Summary
    const [totalAttendance] = await connection.query(
      'SELECT COUNT(*) as count FROM attendance WHERE YEAR(date) = 2025 AND MONTH(date) = 12'
    );
    
    console.log('📊 Summary:');
    console.log(`   Total attendance records for December 2025: ${totalAttendance[0].count}`);
    console.log('\n✅ Sample attendance data added successfully!');
    console.log('\n📝 Now when you run payroll for December 2025:');
    console.log('   - Salary will be calculated based on actual attendance');
    console.log('   - Employees with less attendance will get prorated salary');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

addSampleAttendance();
