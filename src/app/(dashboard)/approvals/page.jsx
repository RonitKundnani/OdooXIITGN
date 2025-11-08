"use client";

import { useState } from 'react';
import Card from '@/components/Card';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { approvals } from '@/lib/mockData';
import { useApp } from '@/context/AppContext';

export default function ApprovalsPage() {
  const { showToast } = useApp();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);

  const columns = [
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.type === 'Leave Request' ? 'bg-blue-100 text-blue-800' :
          row.type === 'Overtime' ? 'bg-purple-100 text-purple-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {row.type}
        </span>
      ),
    },
    { key: 'employee', label: 'Employee', sortable: true },
    { key: 'empId', label: 'Emp ID', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'details', label: 'Details' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedApproval(row);
            setShowDetailModal(true);
          }}
          className="text-[#F2BED1] hover:text-[#FDCEDF] font-medium"
        >
          Review
        </button>
      ),
    },
  ];

  const handleApprove = () => {
    showToast('Request approved successfully!', 'success');
    setShowDetailModal(false);
  };

  const handleReject = () => {
    showToast('Request rejected', 'error');
    setShowDetailModal(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">{approvals.length}</span>
            <span className="text-gray-600">Pending Approvals</span>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={approvals}
          onRowClick={(row) => {
            setSelectedApproval(row);
            setShowDetailModal(true);
          }}
        />
      </Card>

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Approval Details">
        {selectedApproval && (
          <div className="space-y-6">
            <div className="bg-[#F8E8EE] p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Type</div>
                  <div className="font-medium">{selectedApproval.type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Date</div>
                  <div className="font-medium">{selectedApproval.date}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Employee</div>
                  <div className="font-medium">{selectedApproval.employee}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Employee ID</div>
                  <div className="font-medium">{selectedApproval.empId}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-2">Details</div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                {selectedApproval.details}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                placeholder="Add your comments..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={handleReject}
                className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="px-6 py-2 bg-[#F2BED1] hover:bg-[#FDCEDF] text-white rounded-lg"
              >
                Approve
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
