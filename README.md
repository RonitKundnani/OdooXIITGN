# 🏢 WorkZen - Complete HR Management System

<div align="center">

![WorkZen Logo](https://via.placeholder.com/150x150/F2BED1/1F2937?text=WorkZen)

**A Full-Stack Enterprise HR Management System with Role-Based Access Control**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

[📂 Project Drive Link](https://drive.google.com/drive/folders/1GgDH-g-Vmes6LmKAxVbEnfAeapTnWPcL ) • 

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [User Roles & Permissions](#-user-roles--permissions)
- [Core Modules](#-core-modules)
- [Frontend Components](#-frontend-components)
- [Backend API](#-backend-api)
- [Database Schema](#-database-schema)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**WorkZen** is a comprehensive, production-ready Human Resource Management System (HRMS) designed for modern enterprises. Built with cutting-edge technologies, it provides a complete solution for managing employees, attendance, leaves, payroll, and analytics with a beautiful, responsive UI.

### ✨ Highlights

- 🔐 **Multi-tenant Architecture** - Support for multiple companies with isolated data
- 👥 **4 Role-Based Access Levels** - Admin, HR Officer, Payroll Officer, Employee
- 📊 **Real-time Analytics Dashboard** - Interactive charts and statistics
- 💰 **Advanced Payroll System** - Automated salary calculations with PF, Professional Tax
- 📱 **Fully Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Custom UI Components** - No external UI libraries, built from scratch
- 🔒 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- 📧 **Email Notifications** - Automated emails for leave approvals, payslips
- 📈 **Comprehensive Reports** - Attendance, Leave, and Payroll reports with export


---

## 🎯 Problem Statement

Develop a working HR Management System focusing on the following modules and workflows:

### Core Requirements

#### 1. User & Role Management
- ✅ User registration and login functionality
- ✅ Role-based access control (Employee / HR Officer / Admin / Payroll Officer)
- ✅ Editable profile management with complete employee details
- ✅ Multi-tenant company support with unique company codes

#### 2. Attendance & Leave Management
- ✅ Employees can mark attendance (Check-in/Check-out)
- ✅ View daily and monthly attendance logs
- ✅ Leave application with multiple leave types
- ✅ Leave approval and rejection workflows
- ✅ Leave balance tracking and allocation
- ✅ Attendance reports with analytics

#### 3. Payroll Management
- ✅ Comprehensive payroll module with salary breakdown
- ✅ Automated calculation of earnings and deductions
- ✅ Provident Fund (PF) and Professional Tax calculations
- ✅ Monthly payrun processing with 4-step wizard
- ✅ Payslip generation and distribution
- ✅ Admin/Payroll Officer can generate and edit reports

#### 4. Dashboard & Analytics
- ✅ Real-time attendance, leave, and payroll metrics
- ✅ Interactive charts and data visualizations
- ✅ Admin overview of employee data and HR statistics
- ✅ Weekly attendance trends
- ✅ Recent activity feed

### Deliverables
- ✅ Source code hosted on Git repository with meaningful commits
- ✅ Complete documentation and user guides
- ✅ Database schema with ER diagram
- ✅ Role-based permission matrix
- ✅ API documentation

---

## 🚀 Key Features

### 🔐 Authentication & Security
- **Company Registration** - Multi-tenant support with unique company codes
- **Secure Login** - JWT token-based authentication
- **Password Encryption** - Bcrypt hashing for secure password storage
- **Session Management** - Persistent login with token refresh
- **Role-Based Access Control** - Granular permissions for each role

### 👥 Employee Management
- **Complete Employee Profiles** - Personal, employment, and financial details
- **Employee Directory** - Searchable and filterable employee list
- **Profile Editing** - Update personal information, job details, salary structure
- **Document Management** - Store and view employee documents
- **Employment History** - Track job changes and promotions
- **Manager Assignment** - Hierarchical reporting structure

### ⏰ Attendance System
- **Real-time Check-in/Check-out** - Mark attendance from dashboard
- **Attendance Logs** - View daily, weekly, and monthly records
- **Manual Attendance Entry** - HR/Admin can mark attendance for employees
- **Attendance Reports** - Detailed reports with filters
- **Work Hours Calculation** - Automatic calculation of work and extra hours
- **Attendance Analytics** - Visual charts showing attendance trends

### 🏖️ Leave Management
- **Multiple Leave Types** - Casual, Sick, Earned, Unpaid leaves
- **Leave Application** - Easy-to-use leave request form
- **Leave Balance Tracking** - Real-time balance with progress bars
- **Approval Workflow** - Multi-level approval system
- **Leave Calendar** - Visual representation of team leaves
- **Leave Reports** - Comprehensive leave analytics
- **Leave Allocation** - HR can allocate leaves to employees


### 💰 Payroll System
- **4-Step Payroll Wizard** - Select Month → Preview → Simulate → Finalize
- **Automated Calculations** - Earnings, deductions, PF, Professional Tax
- **Salary Components** - Configurable earnings and deductions
- **Payrun Management** - Create and manage monthly payruns
- **Payslip Generation** - Automatic payslip creation for all employees
- **Payslip Distribution** - Employees can view and download payslips
- **Salary Structure** - Define custom salary structures per employee
- **Attendance-Based Payroll** - Salary calculated based on attendance records

### 📊 Reports & Analytics
- **Dashboard Overview** - Key metrics and statistics at a glance
- **Attendance Reports** - Daily, weekly, monthly attendance analysis
- **Leave Reports** - Leave distribution and trends
- **Payroll Reports** - Salary trends and payroll summaries
- **Custom Date Ranges** - Filter reports by specific periods
- **Export Functionality** - Download reports as CSV
- **Visual Charts** - Bar charts, pie charts for data visualization
- **Real-time Updates** - Live data refresh

### ⚙️ Settings & Configuration
- **Company Settings** - Manage company information and logo
- **Leave Type Configuration** - Create and manage leave types
- **Shift Management** - Define work shifts and schedules
- **Salary Components** - Configure earnings and deductions
- **Payroll Settings** - Set PF percentage, Professional Tax
- **User Role Management** - Assign and modify user roles
- **System Preferences** - Customize system behavior

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.1 | React framework with App Router |
| **React** | 19.2.0 | UI library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **React Context API** | - | Global state management |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express.js** | 5.1.0 | Web application framework |
| **MySQL** | 8.x | Relational database |
| **JWT** | 9.0.2 | Authentication tokens |
| **Bcrypt** | 6.0.0 | Password hashing |
| **Nodemailer** | 7.0.10 | Email service |

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control
- **npm** - Package management

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js Frontend (Port 3000)                        │   │
│  │  - React Components                                  │   │
│  │  - Tailwind CSS Styling                             │   │
│  │  - Context API State Management                     │   │
│  │  - Client-side Routing                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js Backend (Port 5000)                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │ Controllers│  │ Middleware │  │   Routes   │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘    │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │   Models   │  │   Utils    │  │   Config   │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL Queries
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MySQL Database (Port 3306)                          │   │
│  │  - Companies                                         │   │
│  │  - Users & Profiles                                  │   │
│  │  - Attendance & Leaves                               │   │
│  │  - Payroll & Salary                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```


---

## 👥 User Roles & Permissions

### 1. 👑 Admin (Full Access)


#### Permissions
- ✅ Full access to all modules and features
- ✅ Create, Read, Update, Delete operations on all data
- ✅ Manage user accounts and roles
- ✅ Configure system settings
- ✅ View all reports and analytics
- ✅ Process payroll and generate payslips
- ✅ Approve/reject leave requests
- ✅ Manage attendance records

#### Accessible Modules
- 📊 Dashboard (Full Overview)
- 👥 Employees (Full CRUD)
- ⏰ Attendance (View & Edit)
- 🏖️ Leaves (View & Approve)
- ✅ Approvals (All Requests)
- 💰 Payroll (Full Access)
- 📈 Reports (All Reports)
- ⚙️ Settings (Full Configuration)

---

### 2. 👔 HR Officer


#### Permissions
- ✅ Manage employee profiles and records
- ✅ Monitor and edit attendance
- ✅ Approve/reject leave requests
- ✅ Allocate leaves to employees
- ✅ View reports and analytics
- ✅ Manage system settings
- ❌ **No payroll access**

#### Accessible Modules
- 📊 Dashboard (HR Overview)
- 👥 Employees (Full CRUD)
- ⏰ Attendance (View & Edit)
- 🏖️ Leaves (View & Approve)
- ✅ Approvals (Leave Requests)
- 📈 Reports (Attendance & Leave)
- ⚙️ Settings (Limited)

#### Key Responsibilities
- Create and update employee profiles
- Monitor attendance records of all employees
- Manage and allocate new leaves
- Approve or reject time-off requests
- Generate attendance and leave reports

---

### 3. 💼 Payroll Officer


#### Permissions
- ✅ View employee data (Read-only)
- ✅ View attendance records (Read-only)
- ✅ Process monthly payroll
- ✅ Generate and distribute payslips
- ✅ View payroll reports
- ✅ Manage salary structures
- ❌ **Cannot edit employees**
- ❌ **Cannot approve leaves**
- ❌ **No settings access**

#### Accessible Modules
- 📊 Dashboard (Payroll Overview)
- 👥 Employees (View Only)
- ⏰ Attendance (View Only)
- 💰 Payroll (Full Access)
- 📈 Reports (Payroll Reports)

#### Key Responsibilities
- Run monthly payroll cycles
- Calculate salaries based on attendance
- Generate payslips for all employees
- Manage salary components and structures
- Export payroll reports

---

### 4. 👤 Employee (Self-Service)

#### Permissions
- ✅ View own profile and information
- ✅ Mark own attendance (Check-in/Check-out)
- ✅ Apply for leave
- ✅ View leave balance and history
- ✅ View own attendance records
- ✅ View and download own payslips
- ❌ **Cannot access other employees' data**
- ❌ **Cannot access settings**
- ❌ **Cannot view payroll module**

#### Accessible Modules
- 📊 Dashboard (Personal Overview)
- 👤 My Profile (View & Edit)
- ⏰ My Attendance (View Only)
- 🏖️ My Leaves (Apply & View)
- 💰 My Payslips (View & Download)

#### Key Features
- Check-in/Check-out from dashboard
- Apply for time off with leave balance tracking
- View personal attendance history
- Download monthly payslips
- Update personal information

---


### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **npm** or **yarn** - Package manager
- **Git** - Version control

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/RonitKundnani/OdooXIITGN.git
cd OdooXIITGN
```

---

### Step 2: Database Setup

#### Create Database

```sql
CREATE DATABASE workzen;
USE workzen;
```

#### Run Database Schema

```bash
# Navigate to backend directory
cd backend

# Run the database setup script
mysql -u root -p workzen < database-setup.sql

# Insert default leave types
mysql -u root -p workzen < insert-leave-types.sql

# (Optional) Add sample data
mysql -u root -p workzen < seed-leave-data.sql
mysql -u root -p workzen < add-sample-salaries.sql
```

---

### Step 3: Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=workzen
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@workzen.com

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

#### Start Backend Server

```bash
# Development mode
npm start

# Or with nodemon (auto-restart)
npx nodemon server.js
```

The backend server will start on `http://localhost:5000`

---

### Step 4: Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure API Endpoint

Update `frontend/src/lib/api.ts` if needed:

```typescript
const API_BASE_URL = 'http://localhost:5000';
```

#### Start Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

---

### Step 5: Create First Company & Admin

1. Open browser and navigate to `http://localhost:3000`
2. Click on "Sign Up" or "Register Company"
3. Fill in the company registration form:
   - Company Name: Your Company Name
   - Admin Email: admin@yourcompany.com
   - Password: Create a secure password
   - First Name & Last Name
4. Click "Register"
5. You'll receive a company code (e.g., "YC" for Your Company)
6. Login with your admin credentials

---

### Step 6: Initial Configuration

After logging in as Admin:

1. **Configure Leave Types** (Settings → Leave Types)
   - Verify default leave types
   - Add custom leave types if needed

2. **Set Payroll Settings** (Settings → Payroll)
   - Set PF percentage (default: 12%)
   - Set Professional Tax amount
   - Configure payment cycle

3. **Add Employees** (Employees → Add Employee)
   - Add HR Officers
   - Add Payroll Officers
   - Add Employees

4. **Allocate Leaves** (Leaves → Allocate)
   - Allocate annual leave balance to employees

---

### Production Deployment

#### Backend Deployment

1. **Set Production Environment Variables**
```env
NODE_ENV=production
DB_HOST=your_production_db_host
JWT_SECRET=strong_random_secret_key
CORS_ORIGIN=https://your-domain.com
```

2. **Build and Start**
```bash
npm start
```

3. **Use Process Manager (PM2)**
```bash
npm install -g pm2
pm2 start server.js --name workzen-backend
pm2 save
pm2 startup
```

#### Frontend Deployment

1. **Build for Production**
```bash
cd frontend
npm run build
```

2. **Start Production Server**
```bash
npm start
```

3. **Deploy to Vercel/Netlify**
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

---


## 📖 Usage Guide

### For Admin

1. **Dashboard Overview**
   - View key metrics and statistics
   - Check today's attendance
   - Monitor pending approvals

2. **Employee Management**
   - Add new employees with complete details
   - Edit employee information
   - Manage salary structures
   - View employee profiles

3. **Attendance Management**
   - Mark attendance for employees
   - Edit attendance records
   - View attendance reports
   - Export attendance data

4. **Leave Management**
   - Approve/reject leave requests
   - Allocate leaves to employees
   - View leave reports
   - Configure leave types

5. **Payroll Processing**
   - Create monthly payrun
   - Preview employee salaries
   - Simulate payroll calculations
   - Finalize and generate payslips

6. **Reports & Analytics**
   - View attendance trends
   - Analyze leave patterns
   - Monitor payroll costs
   - Export reports

7. **System Configuration**
   - Update company settings
   - Configure leave types
   - Set payroll parameters
   - Manage user roles

---

### For HR Officer

1. **Employee Management**
   - Add and update employee records
   - Maintain employee database
   - Update job information

2. **Attendance Tracking**
   - Mark attendance for employees
   - Edit attendance records
   - Generate attendance reports

3. **Leave Management**
   - Approve/reject team leave requests
   - Allocate leaves
   - Monitor leave balance

4. **Reports**
   - View attendance reports
   - Generate leave reports
   - Export data for analysis

---

### For Payroll Officer

1. **Payroll Processing**
   - Create monthly payrun
   - Calculate salaries
   - Generate payslips
   - Finalize payroll

2. **Salary Management**
   - View salary structures
   - Update salary components
   - Manage deductions

3. **Reports**
   - View payroll reports
   - Export payroll data
   - Analyze salary trends

---

### For Employee

1. **Dashboard**
   - Check-in/Check-out
   - View personal statistics
   - See recent activity

2. **My Profile**
   - View personal information
   - Update contact details
   - View employment details

3. **My Attendance**
   - View attendance history
   - Check work hours
   - Monitor attendance status

4. **My Leaves**
   - Apply for leave
   - View leave balance
   - Track leave requests
   - Cancel pending leaves

5. **My Payslips**
   - View monthly payslips
   - Download payslips
   - Check salary breakdown


---

