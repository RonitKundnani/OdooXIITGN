const { pool } = require("../config/database");
const payrollModel = require("../models/payrollModel");
const salaryModel = require("../models/salaryModel");
const systemLogModel = require("../models/systemLogModel");

// Calculate salary components
function calculateComponents(monthly_wage, components) {
  const calculated = {
    earnings: [],
    deductions: [],
    basic_salary: 0,
    gross_salary: 0,
    total_deductions: 0
  };

  // First pass: calculate basic salary and percentage_of_wage/fixed components
  for (const comp of components) {
    if (comp.component_type === 'earning' && comp.calculation_type !== 'percentage_of_basic') {
      let amount = 0;
      
      if (comp.calculation_type === 'fixed') {
        amount = parseFloat(comp.value);
      } else if (comp.calculation_type === 'percentage_of_wage') {
        amount = (monthly_wage * parseFloat(comp.value)) / 100;
      }
      
      if (comp.component_name.toLowerCase().includes('basic')) {
        calculated.basic_salary = amount;
      }
      
      calculated.earnings.push({
        name: comp.component_name,
        amount: amount,
        calculation_type: comp.calculation_type,
        value: comp.value
      });
    }
  }

  // Second pass: calculate percentage_of_basic components
  for (const comp of components) {
    if (comp.component_type === 'earning' && comp.calculation_type === 'percentage_of_basic') {
      const amount = (calculated.basic_salary * parseFloat(comp.value)) / 100;
      calculated.earnings.push({
        name: comp.component_name,
        amount: amount,
        calculation_type: comp.calculation_type,
        value: comp.value
      });
    }
  }

  // Calculate gross salary
  calculated.gross_salary = calculated.earnings.reduce((sum, e) => sum + e.amount, 0);

  // Calculate deductions
  for (const comp of components) {
    if (comp.component_type === 'deduction') {
      let amount = 0;
      
      if (comp.calculation_type === 'fixed') {
        amount = parseFloat(comp.value);
      } else if (comp.calculation_type === 'percentage_of_wage') {
        amount = (monthly_wage * parseFloat(comp.value)) / 100;
      } else if (comp.calculation_type === 'percentage_of_basic') {
        amount = (calculated.basic_salary * parseFloat(comp.value)) / 100;
      }
      
      calculated.deductions.push({
        name: comp.component_name,
        amount: amount,
        calculation_type: comp.calculation_type,
        value: comp.value
      });
    }
  }

  calculated.total_deductions = calculated.deductions.reduce((sum, d) => sum + d.amount, 0);

  return calculated;
}

// Create payrun
async function createPayrun(req, res) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { company_id, name, pay_period_start, pay_period_end, created_by } = req.body;

    if (!company_id || !name || !pay_period_start || !pay_period_end || !created_by) {
      return res.status(400).json({ 
        ok: false, 
        error: "Required fields: company_id, name, pay_period_start, pay_period_end, created_by" 
      });
    }

    // Verify user has permission
    const [userRows] = await connection.query(
      "SELECT role FROM users WHERE id = ? AND company_id = ?",
      [created_by, company_id]
    );

    if (!userRows.length || !['admin', 'payroll_officer'].includes(userRows[0].role)) {
      return res.status(403).json({ ok: false, error: "Unauthorized" });
    }

    const payrunId = await payrollModel.createPayrun(
      company_id,
      name,
      pay_period_start,
      pay_period_end,
      created_by,
      connection
    );

    await systemLogModel.createSystemLog(
      created_by,
      company_id,
      'PAYRUN_CREATED',
      `Payrun ${name} created`,
      'payroll',
      connection
    );

    await connection.commit();

    return res.json({
      ok: true,
      message: "Payrun created successfully",
      payrun_id: payrunId
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  } finally {
    connection.release();
  }
}

