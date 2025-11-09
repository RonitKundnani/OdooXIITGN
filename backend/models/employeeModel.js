async function getUserById(user_id, connection) {
  const [rows] = await connection.query(
    "SELECT id, company_id, first_name, last_name, email, role FROM users WHERE id = ?",
    [user_id]
  );
  return rows.length > 0 ? rows[0] : null;
}

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

async function getAllEmployees(company_id, connection) {
  const [rows] = await connection.query(
    `SELECT 
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.role,
      u.is_active,
      u.created_at,
      u.last_login,
      up.phone,
      up.date_of_birth,
      up.gender,
      up.profile_picture,
      ed.department,
      ed.job_position,
      ed.location,
      ed.date_of_joining,
      ed.manager_id
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    LEFT JOIN employment_details ed ON u.id = ed.user_id
    WHERE u.company_id = ?
    ORDER BY u.created_at DESC`,
    [company_id]
  );
  return rows;
}

async function getEmployeeById(user_id, company_id, connection) {
  const [rows] = await connection.query(
    `SELECT 
      u.id,
      u.company_id,
      u.email,
      u.first_name,
      u.last_name,
      u.role,
      u.is_active,
      u.created_at,
      u.last_login,
      up.phone,
      up.date_of_birth,
      up.gender,
      up.marital_status,
      up.personal_email,
      up.address,
      up.nationality,
      up.profile_picture,
      ed.department,
      ed.job_position,
      ed.manager_id,
      ed.location,
      ed.date_of_joining,
      ed.work_schedule,
      fd.bank_name,
      fd.account_number,
      fd.ifsc_code,
      fd.pan_number,
      fd.uan_number
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    LEFT JOIN employment_details ed ON u.id = ed.user_id
    LEFT JOIN financial_details fd ON u.id = fd.user_id
    WHERE u.id = ? AND u.company_id = ?`,
    [user_id, company_id]
  );
  return rows.length > 0 ? rows[0] : null;
}

async function updateUser(
  user_id,
  first_name,
  last_name,
  email,
  connection
) {
  const updates = [];
  const values = [];

  if (first_name !== undefined) {
    updates.push('first_name = ?');
    values.push(first_name);
  }
  if (last_name !== undefined) {
    updates.push('last_name = ?');
    values.push(last_name);
  }
  if (email !== undefined) {
    updates.push('email = ?');
    values.push(email);
  }

  if (updates.length > 0) {
    values.push(user_id);
    await connection.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }
}

async function updateUserProfile(
  user_id,
  phone,
  date_of_birth,
  gender,
  marital_status,
  personal_email,
  address,
  nationality,
  connection
) {
  const updates = [];
  const values = [];

  if (phone !== undefined) {
    updates.push('phone = ?');
    values.push(phone);
  }
  if (date_of_birth !== undefined) {
    updates.push('date_of_birth = ?');
    values.push(date_of_birth);
  }
  if (gender !== undefined) {
    updates.push('gender = ?');
    values.push(gender);
  }
  if (marital_status !== undefined) {
    updates.push('marital_status = ?');
    values.push(marital_status);
  }
  if (personal_email !== undefined) {
    updates.push('personal_email = ?');
    values.push(personal_email);
  }
  if (address !== undefined) {
    updates.push('address = ?');
    values.push(address);
  }
  if (nationality !== undefined) {
    updates.push('nationality = ?');
    values.push(nationality);
  }

  if (updates.length > 0) {
    values.push(user_id);
    await connection.query(
      `UPDATE user_profiles SET ${updates.join(', ')} WHERE user_id = ?`,
      values
    );
  }
}

async function updateEmploymentDetails(
  user_id,
  department,
  job_position,
  location,
  connection
) {
  const updates = [];
  const values = [];

  if (department !== undefined) {
    updates.push('department = ?');
    values.push(department);
  }
  if (job_position !== undefined) {
    updates.push('job_position = ?');
    values.push(job_position);
  }
  if (location !== undefined) {
    updates.push('location = ?');
    values.push(location);
  }

  if (updates.length > 0) {
    values.push(user_id);
    await connection.query(
      `UPDATE employment_details SET ${updates.join(', ')} WHERE user_id = ?`,
      values
    );
  }
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  getUserById,
  checkUserExists,
  createUserProfile,
  createEmploymentDetails,
  createFinancialDetails,
  updateUser,
  updateUserProfile,
  updateEmploymentDetails
};
