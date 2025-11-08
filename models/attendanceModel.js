// Check in
async function checkIn(user_id, company_id, connection) {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  
  const [result] = await connection.query(
    `INSERT INTO attendance (user_id, company_id, check_in, date, status) 
     VALUES (?, ?, ?, ?, 'present')`,
    [user_id, company_id, now, date]
  );
  
  return result.insertId;
}

// Check out
async function checkOut(attendance_id, connection) {
  const now = new Date();
  
  // Get check_in time
  const [rows] = await connection.query(
    "SELECT check_in FROM attendance WHERE id = ?",
    [attendance_id]
  );
  
  if (rows.length === 0) {
    throw new Error('Attendance record not found');
  }
  
  const checkIn = new Date(rows[0].check_in);
  const checkOut = now;
  
  // Calculate work hours
  const diffMs = checkOut - checkIn;
  const workHours = (diffMs / (1000 * 60 * 60)).toFixed(2);
  
  // Calculate extra hours (assuming 8 hour workday)
  const extraHours = Math.max(0, workHours - 8).toFixed(2);
  
  await connection.query(
    `UPDATE attendance 
     SET check_out = ?, work_hours = ?, extra_hours = ? 
     WHERE id = ?`,
    [now, workHours, extraHours, attendance_id]
  );
}

// Get today's attendance
async function getTodayAttendance(user_id, date, connection) {
  const [rows] = await connection.query(
    `SELECT * FROM attendance 
     WHERE user_id = ? AND date = ?`,
    [user_id, date]
  );
  
  return rows.length > 0 ? rows[0] : null;
}

// Get all attendance
async function getAllAttendance(company_id, user_id, start_date, end_date, connection) {
  let query = `
    SELECT 
      a.*,
      u.first_name,
      u.last_name,
      u.email
    FROM attendance a
    JOIN users u ON a.user_id = u.id
    WHERE a.company_id = ?
  `;
  
  const params = [company_id];
  
  if (user_id) {
    query += ' AND a.user_id = ?';
    params.push(user_id);
  }
  
  if (start_date) {
    query += ' AND a.date >= ?';
    params.push(start_date);
  }
  
  if (end_date) {
    query += ' AND a.date <= ?';
    params.push(end_date);
  }
  
  query += ' ORDER BY a.date DESC, a.check_in DESC';
  
  const [rows] = await connection.query(query, params);
  return rows;
}

// Create attendance (Admin/HR)
async function createAttendance(user_id, company_id, date, check_in, check_out, status, connection) {
  let workHours = null;
  let extraHours = null;
  
  if (check_in && check_out) {
    const checkInTime = new Date(check_in);
    const checkOutTime = new Date(check_out);
    const diffMs = checkOutTime - checkInTime;
    workHours = (diffMs / (1000 * 60 * 60)).toFixed(2);
    extraHours = Math.max(0, workHours - 8).toFixed(2);
  }
  
  const [result] = await connection.query(
    `INSERT INTO attendance (user_id, company_id, date, check_in, check_out, work_hours, extra_hours, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, company_id, date, check_in, check_out, workHours, extraHours, status || 'present']
  );
  
  return result.insertId;
}

// Update attendance (Admin/HR)
async function updateAttendance(id, check_in, check_out, status, connection) {
  let workHours = null;
  let extraHours = null;
  
  if (check_in && check_out) {
    const checkInTime = new Date(check_in);
    const checkOutTime = new Date(check_out);
    const diffMs = checkOutTime - checkInTime;
    workHours = (diffMs / (1000 * 60 * 60)).toFixed(2);
    extraHours = Math.max(0, workHours - 8).toFixed(2);
  }
  
  const updates = [];
  const values = [];
  
  if (check_in !== undefined) {
    updates.push('check_in = ?');
    values.push(check_in);
  }
  if (check_out !== undefined) {
    updates.push('check_out = ?');
    values.push(check_out);
  }
  if (workHours !== null) {
    updates.push('work_hours = ?');
    values.push(workHours);
  }
  if (extraHours !== null) {
    updates.push('extra_hours = ?');
    values.push(extraHours);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
  }
  
  if (updates.length > 0) {
    values.push(id);
    await connection.query(
      `UPDATE attendance SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }
}

// Delete attendance
async function deleteAttendance(id, connection) {
  await connection.query("DELETE FROM attendance WHERE id = ?", [id]);
}

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getAllAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance
};
