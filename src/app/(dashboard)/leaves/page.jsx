"use client";

import { useState } from 'react';
import Card from '@/components/Card';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import Tabs from '@/components/Tabs';
import { leaves, leaveBalance, leaveTypes } from '@/lib/mockData';
import { calculateDays } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function LeavesPage() {
  const { showToast, hasPermission, user } = useApp();
  const [activeTab, setActiveTab] = useState('my-leaves');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    type: '', from: '', to: '', reason: ''
  });

  const myLeaves = leaves.filter(l => l.empId === 'EMP001');
  const teamLeaves = leaves;

  // Show team leaves tab only for HR/Admin
  const tabs = hasPermission('approve_leaves')
    ? [
        { id: 'my-leaves', label: 'My Leaves' },
        { id: 'team-leaves', label: 'Team Leaves' },
      ]
    : [{ id: 'my-leaves', label: 'My Leaves' }];

  const myLeavesColumns = [
    { key: 'type', label: 'Type', sortable: true },
    { key: 'from', label: 'From', sortable: true },
    { key: 'to', label: 'To', sortable: true },
    { key: 'days', label: 'Days', sortable: true },
    { key: 'reason', label: 'Reason' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'Approved' ? 'bg-green-100 text-green-800' :
          row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.status}
        </span>
      ),
    },
  ];

  const teamLeavesColumns = [
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
          row.status === 'Approved' ? 'bg-green-100 text-green-800' :
          row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => row.status === 'Pending' && hasPermission('approve_leaves') ? (
        <div className="flex gap-2">
          <button
            onClick={() => {
              showToast('Leave approved successfully!', 'success');
            }}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Approve
          </button>
          <button
            onClick={() => {
              showToast('Leave rejected', 'error');
            }}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Reject
          </button>
        </div>
      ) : null,
    },
  ];

  const handleApplyLeave = (e) => {
    e.preventDefault();
    showToast('Leave application submitted successfully!', 'success');
    setShowApplyModal(false);
    setFormData({ type: '', from: '', to: '', reason: '' });
  };

  const days = formData.from && formData.to ? calculateDays(formData.from, formData.to) : 0;

  return (
    <div className="space-y-6">
      {activeTab === 'my-leaves' && hasPermission('apply_leave') && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowApplyModal(true)}
            className="bg-[#F2BED1] hover:bg-[#FDCEDF] text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Apply Leave
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 p-6">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          
          <div className="mt-6">
            {activeTab === 'my-leaves' && (
              <DataTable columns={myLeavesColumns} data={myLeaves} />
            )}
            {activeTab === 'team-leaves' && (
              <DataTable columns={teamLeavesColumns} data={teamLeaves} />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave Balance</h2>
          <div className="space-y-4">
            <LeaveBalanceItem
              label="Annual Leave"
              used={leaveBalance.annual.used}
              total={leaveBalance.annual.total}
              color="bg-blue-500"
            />
            <LeaveBalanceItem
              label="Sick Leave"
              used={leaveBalance.sick.used}
              total={leaveBalance.sick.total}
              color="bg-red-500"
            />
            <LeaveBalanceItem
              label="Casual Leave"
              used={leaveBalance.casual.used}
              total={leaveBalance.casual.total}
              color="bg-green-500"
            />
          </div>
        </Card>
      </div>

      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Apply for Leave">
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
            >
              <option value="">Select Leave Type</option>
              {leaveTypes.map(type => (
                <option key={type.id} value={type.name}>{type.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                required
                value={formData.from}
                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                required
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
              />
            </div>
          </div>
          {days > 0 && (
            <div className="bg-[#F8E8EE] p-3 rounded-lg">
              <span className="text-sm font-medium">Total Days: {days}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              required
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
              placeholder="Enter reason for leave..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowApplyModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#F2BED1] hover:bg-[#FDCEDF] text-white rounded-lg"
            >
              Submit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function LeaveBalanceItem({ label, used, total, color }) {
  const percentage = (used / total) * 100;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium">{label}</span>
        <span className="text-gray-600">{used}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
