// API Configuration and Service
const API_BASE_URL = 'http://localhost:5000';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  ok: boolean;
  user?: {
    id: string;
    company_id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    last_login: string;
  };
  error?: string;
}

// Role mapping from backend to frontend
const roleMap: Record<string, 'Admin' | 'HR' | 'Payroll' | 'Employee'> = {
  'admin': 'Admin',
  'hr_officer': 'HR',
  'payroll_officer': 'Payroll',
  'employee': 'Employee',
};

export const authAPI = {
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.ok && data.user) {
        // Map backend role to frontend role
        const frontendRole = roleMap[data.user.role] || 'Employee';
        
        const user = {
          name: `${data.user.first_name} ${data.user.last_name}`,
          email: data.user.email,
          role: frontendRole,
          empId: data.user.id,
          companyId: data.user.company_id,
          avatar: null,
        };

        // Store user in localStorage for session persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        return {
          success: true,
          user,
        };
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred during login',
      };
    }
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },

  getStoredUser() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  async signup(data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Signup failed');
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred during signup',
      };
    }
  },
};

export const employeeAPI = {
  async getAll(company_id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/employees?company_id=${company_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch employees');
      }

      return {
        success: true,
        employees: data.employees || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        employees: [],
      };
    }
  },

  async getById(id: string, company_id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}?company_id=${company_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch employee');
      }

      return {
        success: true,
        employee: data.employee,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },

  async add(employeeData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add employee');
      }

      return {
        success: true,
        employee: data.employee,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },

  async update(id: string, employeeData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update employee');
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },
};

