-- Insert Leave Types for all companies
USE workzen;

-- Insert leave types for each company
INSERT INTO leave_types (company_id, name, description, is_paid) 
SELECT DISTINCT c.id, 'Annual Leave', 'Paid annual vacation leave', TRUE
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM leave_types lt 
    WHERE lt.company_id = c.id AND lt.name = 'Annual Leave'
);

INSERT INTO leave_types (company_id, name, description, is_paid) 
SELECT DISTINCT c.id, 'Sick Leave', 'Paid sick leave for medical reasons', TRUE
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM leave_types lt 
    WHERE lt.company_id = c.id AND lt.name = 'Sick Leave'
);

INSERT INTO leave_types (company_id, name, description, is_paid) 
SELECT DISTINCT c.id, 'Casual Leave', 'Short-term casual leave', TRUE
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM leave_types lt 
    WHERE lt.company_id = c.id AND lt.name = 'Casual Leave'
);

INSERT INTO leave_types (company_id, name, description, is_paid) 
SELECT DISTINCT c.id, 'Unpaid Leave', 'Leave without pay', FALSE
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM leave_types lt 
    WHERE lt.company_id = c.id AND lt.name = 'Unpaid Leave'
);

-- Allocate leaves to all users for current year
INSERT INTO leave_allocations (user_id, leave_type_id, total_days, used_days, year)
SELECT 
    u.id,
    lt.id,
    CASE 
        WHEN lt.name = 'Annual Leave' THEN 20
        WHEN lt.name = 'Sick Leave' THEN 10
        WHEN lt.name = 'Casual Leave' THEN 5
        WHEN lt.name = 'Unpaid Leave' THEN 30
        ELSE 0
    END,
    0,
    YEAR(CURDATE())
FROM users u
CROSS JOIN leave_types lt
WHERE u.company_id = lt.company_id
AND NOT EXISTS (
    SELECT 1 FROM leave_allocations la 
    WHERE la.user_id = u.id 
    AND la.leave_type_id = lt.id 
    AND la.year = YEAR(CURDATE())
);

SELECT 'Leave types and allocations created successfully!' AS status;
SELECT company_id, COUNT(*) as leave_types_count FROM leave_types GROUP BY company_id;
SELECT COUNT(*) as total_allocations FROM leave_allocations WHERE year = YEAR(CURDATE());
