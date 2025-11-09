// Salary Structure Model

// Get salary structure for a user
async function getSalaryStructure(user_id, connection) {
  const [rows] = await connection.query(
    `SELECT * FROM salary_structures 
     WHERE user_id = ? AND is_active = TRUE 
     ORDER BY effective_from DESC LIMIT 1`,
    [user_id]
  );
  return rows.length > 0 ? rows[0] : null;
}

// Get all salary structures for a company
async function getAllSalaryStructures(company_id, connection) {
  const [rows] = await connection.query(
    `SELECT 
      ss.*,
      u.first_name,
      u.last_name,
      u.email,
      ed.department,
      ed.job_position
    FROM salary_structures ss
    JOIN users u ON ss.user_id = u.id
    LEFT JOIN employment_details ed ON u.id = ed.user_id
    WHERE u.company_id = ? AND ss.is_active = TRUE
    ORDER BY u.first_name, u.last_name`,
    [company_id]
  );
  return rows;
}

// Get salary components for a structure
async function getSalaryComponents(salary_structure_id, connection) {
  const [rows] = await connection.query(
    `SELECT * FROM salary_components 
     WHERE salary_structure_id = ? 
     ORDER BY component_type, component_name`,
    [salary_structure_id]
  );
  return rows;
}

// Create salary structure
async function createSalaryStructure(user_id, monthly_wage, yearly_wage, effective_from, working_days_per_week, break_time_hours, connection) {
  // Deactivate old structures
  await connection.query(
    "UPDATE salary_structures SET is_active = FALSE WHERE user_id = ?",
    [user_id]
  );

  const [result] = await connection.query(
    `INSERT INTO salary_structures 
     (user_id, monthly_wage, yearly_wage, effective_from, working_days_per_week, break_time_hours, is_active) 
     VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
    [user_id, monthly_wage, yearly_wage, effective_from, working_days_per_week || 5, break_time_hours || 1]
  );
  return result.insertId;
}

// Update salary structure
async function updateSalaryStructure(id, monthly_wage, yearly_wage, working_days_per_week, break_time_hours, connection) {
  await connection.query(
    `UPDATE salary_structures 
     SET monthly_wage = ?, yearly_wage = ?, working_days_per_week = ?, break_time_hours = ?
     WHERE id = ?`,
    [monthly_wage, yearly_wage, working_days_per_week, break_time_hours, id]
  );
}

// Create salary component
async function createSalaryComponent(salary_structure_id, component_name, component_type, calculation_type, value, connection) {
  const [result] = await connection.query(
    `INSERT INTO salary_components 
     (salary_structure_id, component_name, component_type, calculation_type, value) 
     VALUES (?, ?, ?, ?, ?)`,
    [salary_structure_id, component_name, component_type, calculation_type, value]
  );
  return result.insertId;
}

// Delete all components for a structure
async function deleteSalaryComponents(salary_structure_id, connection) {
  await connection.query(
    "DELETE FROM salary_components WHERE salary_structure_id = ?",
    [salary_structure_id]
  );
}

// Get company payroll settings
async function getPayrollSettings(company_id, connection) {
  const [rows] = await connection.query(
    `SELECT setting_key, setting_value, setting_type 
     FROM company_settings 
     WHERE company_id = ? AND setting_key LIKE 'payroll_%'`,
    [company_id]
  );
  
  const settings = {};
  rows.forEach(row => {
    let value = row.setting_value;
    if (row.setting_type === 'number') value = parseFloat(value);
    if (row.setting_type === 'boolean') value = value === 'true';
    settings[row.setting_key] = value;
  });
  
  return settings;
}

// Update payroll settings
async function updatePayrollSettings(company_id, settings, connection) {
  for (const [key, value] of Object.entries(settings)) {
    const setting_type = typeof value === 'number' ? 'number' : 
                        typeof value === 'boolean' ? 'boolean' : 'string';
    
    await connection.query(
      `INSERT INTO company_settings (company_id, setting_key, setting_value, setting_type)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = ?, setting_type = ?`,
      [company_id, key, String(value), setting_type, String(value), setting_type]
    );
  }
}

module.exports = {
  getSalaryStructure,
  getAllSalaryStructures,
  getSalaryComponents,
  createSalaryStructure,
  updateSalaryStructure,
  createSalaryComponent,
  deleteSalaryComponents,
  getPayrollSettings,
  updatePayrollSettings
};
