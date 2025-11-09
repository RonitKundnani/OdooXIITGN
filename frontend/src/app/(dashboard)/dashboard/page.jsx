"use client";

import { useState, useEffect } from 'react';
import StatsCard from '@/components/StatsCard';
import Card from '@/components/Card';
import DataTable from '@/components/DataTable';
import { BarChart } from '@/components/SimpleChart';
import { reportsAPI, attendanceAPI, leaveAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, hasPermission, showToast } = useApp();
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  // Dashboard data states
  const [stats, setStats] = useState({
    total_employees: 0,
    pending_leaves: 0,
    today_attendance: 0,
    recent_payruns: 0
  });
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
  }, []);

  // Update time every second (only on client)
  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [mounted]);

  // Load dashboard data
  useEffect(() => {
    if (!mounted || !user?.companyId) return;
    fetchDashboardData();
  }, [user, mounted]);

  const fetchDashboardData = async () => {
    if (!user?.companyId) return;
    
    setLoading(true);
    
    try {
      // Fetch dashboard stats
      const statsResult = await reportsAPI.getDashboardStats(user.companyId);
      if (statsResult.success) {
        setStats(statsResult.stats);
      }
      
      // Fetch weekly attendance for chart
      const attendanceResult = await reportsAPI.getAttendanceReport(user.companyId);
      if (attendanceResult.success && attendanceResult.weeklyStats) {
        setWeeklyAttendance(attendanceResult.weeklyStats);
      }
      
      // Fetch recent leave requests for activity
      const leaveResult = await leaveAPI.getLeaveRequests(user.companyId);
      if (leaveResult.success && leaveResult.requests) {
        // Transform to activity format
        const activities = leaveResult.requests.slice(0, 10).map(leave => ({
          action: `${leave.status === 'pending' ? 'Applied for' : leave.status === 'approved' ? 'Approved' : 'Rejected'} ${leave.leave_type}`,
          employee: `${leave.first_name} ${leave.last_name}`,
          date: new Date(leave.created_at).toLocaleString(),
          type: 'leave'
        }));
        setRecentActivity(activities);
      }
      
      // Fetch today's attendance status for current user
      if (user?.empId) {
        const todayResult = await attendanceAPI.getTodayStatus(user.empId);
        if (todayResult.success && todayResult.attendance) {
          setAttendanceStatus(todayResult.attendance);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Failed to load dashboard data', 'error');
    }
    
    setLoading(false);
  };

  const handleCheckIn = async () => {
    if (!user?.empId || !user?.companyId) {
      showToast('User information not available', 'error');
      return;
    }

    const result = await attendanceAPI.checkIn(user.empId, user.companyId);
    
    if (result.success) {
      showToast('Checked in successfully!', 'success');
      fetchDashboardData(); // Refresh all data
    } else {
      showToast(result.error || 'Failed to check in', 'error');
    }
  };

  const handleCheckOut = async () => {
    if (!user?.empId || !user?.companyId) {
      showToast('User information not available', 'error');
      return;
    }

    const result = await attendanceAPI.checkOut(user.empId, user.companyId);
    
    if (result.success) {
      showToast('Checked out successfully!', 'success');
      fetchDashboardData(); // Refresh all data
    } else {
      showToast(result.error || 'Failed to check out', 'error');
    }
  };

  // Transform weekly attendance data for chart
  const chartData = weeklyAttendance.map((week, index) => ({
    label: `Week ${index + 1}`,
    value: parseFloat(week.attendance_rate || 0)
  }));

  const activityColumns = [
    { key: 'action', label: 'Action', sortable: true },
    { key: 'employee', label: 'Employee', sortable: true },
    { key: 'date', label: 'Date & Time', sortable: true },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.type === 'leave' ? 'bg-blue-100 text-blue-800' :
          row.type === 'employee' ? 'bg-green-100 text-green-800' :
          row.type === 'payroll' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.type}
        </span>
      ),
    },
  ];

  if (loading && !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F2BED1] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>
        {mounted && currentTime && (
          <div className="text-sm text-gray-500">
            {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {hasPermission('view_dashboard') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Employees"
            value={stats.total_employees}
            icon={<EmployeesIcon />}
            color="blue"
          />
          <StatsCard
            title="Pending Leaves"
            value={stats.pending_leaves}
            icon={<LeavesIcon />}
            color="yellow"
          />
          <StatsCard
            title="Today's Attendance"
            value={stats.today_attendance}
            icon={<ApprovalsIcon />}
            color="green"
          />
          <StatsCard
            title="Recent Payruns"
            value={stats.recent_payruns}
            icon={<PayrollIcon />}
            color="purple"
          />
        </div>
      )}

      {/* Check In/Out Card */}
      <Card className="p-6 bg-gradient-to-r from-[#F9F5F6] to-[#F8E8EE]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Today's Attendance</h3>
            <div className="flex items-center gap-6">
              {attendanceStatus?.check_in && (
                <div>
                  <span className="text-sm text-gray-600">Check In: </span>
                  <span className="font-semibold text-green-600">
                    {new Date(attendanceStatus.check_in).toLocaleTimeString()}
                  </span>
                </div>
              )}
              {attendanceStatus?.check_out && (
                <div>
                  <span className="text-sm text-gray-600">Check Out: </span>
                  <span className="font-semibold text-red-600">
                    {new Date(attendanceStatus.check_out).toLocaleTimeString()}
                  </span>
                </div>
              )}
              {attendanceStatus?.work_hours && (
                <div>
                  <span className="text-sm text-gray-600">Hours: </span>
                  <span className="font-semibold text-blue-600">{attendanceStatus.work_hours}h</span>
                </div>
              )}
              {!attendanceStatus?.check_in && (
                <span className="text-sm text-gray-500">Not checked in yet</span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {!attendanceStatus?.check_in ? (
              <button
                onClick={handleCheckIn}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                <CheckInIcon />
                Check In
              </button>
            ) : !attendanceStatus?.check_out ? (
              <button
                onClick={handleCheckOut}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                <CheckOutIcon />
                Check Out
              </button>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Attendance Marked</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Attendance Rate (%)</h2>
          {chartData.length > 0 ? (
            <BarChart data={chartData} height={250} />
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              <div className="text-center">
                <p>No attendance data available</p>
                <p className="text-sm mt-2">Start marking attendance to see the chart</p>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {hasPermission('add_employee') && (
              <button
                onClick={() => router.push('/employees')}
                className="w-full bg-[#F2BED1] hover:bg-[#FDCEDF] text-white font-medium py-3 rounded-lg transition-colors"
              >
                Add Employee
              </button>
            )}
            {hasPermission('run_payroll') && (
              <button
                onClick={() => router.push('/payroll/run')}
                className="w-full bg-[#F8E8EE] hover:bg-[#FDCEDF] text-gray-900 font-medium py-3 rounded-lg transition-colors"
              >
                Run Payroll
              </button>
            )}
            {hasPermission('apply_leave') && (
              <button
                onClick={() => router.push('/leaves')}
                className="w-full bg-[#F8E8EE] hover:bg-[#FDCEDF] text-gray-900 font-medium py-3 rounded-lg transition-colors"
              >
                Apply Leave
              </button>
            )}
            {hasPermission('view_reports') && (
              <button
                onClick={() => router.push('/reports')}
                className="w-full bg-[#F8E8EE] hover:bg-[#FDCEDF] text-gray-900 font-medium py-3 rounded-lg transition-colors"
              >
                Export Report
              </button>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      {hasPermission('view_dashboard') && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <DataTable columns={activityColumns} data={recentActivity} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity</p>
              <p className="text-sm mt-2">Activity will appear here as employees use the system</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function EmployeesIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function LeavesIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ApprovalsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PayrollIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckInIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  );
}

function CheckOutIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
