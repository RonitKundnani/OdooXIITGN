require('dotenv').config();
const { testEmailConfig, sendWelcomeEmail } = require('./utils/emailService');

async function testEmail() {
  console.log('='.repeat(60));
  console.log('📧 WorkZen HRMS - Email Configuration Test');
  console.log('='.repeat(60));
  console.log();

  // Check environment variables
  console.log('1️⃣ Checking environment variables...');
  console.log('   EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
  console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET (hidden)' : '❌ NOT SET');
  console.log('   FRONTEND_URL:', process.env.FRONTEND_URL || '❌ NOT SET');
  console.log();

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('❌ ERROR: Email credentials not configured in .env file');
    console.log('   Please update backend/.env with your email credentials');
    console.log();
    console.log('   Required variables:');
    console.log('   EMAIL_USER=your-email@gmail.com');
    console.log('   EMAIL_PASSWORD=your-app-password');
    console.log();
    console.log('   Get Gmail App Password: https://myaccount.google.com/apppasswords');
    process.exit(1);
  }

  // Test email configuration
  console.log('2️⃣ Testing email server connection...');
  const configTest = await testEmailConfig();
  
  if (!configTest.success) {
    console.log('❌ Email configuration test FAILED');
    console.log('   Error:', configTest.error);
    console.log();
    console.log('   Common issues:');
    console.log('   - Wrong email or password');
    console.log('   - 2-Step Verification not enabled');
    console.log('   - Using regular password instead of App Password');
    console.log('   - Network/firewall blocking SMTP');
    process.exit(1);
  }
  
  console.log('✅ Email configuration is valid!');
  console.log();

  // Send test email
  console.log('3️⃣ Sending test welcome email...');
  console.log('   Enter recipient email address:');
  console.log('   (Press Ctrl+C to cancel)');
  console.log();

  // For automated testing, use a default email
  const testRecipient = process.argv[2] || process.env.EMAIL_USER;
  
  console.log(`   Sending to: ${testRecipient}`);
  console.log();

  const emailTest = await sendWelcomeEmail({
    email: testRecipient,
    first_name: 'Test',
    last_name: 'Employee',
    employee_id: 'TEST-EMP-2025-001',
    password: 'TempPassword123!',
    company_name: 'WorkZen Demo Company'
  });

  console.log();
  if (emailTest.success) {
    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', emailTest.messageId);
    console.log();
    console.log('📬 Check your inbox at:', testRecipient);
    console.log('   (Check spam folder if not in inbox)');
  } else {
    console.log('❌ Failed to send test email');
    console.log('   Error:', emailTest.error);
  }

  console.log();
  console.log('='.repeat(60));
  console.log('Test completed!');
  console.log('='.repeat(60));
}

// Run the test
testEmail().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
