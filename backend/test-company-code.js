// Test script for company code generation
const { generateCompanyCode } = require('./utils/companyCodeGenerator');

const testCases = [
  'Odoo India',
  'Tech Solutions',
  'ABC Corporation',
  'Microsoft',
  'Amazon Web Services',
  'Google LLC',
  'Meta Platforms Inc',
  'Apple',
  'Tesla Motors',
  'SpaceX',
];

console.log('Company Code Generation Test\n');
console.log('='.repeat(50));

testCases.forEach(companyName => {
  const code = generateCompanyCode(companyName);
  console.log(`${companyName.padEnd(30)} -> ${code}`);
});

console.log('='.repeat(50));
console.log('\n✅ All tests completed!');
