// Simulate frontend API call
async function testFrontendAPI() {
  const API_BASE_URL = 'http://localhost:5000';
  
  console.log('🧪 Testing Frontend API Calls\n');
  
  // Simulate what frontend does
  const companyId = 1;
  
  console.log(`📞 Calling: ${API_BASE_URL}/leave-types?company_id=${companyId}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/leave-types?company_id=${companyId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);
    
    const data = await response.json();
    console.log('\n📦 Response Data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.ok && data.leaveTypes) {
      console.log('\n✅ Success! Leave Types:');
      data.leaveTypes.forEach((type, index) => {
        console.log(`${index + 1}. ${type.name} (ID: ${type.id}, Paid: ${type.is_paid})`);
      });
    } else {
      console.log('\n❌ No leave types found or error in response');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFrontendAPI();
