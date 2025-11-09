// Mock data for the Healthcare HRMS application

export const employees = [
  { id: 1, name: "Sarah Johnson", empId: "EMP001", dept: "Sales", role: "Senior Manager", status: "Active", joinDate: "2020-01-15", email: "sarah.j@company.com", phone: "+1234567890", salary: 120000 },
  { id: 2, name: "John Smith", empId: "EMP002", dept: "Operations", role: "Team Lead", status: "Active", joinDate: "2019-03-20", email: "john.s@company.com", phone: "+1234567891", salary: 65000 },
  { id: 3, name: "Emily Davis", empId: "EMP003", dept: "Marketing", role: "Marketing Manager", status: "Active", joinDate: "2021-06-10", email: "emily.d@company.com", phone: "+1234567892", salary: 95000 },
  { id: 4, name: "Michael Brown", empId: "EMP004", dept: "IT", role: "IT Manager", status: "Active", joinDate: "2018-11-05", email: "michael.b@company.com", phone: "+1234567893", salary: 110000 },
  { id: 5, name: "Lisa Anderson", empId: "EMP005", dept: "Finance", role: "Financial Analyst", status: "On Leave", joinDate: "2020-08-22", email: "lisa.a@company.com", phone: "+1234567894", salary: 98000 },
  { id: 6, name: "David Wilson", empId: "EMP006", dept: "Administration", role: "HR Manager", status: "Active", joinDate: "2017-02-14", email: "david.w@company.com", phone: "+1234567895", salary: 75000 },
  { id: 7, name: "Jennifer Lee", empId: "EMP007", dept: "Operations", role: "Operations Specialist", status: "Active", joinDate: "2022-01-10", email: "jennifer.l@company.com", phone: "+1234567896", salary: 55000 },
  { id: 8, name: "Robert Taylor", empId: "EMP008", dept: "Sales", role: "Sales Director", status: "Active", joinDate: "2019-09-18", email: "robert.t@company.com", phone: "+1234567897", salary: 135000 },
];

export const recentActivity = [
  { id: 1, action: "Leave Approved", employee: "Dr. Sarah Johnson", date: "2024-01-15 10:30 AM", type: "leave" },
  { id: 2, action: "New Employee Added", employee: "Jennifer Lee", date: "2024-01-15 09:15 AM", type: "employee" },
  { id: 3, action: "Payroll Processed", employee: "All Employees", date: "2024-01-14 05:00 PM", type: "payroll" },
  { id: 4, action: "Attendance Marked", employee: "Michael Brown", date: "2024-01-14 08:45 AM", type: "attendance" },
  { id: 5, action: "Leave Request", employee: "Lisa Anderson", date: "2024-01-13 02:20 PM", type: "leave" },
];

export const attendance = [
  { id: 1, employee: "Dr. Sarah Johnson", empId: "EMP001", date: "2024-01-15", checkIn: "08:00 AM", checkOut: "05:00 PM", status: "Present", hours: 9 },
  { id: 2, employee: "John Smith", empId: "EMP002", date: "2024-01-15", checkIn: "07:30 AM", checkOut: "04:30 PM", status: "Present", hours: 9 },
  { id: 3, employee: "Emily Davis", empId: "EMP003", date: "2024-01-15", checkIn: "09:00 AM", checkOut: "06:00 PM", status: "Present", hours: 9 },
  { id: 4, employee: "Michael Brown", empId: "EMP004", date: "2024-01-15", checkIn: "08:45 AM", checkOut: "05:45 PM", status: "Present", hours: 9 },
  { id: 5, employee: "Lisa Anderson", empId: "EMP005", date: "2024-01-15", checkIn: "-", checkOut: "-", status: "On Leave", hours: 0 },
  { id: 6, employee: "David Wilson", empId: "EMP006", date: "2024-01-15", checkIn: "08:30 AM", checkOut: "05:30 PM", status: "Present", hours: 9 },
  { id: 7, employee: "Jennifer Lee", empId: "EMP007", date: "2024-01-15", checkIn: "07:00 AM", checkOut: "04:00 PM", status: "Present", hours: 9 },
  { id: 8, employee: "Robert Taylor", empId: "EMP008", date: "2024-01-15", checkIn: "10:00 AM", checkOut: "03:00 PM", status: "Half Day", hours: 5 },
];

