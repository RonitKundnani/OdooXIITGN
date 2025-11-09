async function findUserByEmail(email, connection) {
  const [rows] = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows;
}

// async function findUserByEmpID(empId, connection) {
//   const [rows] = await connection.query("SELECT * FROM users WHERE employee_id = ?", [empId]);
//   return rows;
// }

async function findUserByCompanyAndEmail(company_id, email, connection) {
  const [rows] = await connection.query(
    "SELECT id FROM users WHERE company_id = ? AND email = ?",
    [company_id, email]
  );
  return rows;
}

async function createUser(id, company_id, email, password_hash, first_name, last_name, role, connection) {
  await connection.query(
    "INSERT INTO users (id, company_id, email, password_hash, first_name, last_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)",
    [id, company_id, email, password_hash, first_name, last_name, role]
  );
}

async function createUserProfile(user_id, phone, connection) {
  await connection.query(
    "INSERT INTO user_profiles (user_id, phone) VALUES (?, ?)", 
    [user_id, phone || null]
  );
}

async function createEmploymentDetails(user_id, department, job_position, connection) {
  await connection.query(
    "INSERT INTO employment_details (user_id, department, job_position, date_of_joining) VALUES (?, ?, ?, CURDATE())",
    [user_id, department, job_position]
  );
}

async function createFinancialDetails(user_id, connection) {
  await connection.query("INSERT INTO financial_details (user_id) VALUES (?)", [user_id]);
}

async function createUserSettings(user_id, connection) {
  await connection.query(
    "INSERT INTO user_settings (user_id, email_notifications, theme, language) VALUES (?, TRUE, 'light', 'en')",
    [user_id]
  );
}

async function updateLastLogin(user_id, connection) {
  await connection.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [user_id]);
}

module.exports = {
  findUserByEmail,
  findUserByCompanyAndEmail,
  createUser,
  createUserProfile,
  createEmploymentDetails,
  createFinancialDetails,
  createUserSettings,
  updateLastLogin
};
