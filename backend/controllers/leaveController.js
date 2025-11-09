const { pool } = require("../config/database");
const leaveModel = require("../models/leaveModel");
const systemLogModel = require("../models/systemLogModel");

// Get all leave types for a company
async function getLeaveTypes(req, res) {
  try {
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({ ok: false, error: "company_id is required" });
    }

    const leaveTypes = await leaveModel.getLeaveTypes(company_id, pool);

    return res.json({
      ok: true,
      leaveTypes
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Get leave allocations for a user
async function getLeaveAllocations(req, res) {
  try {
    const { user_id, year } = req.query;

    if (!user_id) {
      return res.status(400).json({ ok: false, error: "user_id is required" });
    }

    const currentYear = year || new Date().getFullYear();
    const allocations = await leaveModel.getLeaveAllocations(user_id, currentYear, pool);

    return res.json({
      ok: true,
      allocations
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Get all leave requests
async function getLeaveRequests(req, res) {
  try {
    const { company_id, user_id, status } = req.query;

    if (!company_id) {
      return res.status(400).json({ ok: false, error: "company_id is required" });
    }

    const requests = await leaveModel.getLeaveRequests(company_id, user_id, status, pool);

    return res.json({
      ok: true,
      requests
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Apply for leave
async function applyLeave(req, res) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const {
      user_id,
      company_id,
      leave_type_id,
      start_date,
      end_date,
      total_days,
      reason,
      attachment
    } = req.body;

    if (!user_id || !company_id || !leave_type_id || !start_date || !end_date || !total_days) {
      return res.status(400).json({ 
        ok: false, 
        error: "Required fields: user_id, company_id, leave_type_id, start_date, end_date, total_days" 
      });
    }

    // Check if user has enough leave balance
    const currentYear = new Date().getFullYear();
    const allocation = await leaveModel.getLeaveAllocation(user_id, leave_type_id, currentYear, connection);

    if (!allocation) {
      return res.status(400).json({ 
        ok: false, 
        error: "No leave allocation found for this leave type" 
      });
    }

    const availableDays = allocation.total_days - allocation.used_days;
    if (total_days > availableDays) {
      return res.status(400).json({ 
        ok: false, 
        error: `Insufficient leave balance. Available: ${availableDays} days` 
      });
    }

    // Create leave request
    const requestId = await leaveModel.createLeaveRequest(
      user_id,
      company_id,
      leave_type_id,
      start_date,
      end_date,
      total_days,
      reason,
      attachment,
      connection
    );

    await systemLogModel.createSystemLog(
      user_id,
      company_id,
      'LEAVE_APPLIED',
      `Leave request submitted for ${total_days} days`,
      'leave',
      connection
    );

    await connection.commit();

    return res.json({
      ok: true,
      message: "Leave request submitted successfully",
      request_id: requestId
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  } finally {
    connection.release();
  }
}

// Approve/Reject leave
async function updateLeaveStatus(req, res) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { id } = req.params;
    const { status, approved_by, company_id } = req.body;

    if (!status || !approved_by || !company_id) {
      return res.status(400).json({ 
        ok: false, 
        error: "status, approved_by, and company_id are required" 
      });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ ok: false, error: "Invalid status" });
    }

    // Verify approver has permission
    const [approverRows] = await connection.query(
      "SELECT role FROM users WHERE id = ? AND company_id = ?",
      [approved_by, company_id]
    );

    if (!approverRows.length || !['admin', 'hr_officer'].includes(approverRows[0].role)) {
      return res.status(403).json({ ok: false, error: "Unauthorized to approve/reject leaves" });
    }

    // Get leave request details
    const request = await leaveModel.getLeaveRequestById(id, connection);
    if (!request) {
      return res.status(404).json({ ok: false, error: "Leave request not found" });
    }

    // Update leave request status
    await leaveModel.updateLeaveStatus(id, status, approved_by, connection);

    // If approved, update leave allocation
    if (status === 'approved') {
      await leaveModel.updateLeaveAllocation(
        request.user_id,
        request.leave_type_id,
        new Date(request.start_date).getFullYear(),
        request.total_days,
        connection
      );
    }

    await systemLogModel.createSystemLog(
      approved_by,
      company_id,
      status === 'approved' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
      `Leave request ${id} ${status} by ${approved_by}`,
      'leave',
      connection
    );

    await connection.commit();

    return res.json({
      ok: true,
      message: `Leave request ${status} successfully`
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  } finally {
    connection.release();
  }
}

// Cancel leave request
async function cancelLeaveRequest(req, res) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { id } = req.params;
    const { user_id, company_id } = req.body;

    if (!user_id || !company_id) {
      return res.status(400).json({ ok: false, error: "user_id and company_id are required" });
    }

    // Get leave request
    const request = await leaveModel.getLeaveRequestById(id, connection);
    if (!request) {
      return res.status(404).json({ ok: false, error: "Leave request not found" });
    }

    // Verify user owns this request
    if (request.user_id !== user_id) {
      return res.status(403).json({ ok: false, error: "Unauthorized" });
    }

    // Can only cancel pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({ 
        ok: false, 
        error: "Can only cancel pending leave requests" 
      });
    }

    await leaveModel.deleteLeaveRequest(id, connection);

    await systemLogModel.createSystemLog(
      user_id,
      company_id,
      'LEAVE_CANCELLED',
      `Leave request ${id} cancelled`,
      'leave',
      connection
    );

    await connection.commit();

    return res.json({
      ok: true,
      message: "Leave request cancelled successfully"
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
  getLeaveTypes,
  getLeaveAllocations,
  getLeaveRequests,
  applyLeave,
  updateLeaveStatus,
  cancelLeaveRequest
};
