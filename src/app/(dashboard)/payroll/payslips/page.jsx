"use client";

import { useState } from 'react';
import Card from '@/components/Card';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { payrollData } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';

export default function PayslipsPage() {
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const columns = [
    { key: 'employee', label: 'Employee', sortable: true },
    { key: 'empId', label: 'Emp ID', sortable: true },
    {
      key: 'month',
      label: 'Month',
      render: () => 'January 2024',
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
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedEmployee(row);
            setShowPayslipModal(true);
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

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">January 2024 Payslips</h2>
            <p className="text-sm text-gray-600 mt-1">{payrollData.length} employees</p>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={payrollData}
          onRowClick={(row) => {
            setSelectedEmployee(row);
            setShowPayslipModal(true);
          }}
        />
      </Card>

      <Modal
        isOpen={showPayslipModal}
        onClose={() => setShowPayslipModal(false)}
        title="Payslip"
        size="lg"
      >
        {selectedEmployee && (
          <div className="space-y-6">
            <div className="bg-[#F8E8EE] p-6 rounded-lg print:bg-white">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">HRMS</h2>
                <p className="text-sm text-gray-600">Payslip for January 2024</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-600">Employee Name</div>
                  <div className="font-medium">{selectedEmployee.employee}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Employee ID</div>
                  <div className="font-medium">{selectedEmployee.empId}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Pay Period</div>
                  <div className="font-medium">January 2024</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Payment Date</div>
                  <div className="font-medium">January 31, 2024</div>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-4">
                <h3 className="font-semibold mb-3">Earnings</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Basic Salary</td>
                      <td className="py-2 text-right">{formatCurrency(selectedEmployee.gross * 0.5)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">HRA</td>
                      <td className="py-2 text-right">{formatCurrency(selectedEmployee.gross * 0.2)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Medical Allowance</td>
                      <td className="py-2 text-right">{formatCurrency(1500)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Other Allowances</td>
                      <td className="py-2 text-right">{formatCurrency(selectedEmployee.gross * 0.3 - 1500)}</td>
                    </tr>
                    <tr className="font-semibold">
                      <td className="py-2">Gross Salary</td>
                      <td className="py-2 text-right">{formatCurrency(selectedEmployee.gross)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-t border-gray-300 pt-4 mt-4">
                <h3 className="font-semibold mb-3">Deductions</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Tax (10%)</td>
                      <td className="py-2 text-right text-red-600">{formatCurrency(selectedEmployee.gross * 0.1)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Insurance (5%)</td>
                      <td className="py-2 text-right text-red-600">{formatCurrency(selectedEmployee.gross * 0.05)}</td>
                    </tr>
                    <tr className="font-semibold">
                      <td className="py-2">Total Deductions</td>
                      <td className="py-2 text-right text-red-600">{formatCurrency(selectedEmployee.deductions)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-t-2 border-gray-400 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Net Pay</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(selectedEmployee.net)}</span>
                </div>
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
                Download PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
