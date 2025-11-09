-- Setup Leave Types for Company ID 3
USE workzen;

-- Insert default leave types
INSERT INTO leave_types (company_id, name, description, is_paid)
VALUES 
    (3, 'Annual Leave', 'Paid annual leave for vacation', TRUE),
    (3, 'Sick Leave', 'Paid leave for medical reasons', TRUE),
    (3, 'Casual Leave', 'Short-term casual leave', TRUE),
    (3, 'Maternity Leave', 'Maternity leave for female employees', TRUE),
    (3, 'Paternity Leave', 'Paternity leave for male employees', TRUE),
    (3, 'Unpaid Leave', 'Leave without pay', FALSE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Verify
SELECT * FROM leave_types WHERE company_id = 3;

-- Setup leave allocations for all employees in company 3
INSERT INTO leave_allocations (user_id, leave_type_id, total_days, used_days, year)
SELECT 
    u.id,
    lt.id,
    CASE 
        WHEN lt.name = 'Annual Leave' THEN 20
        WHEN lt.name = 'Sick Leave' THEN 12
        WHEN lt.name = 'Casual Leave' THEN 10
        WHEN lt.name = 'Maternity Leave' THEN 180
        WHEN lt.name = 'Paternity Leave' THEN 15
        ELSE 0
    END as total_days,
    0 as used_days,
    YEAR(CURDATE()) as year
FROM users u
CROSS JOIN leave_types lt
WHERE u.company_id = 3 
  AND lt.company_id = 3
  AND u.is_active = TRUE
ON DUPLICATE KEY UPDATE total_days = VALUES(total_days);

-- Verify allocations
SELECT 
    u.first_name,
    u.last_name,
    lt.name as leave_type,
    la.total_days,
    la.used_days,
    (la.total_days - la.used_days) as remaining
FROM leave_allocations la
JOIN users u ON la.user_id = u.id
JOIN leave_types lt ON la.leave_type_id = lt.id
WHERE u.company_id = 3
ORDER BY u.first_name, lt.name;

SELECT '✅ Leave types and allocations created successfully!' AS status;
