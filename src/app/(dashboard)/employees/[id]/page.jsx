"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Tabs from '@/components/Tabs';
import DataTable from '@/components/DataTable';
import { employees, attendance, leaves } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast, user, hasPermission } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  
  const employee = employees.find(e => e.id === parseInt(params.id));
  
  // If employee role, only allow viewing their own profile
  if (user?.role === 'Employee') {
    const ownEmployee = employees.find(e => e.empId === user.empId);
    if (employee?.id !== ownEmployee?.id) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You can only view your own profile.</p>
            <button
              onClick={() => router.push(`/employees/${ownEmployee?.id}`)}
              className="mt-4 px-6 py-2 bg-[#F2BED1] hover:bg-[#FDCEDF] text-white rounded-lg"
            >
              Go to My Profile
            </button>
          </div>
        </div>
      );
    }
  }
  
  if (!employee) {
    return <div>Employee not found</div>;
  }
  
  const canEdit = hasPermission('edit_employee') || (user?.role === 'Employee' && hasPermission('edit_own_profile'));

  const [formData, setFormData] = useState({
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    dept: employee.dept,
    role: employee.role,
  });

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'job', label: 'Job Info' },
    { id: 'documents', label: 'Documents' },
    { id: 'salary', label: 'Salary' },
    { id: 'history', label: 'History' },
  ];

  const handleSave = () => {
    showToast('Profile updated successfully!', 'success');
  };

  const empAttendance = attendance.filter(a => a.empId === employee.empId);
  const empLeaves = leaves.filter(l => l.empId === employee.empId);

  const attendanceColumns = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'checkIn', label: 'Check In', sortable: true },
    { key: 'checkOut', label: 'Check Out', sortable: true },
    { key: 'hours', label: 'Hours', sortable: true },
    { key: 'status', label: 'Status' },
  ];

  const leaveColumns = [
    { key: 'type', label: 'Type', sortable: true },
    { key: 'from', label: 'From', sortable: true },
    { key: 'to', label: 'To', sortable: true },
    { key: 'days', label: 'Days', sortable: true },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <BackIcon />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{employee.name}</h1>
            <p className="text-gray-600 mt-1">{employee.empId} • {employee.role}</p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
          employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {employee.status}
        </span>
      </div>

      <Card className="p-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.dept}
                    onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                  <input
                    type="text"
                    value={employee.joinDate}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={handleSave}
                  className="bg-[#F2BED1] hover:bg-[#FDCEDF] text-white font-medium px-6 py-2 rounded-lg"
                >
                  Save Changes
                </button>
              )}
            </div>
          )}

          {activeTab === 'job' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="Employee ID" value={employee.empId} />
              <InfoItem label="Department" value={employee.dept} />
              <InfoItem label="Role" value={employee.role} />
              <InfoItem label="Join Date" value={employee.joinDate} />
              <InfoItem label="Employment Type" value="Full Time" />
              <InfoItem label="Work Location" value="Main Hospital" />
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Uploaded Documents</h3>
                <button className="bg-[#F2BED1] hover:bg-[#FDCEDF] text-white px-4 py-2 rounded-lg">
                  Upload Document
                </button>
              </div>
              <div className="space-y-2">
                {['Resume.pdf', 'ID_Proof.pdf', 'Medical_Certificate.pdf'].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileIcon />
                      <span>{doc}</span>
                    </div>
                    <button className="text-[#F2BED1] hover:text-[#FDCEDF]">View</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'salary' && (
            <div className="space-y-6">
              <div className="bg-[#F8E8EE] p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Salary Breakdown</h3>
                <div className="space-y-3">
                  <SalaryRow label="Basic Salary" amount={employee.salary * 0.5} />
                  <SalaryRow label="HRA" amount={employee.salary * 0.2} />
                  <SalaryRow label="Medical Allowance" amount={1500} />
                  <SalaryRow label="Other Allowances" amount={employee.salary * 0.3 - 1500} />
                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <SalaryRow label="Gross Salary" amount={employee.salary} bold />
                  </div>
                  <SalaryRow label="Tax (10%)" amount={-employee.salary * 0.1} deduction />
                  <SalaryRow label="Insurance (5%)" amount={-employee.salary * 0.05} deduction />
                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <SalaryRow label="Net Salary" amount={employee.salary * 0.85} bold />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Attendance History</h3>
                <DataTable columns={attendanceColumns} data={empAttendance} />
              </div>
              <div>
                <h3 className="font-semibold mb-4">Leave History</h3>
                <DataTable columns={leaveColumns} data={empLeaves} />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  );
}

function SalaryRow({ label, amount, bold, deduction }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold text-lg' : ''}`}>
      <span>{label}</span>
      <span className={deduction ? 'text-red-600' : ''}>
        {formatCurrency(Math.abs(amount))}
      </span>
    </div>
  );
}

function BackIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}
