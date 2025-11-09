"use client";

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { attendanceAPI } from '@/lib/api';
import { useApp } from '@/context/AppContext';

export default function AttendancePage() {
  const { showToast, hasPermission, user } = useApp();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [formData, setFormData] = useState({
    user_id: '',
    date: '',
    check_in: '',
    check_out: '',
    status: 'present',
  });

  const canEdit = hasPermission('edit_attendance');
  const isEmployee = user?.role === 'Employee';

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setDateTo(today.toISOString().split('T')[0]);
    setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (user && dateFrom && dateTo) {
      fetchAttendance();
    }
  }, [user, dateFrom, dateTo]);

  const fetchAttendance = async () => {
    const companyId = user?.companyId || 1;
    const userId = isEmployee ? user?.empId : undefined;
    
    setLoading(true);
    const result = await attendanceAPI.getAll(companyId, userId, dateFrom, dateTo);
    
    if (result.success) {
      setAttendance(result.attendance);
    } else {
      showToast(result.error || 'Failed to load attendance', 'error');
    }
    setLoading(false);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setFormData({
      user_id: record.user_id,
      date: record.date,
      check_in: record.check_in ? new Date(record.check_in).toISOString().slice(0, 16) : '',
      check_out: record.check_out ? new Date(record.check_out).toISOString().slice(0, 16) : '',
      status: record.status,
    });
    setShowEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    const attendanceData = {
      id: selectedRecord?.id,
      user_id: formData.user_id,
      company_id: user?.companyId || 1,
      date: formData.date,
      check_in: formData.check_in ? new Date(formData.check_in).toISOString() : null,
      check_out: formData.check_out ? new Date(formData.check_out).toISOString() : null,
      status: formData.status,
      admin_user_id: user?.empId,
    };

    const result = await attendanceAPI.upsert(attendanceData);
    
    if (result.success) {
      showToast(result.message, 'success');
      setShowEditModal(false);
      fetchAttendance();
    } else {
      showToast(result.error || 'Failed to save attendance', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;
    
    const result = await attendanceAPI.delete(id, user?.empId, user?.companyId || 1);
    
    if (result.success) {
      showToast('Attendance deleted successfully', 'success');
      fetchAttendance();
    } else {
      showToast(result.error || 'Failed to delete attendance', 'error');
    }
  };

  const columns = [
    { 
      key: 'employee', 
      label: 'Employee', 
      sortable: true,
      render: (row) => `${row.first_name} ${row.last_name}`
    },
    { key: 'user_id', label: 'Emp ID', sortable: true },
    { 
      key: 'date', 
      label: 'Date', 
      sortable: true,
      render: (row) => new Date(row.date).toLocaleDateString()
    },
    { 
      key: 'check_in', 
      label: 'Check In', 
      sortable: true,
      render: (row) => row.check_in ? new Date(row.check_in).toLocaleTimeString() : '-'
    },
    { 
      key: 'check_out', 
      label: 'Check Out', 
      sortable: true,
      render: (row) => row.check_out ? new Date(row.check_out).toLocaleTimeString() : '-'
    },
    { 
      key: 'work_hours', 
      label: 'Hours', 
      sortable: true,
      render: (row) => row.work_hours ? `${row.work_hours}h` : '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'present' ? 'bg-green-100 text-green-800' :
          row.status === 'half_day' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.status === 'present' ? 'Present' : row.status === 'half_day' ? 'Half Day' : 'Absent'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => canEdit && (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-[#F2BED1] hover:text-[#FDCEDF] font-medium text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-500 hover:text-red-700 font-medium text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F2BED1] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              setSelectedRecord(null);
              setFormData({
                user_id: '',
                date: new Date().toISOString().split('T')[0],
                check_in: '',
                check_out: '',
                status: 'present',
              });
              setShowEditModal(true);
            }}
            className="bg-[#F2BED1] hover:bg-[#FDCEDF] text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            + Add Attendance
          </button>
        </div>
      )}

      <Card className="p-6">
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
          <div className="flex items-end">
            <button
              onClick={fetchAttendance}
              className="bg-[#F8E8EE] hover:bg-[#FDCEDF] text-gray-900 font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Filter
            </button>
          </div>
        </div>

        {attendance.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Attendance Records</h3>
            <p className="text-gray-500">No attendance records found for the selected period.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={attendance} />
        )}
      </Card>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={selectedRecord ? "Edit Attendance" : "Add Attendance"} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
              <input
                type="text"
                required
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                disabled={!!selectedRecord}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50"
                placeholder="e.g., DEMO-AD-2024-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
              <input
                type="datetime-local"
                value={formData.check_in}
                onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
              <input
                type="datetime-local"
                value={formData.check_out}
                onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="half_day">Half Day</option>
              </select>
            </div>
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
              {selectedRecord ? 'Update' : 'Add'} Attendance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
