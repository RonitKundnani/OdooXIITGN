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
  
  // Payroll settings state with proper defaults
  const [payrollSettings, setPayrollSettings] = useState({
    payroll_pf_rate_employee: 12,
    payroll_pf_rate_employer: 12,
    payroll_professional_tax: 200,
    payroll_working_days_per_week: 5,
    payroll_consider_half_days: true,
    payroll_deduct_absent_days: true,
  });

  const [settingsLoaded, setSettingsLoaded] = useState(false);

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
      // Merge with defaults to ensure all fields have values
      setPayrollSettings({
        payroll_pf_rate_employee: result.settings.payroll_pf_rate_employee ?? 12,
        payroll_pf_rate_employer: result.settings.payroll_pf_rate_employer ?? 12,
        payroll_professional_tax: result.settings.payroll_professional_tax ?? 200,
        payroll_working_days_per_week: result.settings.payroll_working_days_per_week ?? 5,
        payroll_consider_half_days: result.settings.payroll_consider_half_days ?? true,
        payroll_deduct_absent_days: result.settings.payroll_deduct_absent_days ?? true,
      });
      setSettingsLoaded(true);
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
                  defaultValue="WorkZen India"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Code</label>
                <input
                  type="text"
                  defaultValue="WI"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="admin@workzen.in"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  defaultValue="+91 98765 43210"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  rows={3}
                  defaultValue="Mumbai, Maharashtra, India"
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

              <h3 className="text-lg font-semibold text-gray-900 mt-8">Attendance & Working Days</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Working Days Per Week
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="7"
                  value={payrollSettings.payroll_working_days_per_week}
                  onChange={(e) => setPayrollSettings({
                    ...payrollSettings,
                    payroll_working_days_per_week: parseInt(e.target.value) || 5
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                  placeholder="5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of working days per week. Standard is 5 days (Monday to Friday).
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payrollSettings.payroll_consider_half_days}
                    onChange={(e) => setPayrollSettings({
                      ...payrollSettings,
                      payroll_consider_half_days: e.target.checked
                    })}
                    className="w-5 h-5 text-[#F2BED1] border-gray-300 rounded focus:ring-[#F2BED1]"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Consider Half Days</div>
                    <div className="text-xs text-gray-500">
                      Half-day attendance will count as 0.5 days in payroll calculation
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payrollSettings.payroll_deduct_absent_days}
                    onChange={(e) => setPayrollSettings({
                      ...payrollSettings,
                      payroll_deduct_absent_days: e.target.checked
                    })}
                    className="w-5 h-5 text-[#F2BED1] border-gray-300 rounded focus:ring-[#F2BED1]"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Deduct for Absent Days</div>
                    <div className="text-xs text-gray-500">
                      Salary will be prorated based on actual attendance. Uncheck to pay full salary regardless of attendance.
                    </div>
                  </div>
                </label>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Example Calculation (Attendance-Based)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Salary:</span>
                    <span className="font-medium">₹60,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Working Days in Month:</span>
                    <span className="font-medium">22 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days Present:</span>
                    <span className="font-medium text-green-600">20 days</span>
                  </div>
                  {payrollSettings.payroll_consider_half_days && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Half Days:</span>
                      <span className="font-medium text-yellow-600">2 days (= 1 day)</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Paid Days:</span>
                    <span className="font-medium text-blue-600">21 days</span>
                  </div>
                  {payrollSettings.payroll_deduct_absent_days && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attendance Ratio:</span>
                      <span className="font-medium">21/22 = 95.45%</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                    <span className="text-gray-600">Prorated Salary:</span>
                    <span className="font-medium">
                      {payrollSettings.payroll_deduct_absent_days 
                        ? '₹57,273 (95.45% of ₹60,000)' 
                        : '₹60,000 (Full salary)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Basic (50%):</span>
                    <span className="font-medium">
                      {payrollSettings.payroll_deduct_absent_days ? '₹28,636' : '₹30,000'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employee PF ({payrollSettings.payroll_pf_rate_employee}%):</span>
                    <span className="font-medium text-red-600">
                      -{payrollSettings.payroll_deduct_absent_days 
                        ? `₹${(28636 * payrollSettings.payroll_pf_rate_employee / 100).toFixed(2)}`
                        : `₹${(30000 * payrollSettings.payroll_pf_rate_employee / 100).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Professional Tax:</span>
                    <span className="font-medium text-red-600">-₹{payrollSettings.payroll_professional_tax}</span>
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
