const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');

// Payrun routes
router.post('/payrun', payrollController.createPayrun);
router.get('/payruns', payrollController.getPayruns);
router.post('/payrun/compute', payrollController.computePayroll);
router.post('/payrun/validate', payrollController.validatePayrun);

// Payslip routes
router.get('/payslips', payrollController.getPayslipsByPayrun);
router.get('/payslip', payrollController.getPayslipDetails);
router.get('/user-payslips', payrollController.getPayslipsByUser);

module.exports = router;
