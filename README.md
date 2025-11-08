# Healthcare HRMS - Human Resource Management System

A complete, fully functional Healthcare HRMS SaaS web application built with Next.js 15+, React, and Tailwind CSS. No external UI libraries - everything is built from scratch.

## 🎨 Features

### Core Modules
- **Dashboard** - Overview with stats, charts, and recent activity
- **Employee Management** - Add, view, edit employee records with detailed profiles
- **Attendance Tracking** - Mark and manage daily attendance with reports
- **Leave Management** - Apply, approve/reject leaves with balance tracking
- **Approvals** - Unified approval system for leaves, overtime, and expenses
- **Payroll Processing** - 4-step payroll run with preview and finalization
- **Payslips** - View and download employee payslips
- **Reports** - Attendance, leave, and payroll reports with charts
- **Settings** - Configure company, leave types, shifts, and salary components

### UI Components (All Custom Built)
- Responsive Sidebar & Navbar
- Data Tables with sorting and pagination
- Modal dialogs with animations
- Tabs navigation
- Stepper for multi-step processes
- Toast notifications
- Custom bar and pie charts (no libraries)
- Stats cards
- Form components

## 🎨 Color Palette

```css
Primary Background: #F9F5F6
Accent Background: #F8E8EE
Button Primary: #F2BED1
Button Hover: #FDCEDF
Text Dark: #1F2937
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd healthcare-hrms
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/          # Login page
│   ├── (dashboard)/
│   │   ├── layout.jsx      # Dashboard layout with sidebar
│   │   ├── dashboard/      # Main dashboard
│   │   ├── employees/      # Employee management
│   │   ├── attendance/     # Attendance tracking
│   │   ├── leaves/         # Leave management
│   │   ├── approvals/      # Approval system
│   │   ├── payroll/        # Payroll processing
│   │   ├── reports/        # Reports & analytics
│   │   └── settings/       # System settings
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── Navbar.jsx          # Top navigation bar
│   ├── Sidebar.jsx         # Side navigation menu
│   ├── DataTable.jsx       # Sortable data table
│   ├── Modal.jsx           # Modal dialog
│   ├── Tabs.jsx            # Tab navigation
│   ├── Stepper.jsx         # Multi-step indicator
│   ├── Toast.jsx           # Toast notifications
│   ├── Card.jsx            # Card container
│   ├── StatsCard.jsx       # Statistics card
│   └── SimpleChart.jsx     # Custom charts
├── context/
│   └── AppContext.tsx      # Global app state
└── lib/
    ├── mockData.ts         # Mock data for demo
    └── utils.ts            # Utility functions
```

## 🔑 Key Features

### Authentication & Role-Based Access Control
- Four user roles: Admin, HR, Payroll, Employee
- Role-based menu visibility
- Permission-based feature access
- Secure login with validation

**Demo Credentials:**
- **Admin:** admin@hospital.com / admin123 (Full Access)
- **HR:** hr@hospital.com / hr123 (Employee & Leave Management)
- **Payroll:** payroll@hospital.com / payroll123 (Payroll Processing)
- **Employee:** employee@hospital.com / emp123 (Self-Service Portal)

### Employee Management
- Add new employees with complete details
- View employee profiles with tabs (Profile, Job Info, Documents, Salary, History)
- Edit employee information
- Filter by department
- Export to CSV

### Attendance System
- Daily attendance tracking
- Edit attendance records
- Filter by date range and department
- Visual pie chart summary
- Export reports

### Leave Management
- Apply for different leave types
- View leave balance with progress bars
- Approve/reject team leaves
- Leave history tracking
- Automatic day calculation

### Payroll Processing
- 4-step wizard (Select Month → Preview → Simulate → Finalize)
- Salary breakdown with earnings and deductions
- Bulk payroll processing
- Export payroll data
- Generate payslips

### Reports & Analytics
- Attendance reports with weekly trends
- Leave distribution analysis
- Payroll trends over time
- Custom bar charts
- Export all reports to CSV

### Settings
- Company information
- Leave type configuration
- Shift management
- Salary component setup
- All configurable through UI

## 🎯 Technical Highlights

- **No External UI Libraries** - All components built from scratch
- **Pure Tailwind CSS** - No CSS-in-JS or styled-components
- **Custom Charts** - Built with HTML/CSS divs and SVG
- **Responsive Design** - Mobile-first approach
- **TypeScript Support** - Type-safe code
- **App Router** - Next.js 15+ App Router
- **Client-Side State** - React Context API
- **Smooth Animations** - CSS transitions and keyframes
- **Print Support** - Payslips can be printed/saved as PDF

## 📊 Mock Data

The application comes with pre-populated mock data including:
- 8 sample employees
- Attendance records
- Leave requests
- Payroll data
- Company settings

All data is stored in `src/lib/mockData.ts` and can be easily replaced with real API calls.

## 🎨 Customization

### Colors
Edit the color palette in `src/app/globals.css`:
```css
:root {
  --primary-bg: #F9F5F6;
  --accent-bg: #F8E8EE;
  --button-primary: #F2BED1;
  --button-hover: #FDCEDF;
  --text-dark: #1F2937;
}
```

### Mock Data
Replace mock data in `src/lib/mockData.ts` with your API endpoints.

### Components
All components are in `src/components/` and can be customized as needed.

## 🔐 Role-Based Access Control

### Admin (Full Access)
- Complete access to all modules
- Can manage employees, attendance, leaves, payroll, and settings
- Full CRUD operations on all entities

### HR Manager
- Employee management (add, edit, view)
- Attendance tracking and editing
- Leave approval and management
- View reports and settings
- **No payroll access**

### Payroll Officer
- View employees and attendance (read-only)
- Process monthly payroll
- Generate and view payslips
- Export payroll reports
- **Cannot edit employees or approve leaves**

### Employee (Self-Service)
- View own profile and information
- Apply for leave
- View leave balance and history
- View own attendance records
- View and download own payslips
- **Cannot access other employees' data**

See [ROLE_PERMISSIONS.md](ROLE_PERMISSIONS.md) for detailed permission matrix.

## 📝 License

This project is built as a demonstration of a complete HRMS system using modern web technologies.

## 🤝 Contributing

This is a complete, production-ready application. Feel free to use it as a template for your own projects.

## 📧 Support

For questions or issues, please open an issue in the repository.

---

Built with ❤️ using Next.js, React, and Tailwind CSS
