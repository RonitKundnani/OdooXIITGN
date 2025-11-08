// Test Complete Payroll Flow
const baseURL = 'http://localhost:5000';

async function testPayrollFlow() {
  console.log('🧪 Testing Complete Payroll Flow\n');
  console.log('='.repeat(70));
  
  const company_id = 1;
  const admin_user_id = 'OINADE20250001';
  
  try {
    // Step 1: Check salary structures
    console.log('\n1️⃣ Checking Salary Structures');
    console.log('-'.repeat(70));
    
    let response = await fetch(`${baseURL}/salary-structures?company_id=${company_id}`);
    let data = await response.json();
    
    if (data.ok && data.structures.length > 0) {
      console.log(`   ✅ Found ${data.structures.length} employees with salary structures`);
      data.structures.forEach(s => {
        console.log(`      - ${s.first_name} ${s.last_name}: ₹${parseFloat(s.monthly_wage).toLocaleString()}/month`);
      });
    } else {
      console.log('   ❌ No salary structures found!');
      console.log('   Run: node backend\\scripts\\setup-sample-salaries.js');
      return;
    }
    
    // Step 2: Create Payrun
    console.log('\n2️⃣ Creating Payrun');
    console.log('-'.repeat(70));
    
    const payrunData = {
      company_id: company_id,
      name: 'December 2025 Payroll',
      pay_period_start: '2025-12-01',
      pay_period_end: '2025-12-31',
      created_by: admin_user_id
    };
    
    response = await fetch(`${baseURL}/payrun`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payrunData)
    });
    data = await response.json();
    
    if (!data.ok) {
      console.log(`   ❌ Failed to create payrun: ${data.error}`);
      return;
    }
    
    const payrun_id = data.payrun_id;
    console.log(`   ✅ Payrun created successfully`);
    console.log(`      Payrun ID: ${payrun_id}`);
    console.log(`      Period: December 2025`);
    
    // Step 3: Compute Payroll
    console.log('\n3️⃣ Computing Payroll');
    console.log('-'.repeat(70));
    
    response = await fetch(`${baseURL}/payrun/compute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payrun_id: payrun_id,
        admin_user_id: admin_user_id,
        company_id: company_id
      })
    });
    data = await response.json();
    
    if (!data.ok) {
      console.log(`   ❌ Failed to compute payroll: ${data.error}`);
      return;
    }
    
    console.log(`   ✅ Payroll computed successfully`);
    console.log(`      Employees processed: ${data.employee_count}`);
    
    // Step 4: Get Payslips
    console.log('\n4️⃣ Fetching Generated Payslips');
    console.log('-'.repeat(70));
    
    response = await fetch(`${baseURL}/payslips?payrun_id=${payrun_id}`);
    data = await response.json();
    
    if (!data.ok || data.payslips.length === 0) {
      console.log('   ❌ No payslips generated!');
      return;
    }
    
    console.log(`   ✅ Found ${data.payslips.length} payslips\n`);
    
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    
    for (const payslip of data.payslips) {
      const gross = parseFloat(payslip.gross_salary);
      const deductions = parseFloat(payslip.total_deductions);
      const net = parseFloat(payslip.net_salary);
      
      totalGross += gross;
      totalDeductions += deductions;
      totalNet += net;
      
      console.log(`   Employee: ${payslip.first_name} ${payslip.last_name}`);
      console.log(`      Gross: ₹${gross.toLocaleString()}`);
      console.log(`      Deductions: ₹${deductions.toLocaleString()}`);
      console.log(`      Net: ₹${net.toLocaleString()}`);
      console.log(`      Status: ${payslip.status}`);
      console.log('');
    }
    
    // Step 5: Get Detailed Breakdown for first payslip
    console.log('5️⃣ Checking Payslip Details (First Employee)');
    console.log('-'.repeat(70));
    
    const firstPayslip = data.payslips[0];
    response = await fetch(`${baseURL}/payslip?payslip_id=${firstPayslip.id}`);
    data = await response.json();
    
    if (!data.ok) {
      console.log('   ❌ Failed to fetch payslip details');
      return;
    }
    
    console.log(`   Employee: ${data.payslip.first_name} ${data.payslip.last_name}\n`);
    
    const earnings = data.details.filter(d => d.component_type === 'earning');
    const deductions = data.details.filter(d => d.component_type === 'deduction');
    
    console.log('   📈 Earnings:');
    earnings.forEach(e => {
      console.log(`      ${e.component_name.padEnd(35)} ₹${parseFloat(e.amount).toLocaleString()}`);
    });
    
    console.log(`\n   📉 Deductions:`);
    deductions.forEach(d => {
      console.log(`      ${d.component_name.padEnd(35)} ₹${parseFloat(d.amount).toLocaleString()}`);
    });
    
    console.log(`\n   💰 Summary:`);
    console.log(`      Gross Salary:${' '.repeat(24)} ₹${parseFloat(data.payslip.gross_salary).toLocaleString()}`);
    console.log(`      Total Deductions:${' '.repeat(18)} ₹${parseFloat(data.payslip.total_deductions).toLocaleString()}`);
    console.log(`      Net Salary:${' '.repeat(26)} ₹${parseFloat(data.payslip.net_salary).toLocaleString()}`);
    
    // Step 6: Validate Payrun
    console.log('\n6️⃣ Validating Payrun');
    console.log('-'.repeat(70));
    
    response = await fetch(`${baseURL}/payrun/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payrun_id: payrun_id,
        admin_user_id: admin_user_id,
        company_id: company_id
      })
    });
    data = await response.json();
    
    if (data.ok) {
      console.log('   ✅ Payrun validated and finalized');
    } else {
      console.log(`   ❌ Failed to validate: ${data.error}`);
    }
    
    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 PAYROLL SUMMARY');
    console.log('='.repeat(70));
    console.log(`   Total Employees: ${data.payslips?.length || 0}`);
    console.log(`   Total Gross: ₹${totalGross.toLocaleString()}`);
    console.log(`   Total Deductions: ₹${totalDeductions.toLocaleString()}`);
    console.log(`   Total Net Pay: ₹${totalNet.toLocaleString()}`);
    console.log('='.repeat(70));
    
    console.log('\n✅ Complete payroll flow tested successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Open frontend: http://localhost:3000');
    console.log('   2. Go to Payroll → Payslips');
    console.log('   3. Select "December 2025 Payroll"');
    console.log('   4. View and print payslips');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testPayrollFlow();
