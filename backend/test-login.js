// Quick test script to verify login API is working
// Usage: node test-login.js

const API_URL = 'http://localhost:5000';

async function testLogin() {
  console.log('🧪 Testing Login API...\n');

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@demo.com',
        password: 'admin123',
      }),
    });

    const data = await response.json();

    if (response.ok && data.ok) {
      console.log('✅ Login successful!\n');
      console.log('User Details:');
      console.log('  ID:', data.user.id);
      console.log('  Name:', `${data.user.first_name} ${data.user.last_name}`);
      console.log('  Email:', data.user.email);
      console.log('  Role:', data.user.role);
      console.log('  Last Login:', data.user.last_login);
      console.log('\n✅ Backend is working correctly!');
    } else {
      console.error('❌ Login failed:', data.error);
      console.log('\nPossible issues:');
      console.log('  - User not found in database');
      console.log('  - Incorrect password');
      console.log('  - Database not setup correctly');
    }
  } catch (error) {
    console.error('❌ Error connecting to backend:', error.message);
    console.log('\nPossible issues:');
    console.log('  - Backend server not running (run: npm start)');
    console.log('  - Wrong API URL (check PORT in .env)');
    console.log('  - Network/firewall issues');
  }
}

// Test health endpoint first
async function testHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Backend server is running\n');
      return true;
    }
  } catch (error) {
    console.error('❌ Backend server is not responding');
    console.log('   Make sure to run: npm start\n');
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(50));
  console.log('Backend Login API Test');
  console.log('='.repeat(50) + '\n');

  const isHealthy = await testHealth();
  if (isHealthy) {
    await testLogin();
  }

  console.log('\n' + '='.repeat(50));
}

runTests();
