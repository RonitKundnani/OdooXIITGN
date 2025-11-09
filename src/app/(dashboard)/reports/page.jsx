"use client";

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Tabs from '@/components/Tabs';
import DataTable from '@/components/DataTable';
import { BarChart } from '@/components/SimpleChart';
import { reportsAPI } from '@/lib/api';
import { exportToCSV, formatCurrency } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function ReportsPage() {
  const { showToast, user } = useApp();
  const [activeTab, setActiveTab] = useState('attendance');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceWeekly, setAttendanceWeekly] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [leaveDistribution, setLeaveDistribution] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [payrollTrends, setPayrollTrends] = useState([]);
  const [payrollTotals, setPayrollTotals] = useState({ total_gross: 0, total_deductions: 0, total_net: 0 });

  // Fetch data on mount and tab change
  useEffect(() => {
    if (user?.companyId) {
      fetchReportData();
    }
  }, [user, activeTab]);

  const fetchReportData = async () => {
    if (!user?.companyId) return;
    
    setLoading(true);
    
    try {
      if (activeTab === 'attendance') {
        const result = await reportsAPI.getAttendanceReport(user.companyId);
        if (result.success) {
          setAttendanceData(result.attendance);
          setAttendanceWeekly(result.weeklyStats);
        } else {
          showToast(result.error || 'Failed to load attendance report', 'error');
        }
      } else if (activeTab === 'leave') {
        const result = await reportsAPI.getLeaveReport(user.companyId);
        if (result.success) {
          setLeaveData(result.leaves);
          setLeaveDistribution(result.distribution);
        } else {
          showToast(result.error || 'Failed to load leave report', 'error');
        }
      } else if (activeTab === 'payroll') {
        const result = await reportsAPI.getPayrollReport(user.companyId);
        if (result.success) {
          setPayrollData(result.payslips);
          setPayrollTrends(result.trends);
          setPayrollTotals(result.totals);
        } else {
          showToast(result.error || 'Failed to load payroll report', 'error');
        }
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      showToast('Failed to load report data', 'error');
    }
    
    setLoading(false);
  };

  const tabs = [
    { id: 'attendance', label: 'Attendance' },
    { id: 'leave', label: 'Leave' },
    { id: 'payroll', label: 'Payroll' },
  ];

  // Transform data for charts
  const attendanceChartData = attendanceWeekly.map((week, index) => ({
    label: `Week ${index + 1}`,
    value: parseFloat(week.attendance_rate || 0)
  }));

  const leaveChartData = leaveDistribution.map(dist => ({
    label: dist.leave_type,
    value: parseInt(dist.total_days || 0)
  }));

  const payrollChartData = payrollTrends.map(trend => ({
    label: trend.month_label || trend.month,
    value: parseFloat(trend.total_net || 0)
  }));

  // Transform attendance data for table
  const attendanceTableData = attendanceData.map(att => ({
    employee: `${att.first_name} ${att.last_name}`,
    date: new Date(att.date).toLocaleDateString(),
    checkIn: att.check_in ? new Date(att.check_in).toLocaleTimeString() : '-',
    checkOut: att.check_out ? new Date(att.check_out).toLocaleTimeString() : '-',
    hours: att.work_hours ? parseFloat(att.work_hours).toFixed(2) : '-',
    status: att.status,
  }));

  const attendanceColumns = [
    { key: 'employee', label: 'Employee', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'checkIn', label: 'Check In', sortable: true },
    { key: 'checkOut', label: 'Check Out', sortable: true },
    { key: 'hours', label: 'Hours', sortable: true },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'present' ? 'bg-green-100 text-green-800' :
          row.status === 'absent' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status}
        </span>
      )
    },
  ];

  // Transform leave data for table
  const leaveTableData = leaveData.map(leave => ({
    employee: `${leave.first_name} ${leave.last_name}`,
    type: leave.leave_type,
    from: new Date(leave.start_date).toLocaleDateString(),
    to: new Date(leave.end_date).toLocaleDateString(),
    days: parseFloat(leave.total_days).toFixed(1),
    status: leave.status,
  }));

  const leaveColumns = [
    { key: 'employee', label: 'Employee', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'from', label: 'From', sortable: true },
    { key: 'to', label: 'To', sortable: true },
    { key: 'days', label: 'Days', sortable: true },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'approved' ? 'bg-green-100 text-green-800' :
          row.status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status}
        </span>
      )
    },
  ];

  // Transform payroll data for table
  const payrollTableData = payrollData.map(payslip => ({
    employee: `${payslip.first_name} ${payslip.last_name}`,
    empId: payslip.user_id,
    gross: parseFloat(payslip.gross_salary || 0),
    deductions: parseFloat(payslip.total_deductions || 0),
    net: parseFloat(payslip.net_salary || 0),
  }));

  const payrollColumns = [
    { key: 'employee', label: 'Employee', sortable: true },
    { key: 'empId', label: 'Emp ID', sortable: true },
    {
      key: 'gross',
      label: 'Gross',
      sortable: true,
      render: (row) => formatCurrency(row.gross),
    },
    {
      key: 'deductions',
      label: 'Deductions',
      sortable: true,
      render: (row) => formatCurrency(row.deductions),
    },
    {
      key: 'net',
      label: 'Net Pay',
      sortable: true,
      render: (row) => formatCurrency(row.net),
    },
  ];

  const handleExport = () => {
    let data, filename;
    if (activeTab === 'attendance') {
      data = attendanceTableData;
      filename = 'attendance_report';
    } else if (activeTab === 'leave') {
      data = leaveTableData;
      filename = 'leave_report';
    } else {
      data = payrollTableData;
      filename = 'payroll_report';
    }
    exportToCSV(data, filename);
    showToast('Report exported successfully!', 'success');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F2BED1] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="bg-[#F2BED1] hover:bg-[#FDCEDF] text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Export CSV
        </button>
      </div>

      <Card className="p-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-6 space-y-6">
          {activeTab === 'attendance' && (
            <>
              {attendanceChartData.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Weekly Attendance Rate (%)</h3>
                  <BarChart data={attendanceChartData} height={250} />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No attendance data available for chart
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold mb-4">Attendance Details</h3>
                {attendanceTableData.length > 0 ? (
                  <DataTable columns={attendanceColumns} data={attendanceTableData} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No attendance records found
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'leave' && (
            <>
              {leaveChartData.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Leave Distribution (Days)</h3>
                  <BarChart data={leaveChartData} height={250} />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No leave data available for chart
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold mb-4">Leave Details</h3>
                {leaveTableData.length > 0 ? (
                  <DataTable columns={leaveColumns} data={leaveTableData} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No leave requests found
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'payroll' && (
            <>
              {payrollChartData.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Monthly Payroll Trend</h3>
                  <BarChart data={payrollChartData} height={250} />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No payroll data available for chart
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-[#F8E8EE]">
                  <div className="text-sm text-gray-600 mb-1">Total Gross</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(payrollTotals.total_gross)}
                  </div>
                </Card>
                <Card className="p-6 bg-[#F8E8EE]">
                  <div className="text-sm text-gray-600 mb-1">Total Deductions</div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(payrollTotals.total_deductions)}
                  </div>
                </Card>
                <Card className="p-6 bg-[#F8E8EE]">
                  <div className="text-sm text-gray-600 mb-1">Total Net Pay</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(payrollTotals.total_net)}
                  </div>
                </Card>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Payroll Details</h3>
                {payrollTableData.length > 0 ? (
                  <DataTable columns={payrollColumns} data={payrollTableData} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No payroll records found
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
