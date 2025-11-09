-- Setup Sample Payroll Data for Company ID 3
USE workzen;

-- Add salary structures for all active employees
INSERT INTO salary_structures (user_id, monthly_wage, yearly_wage, working_days_per_week, break_time_hours, effective_from, is_active)
VALUES 
    ('WIAKDO20250001', 60000.00, 720000.00, 5, 1.0, '2025-01-01', TRUE),
    ('WIAKDO20250002', 45000.00, 540000.00, 5, 1.0, '2025-01-01', TRUE),
    ('WINADE20250001', 80000.00, 960000.00, 5, 1.0, '2025-01-01', TRUE),
    ('WIROKU20250001', 50000.00, 600000.00, 5, 1.0, '2025-01-01', TRUE)
ON DUPLICATE KEY UPDATE 
    monthly_wage = VALUES(monthly_wage),
    yearly_wage = VALUES(yearly_wage);

-- Get the salary structure IDs
SET @ss1 = (SELECT id FROM salary_structures WHERE user_id = 'WIAKDO20250001' AND is_active = TRUE LIMIT 1);
SET @ss2 = (SELECT id FROM salary_structures WHERE user_id = 'WIAKDO20250002' AND is_active = TRUE LIMIT 1);
SET @ss3 = (SELECT id FROM salary_structures WHERE user_id = 'WINADE20250001' AND is_active = TRUE LIMIT 1);
SET @ss4 = (SELECT id FROM salary_structures WHERE user_id = 'WIROKU20250001' AND is_active = TRUE LIMIT 1);

-- Add salary components for each employee
-- Employee 1: AKash Dolani (HR Officer) - 60,000/month
INSERT INTO salary_components (salary_structure_id, component_name, component_type, calculation_type, value)
VALUES 
    (@ss1, 'Basic Salary', 'earning', 'percentage_of_wage', 50.00),
    (@ss1, 'HRA', 'earning', 'percentage_of_basic', 40.00),
    (@ss1, 'Special Allowance', 'earning', 'percentage_of_wage', 10.00),
    (@ss1, 'Professional Tax', 'deduction', 'fixed', 200.00)
ON DUPLICATE KEY UPDATE component_name = VALUES(component_name);

-- Employee 2: Akash 2 Dolani (Employee) - 45,000/month
INSERT INTO salary_components (salary_structure_id, component_name, component_type, calculation_type, value)
VALUES 
    (@ss2, 'Basic Salary', 'earning', 'percentage_of_wage', 50.00),
    (@ss2, 'HRA', 'earning', 'percentage_of_basic', 40.00),
    (@ss2, 'Special Allowance', 'earning', 'percentage_of_wage', 10.00),
    (@ss2, 'Professional Tax', 'deduction', 'fixed', 200.00)
ON DUPLICATE KEY UPDATE component_name = VALUES(component_name);

-- Employee 3: Nakul Desai (Admin) - 80,000/month
INSERT INTO salary_components (salary_structure_id, component_name, component_type, calculation_type, value)
VALUES 
    (@ss3, 'Basic Salary', 'earning', 'percentage_of_wage', 50.00),
    (@ss3, 'HRA', 'earning', 'percentage_of_basic', 40.00),
    (@ss3, 'Special Allowance', 'earning', 'percentage_of_wage', 10.00),
    (@ss3, 'Professional Tax', 'deduction', 'fixed', 200.00)
ON DUPLICATE KEY UPDATE component_name = VALUES(component_name);

-- Employee 4: ronit kundu (Employee) - 50,000/month
INSERT INTO salary_components (salary_structure_id, component_name, component_type, calculation_type, value)
VALUES 
    (@ss4, 'Basic Salary', 'earning', 'percentage_of_wage', 50.00),
    (@ss4, 'HRA', 'earning', 'percentage_of_basic', 40.00),
    (@ss4, 'Special Allowance', 'earning', 'percentage_of_wage', 10.00),
    (@ss4, 'Professional Tax', 'deduction', 'fixed', 200.00)
ON DUPLICATE KEY UPDATE component_name = VALUES(component_name);

-- Verify the setup
SELECT 
    ss.id,
    ss.user_id,
    u.first_name,
    u.last_name,
    ss.monthly_wage,
    ss.yearly_wage,
    COUNT(sc.id) as component_count
FROM salary_structures ss
JOIN users u ON ss.user_id = u.id
LEFT JOIN salary_components sc ON ss.id = sc.salary_structure_id
WHERE u.company_id = 3 AND ss.is_active = TRUE
GROUP BY ss.id;

SELECT '✅ Salary structures and components added successfully!' AS status;
SELECT 'Now you can run payroll from the frontend: Payroll → Run Payroll' AS next_step;