export const leaves = [
  { id: 1, employee: "Lisa Anderson", empId: "EMP005", type: "Sick Leave", from: "2024-01-15", to: "2024-01-17", days: 3, reason: "Flu", status: "Approved" },
  { id: 2, employee: "Dr. Sarah Johnson", empId: "EMP001", type: "Casual Leave", from: "2024-01-20", to: "2024-01-21", days: 2, reason: "Personal", status: "Pending" },
  { id: 3, employee: "Michael Brown", empId: "EMP004", type: "Annual Leave", from: "2024-02-01", to: "2024-02-05", days: 5, reason: "Vacation", status: "Pending" },
  { id: 4, employee: "Jennifer Lee", empId: "EMP007", type: "Sick Leave", from: "2024-01-10", to: "2024-01-10", days: 1, reason: "Medical checkup", status: "Approved" },
];

export const approvals = [
  { id: 1, type: "Leave Request", employee: "Dr. Sarah Johnson", empId: "EMP001", date: "2024-01-14", details: "Casual Leave: 2 days (Jan 20-21)", status: "Pending" },
  { id: 2, type: "Leave Request", employee: "Michael Brown", empId: "EMP004", date: "2024-01-13", details: "Annual Leave: 5 days (Feb 1-5)", status: "Pending" },
  { id: 3, type: "Overtime", employee: "John Smith", empId: "EMP002", date: "2024-01-12", details: "3 hours overtime on Jan 11", status: "Pending" },
  { id: 4, type: "Expense Claim", employee: "Emily Davis", empId: "EMP003", date: "2024-01-11", details: "Medical equipment: $450", status: "Pending" },
];

export const payrollData = [
  { id: 1, employee: "Dr. Sarah Johnson", empId: "EMP001", gross: 10000, deductions: 1500, net: 8500, status: "Processed" },
  { id: 2, employee: "John Smith", empId: "EMP002", gross: 5417, deductions: 812, net: 4605, status: "Processed" },
  { id: 3, employee: "Emily Davis", empId: "EMP003", gross: 7917, deductions: 1188, net: 6729, status: "Processed" },
  { id: 4, employee: "Michael Brown", empId: "EMP004", gross: 9167, deductions: 1375, net: 7792, status: "Processed" },
  { id: 5, employee: "Lisa Anderson", empId: "EMP005", gross: 8167, deductions: 1225, net: 6942, status: "Pending" },
  { id: 6, employee: "David Wilson", empId: "EMP006", gross: 6250, deductions: 938, net: 5312, status: "Processed" },
  { id: 7, employee: "Jennifer Lee", empId: "EMP007", gross: 4583, deductions: 687, net: 3896, status: "Processed" },
  { id: 8, employee: "Robert Taylor", empId: "EMP008", gross: 11250, deductions: 1688, net: 9562, status: "Processed" },
];

export const leaveBalance = {
  annual: { total: 20, used: 5, remaining: 15 },
  sick: { total: 10, used: 2, remaining: 8 },
  casual: { total: 7, used: 3, remaining: 4 },
};

export const departments = ["Sales", "Operations", "Marketing", "IT", "Finance", "Administration", "HR", "Customer Service"];

export const roles = ["Senior Manager", "Manager", "Team Lead", "Specialist", "Analyst", "Director", "Coordinator", "HR Manager", "Administrator"];

export const leaveTypes = [
  { id: 1, name: "Annual Leave", maxDays: 20, paid: true, carryForward: true },
  { id: 2, name: "Sick Leave", maxDays: 10, paid: true, carryForward: false },
  { id: 3, name: "Casual Leave", maxDays: 7, paid: true, carryForward: false },
  { id: 4, name: "Maternity Leave", maxDays: 90, paid: true, carryForward: false },
  { id: 5, name: "Paternity Leave", maxDays: 14, paid: true, carryForward: false },
];

export const shifts = [
  { id: 1, name: "Morning Shift", startTime: "07:00 AM", endTime: "03:00 PM" },
  { id: 2, name: "Day Shift", startTime: "09:00 AM", endTime: "05:00 PM" },
  { id: 3, name: "Evening Shift", startTime: "03:00 PM", endTime: "11:00 PM" },
  { id: 4, name: "Night Shift", startTime: "11:00 PM", endTime: "07:00 AM" },
];

export const salaryComponents = [
  { id: 1, name: "Basic Salary", type: "Earning", percentage: 50, fixed: false },
  { id: 2, name: "HRA", type: "Earning", percentage: 20, fixed: false },
  { id: 3, name: "Medical Allowance", type: "Earning", percentage: 0, fixed: true, amount: 1500 },
  { id: 4, name: "Tax", type: "Deduction", percentage: 10, fixed: false },
  { id: 5, name: "Insurance", type: "Deduction", percentage: 5, fixed: false },
];

export const stats = {
  totalEmployees: 8,
  pendingLeaves: 2,
  pendingApprovals: 4,
  payrollStatus: "Processed",
};
