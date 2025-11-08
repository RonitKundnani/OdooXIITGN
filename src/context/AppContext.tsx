"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'Admin' | 'Employee' | 'Payroll' | 'HR';

interface User {
  name: string;
  email: string;
  role: UserRole;
  empId?: string;
  companyId?: number;
  avatar: string | null;
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hasPermission: (permission: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Role-based permissions
const rolePermissions: Record<UserRole, string[]> = {
  Admin: ['*'], // Full access
  HR: [
    'view_dashboard',
    'view_employees',
    'add_employee',
    'edit_employee',
    'view_attendance',
    'edit_attendance',
    'view_leaves',
    'approve_leaves',
    'view_approvals',
    'approve_requests',
    'view_reports',
    'view_settings',
    'edit_settings',
  ],
  Payroll: [
    'view_dashboard',
    'view_employees',
    'view_attendance',
    'view_payroll',
    'run_payroll',
    'view_payslips',
    'generate_payslips',
    'view_reports',
  ],
  Employee: [
    'view_dashboard',
    'view_employees', // Can access employees module but only see self
    'view_own_profile',
    'edit_own_profile',
    'view_attendance', // Can access attendance module but only see own
    'view_own_attendance',
    'view_leaves', // Can access leaves module
    'view_own_leaves',
    'apply_leave',
    'view_own_payslip',
  ],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to restore user session:', error);
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const permissions = rolePermissions[user.role];
    return permissions.includes('*') || permissions.includes(permission);
  };

  // Update localStorage when user changes
  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('user');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F2BED1] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ user, setUser: updateUser, toast, showToast, hasPermission }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
