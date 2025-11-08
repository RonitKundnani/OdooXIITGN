"use client";

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Modal from '@/components/Modal';
import { leaveAPI } from '@/lib/api';
import { useApp } from '@/context/AppContext';

export default function ApprovalsPage() {
  const { showToast, user } = useApp();
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (user) {
      fetchPendingApprovals();
    }
  }, [user]);

  const fetchPendingApprovals = async () => {
    const companyId = user?.companyId || 1;
    
    setLoading(true);
    const result = await leaveAPI.getLeaveRequests(companyId, undefined, 'pending');
    
    if (result.success) {
      setPendingLeaves(result.requests);
    } else {
      showToast(result.error || 'Failed to load approvals', 'error');
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    const result = await leaveAPI.updateLeaveStatus(
      selectedRequest.id,
      'approved',
      user?.empId,
      user?.companyId || 1
    );
    
    if (result.success) {
      showToast('Leave request approved successfully!', 'success');
      setShowDetailModal(false);
      fetchPendingApprovals();
    } else {
      showToast(result.error || 'Failed to approve leave', 'error');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    const result = await leaveAPI.updateLeaveStatus(
      selectedRequest.id,
      'rejected',
      user?.empId,
      user?.companyId || 1
    );
    
    if (result.success) {
      showToast('Leave request rejected', 'info');
      setShowDetailModal(false);
      fetchPendingApprovals();
    } else {
      showToast(result.error || 'Failed to reject leave', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F2BED1] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">{pendingLeaves.length}</span>
            <span className="text-gray-600">Pending Leave Approvals</span>
          </div>
        </div>

        {pendingLeaves.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-500">No pending approvals at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingLeaves.map((request) => (
              <div
                key={request.id}
                onClick={() => {
                  setSelectedRequest(request);
                  setShowDetailModal(true);
                }}
                className="border border-gray-200 rounded-lg p-4 hover:border-[#F2BED1] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F2BED1] to-[#FDCEDF] flex items-center justify-center text-white font-semibold">
                        {request.first_name?.charAt(0)}{request.last_name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {request.first_name} {request.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">{request.user_id}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        {request.leave_type_name}
                      </span>
                      {request.is_paid && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Paid
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                      <div>
                        <span className="text-gray-500">From:</span>
                        <p className="font-medium">{new Date(request.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">To:</span>
                        <p className="font-medium">{new Date(request.end_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Days:</span>
                        <p className="font-medium text-[#F2BED1]">{request.total_days} days</p>
                      </div>
                    </div>
                    {request.reason && (
                      <div className="mt-3 text-sm">
                        <span className="text-gray-500">Reason:</span>
                        <p className="text-gray-700 mt-1">{request.reason}</p>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-400">
                      Applied on {new Date(request.created_at).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRequest(request);
                      setShowDetailModal(true);
                    }}
                    className="ml-4 px-4 py-2 bg-[#F2BED1] hover:bg-[#FDCEDF] text-white text-sm rounded-lg transition-colors"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Leave Request Details" size="lg">
        {selectedRequest && (
          <div className="space-y-6">
            <div className="bg-[#F8E8EE] p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Employee</div>
                  <div className="font-medium">{selectedRequest.first_name} {selectedRequest.last_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Employee ID</div>
                  <div className="font-medium">{selectedRequest.user_id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Leave Type</div>
                  <div className="font-medium">{selectedRequest.leave_type_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Type</div>
                  <div className="font-medium">{selectedRequest.is_paid ? 'Paid Leave' : 'Unpaid Leave'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Start Date</div>
                  <div className="font-medium">{new Date(selectedRequest.start_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">End Date</div>
                  <div className="font-medium">{new Date(selectedRequest.end_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Days</div>
                  <div className="font-medium text-[#F2BED1]">{selectedRequest.total_days} days</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Applied On</div>
                  <div className="font-medium">{new Date(selectedRequest.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {selectedRequest.reason && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Reason</div>
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  {selectedRequest.reason}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={handleReject}
                className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium"
              >
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="px-6 py-2 bg-[#F2BED1] hover:bg-[#FDCEDF] text-white rounded-lg font-medium"
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
