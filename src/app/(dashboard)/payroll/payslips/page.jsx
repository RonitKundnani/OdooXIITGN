"use client";

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { payrollAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function PayslipsPage() {
  const { user, showToast } = useApp();
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [payslipDetails, setPayslipDetails] = useState([]);
  const [payruns, setPayruns] = useState([]);
  const [selectedPayrun, setSelectedPayrun] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPayruns();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPayrun) {
      fetchPayslips();
    }
  }, [selectedPayrun]);

  const fetchPayruns = async () => {
    setLoading(true);
    const result = await payrollAPI.getPayruns(user?.companyId || 1, 'validated');
    
    if (result.success && result.payruns.length > 0) {
      setPayruns(result.payruns);
      setSelectedPayrun(result.payruns[0].id);
    } else if (!result.success) {
      showToast(result.error || 'Failed to load payruns', 'error');
    }
    setLoading(false);
  };

  const fetchPayslips = async () => {
    if (!selectedPayrun) return;
    
    setLoading(true);
    const result = await payrollAPI.getPayslipsByPayrun(selectedPayrun);
    
    if (result.success) {
      setPayslips(result.payslips);
    } else {
      showToast(result.error || 'Failed to load payslips', 'error');
    }
    setLoading(false);
  };

  const fetchPayslipDetails = async (payslipId) => {
    const result = await payrollAPI.getPayslipDetails(payslipId);
    
    if (result.success) {
      setSelectedPayslip(result.payslip);
      setPayslipDetails(result.details);
      setShowPayslipModal(true);
    } else {
      showToast(result.error || 'Failed to load payslip details', 'error');
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
      key: 'department',
      label: 'Department',
      render: (row) => row.department || 'N/A',
    },
    {
      key: 'attendance',
      label: 'Attendance',
      render: (row) => (
        <div className="text-sm">
          <div className="font-medium">{row.paid_days || 0}/{row.total_working_days || 0}</div>
          <div className="text-xs text-gray-500">
            {row.total_working_days > 0 
              ? `${((row.paid_days / row.total_working_days) * 100).toFixed(1)}%`
              : '0%'}
          </div>
        </div>
      ),
    },
    {
      key: 'net_salary',
      label: 'Net Pay',
      sortable: true,
      render: (row) => <span className="font-semibold">{formatCurrency(row.net_salary)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'validated' ? 'bg-green-100 text-green-800' : 
          row.status === 'computed' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            fetchPayslipDetails(row.id);
          }}
          className="text-[#F2BED1] hover:text-[#FDCEDF] font-medium"
        >
          View
        </button>
      ),
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const selectedPayrunData = payruns.find(p => p.id === selectedPayrun);

  if (loading && payruns.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F2BED1] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payslips...</p>
        </div>
      </div>
    );
  }

  if (payruns.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payslips Yet</h3>
          <p className="text-gray-500">Run payroll first to generate payslips.</p>
        </div>
      </div>
    );
  }

  const earnings = payslipDetails.filter(d => d.component_type === 'earning');
  const deductions = payslipDetails.filter(d => d.component_type === 'deduction');

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Payslips</h2>
            <p className="text-sm text-gray-600 mt-1">{payslips.length} employees</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Payrun</label>
            <select
              value={selectedPayrun || ''}
              onChange={(e) => setSelectedPayrun(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
            >
              {payruns.map((payrun) => (
                <option key={payrun.id} value={payrun.id}>
                  {payrun.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2BED1]"></div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={payslips}
            onRowClick={(row) => fetchPayslipDetails(row.id)}
          />
        )}
      </Card>

      <Modal
        isOpen={showPayslipModal}
        onClose={() => setShowPayslipModal(false)}
        title="Payslip"
        size="lg"
      >
        {selectedPayslip && (
          <div className="space-y-6">
            <div className="bg-[#F8E8EE] p-6 rounded-lg print:bg-white">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">WorkZen HRMS</h2>
                <p className="text-sm text-gray-600">
                  Payslip for {new Date(selectedPayslip.pay_period_start).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-600">Employee Name</div>
                  <div className="font-medium">{selectedPayslip.first_name} {selectedPayslip.last_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Employee ID</div>
                  <div className="font-medium">{selectedPayslip.user_id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Department</div>
                  <div className="font-medium">{selectedPayslip.department || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Position</div>
                  <div className="font-medium">{selectedPayslip.job_position || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Pay Period</div>
                  <div className="font-medium">
                    {new Date(selectedPayslip.pay_period_start).toLocaleDateString()} - {new Date(selectedPayslip.pay_period_end).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Working Days</div>
                  <div className="font-medium">
                    {selectedPayslip.paid_days} / {selectedPayslip.total_working_days} days
                  </div>
                </div>
              </div>

              {/* Attendance Summary */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">📊 Attendance Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-blue-700">Total Working Days</div>
                    <div className="font-semibold text-lg">{selectedPayslip.total_working_days}</div>
                  </div>
                  <div>
                    <div className="text-blue-700">Paid Days</div>
                    <div className="font-semibold text-lg text-green-600">{selectedPayslip.paid_days}</div>
                  </div>
                  <div>
                    <div className="text-blue-700">Attendance</div>
                    <div className="font-semibold text-lg">
                      {selectedPayslip.total_working_days > 0 
                        ? `${((selectedPayslip.paid_days / selectedPayslip.total_working_days) * 100).toFixed(1)}%`
                        : '0%'}
                    </div>
                  </div>
                </div>
                {selectedPayslip.paid_days < selectedPayslip.total_working_days && (
                  <div className="mt-2 text-xs text-blue-700">
                    ℹ️ Salary prorated based on {selectedPayslip.paid_days} paid days out of {selectedPayslip.total_working_days} working days
                  </div>
                )}
              </div>

              <div className="border-t border-gray-300 pt-4">
                <h3 className="font-semibold mb-3">Earnings</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {earnings.map((earning, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{earning.component_name}</td>
                        <td className="py-2 text-right">{formatCurrency(earning.amount)}</td>
                      </tr>
                    ))}
                    <tr className="font-semibold">
                      <td className="py-2">Gross Salary</td>
                      <td className="py-2 text-right">{formatCurrency(selectedPayslip.gross_salary)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* PF Contribution Section */}
              {deductions.some(d => d.component_name.includes('Provident Fund')) && (
                <div className="border-t border-gray-300 pt-4 mt-4">
                  <h3 className="font-semibold mb-3">Provident Fund (PF) Contribution</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      {deductions
                        .filter(d => d.component_name.includes('Provident Fund'))
                        .map((pf, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{pf.component_name}</td>
                            <td className="py-2 text-right">{formatCurrency(pf.amount)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-500 mt-2">
                    * PF is calculated based on the basic salary
                  </p>
                </div>
              )}

              {/* Tax Deductions Section */}
              <div className="border-t border-gray-300 pt-4 mt-4">
                <h3 className="font-semibold mb-3">Tax Deductions</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {deductions
                      .filter(d => !d.component_name.includes('Provident Fund'))
                      .map((deduction, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{deduction.component_name}</td>
                          <td className="py-2 text-right text-red-600">{formatCurrency(deduction.amount)}</td>
                        </tr>
                      ))}
                    <tr className="font-semibold">
                      <td className="py-2">Total Deductions</td>
                      <td className="py-2 text-right text-red-600">{formatCurrency(selectedPayslip.total_deductions)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-t-2 border-gray-400 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Net Pay</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(selectedPayslip.net_salary)}</span>
                </div>
              </div>

              <div className="mt-6 text-xs text-gray-500 text-center">
                <p>This is a computer-generated payslip and does not require a signature.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 print:hidden">
              <button
                onClick={() => setShowPayslipModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-2 bg-[#F2BED1] hover:bg-[#FDCEDF] text-white rounded-lg"
              >
                Print / Download PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
