# Healthcare HRMS - Quick Reference Card

## 🔑 Login Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| 👑 **Admin** | admin@hospital.com | admin123 | Full Access |
| 👔 **HR Manager** | hr@hospital.com | hr123 | Employee & Leave Mgmt |
| 💰 **Payroll** | payroll@hospital.com | payroll123 | Payroll Processing |
| 👤 **Employee** | employee@hospital.com | emp123 | Self-Service |

---

## 📱 Menu Access by Role

| Menu Item | Admin | HR | Payroll | Employee |
|-----------|-------|-----|---------|----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Employees | ✅ | ✅ | 👁️ | ❌ |
| Attendance | ✅ | ✅ | 👁️ | ❌ |
| Leaves | ✅ | ✅ | ❌ | ✅ |
| Approvals | ✅ | ✅ | ❌ | ❌ |
| Payroll | ✅ | ❌ | ✅ | ❌ |
| Reports | ✅ | ✅ | ✅ | ❌ |
| Settings | ✅ | ✅ | ❌ | ❌ |

**Legend:** ✅ Full Access | 👁️ View Only | ❌ No Access

---

## ⚡ Quick Actions by Role

### 👑 Admin Can:
- ✅ Everything
- ✅ Add/Edit/Delete Employees
- ✅ Approve Leaves & Requests
- ✅ Run Payroll
- ✅ Configure Settings

### 👔 HR Manager Can:
- ✅ Manage Employees
- ✅ Edit Attendance
- ✅ Approve Leaves
- ✅ View Reports
- ❌ Cannot Process Payroll

### 💰 Payroll Officer Can:
- ✅ Run Payroll
- ✅ Generate Payslips
- ✅ View Employees (Read-only)
- ❌ Cannot Edit Employees
- ❌ Cannot Approve Leaves

### 👤 Employee Can:
- ✅ View Own Profile
- ✅ Apply for Leave
- ✅ View Own Payslip
- ❌ Cannot View Others
- ❌ Cannot Approve Anything

---

## 🎯 Common Tasks

### Add Employee (Admin/HR)
```
Employees → + Add Employee → Fill Form → Submit
```

### Approve Leave (Admin/HR)
```
Leaves → Team Leaves Tab → Click Approve/Reject
```

### Run Payroll (Admin/Payroll)
```
Payroll → Run Payroll → Select Month → Preview → Simulate → Finalize
```

### Apply Leave (All Users)
```
Leaves → Apply Leave → Select Type & Dates → Submit
```

### View Payslip (Employee)
```
Dashboard → Profile → Payslips → Download
```

---

## 🔐 Permission Quick Check

**Can I add employees?**
- ✅ Admin, HR
- ❌ Payroll, Employee

**Can I approve leaves?**
- ✅ Admin, HR
- ❌ Payroll, Employee

**Can I run payroll?**
- ✅ Admin, Payroll
- ❌ HR, Employee

**Can I view reports?**
- ✅ Admin, HR, Payroll
- ❌ Employee

**Can I change settings?**
- ✅ Admin, HR
- ❌ Payroll, Employee

---

## 🚀 Getting Started

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Login with any role**

4. **Explore based on your permissions**

---

## 📞 Need Help?

- Check **USER_GUIDE.md** for detailed instructions
- See **ROLE_PERMISSIONS.md** for full permission matrix
- Review **IMPLEMENTATION_SUMMARY.md** for technical details

---

**Pro Tip:** Try logging in with different roles to see how the interface changes!
