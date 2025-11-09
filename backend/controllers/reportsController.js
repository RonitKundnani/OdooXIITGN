const { pool } = require("../config/database");

// Get attendance report
async function getAttendanceReport(req, res) {
  try {
    const { company_id, start_date, end_date } = req.query;

    if (!company_id) {
      return res.status(400).json({ ok: false, error: "company_id is required" });
    }

    // Get attendance data with employee details
    let query = `
      SELECT 
        a.id,
        a.date,
        a.check_in,
        a.check_out,
        a.work_hours,
        a.status,
        u.id as user_id,
        u.first_name,
        u.last_name,
        ed.department
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN employment_details ed ON u.id = ed.user_id
      WHERE a.company_id = ?
    `;

    const params = [company_id];

    if (start_date) {
      query += ' AND a.date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND a.date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY a.date DESC, u.first_name';

    const [attendance] = await pool.query(query, params);

    // Calculate weekly attendance rate
    const weeklyQuery = `
      SELECT 
        WEEK(date, 1) as week_num,
        YEAR(date) as year,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
        COUNT(*) as total_count,
        ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END) / COUNT(*)) * 100, 2) as attendance_rate
      FROM attendance
      WHERE company_id = ?
      ${start_date ? 'AND date >= ?' : ''}
      ${end_date ? 'AND date <= ?' : ''}
      GROUP BY YEAR(date), WEEK(date, 1)
      ORDER BY year DESC, week_num DESC
      LIMIT 4
    `;

    const weeklyParams = [company_id];
    if (start_date) weeklyParams.push(start_date);
    if (end_date) weeklyParams.push(end_date);

    const [weeklyStats] = await pool.query(weeklyQuery, weeklyParams);

    return res.json({
      ok: true,
      attendance,
      weeklyStats: weeklyStats.reverse() // Reverse to show oldest to newest
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Get leave report
async function getLeaveReport(req, res) {
  try {
    const { company_id, start_date, end_date, status } = req.query;

    if (!company_id) {
      return res.status(400).json({ ok: false, error: "company_id is required" });
    }

    // Get leave requests with employee details
    let query = `
      SELECT 
        lr.id,
        lr.start_date,
        lr.end_date,
        lr.total_days,
        lr.reason,
        lr.status,
        lr.created_at,
        u.id as user_id,
        u.first_name,
        u.last_name,
        lt.name as leave_type,
        ed.department
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      LEFT JOIN employment_details ed ON u.id = ed.user_id
      WHERE lr.company_id = ?
    `;

    const params = [company_id];

    if (start_date) {
      query += ' AND lr.start_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND lr.end_date <= ?';
      params.push(end_date);
    }

    if (status) {
      query += ' AND lr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY lr.created_at DESC';

    const [leaves] = await pool.query(query, params);

    // Get leave distribution by type
    const distributionQuery = `
      SELECT 
        lt.name as leave_type,
        COUNT(lr.id) as count,
        SUM(lr.total_days) as total_days
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      WHERE lr.company_id = ?
      ${start_date ? 'AND lr.start_date >= ?' : ''}
      ${end_date ? 'AND lr.end_date <= ?' : ''}
      ${status ? 'AND lr.status = ?' : ''}
      GROUP BY lt.id, lt.name
    `;

    const distParams = [company_id];
    if (start_date) distParams.push(start_date);
    if (end_date) distParams.push(end_date);
    if (status) distParams.push(status);

    const [distribution] = await pool.query(distributionQuery, distParams);

    return res.json({
      ok: true,
      leaves,
      distribution
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Get payroll report
async function getPayrollReport(req, res) {
  try {
    const { company_id, start_date, end_date } = req.query;

    if (!company_id) {
      return res.status(400).json({ ok: false, error: "company_id is required" });
    }

    // Get payslips with employee details
    let query = `
      SELECT 
        ps.id,
        ps.basic_salary,
        ps.gross_salary,
        ps.total_deductions,
        ps.net_salary,
        ps.paid_days,
        ps.total_working_days,
        u.id as user_id,
        u.first_name,
        u.last_name,
        ed.department,
        pr.name as payrun_name,
        pr.pay_period_start,
        pr.pay_period_end
      FROM payslips ps
      JOIN payruns pr ON ps.payrun_id = pr.id
      JOIN users u ON ps.user_id = u.id
      LEFT JOIN employment_details ed ON u.id = ed.user_id
      WHERE pr.company_id = ?
    `;

    const params = [company_id];

    if (start_date) {
      query += ' AND pr.pay_period_start >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND pr.pay_period_end <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY pr.pay_period_end DESC, u.first_name';

    const [payslips] = await pool.query(query, params);

    // Get monthly payroll trends
    const trendQuery = `
      SELECT 
        DATE_FORMAT(pr.pay_period_end, '%Y-%m') as month,
        DATE_FORMAT(pr.pay_period_end, '%b %Y') as month_label,
        COUNT(DISTINCT ps.id) as employee_count,
        SUM(ps.gross_salary) as total_gross,
        SUM(ps.total_deductions) as total_deductions,
        SUM(ps.net_salary) as total_net
      FROM payslips ps
      JOIN payruns pr ON ps.payrun_id = pr.id
      WHERE pr.company_id = ?
      ${start_date ? 'AND pr.pay_period_start >= ?' : ''}
      ${end_date ? 'AND pr.pay_period_end <= ?' : ''}
      GROUP BY DATE_FORMAT(pr.pay_period_end, '%Y-%m'), DATE_FORMAT(pr.pay_period_end, '%b %Y')
      ORDER BY month DESC
      LIMIT 12
    `;

    const trendParams = [company_id];
    if (start_date) trendParams.push(start_date);
    if (end_date) trendParams.push(end_date);

    const [trends] = await pool.query(trendQuery, trendParams);

    // Calculate totals
    const totals = {
      total_gross: payslips.reduce((sum, p) => sum + parseFloat(p.gross_salary || 0), 0),
      total_deductions: payslips.reduce((sum, p) => sum + parseFloat(p.total_deductions || 0), 0),
      total_net: payslips.reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0),
      employee_count: new Set(payslips.map(p => p.user_id)).size
    };

    return res.json({
      ok: true,
      payslips,
      trends: trends.reverse(), // Reverse to show oldest to newest
      totals
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Get dashboard statistics
async function getDashboardStats(req, res) {
  try {
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({ ok: false, error: "company_id is required" });
    }

    // Total employees
    const [employeeCount] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE company_id = ? AND is_active = TRUE',
      [company_id]
    );

    // Pending leaves
    const [pendingLeaves] = await pool.query(
      'SELECT COUNT(*) as count FROM leave_requests WHERE company_id = ? AND status = "pending"',
      [company_id]
    );

    // Today's attendance
    const today = new Date().toISOString().split('T')[0];
    const [todayAttendance] = await pool.query(
      'SELECT COUNT(*) as count FROM attendance WHERE company_id = ? AND date = ? AND status = "present"',
      [company_id, today]
    );

    // Recent payruns
    const [recentPayruns] = await pool.query(
      'SELECT COUNT(*) as count FROM payruns WHERE company_id = ? AND status = "validated" AND pay_period_end >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
      [company_id]
    );

    return res.json({
      ok: true,
      stats: {
        total_employees: employeeCount[0].count,
        pending_leaves: pendingLeaves[0].count,
        today_attendance: todayAttendance[0].count,
        recent_payruns: recentPayruns[0].count
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = {
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
  getDashboardStats
};
