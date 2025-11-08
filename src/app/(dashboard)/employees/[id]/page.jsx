"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Tabs from '@/components/Tabs';
import SalaryInfoTab from '@/components/SalaryInfoTab';
import { employeeAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast, user, hasPermission } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    // User info
    first_name: '',
    last_name: '',
    email: '',
    // User profiles
    phone: '',
    date_of_birth: '',
    gender: '',
    marital_status: '',
    personal_email: '',
    address: '',
    nationality: '',
    // Employment details
    department: '',
    job_position: '',
    location: '',
  });

  useEffect(() => {
    if (user && params.id) {
      fetchEmployee();
    }
  }, [user, params.id]);

  const fetchEmployee = async () => {
    const companyId = user?.companyId || 1;
    setLoading(true);

    try {
      const result = await employeeAPI.getById(params.id, companyId);
      
      if (result.success && result.employee) {
        setEmployee(result.employee);
        
        // Format date_of_birth to YYYY-MM-DD for input[type="date"]
        let formattedDate = '';
        if (result.employee.date_of_birth) {
          const date = new Date(result.employee.date_of_birth);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toISOString().split('T')[0];
          }
        }
        
        setFormData({
          first_name: result.employee.first_name || '',
          last_name: result.employee.last_name || '',
          email: result.employee.email || '',
          phone: result.employee.phone || '',
          date_of_birth: formattedDate,
          gender: result.employee.gender || '',
          marital_status: result.employee.marital_status || '',
          personal_email: result.employee.personal_email || '',
          address: result.employee.address || '',
          nationality: result.employee.nationality || '',
          department: result.employee.department || '',
          job_position: result.employee.job_position || '',
          location: result.employee.location || '',
        });
      } else {
        showToast(result.error || 'Employee not found', 'error');
        router.push('/employees');
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      showToast('Failed to load employee details', 'error');
      router.push('/employees');
    }

    setLoading(false);
  };
  
  // If employee role, only allow viewing their own profile
  if (user?.role === 'Employee' && user?.empId !== params.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You can only view your own profile.</p>
          <button
            onClick={() => router.push(`/employees/${user.empId}`)}
            className="mt-4 px-6 py-2 bg-[#F2BED1] hover:bg-[#FDCEDF] text-white rounded-lg"
          >
            Go to My Profile
          </button>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F2BED1] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Employee Not Found</h1>
          <p className="text-gray-600 mb-4">The employee you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/employees')}
            className="px-6 py-2 bg-[#F2BED1] hover:bg-[#FDCEDF] text-white rounded-lg"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }
  
  // Check if user can edit this profile
  // Admin and HR can edit anyone, employees can only edit their own
  const isAdmin = user?.role === 'Admin' || user?.role === 'HR';
  const isSelf = user?.empId === params.id;
  const canEdit = isAdmin || isSelf;
  
  // Debug logging
  console.log('Edit permissions:', {
    userRole: user?.role,
    userEmpId: user?.empId,
    profileId: params.id,
    isAdmin,
    isSelf,
    canEdit
  });

  // Only show Salary Info tab to Admin and Payroll officers
  const canViewSalary = user?.role === 'Admin' || user?.role === 'Payroll';
  
  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'job', label: 'Job Info' },
    { id: 'financial', label: 'Financial' },
    ...(canViewSalary ? [{ id: 'salary', label: 'Salary Info' }] : []),
  ];

  const handleSave = async () => {
    if (!employee) return;

    const updateData = {
      // User info
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      // User profiles
      phone: formData.phone,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || null,
      marital_status: formData.marital_status || null,
      personal_email: formData.personal_email || null,
      address: formData.address || null,
      nationality: formData.nationality || null,
      // Employment details
      department: formData.department || null,
      job_position: formData.job_position || null,
      location: formData.location || null,
      // Admin info
      admin_user_id: user?.empId,
    };

    try {
      const result = await employeeAPI.update(employee.id, updateData);
      
      if (result.success) {
        showToast('Profile updated successfully!', 'success');
        // Refresh employee data
        fetchEmployee();
      } else {
        showToast(result.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      showToast('An error occurred while updating', 'error');
    }
  };

  const roleLabels = {
    admin: 'Admin',
    hr_officer: 'HR Officer',
    payroll_officer: 'Payroll Officer',
    employee: 'Employee'
  };

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
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F2BED1] to-[#FDCEDF] flex items-center justify-center text-white text-2xl font-semibold">
              {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {employee.first_name} {employee.last_name}
              </h1>
              <p className="text-gray-600 mt-1">
                {employee.id} • {roleLabels[employee.role] || employee.role}
                {isSelf && <span className="ml-2 text-[#F2BED1]">(You)</span>}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!canEdit && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              View Only
            </span>
          )}
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {employee.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 mb-4 bg-yellow-50 border border-yellow-200">
          <details>
            <summary className="cursor-pointer font-medium text-sm">🔍 Debug Info (Click to expand)</summary>
            <div className="mt-2 text-xs space-y-1">
              <div><strong>Your Role:</strong> {user?.role}</div>
              <div><strong>Your Emp ID:</strong> {user?.empId}</div>
              <div><strong>Profile ID:</strong> {params.id}</div>
              <div><strong>Is Admin:</strong> {isAdmin ? '✅ Yes' : '❌ No'}</div>
              <div><strong>Is Self:</strong> {isSelf ? '✅ Yes' : '❌ No'}</div>
              <div><strong>Can Edit:</strong> {canEdit ? '✅ Yes' : '❌ No'}</div>
            </div>
          </details>
        </Card>
      )}

      <Card className="p-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Login) *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="email@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                  <select
                    value={formData.marital_status}
                    onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Personal Email</label>
                  <input
                    type="email"
                    value={formData.personal_email}
                    onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="personal@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="e.g., Indian"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!canEdit}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Enter full address"
                  />
                </div>
              </div>
              {canEdit ? (
                <button
                  onClick={handleSave}
                  className="bg-[#F2BED1] hover:bg-[#FDCEDF] text-white font-medium px-6 py-2 rounded-lg"
                >
                  Save Changes
                </button>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  ℹ️ You can only view this profile. Only admins and the employee themselves can make changes.
                </div>
              )}
            </div>
          )}

          {activeTab === 'job' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                  <input
                    type="text"
                    value={employee.id}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <input
                    type="text"
                    value={roleLabels[employee.role] || employee.role}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="e.g., Engineering, HR"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Position</label>
                  <input
                    type="text"
                    value={formData.job_position}
                    onChange={(e) => setFormData({ ...formData, job_position: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="e.g., Mumbai Office"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                  <input
                    type="text"
                    value={employee.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString() : 'Not set'}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manager ID</label>
                  <input
                    type="text"
                    value={employee.manager_id || 'No manager assigned'}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
                  <input
                    type="text"
                    value={employee.last_login ? new Date(employee.last_login).toLocaleString() : 'Never'}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
              {canEdit ? (
                <button
                  onClick={handleSave}
                  className="bg-[#F2BED1] hover:bg-[#FDCEDF] text-white font-medium px-6 py-2 rounded-lg"
                >
                  Save Changes
                </button>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  ℹ️ You can only view this information. Only admins and the employee themselves can make changes.
                </div>
              )}
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="bg-[#F8E8EE] p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem label="Bank Name" value={employee.bank_name || 'Not set'} />
                  <InfoItem label="Account Number" value={employee.account_number || 'Not set'} />
                  <InfoItem label="IFSC Code" value={employee.ifsc_code || 'Not set'} />
                  <InfoItem label="PAN Number" value={employee.pan_number || 'Not set'} />
                  <InfoItem label="UAN Number" value={employee.uan_number || 'Not set'} />
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <p>💡 Financial details are confidential and only visible to authorized personnel.</p>
              </div>
            </div>
          )}

          {activeTab === 'salary' && (
            <SalaryInfoTab userId={employee.id} companyId={user?.companyId || 1} />
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

function BackIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}
