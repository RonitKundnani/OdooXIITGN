"use client";

import { useState } from 'react';
import Card from '@/components/Card';
import Stepper from '@/components/Stepper';
import DataTable from '@/components/DataTable';
import { payrollData } from '@/lib/mockData';
import { formatCurrency, exportToCSV } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function PayrollRunPage() {
  const { showToast } = useApp();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('2024-01');

  const steps = ['Select Month', 'Preview', 'Simulate', 'Finalize'];

  const columns = [
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
      render: (row) => <span className="font-semibold">{formatCurrency(row.net)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'Processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status}
        </span>
      ),
    },
  ];

  const totalGross = payrollData.reduce((sum, emp) => sum + emp.gross, 0);
  const totalDeductions = payrollData.reduce((sum, emp) => sum + emp.deductions, 0);
  const totalNet = payrollData.reduce((sum, emp) => sum + emp.net, 0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalize = () => {
    showToast('Payroll processed successfully!', 'success');
    setTimeout(() => {
      router.push('/payroll/payslips');
    }, 1500);
  };

  const handleExport = () => {
    exportToCSV(payrollData, `payroll_${selectedMonth}`);
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
                    <span>Total Employees:</span>
                    <span className="font-medium">{payrollData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payroll Period:</span>
                    <span className="font-medium">{selectedMonth}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <DataTable columns={columns} data={payrollData} />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <WarningIcon />
                  <div>
                    <h3 className="font-semibold text-yellow-800">Simulation Mode</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      This is a simulation. No actual payments will be processed. Review the data carefully before finalizing.
                    </p>
                  </div>
                </div>
              </div>
              <DataTable columns={columns} data={payrollData} />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <h3 className="font-semibold text-green-800">Ready to Process</h3>
                    <p className="text-sm text-green-700 mt-1">
                      All validations passed. Click "Finalize Payroll" to process payments.
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

              <DataTable columns={columns} data={payrollData} />
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t">
          <div>
            {currentStep === 1 && (
              <button
                onClick={handleExport}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Export CSV
              </button>
            )}
          </div>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-[#F2BED1] hover:bg-[#FDCEDF] text-white rounded-lg"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleFinalize}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Finalize Payroll
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
