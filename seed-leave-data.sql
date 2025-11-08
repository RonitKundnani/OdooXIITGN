-- Seed Leave Data for WorkZen
USE workzen;

-- Get the demo company ID
SET @company_id = (SELECT id FROM companies WHERE company_code = 'DEMO' LIMIT 1);

-- Insert default leave types
INSERT INTO leave_types (company_id, name, description, is_paid) VALUES
(@company_id, 'Annual Leave', 'Paid annual vacation leave', TRUE),
(@company_id, 'Sick Leave', 'Paid sick leave for medical reasons', TRUE),
(@company_id, 'Casual Leave', 'Short-term casual leave', TRUE),
(@company_id, 'Unpaid Leave', 'Leave without pay', FALSE)
ON DUPLICATE KEY UPDATE name = name;

-- Get leave type IDs
SET @annual_leave_id = (SELECT id FROM leave_types WHERE company_id = @company_id AND name = 'Annual Leave' LIMIT 1);
SET @sick_leave_id = (SELECT id FROM leave_types WHERE company_id = @company_id AND name = 'Sick Leave' LIMIT 1);
SET @casual_leave_id = (SELECT id FROM leave_types WHERE company_id = @company_id AND name = 'Casual Leave' LIMIT 1);
SET @unpaid_leave_id = (SELECT id FROM leave_types WHERE company_id = @company_id AND name = 'Unpaid Leave' LIMIT 1);

-- Allocate leaves to all users in the company for current year
INSERT INTO leave_allocations (user_id, leave_type_id, total_days, used_days, year)
SELECT 
    u.id,
    @annual_leave_id,
    20,
    0,
    YEAR(CURDATE())
FROM users u
WHERE u.company_id = @company_id
ON DUPLICATE KEY UPDATE total_days = total_days;

INSERT INTO leave_allocations (user_id, leave_type_id, total_days, used_days, year)
SELECT 
    u.id,
    @sick_leave_id,
    10,
    0,
    YEAR(CURDATE())
FROM users u
WHERE u.company_id = @company_id
ON DUPLICATE KEY UPDATE total_days = total_days;

INSERT INTO leave_allocations (user_id, leave_type_id, total_days, used_days, year)
SELECT 
    u.id,
    @casual_leave_id,
    5,
    0,
    YEAR(CURDATE())
FROM users u
WHERE u.company_id = @company_id
ON DUPLICATE KEY UPDATE total_days = total_days;

INSERT INTO leave_allocations (user_id, leave_type_id, total_days, used_days, year)
SELECT 
    u.id,
    @unpaid_leave_id,
    30,
    0,
    YEAR(CURDATE())
FROM users u
WHERE u.company_id = @company_id
ON DUPLICATE KEY UPDATE total_days = total_days;

SELECT '✅ Leave types and allocations created successfully!' AS status;
SELECT CONCAT('Leave types created: ', COUNT(*), ' types') AS leave_types FROM leave_types WHERE company_id = @company_id;
SELECT CONCAT('Leave allocations created: ', COUNT(*), ' allocations') AS allocations FROM leave_allocations la JOIN users u ON la.user_id = u.id WHERE u.company_id = @company_id;
