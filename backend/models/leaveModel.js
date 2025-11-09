// Get leave types for a company
async function getLeaveTypes(company_id, connection) {
  const [rows] = await connection.query(
    "SELECT * FROM leave_types WHERE company_id = ? ORDER BY name",
    [company_id]
  );
  return rows;
}

// Get leave allocations for a user
async function getLeaveAllocations(user_id, year, connection) {
  const [rows] = await connection.query(
    `SELECT 
      la.*,
      lt.name as leave_type_name,
      lt.is_paid
    FROM leave_allocations la
    JOIN leave_types lt ON la.leave_type_id = lt.id
    WHERE la.user_id = ? AND la.year = ?
    ORDER BY lt.name`,
    [user_id, year]
  );
  return rows;
}

// Get single leave allocation
async function getLeaveAllocation(user_id, leave_type_id, year, connection) {
  const [rows] = await connection.query(
    `SELECT * FROM leave_allocations 
     WHERE user_id = ? AND leave_type_id = ? AND year = ?`,
    [user_id, leave_type_id, year]
  );
  return rows.length > 0 ? rows[0] : null;
}

// Get leave requests
async function getLeaveRequests(company_id, user_id, status, connection) {
  let query = `
    SELECT 
      lr.*,
      u.first_name,
      u.last_name,
      u.email,
      lt.name as leave_type_name,
      lt.is_paid,
      approver.first_name as approver_first_name,
      approver.last_name as approver_last_name
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.id
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    LEFT JOIN users approver ON lr.approved_by = approver.id
    WHERE lr.company_id = ?
  `;
  
  const params = [company_id];
  
  if (user_id) {
    query += ' AND lr.user_id = ?';
    params.push(user_id);
  }
  
  if (status) {
    query += ' AND lr.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY lr.created_at DESC';
  
  const [rows] = await connection.query(query, params);
  return rows;
}

// Get leave request by ID
async function getLeaveRequestById(id, connection) {
  const [rows] = await connection.query(
    "SELECT * FROM leave_requests WHERE id = ?",
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

// Create leave request
async function createLeaveRequest(
  user_id,
  company_id,
  leave_type_id,
  start_date,
  end_date,
  total_days,
  reason,
  attachment,
  connection
) {
  const [result] = await connection.query(
    `INSERT INTO leave_requests 
     (user_id, company_id, leave_type_id, start_date, end_date, total_days, reason, attachment, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [user_id, company_id, leave_type_id, start_date, end_date, total_days, reason, attachment]
  );
  return result.insertId;
}

// Update leave status
async function updateLeaveStatus(id, status, approved_by, connection) {
  await connection.query(
    "UPDATE leave_requests SET status = ?, approved_by = ? WHERE id = ?",
    [status, approved_by, id]
  );
}

// Update leave allocation (deduct used days)
async function updateLeaveAllocation(user_id, leave_type_id, year, days_used, connection) {
  await connection.query(
    "UPDATE leave_allocations SET used_days = used_days + ? WHERE user_id = ? AND leave_type_id = ? AND year = ?",
    [days_used, user_id, leave_type_id, year]
  );
}

// Delete leave request
async function deleteLeaveRequest(id, connection) {
  await connection.query("DELETE FROM leave_requests WHERE id = ?", [id]);
}

// Create leave type (Admin only)
async function createLeaveType(company_id, name, description, is_paid, connection) {
  const [result] = await connection.query(
    "INSERT INTO leave_types (company_id, name, description, is_paid) VALUES (?, ?, ?, ?)",
    [company_id, name, description, is_paid]
  );
  return result.insertId;
}

// Create leave allocation (Admin/HR only)
async function createLeaveAllocation(user_id, leave_type_id, total_days, year, connection) {
  const [result] = await connection.query(
    "INSERT INTO leave_allocations (user_id, leave_type_id, total_days, used_days, year) VALUES (?, ?, ?, 0, ?)",
    [user_id, leave_type_id, total_days, year]
  );
  return result.insertId;
}

module.exports = {
  getLeaveTypes,
  getLeaveAllocations,
  getLeaveAllocation,
  getLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  updateLeaveStatus,
  updateLeaveAllocation,
  deleteLeaveRequest,
  createLeaveType,
  createLeaveAllocation
};
