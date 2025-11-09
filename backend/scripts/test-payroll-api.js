// Test Payroll API endpoints
const baseURL = 'http://localhost:5000';

async function testPayrollAPI() {
  console.log('🧪 Testing Payroll API Endpoints\n');
  
  const company_id = 1;
  const admin_user_id = 'OINADE20250001'; // Replace with actual admin user
  const test_user_id = 'OIAKAK20250001'; // Replace with actual employee
  
  try {
    // Test 1: Get Payroll Settings
    console.log('1️⃣ Testing GET /payroll-settings');
    let response = await fetch(`${baseURL}/payroll-settings?company_id=${company_id}`);
    let data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📊 Settings:', data.settings);
    
    // Test 2: Create Salary Structure
    console.log('\n2️⃣ Testing POST /salary-structure');
    const salaryData = {
      user_id: test_user_id,
      company_id: company_id,
      monthly_wage: 50000,
      yearly_wage: 600000,
      working_days_per_week: 5,
      break_time_hours: 1,
      effective_from: '2025-01-01',
      admin_user_id: admin_user_id,
      components: [
        {
          component_name: 'Basic Salary',
          component_type: 'earning',
          calculation_type: 'percentage_of_wage',
          value: 50
        },
        {
          component_name: 'House Rent Allowance',
          component_type: 'earning',
          calculation_type: 'percentage_of_basic',
          value: 50
        },
        {
          component_name: 'Standard Allowance',
          component_type: 'earning',
          calculation_type: 'percentage_of_wage',
          value: 16.67
        },
        {
          component_name: 'Performance Bonus',
          component_type: 'earning',
          calculation_type: 'percentage_of_wage',
          value: 8.33
        },
        {
          component_name: 'Leave Travel Allowance',
          component_type: 'earning',
          calculation_type: 'percentage_of_wage',
          value: 8.33
        },
        {
          component_name: 'Fixed Allowance',
          component_type: 'earning',
          calculation_type: 'fixed',
          value: 2918
        }
      ]
    };
    
    response = await fetch(`${baseURL}/salary-structure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(salaryData)
    });
    data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📊 Response:', data);
    
    // Test 3: Get Salary Structure
    console.log('\n3️⃣ Testing GET /salary-structure');
    response = await fetch(`${baseURL}/salary-structure?user_id=${test_user_id}`);
    data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📊 Structure:', data.structure);
    console.log('📊 Components:', data.components?.length || 0);
    
    // Test 4: Get All Salary Structures
    console.log('\n4️⃣ Testing GET /salary-structures');
    response = await fetch(`${baseURL}/salary-structures?company_id=${company_id}`);
    data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📊 Structures:', data.structures?.length || 0);
    
    // Test 5: Create Payrun
    console.log('\n5️⃣ Testing POST /payrun');
    const payrunData = {
      company_id: company_id,
      name: 'January 2025 Payroll',
      pay_period_start: '2025-01-01',
      pay_period_end: '2025-01-31',
      created_by: admin_user_id
    };
    
    response = await fetch(`${baseURL}/payrun`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payrunData)
    });
    data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📊 Response:', data);
    const payrun_id = data.payrun_id;
    
    if (payrun_id) {
      // Test 6: Compute Payroll
      console.log('\n6️⃣ Testing POST /payrun/compute');
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
      console.log('✅ Status:', response.status);
      console.log('📊 Response:', data);
      
      // Test 7: Get Payslips
      console.log('\n7️⃣ Testing GET /payslips');
      response = await fetch(`${baseURL}/payslips?payrun_id=${payrun_id}`);
      data = await response.json();
      console.log('✅ Status:', response.status);
      console.log('📊 Payslips:', data.payslips?.length || 0);
      
      if (data.payslips && data.payslips.length > 0) {
        const payslip_id = data.payslips[0].id;
        
        // Test 8: Get Payslip Details
        console.log('\n8️⃣ Testing GET /payslip');
        response = await fetch(`${baseURL}/payslip?payslip_id=${payslip_id}`);
        data = await response.json();
        console.log('✅ Status:', response.status);
        console.log('📊 Payslip:', data.payslip);
        console.log('📊 Details:', data.details?.length || 0);
      }
    }
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPayrollAPI();
