const { pool } = require("../config/database");
const attendanceModel = require("../models/attendanceModel");
const systemLogModel = require("../models/systemLogModel");

// Check in
async function checkIn(req, res) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { user_id, company_id } = req.body;

    if (!user_id || !company_id) {
      return res.status(400).json({ ok: false, error: "user_id and company_id are required" });
    }

    // Check if already checked in today
    const today = new Date().toISOString().split('T')[0];
    const existingAttendance = await attendanceModel.getTodayAttendance(user_id, today, connection);

    if (existingAttendance) {
      return res.status(400).json({ ok: false, error: "Already checked in today" });
    }

    // Create attendance record
    const attendanceId = await attendanceModel.checkIn(user_id, company_id, connection);

    await systemLogModel.createSystemLog(
      user_id,
      company_id,
      'CHECK_IN',
      `User checked in`,
      'attendance',
      connection
    );

    await connection.commit();

    return res.json({
      ok: true,
      message: "Checked in successfully",
      attendance_id: attendanceId
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  } finally {
    connection.release();
  }
}

// Check out
async function checkOut(req, res) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { user_id, company_id } = req.body;

    if (!user_id || !company_id) {
      return res.status(400).json({ ok: false, error: "user_id and company_id are required" });
    }

    // Get today's attendance
    const today = new Date().toISOString().split('T')[0];
    const attendance = await attendanceModel.getTodayAttendance(user_id, today, connection);

    if (!attendance) {
      return res.status(400).json({ ok: false, error: "No check-in found for today" });
    }

    if (attendance.check_out) {
      return res.status(400).json({ ok: false, error: "Already checked out today" });
    }

    // Update attendance with check out
    await attendanceModel.checkOut(attendance.id, connection);

    await systemLogModel.createSystemLog(
      user_id,
      company_id,
      'CHECK_OUT',
      `User checked out`,
      'attendance',
      connection
    );

    await connection.commit();

    return res.json({
      ok: true,
      message: "Checked out successfully"
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  } finally {
    connection.release();
  }
}

// Get today's attendance status
async function getTodayStatus(req, res) {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ ok: false, error: "user_id is required" });
    }

    const today = new Date().toISOString().split('T')[0];
    const attendance = await attendanceModel.getTodayAttendance(user_id, today, pool);

    return res.json({
      ok: true,
      attendance: attendance || null
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Get all attendance records
async function getAllAttendance(req, res) {
  try {
    const { company_id, user_id, start_date, end_date } = req.query;

    if (!company_id) {
      return res.status(400).json({ ok: false, error: "company_id is required" });
    }

    const attendance = await attendanceModel.getAllAttendance(
      company_id,
      user_id,
      start_date,
      end_date,
      pool
    );

    return res.json({
      ok: true,
      attendance
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Add/Edit attendance (Admin/HR only)
async function upsertAttendance(req, res) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const {
      id,
      user_id,
      company_id,
      date,
      check_in,
      check_out,
      status,
      admin_user_id
    } = req.body;

    if (!user_id || !company_id || !date || !admin_user_id) {
      return res.status(400).json({ 
        ok: false, 
        error: "user_id, company_id, date, and admin_user_id are required" 
      });
    }

    // Verify admin has permission
    const [adminRows] = await connection.query(
      "SELECT role FROM users WHERE id = ? AND company_id = ?",
      [admin_user_id, company_id]
    );

    if (!adminRows.length || !['admin', 'hr_officer'].includes(adminRows[0].role)) {
      return res.status(403).json({ ok: false, error: "Unauthorized" });
    }

    if (id) {
      // Update existing
      await attendanceModel.updateAttendance(id, check_in, check_out, status, connection);
      await systemLogModel.createSystemLog(
        admin_user_id,
        company_id,
        'ATTENDANCE_UPDATED',
        `Attendance updated for user ${user_id} on ${date}`,
        'attendance',
        connection
      );
    } else {
      // Create new
      await attendanceModel.createAttendance(
        user_id,
        company_id,
        date,
        check_in,
        check_out,
        status,
        connection
      );
      await systemLogModel.createSystemLog(
        admin_user_id,
        company_id,
        'ATTENDANCE_CREATED',
        `Attendance created for user ${user_id} on ${date}`,
        'attendance',
        connection
      );
    }

    await connection.commit();

    return res.json({
      ok: true,
      message: id ? "Attendance updated successfully" : "Attendance created successfully"
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  } finally {
    connection.release();
  }
}

// Delete attendance (Admin/HR only)
async function deleteAttendance(req, res) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { id } = req.params;
    const { admin_user_id, company_id } = req.body;

    if (!admin_user_id || !company_id) {
      return res.status(400).json({ ok: false, error: "admin_user_id and company_id are required" });
    }

    // Verify admin has permission
    const [adminRows] = await connection.query(
      "SELECT role FROM users WHERE id = ? AND company_id = ?",
      [admin_user_id, company_id]
    );

    if (!adminRows.length || !['admin', 'hr_officer'].includes(adminRows[0].role)) {
      return res.status(403).json({ ok: false, error: "Unauthorized" });
    }

    await attendanceModel.deleteAttendance(id, connection);

    await systemLogModel.createSystemLog(
      admin_user_id,
      company_id,
      'ATTENDANCE_DELETED',
      `Attendance record ${id} deleted`,
      'attendance',
      connection
    );

    await connection.commit();

    return res.json({
      ok: true,
      message: "Attendance deleted successfully"
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
  checkIn,
  checkOut,
  getTodayStatus,
  getAllAttendance,
  upsertAttendance,
  deleteAttendance
};
