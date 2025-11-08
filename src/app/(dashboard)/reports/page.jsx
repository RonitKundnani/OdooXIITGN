"use client";

import { useState } from 'react';
import Card from '@/components/Card';
import Tabs from '@/components/Tabs';
import DataTable from '@/components/DataTable';
import { BarChart } from '@/components/SimpleChart';
import { attendance, leaves, payrollData } from '@/lib/mockData';
import { exportToCSV, formatCurrency } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function ReportsPage() {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState('attendance');

  const tabs = [
    { id: 'attendance', label: 'Attendance' },
    { id: 'leave', label: 'Leave' },
    { id: 'payroll', label: 'Payroll' },
  ];

  const attendanceChartData = [
    { label: 'Week 1', value: 95 },
    { label: 'Week 2', value: 92 },
    { label: 'Week 3', value: 88 },
    { label: 'Week 4', value: 90 },
  ];

  const leaveChartData = [
    { label: 'Annual', value: 12 },
    { label: 'Sick', value: 8 },
    { label: 'Casual', value: 5 },
    { label: 'Other', value: 3 },
  ];

  const payrollChartData = [
    { label: 'Jan', value: 62000 },
    { label: 'Feb', value: 62000 },
    { label: 'Mar', value: 63500 },
    { label: 'Apr', value: 64000 },
    { label: 'May', value: 62500 },
    { label: 'Jun', value: 65000 },
  ];

  const attendanceColumns = [
    { key: 'employee', label: 'Employee', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'checkIn', label: 'Check In', sortable: true },
    { key: 'checkOut', label: 'Check Out', sortable: true },
    { key: 'hours', label: 'Hours', sortable: true },
    { key: 'status', label: 'Status' },
  ];

  const leaveColumns = [
    { key: 'employee', label: 'Employee', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'from', label: 'From', sortable: true },
    { key: 'to', label: 'To', sortable: true },
    { key: 'days', label: 'Days', sortable: true },
    { key: 'status', label: 'Status' },
  ];

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
      data = attendance;
      filename = 'attendance_report';
    } else if (activeTab === 'leave') {
      data = leaves;
      filename = 'leave_report';
    } else {
      data = payrollData;
      filename = 'payroll_report';
    }
    exportToCSV(data, filename);
    showToast('Report exported successfully!', 'success');
  };

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
              <div>
                <h3 className="text-lg font-semibold mb-4">Weekly Attendance Rate (%)</h3>
                <BarChart data={attendanceChartData} height={250} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Attendance Details</h3>
                <DataTable columns={attendanceColumns} data={attendance} />
              </div>
            </>
          )}

          {activeTab === 'leave' && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4">Leave Distribution</h3>
                <BarChart data={leaveChartData} height={250} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Leave Details</h3>
                <DataTable columns={leaveColumns} data={leaves} />
              </div>
            </>
          )}

          {activeTab === 'payroll' && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4">Monthly Payroll Trend</h3>
                <BarChart data={payrollChartData} height={250} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-[#F8E8EE]">
                  <div className="text-sm text-gray-600 mb-1">Total Gross</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(payrollData.reduce((sum, emp) => sum + emp.gross, 0))}
                  </div>
                </Card>
                <Card className="p-6 bg-[#F8E8EE]">
                  <div className="text-sm text-gray-600 mb-1">Total Deductions</div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(payrollData.reduce((sum, emp) => sum + emp.deductions, 0))}
                  </div>
                </Card>
                <Card className="p-6 bg-[#F8E8EE]">
                  <div className="text-sm text-gray-600 mb-1">Total Net Pay</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(payrollData.reduce((sum, emp) => sum + emp.net, 0))}
                  </div>
                </Card>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Payroll Details</h3>
                <DataTable columns={payrollColumns} data={payrollData} />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
