const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');

// Salary structure routes
router.get('/salary-structure', salaryController.getSalaryStructure);
router.get('/salary-structures', salaryController.getAllSalaryStructures);
router.post('/salary-structure', salaryController.upsertSalaryStructure);
router.put('/salary-structure/:id', salaryController.updateSalaryStructure);

// Payroll settings routes
router.get('/payroll-settings', salaryController.getPayrollSettings);
router.put('/payroll-settings', salaryController.updatePayrollSettings);

module.exports = router;