export const attendanceAPI = {
  async checkIn(user_id: string, company_id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, company_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check in');
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },

  async checkOut(user_id: string, company_id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/check-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, company_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check out');
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },

  async getTodayStatus(user_id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/today?user_id=${user_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get status');
      }

      return {
        success: true,
        attendance: data.attendance,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        attendance: null,
      };
    }
  },

  async getAll(company_id: number, user_id?: string, start_date?: string, end_date?: string) {
    try {
      let url = `${API_BASE_URL}/attendance?company_id=${company_id}`;
      if (user_id) url += `&user_id=${user_id}`;
      if (start_date) url += `&start_date=${start_date}`;
      if (end_date) url += `&end_date=${end_date}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch attendance');
      }

      return {
        success: true,
        attendance: data.attendance || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        attendance: [],
      };
    }
  },

  async upsert(attendanceData: any) {
    try {
      const url = attendanceData.id 
        ? `${API_BASE_URL}/attendance/${attendanceData.id}`
        : `${API_BASE_URL}/attendance`;
      
      const response = await fetch(url, {
        method: attendanceData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save attendance');
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },

  async delete(id: number, admin_user_id: string, company_id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_user_id, company_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete attendance');
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },
};

export const leaveAPI = {
  async getLeaveTypes(company_id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-types?company_id=${company_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leave types');
      }

      return {
        success: true,
        leaveTypes: data.leaveTypes || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        leaveTypes: [],
      };
    }
  },

  async getLeaveAllocations(user_id: string, year?: number) {
    try {
      let url = `${API_BASE_URL}/leave-allocations?user_id=${user_id}`;
      if (year) url += `&year=${year}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leave allocations');
      }

      return {
        success: true,
        allocations: data.allocations || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        allocations: [],
      };
    }
  },

  async getLeaveRequests(company_id: number, user_id?: string, status?: string) {
    try {
      let url = `${API_BASE_URL}/leave-requests?company_id=${company_id}`;
      if (user_id) url += `&user_id=${user_id}`;
      if (status) url += `&status=${status}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leave requests');
      }

      return {
        success: true,
        requests: data.requests || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        requests: [],
      };
    }
  },

  async applyLeave(leaveData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leaveData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply leave');
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },

  async updateLeaveStatus(id: number, status: string, approved_by: string, company_id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, approved_by, company_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update leave status');
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },

  async cancelLeaveRequest(id: number, user_id: string, company_id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-requests/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, company_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel leave request');
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },
};

export const salaryAPI = {
  async getSalaryStructure(user_id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/salary-structure?user_id=${user_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch salary structure');
      }

      return {
        success: true,
        structure: data.structure,
        components: data.components || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },

  async getAllSalaryStructures(company_id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/salary-structures?company_id=${company_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch salary structures');
      }

      return {
        success: true,
        structures: data.structures || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        structures: [],
      };
    }
  },

  async upsertSalaryStructure(salaryData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/salary-structure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salaryData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save salary structure');
      }

      return {
        success: true,
        message: data.message,
        structure_id: data.structure_id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },

  async getPayrollSettings(company_id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/payroll-settings?company_id=${company_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payroll settings');
      }

      return {
        success: true,
        settings: data.settings || {},
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        settings: {},
      };
    }
  },

  async updatePayrollSettings(company_id: number, settings: any, admin_user_id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/payroll-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_id, settings, admin_user_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update payroll settings');
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },
};

export const payrollAPI = {
  async createPayrun(payrunData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/payrun`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payrunData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payrun');
      }

      return {
        success: true,
        message: data.message,
        payrun_id: data.payrun_id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },

  async computePayroll(payrun_id: number, admin_user_id: string, company_id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/payrun/compute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payrun_id, admin_user_id, company_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to compute payroll');
      }

      return {
        success: true,
        message: data.message,
        employee_count: data.employee_count,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },

  async validatePayrun(payrun_id: number, admin_user_id: string, company_id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/payrun/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payrun_id, admin_user_id, company_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate payrun');
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },

  async getPayruns(company_id: number, status?: string) {
    try {
      let url = `${API_BASE_URL}/payruns?company_id=${company_id}`;
      if (status) url += `&status=${status}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payruns');
      }

      return {
        success: true,
        payruns: data.payruns || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        payruns: [],
      };
    }
  },

  async getPayslipsByPayrun(payrun_id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/payslips?payrun_id=${payrun_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payslips');
      }

      return {
        success: true,
        payslips: data.payslips || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        payslips: [],
      };
    }
  },

  async getPayslipDetails(payslip_id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/payslip?payslip_id=${payslip_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payslip details');
      }

      return {
        success: true,
        payslip: data.payslip,
        details: data.details || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },

  async getUserPayslips(user_id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/user-payslips?user_id=${user_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payslips');
      }

      return {
        success: true,
        payslips: data.payslips || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        payslips: [],
      };
    }
  },
};


export const reportsAPI = {
  async getAttendanceReport(company_id: number, start_date?: string, end_date?: string) {
    try {
      let url = `${API_BASE_URL}/reports/attendance?company_id=${company_id}`;
      if (start_date) url += `&start_date=${start_date}`;
      if (end_date) url += `&end_date=${end_date}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch attendance report');
      }

      return {
        success: true,
        attendance: data.attendance || [],
        weeklyStats: data.weeklyStats || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        attendance: [],
        weeklyStats: [],
      };
    }
  },

  async getLeaveReport(company_id: number, start_date?: string, end_date?: string, status?: string) {
    try {
      let url = `${API_BASE_URL}/reports/leave?company_id=${company_id}`;
      if (start_date) url += `&start_date=${start_date}`;
      if (end_date) url += `&end_date=${end_date}`;
      if (status) url += `&status=${status}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leave report');
      }

      return {
        success: true,
        leaves: data.leaves || [],
        distribution: data.distribution || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        leaves: [],
        distribution: [],
      };
    }
  },

  async getPayrollReport(company_id: number, start_date?: string, end_date?: string) {
    try {
      let url = `${API_BASE_URL}/reports/payroll?company_id=${company_id}`;
      if (start_date) url += `&start_date=${start_date}`;
      if (end_date) url += `&end_date=${end_date}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payroll report');
      }

      return {
        success: true,
        payslips: data.payslips || [],
        trends: data.trends || [],
        totals: data.totals || { total_gross: 0, total_deductions: 0, total_net: 0, employee_count: 0 },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        payslips: [],
        trends: [],
        totals: { total_gross: 0, total_deductions: 0, total_net: 0, employee_count: 0 },
      };
    }
  },

  async getDashboardStats(company_id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/dashboard-stats?company_id=${company_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dashboard stats');
      }

      return {
        success: true,
        stats: data.stats || {},
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        stats: {},
      };
    }
  },
};
