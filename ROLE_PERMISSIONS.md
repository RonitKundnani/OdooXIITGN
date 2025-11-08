# Role-Based Access Control (RBAC)

## User Roles & Permissions

### 1. Admin (Full Access)
**Login:** admin@hospital.com / admin123

**Permissions:**
- ✅ Full access to all modules
- ✅ View/Add/Edit/Delete Employees
- ✅ View/Edit Attendance
- ✅ View/Approve Leaves
- ✅ View/Approve All Requests
- ✅ Run Payroll
- ✅ View/Generate Payslips
- ✅ View/Export Reports
- ✅ Manage Settings

**Sidebar Menu:**
- Dashboard
- Employees
- Attendance
- Leaves
- Approvals
- Payroll
- Reports
- Settings

---

### 2. HR Manager
**Login:** hr@hospital.com / hr123

**Permissions:**
- ✅ View Dashboard
- ✅ View/Add/Edit Employees
- ✅ View/Edit Attendance
- ✅ View/Approve Leaves (Team Leaves)
- ✅ View/Approve Requests
- ✅ View Reports
- ✅ Manage Settings
- ❌ No Payroll Access

**Sidebar Menu:**
- Dashboard
- Employees
- Attendance
- Leaves (My Leaves + Team Leaves)
- Approvals
- Reports
- Settings

**Key Features:**
- Can manage employee records
- Can approve/reject leave requests
- Can edit attendance records
- Can view and export reports
- Cannot access payroll module

---

### 3. Payroll Officer
**Login:** payroll@hospital.com / payroll123

**Permissions:**
- ✅ View Dashboard
- ✅ View Employees (Read-only)
- ✅ View Attendance (Read-only)
- ✅ Run Payroll
- ✅ View/Generate Payslips
- ✅ View Reports
- ❌ Cannot Edit Employees
- ❌ Cannot Approve Leaves
- ❌ No Settings Access

**Sidebar Menu:**
- Dashboard
- Employees (View only)
- Attendance (View only)
- Payroll
- Reports

**Key Features:**
- Can process monthly payroll
- Can generate and view payslips
- Can view employee and attendance data
- Can export payroll reports
- Cannot modify employee records or approve leaves

---

### 4. Employee (Self-Service)
**Login:** employee@hospital.com / emp123

**Permissions:**
- ✅ View Dashboard (Limited)
- ✅ View Own Profile
- ✅ View Own Attendance
- ✅ View Own Leaves
- ✅ Apply for Leave
- ✅ View Own Payslip
- ❌ Cannot View Other Employees
- ❌ Cannot Approve Anything
- ❌ No Admin Functions

**Sidebar Menu:**
- Dashboard
- Leaves (My Leaves only)

**Key Features:**
- Can view their own profile and information
- Can apply for leave
- Can view their leave balance and history
- Can view their own attendance records
- Can view and download their payslips
- Cannot access other employees' data
- Cannot approve or manage anything

---

## Permission Matrix

| Feature | Admin | HR | Payroll | Employee |
|---------|-------|-----|---------|----------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ (Limited) |
| Add Employee | ✅ | ✅ | ❌ | ❌ |
| Edit Employee | ✅ | ✅ | ❌ | ❌ |
| View All Employees | ✅ | ✅ | ✅ | ❌ |
| View Own Profile | ✅ | ✅ | ✅ | ✅ |
| Mark Attendance | ✅ | ✅ | ❌ | ❌ |
| Edit Attendance | ✅ | ✅ | ❌ | ❌ |
| View Attendance | ✅ | ✅ | ✅ | ✅ (Own) |
| Apply Leave | ✅ | ✅ | ✅ | ✅ |
| Approve Leave | ✅ | ✅ | ❌ | ❌ |
| View Team Leaves | ✅ | ✅ | ❌ | ❌ |
| View Approvals | ✅ | ✅ | ❌ | ❌ |
| Approve Requests | ✅ | ✅ | ❌ | ❌ |
| Run Payroll | ✅ | ❌ | ✅ | ❌ |
| View Payslips | ✅ | ❌ | ✅ | ✅ (Own) |
| Generate Payslips | ✅ | ❌ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ❌ |
| Export Reports | ✅ | ✅ | ✅ | ❌ |
| Manage Settings | ✅ | ✅ | ❌ | ❌ |

---

## Implementation Details

### Context API
The role-based permissions are managed through `AppContext.tsx`:

```typescript
const rolePermissions: Record<UserRole, string[]> = {
  Admin: ['*'], // Full access
  HR: ['view_dashboard', 'view_employees', 'add_employee', ...],
  Payroll: ['view_dashboard', 'view_employees', 'view_payroll', ...],
  Employee: ['view_dashboard', 'view_own_profile', 'apply_leave', ...],
};
```

### Permission Check
Use the `hasPermission()` function:

```javascript
const { hasPermission } = useApp();

{hasPermission('add_employee') && (
  <button>Add Employee</button>
)}
```

### Sidebar Menu
The sidebar automatically filters menu items based on user permissions:

```javascript
const menuItems = allMenuItems.filter(item => 
  hasPermission(item.permission)
);
```

---

## Testing Different Roles

1. **Login as Admin:**
   - Email: admin@hospital.com
   - Password: admin123
   - See all menu items and full functionality

2. **Login as HR:**
   - Email: hr@hospital.com
   - Password: hr123
   - No Payroll menu, can manage employees and leaves

3. **Login as Payroll:**
   - Email: payroll@hospital.com
   - Password: payroll123
   - Limited to payroll functions, read-only for employees

4. **Login as Employee:**
   - Email: employee@hospital.com
   - Password: emp123
   - Minimal menu, self-service only

---

## Security Notes

- All routes check user authentication
- Permission checks on both UI and component level
- Unauthorized access redirects to dashboard
- Logout clears user session
- Each role has specific, limited permissions
