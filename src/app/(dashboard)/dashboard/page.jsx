"use client";

import StatsCard from '@/components/StatsCard';
import Card from '@/components/Card';
import DataTable from '@/components/DataTable';
import { BarChart } from '@/components/SimpleChart';
import { stats, recentActivity } from '@/lib/mockData';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, hasPermission } = useApp();

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
      <div className="mb-2">
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

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
