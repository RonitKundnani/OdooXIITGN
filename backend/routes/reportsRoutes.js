const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

// Report routes
router.get('/reports/attendance', reportsController.getAttendanceReport);
router.get('/reports/leave', reportsController.getLeaveReport);
router.get('/reports/payroll', reportsController.getPayrollReport);
router.get('/reports/dashboard-stats', reportsController.getDashboardStats);

module.exports = router;
