"use client";

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Stepper from '@/components/Stepper';
import DataTable from '@/components/DataTable';
import { payrollAPI } from '@/lib/api';
import { formatCurrency, exportToCSV } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function PayrollRunPage() {
  const { showToast, user } = useApp();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [payrunId, setPayrunId] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);

  const steps = ['Select Month', 'Preview', 'Compute', 'Finalize'];

  useEffect(() => {
    if (currentStep === 1 && payrunId) {
      fetchPayslips();
    }
  }, [currentStep, payrunId]);

  const fetchPayslips = async () => {
    if (!payrunId) return;
    
    setLoading(true);
    const result = await payrollAPI.getPayslipsByPayrun(payrunId);
    
    if (result.success) {
      setPayslips(result.payslips);
    } else {
      showToast(result.error || 'Failed to fetch payslips', 'error');
    }
    setLoading(false);
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
      key: 'attendance',
      label: 'Attendance',
      render: (row) => (
        <div className="text-sm">
          <div className="font-medium">{row.paid_days || 0}/{row.total_working_days || 0} days</div>
          <div className="text-xs text-gray-500">
            {row.total_working_days > 0 
              ? `${((row.paid_days / row.total_working_days) * 100).toFixed(1)}%`
              : '0%'}
          </div>
        </div>
      ),
    },
    {
      key: 'gross_salary',
      label: 'Gross',
      sortable: true,
      render: (row) => formatCurrency(row.gross_salary),
    },
    {
      key: 'total_deductions',
      label: 'Deductions',
      sortable: true,
      render: (row) => formatCurrency(row.total_deductions),
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
  ];

  const totalGross = payslips.reduce((sum, emp) => sum + parseFloat(emp.gross_salary || 0), 0);
  const totalDeductions = payslips.reduce((sum, emp) => sum + parseFloat(emp.total_deductions || 0), 0);
  const totalNet = payslips.reduce((sum, emp) => sum + parseFloat(emp.net_salary || 0), 0);

  const handleNext = async () => {
    if (currentStep === 0) {
      // Create payrun
      await createPayrun();
    } else if (currentStep === 1) {
      // Compute payroll
      await computePayroll();
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const createPayrun = async () => {
    const [year, month] = selectedMonth.split('-');
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const payrunData = {
      company_id: user?.companyId || 1,
      name: `${startDate.toLocaleString('default', { month: 'long' })} ${year} Payroll`,
      pay_period_start: startDate.toISOString().split('T')[0],
      pay_period_end: endDate.toISOString().split('T')[0],
      created_by: user?.empId
    };

    setLoading(true);
    const result = await payrollAPI.createPayrun(payrunData);
    
    if (result.success) {
      setPayrunId(result.payrun_id);
      setCurrentStep(1);
      showToast('Payrun created successfully!', 'success');
    } else {
      showToast(result.error || 'Failed to create payrun', 'error');
    }
    setLoading(false);
  };

  const computePayroll = async () => {
    if (!payrunId) return;

    setLoading(true);
    const result = await payrollAPI.computePayroll(
      payrunId,
      user?.empId,
      user?.companyId || 1
    );
    
    if (result.success) {
      showToast(`Payroll computed for ${result.employee_count} employees!`, 'success');
      await fetchPayslips();
      setCurrentStep(2);
    } else {
      showToast(result.error || 'Failed to compute payroll', 'error');
    }
    setLoading(false);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalize = async () => {
    if (!payrunId) return;

    setLoading(true);
    const result = await payrollAPI.validatePayrun(
      payrunId,
      user?.empId,
      user?.companyId || 1
    );
    
    if (result.success) {
      showToast('Payroll finalized successfully!', 'success');
      setTimeout(() => {
        router.push('/payroll/payslips');
      }, 1500);
    } else {
      showToast(result.error || 'Failed to finalize payroll', 'error');
    }
    setLoading(false);
  };

  const handleExport = () => {
    const exportData = payslips.map(p => ({
      employee: `${p.first_name} ${p.last_name}`,
      empId: p.user_id,
      gross: p.gross_salary,
      deductions: p.total_deductions,
      net: p.net_salary,
      status: p.status
    }));
    exportToCSV(exportData, `payroll_${selectedMonth}`);
    showToast('Payroll data exported successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Stepper steps={steps} currentStep={currentStep} />

        <div className="mt-8">
          {currentStep === 0 && (
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Payroll Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                />
              </div>
              <div className="bg-[#F8E8EE] p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Payroll Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Payroll Period:</span>
                    <span className="font-medium">{selectedMonth}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    Click "Next" to create payrun and preview employees
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2BED1]"></div>
                </div>
              ) : payslips.length > 0 ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>{payslips.length} employees</strong> found with salary structures. Click "Next" to compute payroll.
                    </p>
                  </div>
                  <DataTable columns={columns} data={payslips} />
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Compute</h3>
                  <p className="text-gray-500">Click "Next" to compute payroll for this period.</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <WarningIcon />
                  <div>
                    <h3 className="font-semibold text-yellow-800">Review Mode</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Payroll has been computed. Review the data carefully before finalizing.
                    </p>
                  </div>
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2BED1]"></div>
                </div>
              ) : (
                <DataTable columns={columns} data={payslips} />
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <h3 className="font-semibold text-green-800">Ready to Finalize</h3>
                    <p className="text-sm text-green-700 mt-1">
                      All validations passed. Click "Finalize Payroll" to complete the process.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-[#F8E8EE]">
                  <div className="text-sm text-gray-600 mb-1">Total Gross</div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalGross)}</div>
                </Card>
                <Card className="p-6 bg-[#F8E8EE]">
                  <div className="text-sm text-gray-600 mb-1">Total Deductions</div>
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDeductions)}</div>
                </Card>
                <Card className="p-6 bg-[#F8E8EE]">
                  <div className="text-sm text-gray-600 mb-1">Total Net Pay</div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(totalNet)}</div>
                </Card>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2BED1]"></div>
                </div>
              ) : (
                <DataTable columns={columns} data={payslips} />
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t">
          <div>
            {(currentStep === 2 || currentStep === 3) && payslips.length > 0 && (
              <button
                onClick={handleExport}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Export CSV
              </button>
            )}
          </div>
          <div className="flex gap-3">
            {currentStep > 0 && currentStep < 3 && (
              <button
                onClick={handleBack}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Back
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-2 bg-[#F2BED1] hover:bg-[#FDCEDF] text-white rounded-lg disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Next'}
              </button>
            ) : (
              <button
                onClick={handleFinalize}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Finalize Payroll'}
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
