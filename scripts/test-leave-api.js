// Test Leave API endpoints
async function testLeaveAPI() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing Leave API Endpoints\n');
  
  // Test 1: Get Leave Types
  console.log('1️⃣ Testing GET /leave-types');
  try {
    const response = await fetch(`${baseURL}/leave-types?company_id=1`);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📊 Leave Types:', data.leaveTypes?.length || 0);
    if (data.leaveTypes && data.leaveTypes.length > 0) {
      data.leaveTypes.forEach(lt => {
        console.log(`   - ${lt.name} (${lt.is_paid ? 'Paid' : 'Unpaid'})`);
      });
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n2️⃣ Testing GET /leave-allocations');
  try {
    const response = await fetch(`${baseURL}/leave-allocations?user_id=OINADE20250001`);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📊 Allocations:', data.allocations?.length || 0);
    if (data.allocations && data.allocations.length > 0) {
      data.allocations.forEach(alloc => {
        console.log(`   - ${alloc.leave_type_name}: ${alloc.total_days - alloc.used_days}/${alloc.total_days} days`);
      });
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n✅ All tests completed!');
}

testLeaveAPI();
