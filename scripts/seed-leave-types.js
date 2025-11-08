require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function seedLeaveTypes() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '2712',
    database: process.env.DB_NAME || 'workzen',
  });

  try {
    console.log('🔄 Starting leave types seeding...');

    // Get all companies
    const [companies] = await connection.query('SELECT id, company_name FROM companies');
    console.log(`📊 Found ${companies.length} companies`);

    for (const company of companies) {
      console.log(`\n🏢 Processing company: ${company.company_name} (ID: ${company.id})`);

      // Insert leave types
      const leaveTypes = [
        { name: 'Annual Leave', description: 'Paid annual vacation leave', is_paid: true },
        { name: 'Sick Leave', description: 'Paid sick leave for medical reasons', is_paid: true },
        { name: 'Casual Leave', description: 'Short-term casual leave', is_paid: true },
        { name: 'Unpaid Leave', description: 'Leave without pay', is_paid: false },
      ];

      for (const leaveType of leaveTypes) {
        // Check if leave type already exists
        const [existing] = await connection.query(
          'SELECT id FROM leave_types WHERE company_id = ? AND name = ?',
          [company.id, leaveType.name]
        );

        if (existing.length === 0) {
          await connection.query(
            'INSERT INTO leave_types (company_id, name, description, is_paid) VALUES (?, ?, ?, ?)',
            [company.id, leaveType.name, leaveType.description, leaveType.is_paid]
          );
          console.log(`  ✅ Created: ${leaveType.name}`);
        } else {
          console.log(`  ⏭️  Skipped: ${leaveType.name} (already exists)`);
        }
      }

      // Get all users in this company
      const [users] = await connection.query(
        'SELECT id, first_name, last_name FROM users WHERE company_id = ?',
        [company.id]
      );

      console.log(`  👥 Found ${users.length} users`);

      // Get leave types for this company
      const [companyLeaveTypes] = await connection.query(
        'SELECT id, name FROM leave_types WHERE company_id = ?',
        [company.id]
      );

      const currentYear = new Date().getFullYear();

      // Allocate leaves to all users
      for (const user of users) {
        for (const leaveType of companyLeaveTypes) {
          // Check if allocation already exists
          const [existingAlloc] = await connection.query(
            'SELECT id FROM leave_allocations WHERE user_id = ? AND leave_type_id = ? AND year = ?',
            [user.id, leaveType.id, currentYear]
          );

          if (existingAlloc.length === 0) {
            const totalDays = 
              leaveType.name === 'Annual Leave' ? 20 :
              leaveType.name === 'Sick Leave' ? 10 :
              leaveType.name === 'Casual Leave' ? 5 :
              leaveType.name === 'Unpaid Leave' ? 30 : 0;

            await connection.query(
              'INSERT INTO leave_allocations (user_id, leave_type_id, total_days, used_days, year) VALUES (?, ?, ?, 0, ?)',
              [user.id, leaveType.id, totalDays, currentYear]
            );
          }
        }
      }
      console.log(`  ✅ Allocated leaves to all users`);
    }

    // Show summary
    const [leaveTypesCount] = await connection.query(
      'SELECT company_id, COUNT(*) as count FROM leave_types GROUP BY company_id'
    );
    const [allocationsCount] = await connection.query(
      'SELECT COUNT(*) as count FROM leave_allocations WHERE year = ?',
      [new Date().getFullYear()]
    );

    console.log('\n📊 Summary:');
    console.log('Leave Types by Company:');
    leaveTypesCount.forEach(row => {
      console.log(`  Company ${row.company_id}: ${row.count} leave types`);
    });
    console.log(`Total Allocations for ${new Date().getFullYear()}: ${allocationsCount[0].count}`);

    console.log('\n✅ Leave types seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding leave types:', error);
  } finally {
    await connection.end();
  }
}

seedLeaveTypes();
