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
