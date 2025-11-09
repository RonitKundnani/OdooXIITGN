// Utility script to generate bcrypt password hashes
// Usage: node utils/hashPassword.js <password>

const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.error('❌ Please provide a password as argument');
  console.log('Usage: node utils/hashPassword.js <password>');
  process.exit(1);
}

const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('❌ Error generating hash:', err);
    process.exit(1);
  }
  
  console.log('\n✅ Password hash generated successfully!\n');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nUse this hash in your database INSERT statements.\n');
});
