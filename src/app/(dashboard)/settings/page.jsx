"use client";

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Tabs from '@/components/Tabs';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { salaryAPI } from '@/lib/api';
import { leaveTypes, shifts, salaryComponents } from '@/lib/mockData';
import { useApp } from '@/context/AppContext';

export default function SettingsPage() {
  const { showToast, user } = useApp();
  const [activeTab, setActiveTab] = useState('company');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Payroll settings state
  const [payrollSettings, setPayrollSettings] = useState({
    payroll_pf_rate_employee: 12,
    payroll_pf_rate_employer: 12,
    payroll_professional_tax: 200,
  });

  useEffect(() => {
    if (user?.companyId && activeTab === 'payroll') {
      fetchPayrollSettings();
    }
  }, [user, activeTab]);

  const fetchPayrollSettings = async () => {
    if (!user?.companyId) return;
    
    setLoading(true);
    const result = await salaryAPI.getPayrollSettings(user.companyId);
    
    if (result.success) {
      setPayrollSettings(result.settings);
    } else {
      showToast(result.error || 'Failed to load payroll settings', 'error');
    }
    setLoading(false);
  };

  const handleSavePayrollSettings = async () => {
    if (!user?.companyId || !user?.empId) {
      showToast('User session invalid', 'error');
      return;
    }

    setLoading(true);
    const result = await salaryAPI.updatePayrollSettings(
      user.companyId,
      payrollSettings,
      user.empId
    );

    if (result.success) {
      showToast('Payroll settings saved successfully!', 'success');
    } else {
      showToast(result.error || 'Failed to save payroll settings', 'error');
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'company', label: 'Company' },
    { id: 'payroll', label: 'Payroll Settings' },
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

          {activeTab === 'payroll' && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">ℹ️ About Payroll Settings</h4>
                <p className="text-sm text-blue-800">
                  These settings apply to all employees during payroll computation. Changes will affect future payroll runs.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-900">Provident Fund (PF) Rates</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee PF Contribution (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={payrollSettings.payroll_pf_rate_employee}
                  onChange={(e) => setPayrollSettings({
                    ...payrollSettings,
                    payroll_pf_rate_employee: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                  placeholder="12"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Standard rate is 12%. This will be deducted from employee's basic salary.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employer PF Contribution (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={payrollSettings.payroll_pf_rate_employer}
                  onChange={(e) => setPayrollSettings({
                    ...payrollSettings,
                    payroll_pf_rate_employer: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                  placeholder="12"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Standard rate is 12%. This is paid by the employer (not deducted from salary).
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-8">Tax Deductions</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Tax (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={payrollSettings.payroll_professional_tax}
                  onChange={(e) => setPayrollSettings({
                    ...payrollSettings,
                    payroll_professional_tax: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                  placeholder="200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Fixed monthly professional tax amount. Standard is ₹200 per month.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Example Calculation</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Basic Salary:</span>
                    <span className="font-medium">₹30,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employee PF ({payrollSettings.payroll_pf_rate_employee}%):</span>
                    <span className="font-medium text-red-600">-₹{(30000 * payrollSettings.payroll_pf_rate_employee / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employer PF ({payrollSettings.payroll_pf_rate_employer}%):</span>
                    <span className="font-medium text-blue-600">₹{(30000 * payrollSettings.payroll_pf_rate_employer / 100).toFixed(2)} (Company pays)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Professional Tax:</span>
                    <span className="font-medium text-red-600">-₹{payrollSettings.payroll_professional_tax}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total Deductions:</span>
                    <span className="font-semibold text-red-600">
                      ₹{((30000 * payrollSettings.payroll_pf_rate_employee / 100) + payrollSettings.payroll_professional_tax).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSavePayrollSettings}
                disabled={loading}
                className="bg-[#F2BED1] hover:bg-[#FDCEDF] text-white font-medium px-6 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Payroll Settings'}
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
