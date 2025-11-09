"use client";

import { useState, useEffect } from 'react';
import { salaryAPI } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';

export default function SalaryInfoTab({ userId, companyId }) {
  const { showToast, hasPermission, user } = useApp();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [structure, setStructure] = useState(null);
  const [components, setComponents] = useState([]);
  const [settings, setSettings] = useState({});
  
  const [formData, setFormData] = useState({
    monthly_wage: '',
    yearly_wage: '',
    working_days_per_week: 5,
    break_time_hours: 1,
    effective_from: new Date().toISOString().split('T')[0],
  });

  const canEdit = hasPermission('edit_settings') || user?.role === 'Admin' || user?.role === 'Payroll';

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch salary structure
    const structureResult = await salaryAPI.getSalaryStructure(userId);
    if (structureResult.success && structureResult.structure) {
      setStructure(structureResult.structure);
      setComponents(structureResult.components || []);
      setFormData({
        monthly_wage: structureResult.structure.monthly_wage,
        yearly_wage: structureResult.structure.yearly_wage,
        working_days_per_week: structureResult.structure.working_days_per_week || 5,
        break_time_hours: structureResult.structure.break_time_hours || 1,
        effective_from: structureResult.structure.effective_from?.split('T')[0] || new Date().toISOString().split('T')[0],
      });
    }
    
    // Fetch payroll settings
    const settingsResult = await salaryAPI.getPayrollSettings(companyId);
    if (settingsResult.success) {
      setSettings(settingsResult.settings);
    }
    
    setLoading(false);
  };

  const calculateComponents = (monthlyWage) => {
    const basic = monthlyWage * 0.50; // 50% of wage
    const hra = basic * 0.50; // 50% of basic
    const standardAllowance = monthlyWage * 0.1667; // 16.67%
    const performanceBonus = monthlyWage * 0.0833; // 8.33%
    const lta = monthlyWage * 0.0833; // 8.33%
    const fixedAllowance = monthlyWage - (basic + hra + standardAllowance + performanceBonus + lta);
    
    return {
      basic,
      hra,
      standardAllowance,
      performanceBonus,
      lta,
      fixedAllowance
    };
  };

  const handleMonthlyWageChange = (value) => {
    const monthly = parseFloat(value) || 0;
    setFormData({
      ...formData,
      monthly_wage: monthly,
      yearly_wage: monthly * 12
    });
  };

  const handleYearlyWageChange = (value) => {
    const yearly = parseFloat(value) || 0;
    setFormData({
      ...formData,
      yearly_wage: yearly,
      monthly_wage: yearly / 12
    });
  };

  const handleSave = async () => {
    if (!formData.monthly_wage || !formData.yearly_wage) {
      showToast('Please enter wage amounts', 'error');
      return;
    }

    const calculated = calculateComponents(formData.monthly_wage);
    
    const salaryData = {
      user_id: userId,
      company_id: companyId,
      monthly_wage: formData.monthly_wage,
      yearly_wage: formData.yearly_wage,
      working_days_per_week: formData.working_days_per_week,
      break_time_hours: formData.break_time_hours,
      effective_from: formData.effective_from,
      admin_user_id: user?.empId,
      components: [
        {
          component_name: 'Basic Salary',
          component_type: 'earning',
          calculation_type: 'percentage_of_wage',
          value: 50
        },
        {
          component_name: 'House Rent Allowance',
          component_type: 'earning',
          calculation_type: 'percentage_of_basic',
          value: 50
        },
        {
          component_name: 'Standard Allowance',
          component_type: 'earning',
          calculation_type: 'percentage_of_wage',
          value: 16.67
        },
        {
          component_name: 'Performance Bonus',
          component_type: 'earning',
          calculation_type: 'percentage_of_wage',
          value: 8.33
        },
        {
          component_name: 'Leave Travel Allowance',
          component_type: 'earning',
          calculation_type: 'percentage_of_wage',
          value: 8.33
        },
        {
          component_name: 'Fixed Allowance',
          component_type: 'earning',
          calculation_type: 'fixed',
          value: calculated.fixedAllowance
        }
      ]
    };

    const result = await salaryAPI.upsertSalaryStructure(salaryData);
    
    if (result.success) {
      showToast('Salary structure saved successfully!', 'success');
      setEditing(false);
      fetchData();
    } else {
      showToast(result.error || 'Failed to save salary structure', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2BED1]"></div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-500">Only Admin and Payroll Officers can view salary information.</p>
      </div>
    );
  }

  const calculated = formData.monthly_wage ? calculateComponents(parseFloat(formData.monthly_wage)) : null;
  const pfEmployee = calculated ? (calculated.basic * (settings.payroll_pf_rate_employee || 12)) / 100 : 0;
  const pfEmployer = calculated ? (calculated.basic * (settings.payroll_pf_rate_employer || 12)) / 100 : 0;
  const professionalTax = settings.payroll_professional_tax || 200;

  return (
    <div className="space-y-6">
      {!structure && !editing && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            No salary structure defined for this employee. Click "Edit" to create one.
          </p>
        </div>
      )}

      {canEdit && (
        <div className="flex justify-end">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-2 bg-[#F2BED1] hover:bg-[#FDCEDF] text-white rounded-lg"
            >
              {structure ? 'Edit' : 'Create'} Salary Structure
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditing(false);
                  if (structure) {
                    setFormData({
                      monthly_wage: structure.monthly_wage,
                      yearly_wage: structure.yearly_wage,
                      working_days_per_week: structure.working_days_per_week || 5,
                      break_time_hours: structure.break_time_hours || 1,
                      effective_from: structure.effective_from?.split('T')[0] || new Date().toISOString().split('T')[0],
                    });
                  }
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wage Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Wage Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Wage
            </label>
            <input
              type="number"
              disabled={!editing}
              value={formData.monthly_wage}
              onChange={(e) => handleMonthlyWageChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-100"
              placeholder="50000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yearly Wage
            </label>
            <input
              type="number"
              disabled={!editing}
              value={formData.yearly_wage}
              onChange={(e) => handleYearlyWageChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-100"
              placeholder="600000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Working Days per Week
            </label>
            <input
              type="number"
              disabled={!editing}
              value={formData.working_days_per_week}
              onChange={(e) => setFormData({ ...formData, working_days_per_week: parseInt(e.target.value) || 5 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-100"
              min="1"
              max="7"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Break Time (hours)
            </label>
            <input
              type="number"
              step="0.5"
              disabled={!editing}
              value={formData.break_time_hours}
              onChange={(e) => setFormData({ ...formData, break_time_hours: parseFloat(e.target.value) || 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Effective From
            </label>
            <input
              type="date"
              disabled={!editing}
              value={formData.effective_from}
              onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1] disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Salary Components */}
        {calculated && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Salary Components</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Basic Salary (50%)</span>
                <span className="font-medium">{formatCurrency(calculated.basic)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 ml-4">₹{calculated.basic.toFixed(2)} / month</span>
                <span className="text-gray-500">50.00%</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">House Rent Allowance (50% of Basic)</span>
                <span className="font-medium">{formatCurrency(calculated.hra)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 ml-4">₹{calculated.hra.toFixed(2)} / month</span>
                <span className="text-gray-500">50.00%</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Standard Allowance (16.67%)</span>
                <span className="font-medium">{formatCurrency(calculated.standardAllowance)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Performance Bonus (8.33%)</span>
                <span className="font-medium">{formatCurrency(calculated.performanceBonus)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Leave Travel Allowance (8.33%)</span>
                <span className="font-medium">{formatCurrency(calculated.lta)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fixed Allowance</span>
                <span className="font-medium">{formatCurrency(calculated.fixedAllowance)}</span>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mt-6">Provident Fund (PF) Contribution</h3>
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Employee ({settings.payroll_pf_rate_employee || 12}%)</span>
                <span className="font-medium">{formatCurrency(pfEmployee)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Employer ({settings.payroll_pf_rate_employer || 12}%)</span>
                <span className="font-medium">{formatCurrency(pfEmployer)}</span>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mt-6">Tax Deductions</h3>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Professional Tax</span>
                <span className="font-medium">{formatCurrency(professionalTax)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
