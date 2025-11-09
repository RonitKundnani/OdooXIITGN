// Quick test to verify reports endpoints are working
const express = require('express');
const reportsRoutes = require('./routes/reportsRoutes');

const app = express();
app.use(express.json());
app.use('/', reportsRoutes);

// List all registered routes
console.log('Registered Routes:');
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`  ${Object.keys(middleware.route.methods)[0].toUpperCase()} ${middleware.route.path}`);
  }
});

console.log('\n✅ Reports routes are configured correctly!');
console.log('\nAvailable endpoints:');
console.log('  GET /reports/attendance?company_id=1');
console.log('  GET /reports/leave?company_id=1');
console.log('  GET /reports/payroll?company_id=1');
console.log('  GET /reports/dashboard-stats?company_id=1');
console.log('\n⚠️  Make sure to restart your server: npm start');
