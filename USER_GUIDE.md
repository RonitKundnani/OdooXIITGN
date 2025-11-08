# Healthcare HRMS - User Guide

## 🚀 Quick Start

### Step 1: Login
Navigate to `http://localhost:3000` and you'll be redirected to the login page.

### Step 2: Choose Your Role
Use one of the demo credentials based on your role:

```
👑 Admin
Email: admin@hospital.com
Password: admin123
Access: Everything

👔 HR Manager  
Email: hr@hospital.com
Password: hr123
Access: Employees, Attendance, Leaves, Approvals, Reports, Settings

💰 Payroll Officer
Email: payroll@hospital.com
Password: payroll123
Access: Employees (view), Attendance (view), Payroll, Reports

👤 Employee
Email: employee@hospital.com
Password: emp123
Access: Own profile, Leaves, Attendance (own)
```

---

## 📱 User Interfaces by Role

### 1. Admin Dashboard
**Sidebar Menu:**
- ✅ Dashboard
- ✅ Employees
- ✅ Attendance
- ✅ Leaves
- ✅ Approvals
- ✅ Payroll
- ✅ Reports
- ✅ Settings

**What You Can Do:**
- View complete dashboard with all stats
- Add, edit, delete employees
- Mark and edit attendance
- Approve/reject leave requests
- Process payroll
- Generate reports
- Configure system settings

---

### 2. HR Manager Dashboard
**Sidebar Menu:**
- ✅ Dashboard
- ✅ Employees
- ✅ Attendance
- ✅ Leaves (My Leaves + Team Leaves)
- ✅ Approvals
- ✅ Reports
- ✅ Settings
- ❌ Payroll (Hidden)

**What You Can Do:**
- Manage employee records
- Track and edit attendance
- Approve/reject leave requests
- View team leaves
- Handle approval requests
- Generate HR reports
- Configure leave types and shifts

**What You Cannot Do:**
- Process payroll
- View payslips
- Access payroll reports

---

### 3. Payroll Officer Dashboard
**Sidebar Menu:**
- ✅ Dashboard
- ✅ Employees (View only)
- ✅ Attendance (View only)
- ✅ Payroll
- ✅ Reports
- ❌ Leaves (Hidden)
- ❌ Approvals (Hidden)
- ❌ Settings (Hidden)

**What You Can Do:**
- View employee information
- View attendance records
- Run monthly payroll (4-step process)
- Generate payslips
- Export payroll reports
- Download payroll data

**What You Cannot Do:**
- Edit employee records
- Approve leaves
- Edit attendance
- Access system settings

---

### 4. Employee Dashboard
**Sidebar Menu:**
- ✅ Dashboard (Limited view)
- ✅ Leaves (My Leaves only)
- ❌ All other menus hidden

**What You Can Do:**
- View your own profile
- Apply for leave
- View leave balance
- Check leave history
- View your attendance
- Download your payslip

**What You Cannot Do:**
- View other employees
- Approve anything
- Access admin functions
- View team data

---

## 🎯 Common Tasks by Role

### Admin Tasks

#### Add New Employee
1. Go to **Employees** page
2. Click **"+ Add Employee"** button
3. Fill in employee details:
   - Name, Email, Phone
   - Department, Role
   - Salary, Bank Account
4. Click **"Add Employee"**

#### Process Payroll
1. Go to **Payroll** → **Run Payroll**
2. **Step 1:** Select payroll month
3. **Step 2:** Preview employee list and amounts
4. **Step 3:** Simulate payroll (validation)
5. **Step 4:** Finalize and process

#### Approve Leave Request
1. Go to **Approvals** page
2. Click on pending request
3. Review details
4. Click **"Approve"** or **"Reject"**

---

### HR Manager Tasks

#### Manage Employee
1. Go to **Employees** page
2. Click on employee name
3. Edit profile information
4. View tabs: Profile, Job Info, Documents, Salary, History
5. Click **"Save Changes"**

#### Approve Team Leave
1. Go to **Leaves** page
2. Switch to **"Team Leaves"** tab
3. Review pending requests
4. Click **"Approve"** or **"Reject"** inline

#### Edit Attendance
1. Go to **Attendance** page
2. Click **"Edit"** on any record
3. Modify check-in/check-out times
4. Add reason if needed
5. Click **"Update"**

---

### Payroll Officer Tasks

#### Run Monthly Payroll
1. Navigate to **Payroll** → **Run Payroll**
2. Select the month (e.g., January 2024)
3. Click **"Next"** to preview
4. Review all employee salaries
5. Click **"Next"** to simulate
6. Verify totals (Gross, Deductions, Net)
7. Click **"Finalize Payroll"**

#### Generate Payslips
1. Go to **Payroll** → **Payslips**
2. Click **"View"** on any employee
3. Review payslip details
4. Click **"Download PDF"** to print

#### Export Payroll Report
1. Go to **Reports** page
2. Select **"Payroll"** tab
3. View payroll trends chart
4. Click **"Export CSV"** button

---

### Employee Tasks

#### Apply for Leave
1. Go to **Leaves** page
2. Click **"Apply Leave"** button
3. Select leave type (Annual, Sick, Casual)
4. Choose from and to dates
5. Enter reason
6. Click **"Submit"**

#### View Leave Balance
1. Go to **Leaves** page
2. Check the right sidebar
3. See remaining days for each leave type:
   - Annual Leave
   - Sick Leave
   - Casual Leave

#### View Your Payslip
1. Go to **Dashboard**
2. Click on your profile
3. Navigate to payslips section
4. Download your latest payslip

---

## 🔄 Switching Between Roles

To test different roles:

1. Click on your profile picture (top right)
2. Click **"Logout"**
3. Login with different credentials
4. Notice the different menu items and permissions

---

## 📊 Understanding the Dashboard

### Admin/HR Dashboard Shows:
- Total Employees count
- Pending Leaves count
- Pending Approvals count
- Payroll Status
- Weekly Attendance Chart
- Recent Activity Table
- Quick Action Buttons

### Payroll Dashboard Shows:
- Employee count
- Payroll statistics
- Quick access to payroll functions
- Recent payroll activity

### Employee Dashboard Shows:
- Personal stats
- Leave balance
- Recent activity
- Quick actions (Apply Leave)

---

## 💡 Tips & Best Practices

### For Admins:
- Regularly review pending approvals
- Process payroll on time each month
- Keep employee records updated
- Monitor attendance patterns

### For HR Managers:
- Respond to leave requests promptly
- Keep attendance records accurate
- Update employee information regularly
- Generate reports for insights

### For Payroll Officers:
- Verify attendance before running payroll
- Double-check salary calculations
- Keep payslips organized
- Export reports for record-keeping

### For Employees:
- Apply for leave in advance
- Check leave balance regularly
- Keep profile information updated
- Download payslips for records

---

## 🆘 Troubleshooting

### Cannot See a Menu Item?
- Check your role permissions
- Some menus are role-specific
- Contact your admin if you need access

### Cannot Edit Something?
- You might have view-only access
- Check your role in the top-right profile
- Some actions require specific permissions

### Forgot Password?
- Contact your system administrator
- In demo mode, use the provided credentials

---

## 📞 Support

For questions or issues:
- Contact your system administrator
- Check the documentation
- Review role permissions in ROLE_PERMISSIONS.md

---

**Built with ❤️ for Healthcare Professionals**
