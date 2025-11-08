"use client";

import { useState, useEffect } from 'react';
import StatsCard from '@/components/StatsCard';
import Card from '@/components/Card';
import DataTable from '@/components/DataTable';
import { BarChart } from '@/components/SimpleChart';
import { stats, recentActivity } from '@/lib/mockData';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, hasPermission, showToast } = useApp();
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [mounted, setMounted] = useState(false);

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

  // Load attendance status from localStorage
  useEffect(() => {
    if (!mounted || !user) return;
    const savedStatus = localStorage.getItem(`attendance_${user?.empId}_${new Date().toDateString()}`);
    if (savedStatus) {
      setAttendanceStatus(JSON.parse(savedStatus));
    }
  }, [user, mounted]);

  const handleCheckIn = () => {
    const checkInTime = new Date().toLocaleTimeString();
    const status = {
      checkIn: checkInTime,
      checkOut: null,
      date: new Date().toDateString(),
    };
    setAttendanceStatus(status);
    localStorage.setItem(`attendance_${user?.empId}_${new Date().toDateString()}`, JSON.stringify(status));
    showToast('Checked in successfully!', 'success');
  };

  const handleCheckOut = () => {
    const checkOutTime = new Date().toLocaleTimeString();
    const status = {
      ...attendanceStatus,
      checkOut: checkOutTime,
    };
    setAttendanceStatus(status);
    localStorage.setItem(`attendance_${user?.empId}_${new Date().toDateString()}`, JSON.stringify(status));
    showToast('Checked out successfully!', 'success');
  };

  const chartData = [
    { label: 'Mon', value: 45 },
    { label: 'Tue', value: 52 },
    { label: 'Wed', value: 48 },
    { label: 'Thu', value: 50 },
    { label: 'Fri', value: 46 },
    { label: 'Sat', value: 20 },
    { label: 'Sun', value: 15 },
  ];

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
        {mounted && currentTime && (
          <div className="text-sm text-gray-500">
            {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Check In/Out Card */}
      <Card className="p-6 bg-gradient-to-r from-[#F9F5F6] to-[#F8E8EE]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Today's Attendance</h3>
            <div className="flex items-center gap-6">
              {attendanceStatus?.checkIn && (
                <div>
                  <span className="text-sm text-gray-600">Check In: </span>
                  <span className="font-semibold text-green-600">{attendanceStatus.checkIn}</span>
                </div>
              )}
              {attendanceStatus?.checkOut && (
                <div>
                  <span className="text-sm text-gray-600">Check Out: </span>
                  <span className="font-semibold text-red-600">{attendanceStatus.checkOut}</span>
                </div>
              )}
              {!attendanceStatus?.checkIn && (
                <span className="text-sm text-gray-500">Not checked in yet</span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {!attendanceStatus?.checkIn ? (
              <button
                onClick={handleCheckIn}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                <CheckInIcon />
                Check In
              </button>
            ) : !attendanceStatus?.checkOut ? (
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Attendance</h2>
          <BarChart data={chartData} height={250} />
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
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <DataTable columns={activityColumns} data={recentActivity} />
      </Card>
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
