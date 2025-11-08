"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

// Mock users for different roles
const mockUsers = [
  { email: 'admin@company.com', password: 'admin123', name: 'Admin User', role: 'Admin', empId: 'ADM001' },
  { email: 'hr@company.com', password: 'hr123', name: 'HR Manager', role: 'HR', empId: 'HR001' },
  { email: 'payroll@company.com', password: 'payroll123', name: 'Payroll Officer', role: 'Payroll', empId: 'PAY001' },
  { email: 'employee@company.com', password: 'emp123', name: 'John Smith', role: 'Employee', empId: 'EMP002' },
];

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useApp();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Find matching user
    const user = mockUsers.find(
      u => u.email === formData.email && u.password === formData.password
    );

    if (!user) {
      setError('Invalid email or password');
      return;
    }

    setLoading(true);

    // Set user in context
    setUser({
      name: user.name,
      email: user.email,
      role: user.role,
      empId: user.empId,
      avatar: null,
    });

    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9F5F6] via-[#F8E8EE] to-[#FDCEDF] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">WorkZen</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email / Employee ID
              </label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                placeholder="Enter your email or employee ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2BED1]"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-[#F2BED1] focus:ring-[#F2BED1]" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-[#F2BED1] hover:text-[#FDCEDF]">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F2BED1] hover:bg-[#FDCEDF] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Need help? <a href="#" className="text-[#F2BED1] hover:text-[#FDCEDF]">Contact Support</a>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-[#F8E8EE] rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Demo Credentials:</h3>
            <div className="space-y-2 text-xs text-gray-700">
              <div><strong>Admin:</strong> admin@company.com / admin123</div>
              <div><strong>HR:</strong> hr@company.com / hr123</div>
              <div><strong>Payroll:</strong> payroll@company.com / payroll123</div>
              <div><strong>Employee:</strong> employee@company.com / emp123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
