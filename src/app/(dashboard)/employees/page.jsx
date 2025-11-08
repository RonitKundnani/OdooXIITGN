"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { employees, departments, roles } from '@/lib/mockData';
import { exportToCSV } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function EmployeesPage() {
  const router = useRouter();
  const { showToast, hasPermission, user } = useApp();
  
  // If employee role, redirect to their own profile
  if (user?.role === 'Employee') {
    // Find the employee by empId
    const employee = employees.find(e => e.empId === user.empId);
    if (employee) {
      router.push(`/employees/${employee.id}`);
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F2BED1]"></div>
      </div>
    );
  }
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', dept: '', role: '', salary: '', bankAccount: ''
  });

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !filterDept || emp.dept === filterDept;
    return matchesSearch && matchesDept;
  });

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'empId', label: 'Employee ID', sortable: true },
    { key: 'dept', label: 'Department', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status}
        </span>
      ),
    },
    { key: 'joinDate', label: 'Join Date', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/employees/${row.id}`);
          }}
          className="text-[#F2BED1] hover:text-[#FDCEDF] font-medium"
        >
          {hasPermission('edit_employee') ? 'Edit' : 'View'}
        </button>
      ),
    },
  ];

  const handleAddEmployee = (e) => {
    e.preventDefault();
    showToast('Employee added successfully!', 'success');
    setShowAddModal(false);
    setFormData({ name: '', email: '', phone: '', dept: '', role: '', salary: '', bankAccount: '' });
  };

  const handleExport = () => {
    exportToCSV(filteredEmployees, 'employees');
    showToast('Employees exported successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {hasPermission('add_employee') && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#F2BED1] hover:bg-[#FDCEDF] text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            + Add Employee
          </button>
        </div>
      )}

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
          />
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="bg-[#F8E8EE] hover:bg-[#FDCEDF] text-gray-900 font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Export CSV
          </button>
        </div>

        <DataTable
          columns={columns}
          data={filteredEmployees}
          onRowClick={(row) => router.push(`/employees/${row.id}`)}
        />
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Employee" size="lg">
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                required
                value={formData.dept}
                onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
              <input
                type="number"
                required
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
              <input
                type="text"
                required
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#F2BED1] hover:bg-[#FDCEDF] text-white rounded-lg"
            >
              Add Employee
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