// Compute payroll
async function computePayroll(req, res) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { payrun_id, admin_user_id, company_id } = req.body;

    if (!payrun_id || !admin_user_id || !company_id) {
      return res.status(400).json({ 
        ok: false, 
        error: "payrun_id, admin_user_id, and company_id are required" 
      });
    }

    // Verify user has permission
    const [userRows] = await connection.query(
      "SELECT role FROM users WHERE id = ? AND company_id = ?",
      [admin_user_id, company_id]
    );

    if (!userRows.length || !['admin', 'payroll_officer'].includes(userRows[0].role)) {
      return res.status(403).json({ ok: false, error: "Unauthorized" });
    }

    // Get payrun details
    const payrun = await payrollModel.getPayrunById(payrun_id, connection);
    if (!payrun) {
      return res.status(404).json({ ok: false, error: "Payrun not found" });
    }

    // Get payroll settings
    const settings = await salaryModel.getPayrollSettings(company_id, connection);
    const pfRateEmployee = settings.payroll_pf_rate_employee || 12;
    const pfRateEmployer = settings.payroll_pf_rate_employer || 12;
    const professionalTax = settings.payroll_professional_tax || 200;

    // Get all active employees with salary structures
    const [employees] = await connection.query(
      `SELECT DISTINCT u.id, u.first_name, u.last_name, u.email
       FROM users u
       JOIN salary_structures ss ON u.id = ss.user_id
       WHERE u.company_id = ? AND u.is_active = TRUE AND ss.is_active = TRUE`,
      [company_id]
    );

    // Delete existing payslips for this payrun
    await payrollModel.deletePayslipsByPayrun(payrun_id, connection);

    // Calculate working days in period
    const startDate = new Date(payrun.pay_period_start);
    const endDate = new Date(payrun.pay_period_end);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const totalWorkingDays = Math.floor(totalDays * (5/7)); // Assuming 5 working days per week

    // Generate payslips for each employee
    for (const employee of employees) {
      // Get salary structure
      const structure = await salaryModel.getSalaryStructure(employee.id, connection);
      if (!structure) continue;

      const components = await salaryModel.getSalaryComponents(structure.id, connection);

      // Calculate salary components
      const calculated = calculateComponents(structure.monthly_wage, components);

      // Get attendance for the period
      const [attendanceRows] = await connection.query(
        `SELECT COUNT(*) as present_days 
         FROM attendance 
         WHERE user_id = ? AND date BETWEEN ? AND ? AND status = 'present'`,
        [employee.id, payrun.pay_period_start, payrun.pay_period_end]
      );

      const presentDays = attendanceRows[0].present_days || totalWorkingDays;
      const paidDays = Math.min(presentDays, totalWorkingDays);

      // Prorate salary based on attendance
      const attendanceRatio = paidDays / totalWorkingDays;
      const proratedBasic = calculated.basic_salary * attendanceRatio;
      const proratedGross = calculated.gross_salary * attendanceRatio;

      // Calculate PF
      const pfEmployee = (proratedBasic * pfRateEmployee) / 100;
      const pfEmployer = (proratedBasic * pfRateEmployer) / 100;

      // Calculate total deductions (only employee PF and professional tax are deducted from salary)
      const totalDeductions = calculated.total_deductions * attendanceRatio + pfEmployee + professionalTax;
      const netSalary = proratedGross - totalDeductions;

      // Create payslip
      const payslipId = await payrollModel.createPayslip({
        payrun_id,
        user_id: employee.id,
        total_working_days: totalWorkingDays,
        paid_days: paidDays,
        basic_salary: proratedBasic,
        gross_salary: proratedGross,
        total_deductions: totalDeductions,
        net_salary: netSalary,
        status: 'computed'
      }, connection);

      // Create payslip details for earnings
      for (const earning of calculated.earnings) {
        const amount = earning.amount * attendanceRatio;
        await payrollModel.createPayslipDetail(
          payslipId,
          earning.name,
          amount,
          'earning',
          connection
        );
      }

      // Create payslip details for deductions
      for (const deduction of calculated.deductions) {
        const amount = deduction.amount * attendanceRatio;
        await payrollModel.createPayslipDetail(
          payslipId,
          deduction.name,
          amount,
          'deduction',
          connection
        );
      }

      // Add PF deductions
      await payrollModel.createPayslipDetail(
        payslipId,
        `Provident Fund (Employee ${pfRateEmployee}%)`,
        pfEmployee,
        'deduction',
        connection
      );

      await payrollModel.createPayslipDetail(
        payslipId,
        `Provident Fund (Employer ${pfRateEmployer}%)`,
        pfEmployer,
        'deduction',
        connection
      );

      // Add Professional Tax
      await payrollModel.createPayslipDetail(
        payslipId,
        'Professional Tax',
        professionalTax,
        'deduction',
        connection
      );
    }

    // Update payrun status
    await payrollModel.updatePayrunStatus(payrun_id, 'computed', connection);

    await systemLogModel.createSystemLog(
      admin_user_id,
      company_id,
      'PAYROLL_COMPUTED',
      `Payroll computed for payrun ${payrun_id}`,
      'payroll',
      connection
    );

    await connection.commit();

    return res.json({
      ok: true,
      message: "Payroll computed successfully",
      employee_count: employees.length
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  } finally {
    connection.release();
  }
}

