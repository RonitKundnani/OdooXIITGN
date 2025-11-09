-- Add Sample Salary Structures for Employees
USE workzen;

-- Get all active employees from company_id = 3
-- Add salary structures for them

-- Example: Add salary structure for employees
-- You'll need to replace user_id with actual employee IDs from your database

-- First, let's see what employees we have
SELECT 
    id as user_id, 
    CONCAT(first_name, ' ', last_name) as name,
    email,
    role
FROM users 
WHERE company_id = 3 AND is_active = TRUE;

-- Sample salary structure insert (uncomment and modify with actual user_ids)
-- INSERT INTO salary_structures (user_id, monthly_wage, yearly_wage, working_days_per_week, break_time_hours, effective_from, is_active)
-- VALUES 
--     ('DEMO-EMP-2024-001', 50000.00, 600000.00, 5, 1.0, '2024-01-01', TRUE),
--     ('DEMO-EMP-2024-002', 45000.00, 540000.00, 5, 1.0, '2024-01-01', TRUE);

-- Sample salary components (uncomment after adding salary structures)
-- Get the salary_structure_id from the above insert, then add components
-- 
-- INSERT INTO salary_components (salary_structure_id, component_name, component_type, calculation_type, value)
-- VALUES 
--     -- For salary_structure_id = 1 (replace with actual ID)
--     (1, 'Basic Salary', 'earning', 'percentage_of_wage', 50.00),
--     (1, 'HRA', 'earning', 'percentage_of_basic', 40.00),
--     (1, 'Special Allowance', 'earning', 'percentage_of_wage', 10.00),
--     (1, 'Professional Tax', 'deduction', 'fixed', 200.00);

-- To add salary structures via API, use the frontend Settings page or make API calls
