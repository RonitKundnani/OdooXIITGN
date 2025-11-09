-- Update Payroll Schema
USE workzen;

-- Drop existing tables to recreate with proper structure
DROP TABLE IF EXISTS payslip_details;
DROP TABLE IF EXISTS payslips;
DROP TABLE IF EXISTS payruns;
DROP TABLE IF EXISTS salary_components;
DROP TABLE IF EXISTS salary_structures;

-- Salary Structures
CREATE TABLE salary_structures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(20) NOT NULL,
    monthly_wage DECIMAL(12,2) NOT NULL,
    yearly_wage DECIMAL(12,2) NOT NULL,
    working_days_per_week INT DEFAULT 5,
    break_time_hours DECIMAL(4,2) DEFAULT 1.0,
    effective_from DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_active (user_id, is_active)
);

-- Salary Components
CREATE TABLE salary_components (
    id INT PRIMARY KEY AUTO_INCREMENT,
    salary_structure_id INT NOT NULL,
    component_name VARCHAR(100) NOT NULL,
    component_type ENUM('earning', 'deduction') NOT NULL,
    calculation_type ENUM('fixed', 'percentage_of_wage', 'percentage_of_basic') NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salary_structure_id) REFERENCES salary_structures(id) ON DELETE CASCADE
);

-- Payruns
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

-- Payslips
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payrun_id) REFERENCES payruns(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_payslips_status (status),
    INDEX idx_user_payrun (user_id, payrun_id)
);

-- Payslip Details
CREATE TABLE payslip_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payslip_id INT NOT NULL,
    component_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    component_type ENUM('earning', 'deduction') NOT NULL,
    FOREIGN KEY (payslip_id) REFERENCES payslips(id) ON DELETE CASCADE
);

SELECT 'Payroll schema updated successfully!' AS status;
