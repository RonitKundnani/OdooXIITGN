async function checkUserExists(user_id, company_id, connection) {
  const [rows] = await connection.query(
    "SELECT id FROM users WHERE id = ? AND company_id = ?",
    [user_id, company_id]
  );
  return rows.length > 0;
}

async function createUserProfile(
  user_id,
  phone,
  date_of_birth,
  gender,
  marital_status,
  personal_email,
  address,
  nationality,
  profile_picture,
  connection
) {
  await connection.query(
    `INSERT INTO user_profiles (
      user_id, phone, date_of_birth, gender, marital_status,
      personal_email, address, nationality, profile_picture
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      phone || null,
      date_of_birth || null,
      gender || null,
      marital_status || null,
      personal_email || null,
      address || null,
      nationality || null,
      profile_picture || null
    ]
  );
}

async function createEmploymentDetails(
  user_id,
  department,
  job_position,
  manager_id,
  location,
  date_of_joining,
  work_schedule,
  connection
) {
  await connection.query(
    `INSERT INTO employment_details (
      user_id, department, job_position, manager_id,
      location, date_of_joining, work_schedule
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      department || null,
      job_position || null,
      manager_id || null,
      location || null,
      date_of_joining || null,
      work_schedule ? JSON.stringify(work_schedule) : null
    ]
  );
}

async function createFinancialDetails(
  user_id,
  bank_name,
  account_number,
  ifsc_code,
  pan_number,
  uan_number,
  connection
) {
  await connection.query(
    `INSERT INTO financial_details (
      user_id, bank_name, account_number, ifsc_code, pan_number, uan_number
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      bank_name || null,
      account_number || null,
      ifsc_code || null,
      pan_number || null,
      uan_number || null
    ]
  );
}

module.exports = {
  checkUserExists,
  createUserProfile,
  createEmploymentDetails,
  createFinancialDetails
};
