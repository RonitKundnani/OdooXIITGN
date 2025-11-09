// Quick test to verify routes are loaded
const salaryRoutes = require('../routes/salaryRoutes');
const payrollRoutes = require('../routes/payrollRoutes');

console.log('✅ Salary routes loaded:', typeof salaryRoutes);
console.log('✅ Payroll routes loaded:', typeof payrollRoutes);

// Test models
const salaryModel = require('../models/salaryModel');
const payrollModel = require('../models/payrollModel');

console.log('✅ Salary model loaded:', typeof salaryModel.getSalaryStructure);
console.log('✅ Payroll model loaded:', typeof payrollModel.createPayrun);

// Test controllers
const salaryController = require('../controllers/salaryController');
const payrollController = require('../controllers/payrollController');

console.log('✅ Salary controller loaded:', typeof salaryController.getSalaryStructure);
console.log('✅ Payroll controller loaded:', typeof payrollController.createPayrun);

console.log('\n✅ All modules loaded successfully!');
console.log('\n⚠️  Please restart the backend server to load the new routes.');
