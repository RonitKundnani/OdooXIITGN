use workzen;

-- Companies Table (MUST BE FIRST)
CREATE TABLE companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_code VARCHAR(10) UNIQUE NOT NULL, -- 'OI' for Odoo India
    company_name VARCHAR(255) NOT NULL,
    company_logo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users and Authentication (UPDATED with company_id)
CREATE TABLE users (
    id VARCHAR(20) PRIMARY KEY, -- Node.js will generate: OIJODO20220001
    company_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'hr_officer', 'payroll_officer', 'employee') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    
);

-- User Profiles
CREATE TABLE user_profiles (
    user_id VARCHAR(20) PRIMARY KEY,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    marital_status ENUM('single', 'married', 'divorced', 'widowed'),
    personal_email VARCHAR(255),
    address TEXT,
    nationality VARCHAR(100),
    profile_picture VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Employment Details (UPDATED - removed company_name)
CREATE TABLE employment_details (
    user_id VARCHAR(20) PRIMARY KEY,
    department VARCHAR(100),
    job_position VARCHAR(100),
    manager_id VARCHAR(20),
    location VARCHAR(255),
    date_of_joining DATE,
    work_schedule JSON,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- Bank and Financial Details
CREATE TABLE financial_details (
    user_id VARCHAR(20) PRIMARY KEY,
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    pan_number VARCHAR(20),
    uan_number VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Attendance (UPDATED with company_id)
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(20) NOT NULL,
    company_id INT NOT NULL,
    check_in TIMESTAMP NOT NULL,
    check_out TIMESTAMP NULL,
    work_hours DECIMAL(5,2),
    extra_hours DECIMAL(5,2),
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'half_day') DEFAULT 'absent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    INDEX idx_user_date (user_id, date),
    INDEX idx_attendance_date (date),
    INDEX idx_company_date (company_id, date)
);

-- Leave Management
CREATE TABLE leave_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE leave_allocations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(20) NOT NULL,
    leave_type_id INT NOT NULL,
    total_days INT NOT NULL,
    used_days INT DEFAULT 0,
    year YEAR NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id)
);

CREATE TABLE leave_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(20) NOT NULL,
    company_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5,2) NOT NULL,
    reason TEXT,
    attachment VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_leave_requests_status (status),
    INDEX idx_leave_requests_dates (start_date, end_date),
    INDEX idx_company_status (company_id, status)
);

-- Payroll Management
CREATE TABLE salary_structures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(20) NOT NULL,
    monthly_wage DECIMAL(12,2) NOT NULL,
    yearly_wage DECIMAL(12,2) NOT NULL,
    effective_from DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Store final calculated components
CREATE TABLE salary_components (
    id INT PRIMARY KEY AUTO_INCREMENT,
    salary_structure_id INT NOT NULL,
    component_name VARCHAR(100) NOT NULL,
    component_type ENUM('earning', 'deduction') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (salary_structure_id) REFERENCES salary_structures(id)
);

CREATE TABLE payruns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    status ENUM('draft', 'computed', 'validated', 'cancelled') DEFAULT 'draft',
    created_by VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_payruns_period (pay_period_start, pay_period_end),
    INDEX idx_company_status (company_id, status)
);

-- Store final calculated payslip data
CREATE TABLE payslips (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payrun_id INT NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    total_working_days INT NOT NULL,
    paid_days DECIMAL(5,2) NOT NULL,
    basic_salary DECIMAL(10,2) NOT NULL,
    gross_salary DECIMAL(10,2) NOT NULL,
    total_deductions DECIMAL(10,2) NOT NULL,
    net_salary DECIMAL(10,2) NOT NULL,
    status ENUM('draft', 'computed', 'validated') DEFAULT 'draft',
    FOREIGN KEY (payrun_id) REFERENCES payruns(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_payslips_status (status)
);

-- Store final calculated payslip breakdown
CREATE TABLE payslip_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payslip_id INT NOT NULL,
    component_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    component_type ENUM('earning', 'deduction') NOT NULL,
    FOREIGN KEY (payslip_id) REFERENCES payslips(id)
);

-- System Logs for Audit
CREATE TABLE system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(20),
    company_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    module VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
-- User Settings
CREATE TABLE user_settings (
    user_id VARCHAR(20) PRIMARY KEY,
    email_notifications BOOLEAN DEFAULT TRUE,
    theme ENUM('light', 'dark') DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Company Settings (NEW - for company-specific configurations)
CREATE TABLE company_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    UNIQUE KEY unique_company_setting (company_id, setting_key)
);