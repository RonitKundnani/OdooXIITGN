"use client";

import { useState } from 'react';
import Card from '@/components/Card';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { PieChart } from '@/components/SimpleChart';
import { attendance, departments } from '@/lib/mockData';
import { useApp } from '@/context/AppContext';

export default function AttendancePage() {
  const { showToast, hasPermission, user } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterDept, setFilterDept] = useState('');
  const [dateFrom, setDateFrom] = useState('2024-01-15');
  const [dateTo, setDateTo] = useState('2024-01-15');

  // Filter attendance based on role
  const filteredAttendance = attendance.filter(record => {
    // If employee, show only their own records
    if (user?.role === 'Employee') {
      return record.empId === user.empId;
    }
    // For other roles, apply department filter
    const matchesDept = !filterDept || record.employee.includes(filterDept);
    return matchesDept;
  });

  const columns = [
    { key: 'employee', label: 'Employee', sortable: true },
    { key: 'empId', label: 'Emp ID', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'checkIn', label: 'Check In', sortable: true },
    { key: 'checkOut', label: 'Check Out', sortable: true },
    { key: 'hours', label: 'Hours', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'Present' ? 'bg-green-100 text-green-800' :
          row.status === 'Half Day' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => hasPermission('edit_attendance') && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRecord(row);
            setShowEditModal(true);
          }}
          className="text-[#F2BED1] hover:text-[#FDCEDF] font-medium"
        >
          Edit
        </button>
      ),
    },
  ];

  const handleEditAttendance = (e) => {
    e.preventDefault();
    showToast('Attendance updated successfully!', 'success');
    setShowEditModal(false);
  };

  const attendanceStats = [
    { label: 'Present', value: 6, color: '#10B981' },
    { label: 'Half Day', value: 1, color: '#F59E0B' },
    { label: 'On Leave', value: 1, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          {user?.role !== 'Employee' && (
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <DataTable columns={columns} data={filteredAttendance} />
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h2>
          <PieChart data={attendanceStats} />
        </Card>
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Attendance">
        {selectedRecord && (
          <form onSubmit={handleEditAttendance} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <input
                type="text"
                value={selectedRecord.employee}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                defaultValue={selectedRecord.date}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                <input
                  type="time"
                  defaultValue="08:00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                <input
                  type="time"
                  defaultValue="17:00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason (if any)</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                placeholder="Enter reason for attendance modification..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#F2BED1] hover:bg-[#FDCEDF] text-white rounded-lg"
              >
                Update
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
