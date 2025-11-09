const { pool } = require("../config/database");
const salaryModel = require("../models/salaryModel");
const systemLogModel = require("../models/systemLogModel");

// Get salary structure for a user
async function getSalaryStructure(req, res) {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ ok: false, error: "user_id is required" });
    }

    const structure = await salaryModel.getSalaryStructure(user_id, pool);
    
    if (!structure) {
      return res.json({ ok: true, structure: null, components: [] });
    }

    const components = await salaryModel.getSalaryComponents(structure.id, pool);

    return res.json({
      ok: true,
      structure,
      components
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Get all salary structures for company
async function getAllSalaryStructures(req, res) {
  try {
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({ ok: false, error: "company_id is required" });
    }

    const structures = await salaryModel.getAllSalaryStructures(company_id, pool);
    
    // Get components for each structure
    for (let structure of structures) {
      structure.components = await salaryModel.getSalaryComponents(structure.id, pool);
    }

    return res.json({
      ok: true,
      structures
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Create or update salary structure
async function upsertSalaryStructure(req, res) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const {
      user_id,
      company_id,
      monthly_wage,
      yearly_wage,
      working_days_per_week,
      break_time_hours,
      effective_from,
      components,
      admin_user_id
    } = req.body;

    if (!user_id || !company_id || !monthly_wage || !yearly_wage || !effective_from || !components || !admin_user_id) {
      return res.status(400).json({ 
        ok: false, 
        error: "Required fields: user_id, company_id, monthly_wage, yearly_wage, effective_from, components, admin_user_id" 
      });
    }

    // Verify admin has permission
    const [adminRows] = await connection.query(
      "SELECT role FROM users WHERE id = ? AND company_id = ?",
      [admin_user_id, company_id]
    );

    if (!adminRows.length || !['admin', 'payroll_officer'].includes(adminRows[0].role)) {
      return res.status(403).json({ ok: false, error: "Unauthorized" });
    }

    // Validate components total doesn't exceed wage
    let totalPercentage = 0;
    let totalFixed = 0;
    
    for (const comp of components) {
      if (comp.component_type === 'earning') {
        if (comp.calculation_type === 'percentage_of_wage') {
          totalPercentage += parseFloat(comp.value);
        } else if (comp.calculation_type === 'fixed') {
          totalFixed += parseFloat(comp.value);
        }
      }
    }

    const percentageAmount = (monthly_wage * totalPercentage) / 100;
    if (percentageAmount + totalFixed > monthly_wage) {
      return res.status(400).json({ 
        ok: false, 
        error: "Total salary components exceed the defined wage" 
      });
    }

    // Create salary structure
    const structureId = await salaryModel.createSalaryStructure(
      user_id,
      monthly_wage,
      yearly_wage,
      effective_from,
      working_days_per_week,
      break_time_hours,
      connection
    );

    // Create components
    for (const comp of components) {
      await salaryModel.createSalaryComponent(
        structureId,
        comp.component_name,
        comp.component_type,
        comp.calculation_type,
        comp.value,
        connection
      );
    }

    await systemLogModel.createSystemLog(
      admin_user_id,
      company_id,
      'SALARY_STRUCTURE_CREATED',
      `Salary structure created for user ${user_id}`,
      'payroll',
      connection
    );

    await connection.commit();

    return res.json({
      ok: true,
      message: "Salary structure created successfully",
      structure_id: structureId
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  } finally {
    connection.release();
  }
}

// Update salary structure
async function updateSalaryStructure(req, res) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { id } = req.params;
    const {
      monthly_wage,
      yearly_wage,
      working_days_per_week,
      break_time_hours,
      components,
      admin_user_id,
      company_id
    } = req.body;

    if (!monthly_wage || !yearly_wage || !components || !admin_user_id || !company_id) {
      return res.status(400).json({ 
        ok: false, 
        error: "Required fields: monthly_wage, yearly_wage, components, admin_user_id, company_id" 
      });
    }

    // Verify admin has permission
    const [adminRows] = await connection.query(
      "SELECT role FROM users WHERE id = ? AND company_id = ?",
      [admin_user_id, company_id]
    );

    if (!adminRows.length || !['admin', 'payroll_officer'].includes(adminRows[0].role)) {
      return res.status(403).json({ ok: false, error: "Unauthorized" });
    }

    // Update structure
    await salaryModel.updateSalaryStructure(
      id,
      monthly_wage,
      yearly_wage,
      working_days_per_week,
      break_time_hours,
      connection
    );

    // Delete old components
    await salaryModel.deleteSalaryComponents(id, connection);

    // Create new components
    for (const comp of components) {
      await salaryModel.createSalaryComponent(
        id,
        comp.component_name,
        comp.component_type,
        comp.calculation_type,
        comp.value,
        connection
      );
    }

    await systemLogModel.createSystemLog(
      admin_user_id,
      company_id,
      'SALARY_STRUCTURE_UPDATED',
      `Salary structure ${id} updated`,
      'payroll',
      connection
    );

    await connection.commit();

    return res.json({
      ok: true,
      message: "Salary structure updated successfully"
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  } finally {
    connection.release();
  }
}

// Get payroll settings
async function getPayrollSettings(req, res) {
  try {
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({ ok: false, error: "company_id is required" });
    }

    const settings = await salaryModel.getPayrollSettings(company_id, pool);

    // Set defaults if not exists
    const defaultSettings = {
      payroll_pf_rate_employee: 12,
      payroll_pf_rate_employer: 12,
      payroll_professional_tax: 200,
      ...settings
    };

    return res.json({
      ok: true,
      settings: defaultSettings
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Update payroll settings
async function updatePayrollSettings(req, res) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { company_id, settings, admin_user_id } = req.body;

    if (!company_id || !settings || !admin_user_id) {
      return res.status(400).json({ 
        ok: false, 
        error: "company_id, settings, and admin_user_id are required" 
      });
    }

    // Verify admin has permission
    const [adminRows] = await connection.query(
      "SELECT role FROM users WHERE id = ? AND company_id = ?",
      [admin_user_id, company_id]
    );

    if (!adminRows.length || !['admin', 'payroll_officer'].includes(adminRows[0].role)) {
      return res.status(403).json({ ok: false, error: "Unauthorized" });
    }

    await salaryModel.updatePayrollSettings(company_id, settings, connection);

    await systemLogModel.createSystemLog(
      admin_user_id,
      company_id,
      'PAYROLL_SETTINGS_UPDATED',
      'Payroll settings updated',
      'payroll',
      connection
    );

    await connection.commit();

    return res.json({
      ok: true,
      message: "Payroll settings updated successfully"
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
  getSalaryStructure,
  getAllSalaryStructures,
  upsertSalaryStructure,
  updateSalaryStructure,
  getPayrollSettings,
  updatePayrollSettings
};