// Get payruns
async function getPayruns(req, res) {
  try {
    const { company_id, status } = req.query;

    if (!company_id) {
      return res.status(400).json({ ok: false, error: "company_id is required" });
    }

    const payruns = await payrollModel.getPayruns(company_id, status, pool);

    return res.json({
      ok: true,
      payruns
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Get payslips for payrun
async function getPayslipsByPayrun(req, res) {
  try {
    const { payrun_id } = req.query;

    if (!payrun_id) {
      return res.status(400).json({ ok: false, error: "payrun_id is required" });
    }

    const payslips = await payrollModel.getPayslipsByPayrun(payrun_id, pool);

    return res.json({
      ok: true,
      payslips
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Get payslip details
async function getPayslipDetails(req, res) {
  try {
    const { payslip_id } = req.query;

    if (!payslip_id) {
      return res.status(400).json({ ok: false, error: "payslip_id is required" });
    }

    const payslip = await payrollModel.getPayslipById(payslip_id, pool);
    if (!payslip) {
      return res.status(404).json({ ok: false, error: "Payslip not found" });
    }

    const details = await payrollModel.getPayslipDetails(payslip_id, pool);

    return res.json({
      ok: true,
      payslip,
      details
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Get payslips for user
async function getPayslipsByUser(req, res) {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ ok: false, error: "user_id is required" });
    }

    const payslips = await payrollModel.getPayslipsByUser(user_id, pool);

    return res.json({
      ok: true,
      payslips
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Validate payrun
async function validatePayrun(req, res) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { payrun_id, admin_user_id, company_id } = req.body;

    if (!payrun_id || !admin_user_id || !company_id) {
      return res.status(400).json({ 
        ok: false, 
        error: "payrun_id, admin_user_id, and company_id are required" 
      });
    }

    // Verify user has permission
    const [userRows] = await connection.query(
      "SELECT role FROM users WHERE id = ? AND company_id = ?",
      [admin_user_id, company_id]
    );

    if (!userRows.length || !['admin', 'payroll_officer'].includes(userRows[0].role)) {
      return res.status(403).json({ ok: false, error: "Unauthorized" });
    }

    // Update payrun status
    await payrollModel.updatePayrunStatus(payrun_id, 'validated', connection);

    // Update all payslips status
    await connection.query(
      "UPDATE payslips SET status = 'validated' WHERE payrun_id = ?",
      [payrun_id]
    );

    await systemLogModel.createSystemLog(
      admin_user_id,
      company_id,
      'PAYROLL_VALIDATED',
      `Payroll validated for payrun ${payrun_id}`,
      'payroll',
      connection
    );

    await connection.commit();

    return res.json({
      ok: true,
      message: "Payroll validated successfully"
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  } finally {
    connection.release();
  }
}

module.exports = {
  createPayrun,
  computePayroll,
  getPayruns,
  getPayslipsByPayrun,
  getPayslipDetails,
  getPayslipsByUser,
  validatePayrun
};
