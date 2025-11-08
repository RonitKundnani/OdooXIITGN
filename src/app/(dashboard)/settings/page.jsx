"use client";

import { useState } from 'react';
import Card from '@/components/Card';
import Tabs from '@/components/Tabs';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { leaveTypes, shifts, salaryComponents } from '@/lib/mockData';
import { useApp } from '@/context/AppContext';

export default function SettingsPage() {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState('company');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  const tabs = [
    { id: 'company', label: 'Company' },
    { id: 'leave-types', label: 'Leave Types' },
    { id: 'shifts', label: 'Shifts' },
    { id: 'salary', label: 'Salary Components' },
  ];

  const leaveTypeColumns = [
    { key: 'name', label: 'Leave Type', sortable: true },
    { key: 'maxDays', label: 'Max Days', sortable: true },
    {
      key: 'paid',
      label: 'Paid',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.paid ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'carryForward',
      label: 'Carry Forward',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.carryForward ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.carryForward ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <button className="text-[#F2BED1] hover:text-[#FDCEDF] font-medium">
          Edit
        </button>
      ),
    },
  ];

  const shiftColumns = [
    { key: 'name', label: 'Shift Name', sortable: true },
    { key: 'startTime', label: 'Start Time', sortable: true },
    { key: 'endTime', label: 'End Time', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <button className="text-[#F2BED1] hover:text-[#FDCEDF] font-medium">
          Edit
        </button>
      ),
    },
  ];

  const salaryColumns = [
    { key: 'name', label: 'Component', sortable: true },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.type === 'Earning' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.type}
        </span>
      ),
    },
    {
      key: 'percentage',
      label: 'Percentage',
      render: (row) => row.fixed ? '-' : `${row.percentage}%`,
    },
    {
      key: 'amount',
      label: 'Fixed Amount',
      render: (row) => row.fixed ? `$${row.amount}` : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <button className="text-[#F2BED1] hover:text-[#FDCEDF] font-medium">
          Edit
        </button>
      ),
    },
  ];

  const handleAddNew = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Settings saved successfully!', 'success');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === 'company' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  defaultValue="HRMS Company"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="admin@hrms.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  defaultValue="+1 234 567 8900"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  rows={3}
                  defaultValue="123 Business Street, City, State 12345"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                />
              </div>
              <button
                onClick={() => showToast('Company settings saved!', 'success')}
                className="bg-[#F2BED1] hover:bg-[#FDCEDF] text-white font-medium px-6 py-2 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'leave-types' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => handleAddNew('leave-type')}
                  className="bg-[#F2BED1] hover:bg-[#FDCEDF] text-white font-medium px-6 py-2 rounded-lg"
                >
                  + Add Leave Type
                </button>
              </div>
              <DataTable columns={leaveTypeColumns} data={leaveTypes} />
            </div>
          )}

          {activeTab === 'shifts' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => handleAddNew('shift')}
                  className="bg-[#F2BED1] hover:bg-[#FDCEDF] text-white font-medium px-6 py-2 rounded-lg"
                >
                  + Add Shift
                </button>
              </div>
              <DataTable columns={shiftColumns} data={shifts} />
            </div>
          )}

          {activeTab === 'salary' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => handleAddNew('salary-component')}
                  className="bg-[#F2BED1] hover:bg-[#FDCEDF] text-white font-medium px-6 py-2 rounded-lg"
                >
                  + Add Component
                </button>
              </div>
              <DataTable columns={salaryColumns} data={salaryComponents} />
            </div>
          )}
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Add ${modalType}`}>
        <form onSubmit={handleSave} className="space-y-4">
          {modalType === 'leave-type' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Days</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Paid Leave</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Carry Forward</span>
                </label>
              </div>
            </>
          )}

          {modalType === 'shift' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                  />
                </div>
              </div>
            </>
          )}

          {modalType === 'salary-component' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Component Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                >
                  <option value="">Select Type</option>
                  <option value="Earning">Earning</option>
                  <option value="Deduction">Deduction</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#F2BED1] hover:bg-[#FDCEDF] text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
