-- SynthalystHRM Database Seed Script
-- Generates default organization, core departments, default designations,
-- sample users (super admin, HR manager, employees), initial leave balances,
-- and salary structures for testing multi-tenancy and modules.

-- Note: Passwords are hashed using standard bcrypt for local development
-- Raw password for all seeded users: "Password123"
-- Hashed value: "$2b$12$94Ittr0uVOPenGAu5nS3UOxhMX/z800n6dgq1NE68zxddAZYLF7Ny"

-- =========================================================================
-- 1. SEED ORGANIZATIONS (TENANTS)
-- =========================================================================

INSERT INTO organizations (id, name, subdomain, domain, subscription_plan, subscription_status, feature_talent_mgmt, feature_hr_team, feature_resource_mgmt)
VALUES 
('a8385002-390c-45a8-8e6d-2c8b7468112c', 'Acme Corporation', 'acme', 'acme.cybehrm.com', 'growth', 'active', true, true, true),
('b5278c6a-49bd-4cc7-bc6d-eb1a3c77d54b', 'Nexus Health', 'nexus', 'nexushealth.com', 'starter', 'active', true, true, true);


-- =========================================================================
-- 2. SEED USERS FOR ACME CORP (TENANT A)
-- =========================================================================

INSERT INTO users (id, organization_id, email, password_hash, role, is_active)
VALUES
-- Super Admin / HR Admin
('c1a8e8f2-89dc-4fba-994c-88229b12a84d', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'admin@acme.com', '$2b$12$94Ittr0uVOPenGAu5nS3UOxhMX/z800n6dgq1NE68zxddAZYLF7Ny', 'hr_admin', true),
-- Manager
('d2b9f9e3-9ab3-4cbd-883c-99330c23b95e', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'manager@acme.com', '$2b$12$94Ittr0uVOPenGAu5nS3UOxhMX/z800n6dgq1NE68zxddAZYLF7Ny', 'manager', true),
-- Employee 1
('e3c0a0f4-ab45-4ded-bb4c-dd441d34c06f', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'john.doe@acme.com', '$2b$12$94Ittr0uVOPenGAu5nS3UOxhMX/z800n6dgq1NE68zxddAZYLF7Ny', 'employee', true);

-- =========================================================================
-- 3. SEED USERS FOR NEXUS HEALTH (TENANT B - ISOLATION TEST)
-- =========================================================================

INSERT INTO users (id, organization_id, email, password_hash, role, is_active)
VALUES
-- HR Admin
('f4d1b1f5-bc56-4efe-cc5d-ee552e45d17a', 'b5278c6a-49bd-4cc7-bc6d-eb1a3c77d54b', 'hr@nexushealth.com', '$2b$12$94Ittr0uVOPenGAu5nS3UOxhMX/z800n6dgq1NE68zxddAZYLF7Ny', 'hr_admin', true);

-- =========================================================================
-- 4. SEED DEPARTMENTS & DESIGNATIONS (TENANT A)
-- =========================================================================

INSERT INTO departments (id, organization_id, name, code)
VALUES
('d1111111-1111-1111-1111-111111111111', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'Human Resources', 'HR'),
('d2222222-2222-2222-2222-222222222222', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'Engineering', 'ENG');

INSERT INTO designations (id, organization_id, title)
VALUES
('91111111-1111-1111-1111-111111111111', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'HR Director'),
('92222222-2222-2222-2222-222222222222', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'Engineering Lead'),
('93333333-3333-3333-3333-333333333333', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'Software Engineer');

-- =========================================================================
-- 5. SEED DEPARTMENTS & DESIGNATIONS (TENANT B)
-- =========================================================================

INSERT INTO departments (id, organization_id, name, code)
VALUES
('d3333333-3333-3333-3333-333333333333', 'b5278c6a-49bd-4cc7-bc6d-eb1a3c77d54b', 'Clinical Operations', 'CLINIC');

INSERT INTO designations (id, organization_id, title)
VALUES
('94444444-4444-4444-4444-444444444444', 'b5278c6a-49bd-4cc7-bc6d-eb1a3c77d54b', 'Chief Nursing Officer');

-- =========================================================================
-- 6. SEED EMPLOYEES (TENANT A)
-- =========================================================================

INSERT INTO employees (id, organization_id, user_id, employee_id, first_name, last_name, dob, gender, phone, address, department_id, designation_id, manager_id, joining_date, employment_type, employment_status, grade)
VALUES
-- Seed HR Admin Employee
('e1111111-1111-1111-1111-111111111111', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'c1a8e8f2-89dc-4fba-994c-88229b12a84d', 'EMP-1001', 'Sarah', 'Jenkins', '1988-04-12', 'Female', '+1234567890', '123 Main St, Tech City', 'd1111111-1111-1111-1111-111111111111', '91111111-1111-1111-1111-111111111111', NULL, '2022-01-15', 'full-time', 'active', 'L3'),

-- Seed Manager Employee (ENG Lead)
('e2222222-2222-2222-2222-222222222222', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'd2b9f9e3-9ab3-4cbd-883c-99330c23b95e', 'EMP-1002', 'David', 'Miller', '1985-09-24', 'Male', '+1234567891', '456 Oak Ave, Code Village', 'd2222222-2222-2222-2222-222222222222', '92222222-2222-2222-2222-222222222222', NULL, '2023-03-01', 'full-time', 'active', 'L2'),

-- Seed Standard Employee (Software Engineer, reporting to David Miller)
('e3333333-3333-3333-3333-333333333333', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e3c0a0f4-ab45-4ded-bb4c-dd441d34c06f', 'EMP-1003', 'John', 'Doe', '1993-11-05', 'Male', '+1234567892', '789 Pine Lane, Binary Suburb', 'd2222222-2222-2222-2222-222222222222', '93333333-3333-3333-3333-333333333333', 'e2222222-2222-2222-2222-222222222222', '2024-06-10', 'full-time', 'active', 'L1');

-- Update Manager for Departments now that employees exist
UPDATE departments SET manager_id = 'e1111111-1111-1111-1111-111111111111' WHERE id = 'd1111111-1111-1111-1111-111111111111';
UPDATE departments SET manager_id = 'e2222222-2222-2222-2222-222222222222' WHERE id = 'd2222222-2222-2222-2222-222222222222';

-- =========================================================================
-- 7. SEED EMPLOYEES (TENANT B)
-- =========================================================================

INSERT INTO employees (id, organization_id, user_id, employee_id, first_name, last_name, dob, gender, phone, address, department_id, designation_id, manager_id, joining_date, employment_type, employment_status, grade)
VALUES
('e4444444-4444-4444-4444-444444444444', 'b5278c6a-49bd-4cc7-bc6d-eb1a3c77d54b', 'f4d1b1f5-bc56-4efe-cc5d-ee552e45d17a', 'EMP-9001', 'Alice', 'Smith', '1990-07-15', 'Female', '+1987654321', '500 Health Way, Med City', 'd3333333-3333-3333-3333-333333333333', '94444444-4444-4444-4444-444444444444', NULL, '2023-01-01', 'full-time', 'active', 'L2');

UPDATE departments SET manager_id = 'e4444444-4444-4444-4444-444444444444' WHERE id = 'd3333333-3333-3333-3333-333333333333';

-- =========================================================================
-- 8. SEED LEAVE BALANCES FOR 2026 (TENANT A)
-- =========================================================================

-- John Doe Leave Balances for 2026
INSERT INTO leave_balances (id, organization_id, employee_id, year, leave_type, allocated, used)
VALUES
('f1111111-1111-1111-1111-111111111111', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e3333333-3333-3333-3333-333333333333', 2026, 'casual', 12.0, 2.0),
('f2222222-2222-2222-2222-222222222222', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e3333333-3333-3333-3333-333333333333', 2026, 'sick', 10.0, 1.0),
('f3333333-3333-3333-3333-333333333333', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e3333333-3333-3333-3333-333333333333', 2026, 'earned', 15.0, 0.0);

-- David Miller Leave Balances for 2026
INSERT INTO leave_balances (id, organization_id, employee_id, year, leave_type, allocated, used)
VALUES
('f4444444-4444-4444-4444-444444444444', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e2222222-2222-2222-2222-222222222222', 2026, 'casual', 12.0, 0.0),
('f5555555-5555-5555-5555-555555555555', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e2222222-2222-2222-2222-222222222222', 2026, 'sick', 10.0, 0.0),
('f6666666-6666-6666-6666-666666666666', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e2222222-2222-2222-2222-222222222222', 2026, 'earned', 15.0, 4.0);

-- =========================================================================
-- 9. SEED SALARY STRUCTURES (TENANT A)
-- =========================================================================

-- John Doe Salary Setup
INSERT INTO salary_structures (id, organization_id, employee_id, basic, hra, allowances, pf, tax, other_deductions)
VALUES
('81111111-1111-1111-1111-111111111111', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e3333333-3333-3333-3333-333333333333', 45000.00, 22500.00, 10000.00, 5400.00, 4000.00, 0.00);

-- David Miller Salary Setup
INSERT INTO salary_structures (id, organization_id, employee_id, basic, hra, allowances, pf, tax, other_deductions)
VALUES
('82222222-2222-2222-2222-222222222222', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e2222222-2222-2222-2222-222222222222', 80000.00, 40000.00, 25000.00, 9600.00, 15000.00, 0.00);

-- =========================================================================
-- 10. SEED LEAVE POLICIES (MASTER) - TENANT A & B
-- =========================================================================

-- Acme Corp (Tenant A) Leave Policies
INSERT INTO leave_policies (id, organization_id, grade, leave_type, annual_allocation, monthly_accrual_rate, max_carry_forward, tenure_months_required)
VALUES
-- Grade L1
('71111111-1111-1111-1111-111111111111', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'L1', 'casual', 12.0, 1.00, 0.0, 0),
('71111111-1111-1111-1111-111111111112', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'L1', 'sick', 10.0, 0.83, 0.0, 0),
('71111111-1111-1111-1111-111111111113', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'L1', 'earned', 15.0, 1.25, 30.0, 3),

-- Grade L2
('72222222-2222-2222-2222-222222222221', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'L2', 'casual', 14.0, 1.16, 0.0, 0),
('72222222-2222-2222-2222-222222222222', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'L2', 'sick', 12.0, 1.00, 0.0, 0),
('72222222-2222-2222-2222-222222222223', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'L2', 'earned', 18.0, 1.50, 45.0, 3),

-- Grade L3
('73333333-3333-3333-3333-333333333331', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'L3', 'casual', 16.0, 1.33, 0.0, 0),
('73333333-3333-3333-3333-333333333332', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'L3', 'sick', 14.0, 1.16, 0.0, 0),
('73333333-3333-3333-3333-333333333333', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'L3', 'earned', 24.0, 2.00, 60.0, 3);

-- Nexus Health (Tenant B) Leave Policies
INSERT INTO leave_policies (id, organization_id, grade, leave_type, annual_allocation, monthly_accrual_rate, max_carry_forward, tenure_months_required)
VALUES
('74444444-4444-4444-4444-444444444441', 'b5278c6a-49bd-4cc7-bc6d-eb1a3c77d54b', 'L2', 'casual', 14.0, 1.16, 0.0, 0),
('74444444-4444-4444-4444-444444444442', 'b5278c6a-49bd-4cc7-bc6d-eb1a3c77d54b', 'L2', 'sick', 12.0, 1.00, 0.0, 0),
('74444444-4444-4444-4444-444444444443', 'b5278c6a-49bd-4cc7-bc6d-eb1a3c77d54b', 'L2', 'earned', 18.0, 1.50, 45.0, 3);

-- =========================================================================
-- 11. SEED GRADE ALLOWANCES (MASTER) - TENANT A & B
-- =========================================================================

-- Acme Corp (Tenant A) Grade Allowances
INSERT INTO grade_allowances (id, organization_id, grade, fuel_cap, lta_cap, phone_cap, food_cap, car_lease_cap, insurance_cover)
VALUES
('90101010-1010-1010-1010-101010101011', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'L1', 3000.00, 25000.00, 1000.00, 2200.00, 0.00, 300000.00),
('90101010-1010-1010-1010-101010101012', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'L2', 5000.00, 50000.00, 2000.00, 2200.00, 25000.00, 500000.00),
('90101010-1010-1010-1010-101010101013', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'L3', 8000.00, 100000.00, 3000.00, 2200.00, 50000.00, 700000.00);

-- Nexus Health (Tenant B) Grade Allowances
INSERT INTO grade_allowances (id, organization_id, grade, fuel_cap, lta_cap, phone_cap, food_cap, car_lease_cap, insurance_cover)
VALUES
('90101010-1010-1010-1010-101010101014', 'b5278c6a-49bd-4cc7-bc6d-eb1a3c77d54b', 'L2', 4000.00, 40000.00, 1500.00, 2200.00, 20000.00, 500000.00);

-- =========================================================================
-- 12. SEED PERFORMANCE KRAS (TRANSACTIONAL)
-- =========================================================================

-- John Doe KRAs
INSERT INTO performance_kras (id, organization_id, employee_id, title, description, weightage, target_date)
VALUES
('61111111-1111-1111-1111-111111111111', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e3333333-3333-3333-3333-333333333333', 'Deliver Core API Modules', 'Develop backend endpoints for appraisal, FBP, and offboarding systems.', 40, '2026-06-30'),
('61111111-1111-1111-1111-111111111112', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e3333333-3333-3333-3333-333333333333', 'Improve UI Responsiveness', 'Refactor React dashboard components with modern glassmorphism and animations.', 30, '2026-06-30'),
('61111111-1111-1111-1111-111111111113', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e3333333-3333-3333-3333-333333333333', 'Reduce API Latency', 'Optimize SQLite queries and implement Redis-style memory caching structures.', 30, '2026-07-15');

-- David Miller KRAs
INSERT INTO performance_kras (id, organization_id, employee_id, title, description, weightage, target_date)
VALUES
('62222222-2222-2222-2222-222222222221', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e2222222-2222-2222-2222-222222222222', 'Lead Platform Migration', 'Manage architecture shift to high-availability multi-tenant cloud systems.', 50, '2026-08-31'),
('62222222-2222-2222-2222-222222222222', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e2222222-2222-2222-2222-222222222222', 'Mentor Junior Engineers', 'Conduct pair programming and system design reviews for core engineering teams.', 30, '2026-09-30'),
('62222222-2222-2222-2222-222222222223', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e2222222-2222-2222-2222-222222222222', 'Review Infrastructure Cost', 'Analyze and trim down monthly hosting overheads by 15%.', 20, '2026-07-31');

-- =========================================================================
-- 13. SEED TAX DECLARATIONS (TRANSACTIONAL)
-- =========================================================================

-- Seed John Doe Old Regime Tax Declaration for verification
INSERT INTO tax_declarations (id, organization_id, employee_id, financial_year, regime, section_80c, section_80d, hra_rent_paid, landlord_pan, landlord_name, evidence_url, status, created_at, updated_at)
VALUES
('51111111-1111-1111-1111-111111111111', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e3333333-3333-3333-3333-333333333333', '2025-2026', 'old', 120000.00, 25000.00, 180000.00, 'ABCDE1234F', 'Mr. Rent Lord', 'https://evidence.cybehrm.com/rent_receipts_john.pdf', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =========================================================================
-- 14. SEED SALARY BANDS (ERP MASTER)
-- =========================================================================

INSERT INTO salary_bands (id, organization_id, band_name, min_base_annual, mid_base_annual, max_base_annual)
VALUES
('b1111111-1111-1111-1111-111111111111', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'B1-CONS', 300000.00, 500000.00, 800000.00),
('b2222222-2222-2222-2222-222222222222', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'B2-SRCONS', 800000.00, 1200000.00, 1800000.00),
('b3333333-3333-3333-3333-333333333333', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'B3-MGR', 1800000.00, 2500000.00, 3500000.00);

-- Map existing designations to salary bands
UPDATE designations SET salary_band_id = 'b3333333-3333-3333-3333-333333333333' WHERE id = '91111111-1111-1111-1111-111111111111';
UPDATE designations SET salary_band_id = 'b2222222-2222-2222-2222-222222222222' WHERE id = '92222222-2222-2222-2222-222222222222';
UPDATE designations SET salary_band_id = 'b1111111-1111-1111-1111-111111111111' WHERE id = '93333333-3333-3333-3333-333333333333';

-- =========================================================================
-- 15. SEED FUNCTIONAL TITLES (ERP MASTER)
-- =========================================================================

INSERT INTO functional_titles (id, organization_id, name, skill_category)
VALUES
('51111111-2222-3333-4444-555555555555', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'React Web Developer', 'Frontend'),
('52222222-3333-4444-5555-666666666666', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'Python Engineer', 'Backend'),
('53333333-4444-5555-6666-777777777777', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'HR Generalist', 'Operations');

-- =========================================================================
-- 16. SEED CLIENTS (ERP MASTER)
-- =========================================================================

INSERT INTO clients (id, organization_id, name, code, domain_industry, country)
VALUES
('c1111111-3333-4444-5555-666666666666', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'Walmart Inc.', 'WALMART_CORP', 'Retail', 'USA'),
('c2222222-4444-5555-6666-777777777777', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'CVS Health', 'CVS_HEALTH', 'Healthcare', 'USA'),
('c3333333-5555-6666-7777-888888888888', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'Standard Chartered', 'STANCHAR', 'Banking', 'UK');

-- =========================================================================
-- 17. SEED PROJECTS (ERP MASTER)
-- =========================================================================

INSERT INTO projects (id, organization_id, client_id, name, code, billing_type, start_date, end_date)
VALUES
('71111111-4444-5555-6666-777777777777', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'c2222222-4444-5555-6666-777777777777', 'Cloud Migration Program', 'CVS_CLOUD', 'Time & Material', '2026-01-10', '2026-12-31'),
('72222222-5555-6666-7777-888888888888', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'c1111111-3333-4444-5555-666666666666', 'Digital Checkout Platform', 'WAL_CHECKOUT', 'Fixed Price', '2025-08-15', '2026-08-14'),
('73333333-6666-7777-8888-999999999999', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'c1111111-3333-4444-5555-666666666666', 'Supply Chain Analytics', 'WAL_SUPPLY', 'Time & Material', '2026-02-01', '2027-01-31'),
('74444444-7777-8888-9999-000000000000', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'c3333333-5555-6666-7777-888888888888', 'Core Banking Migration', 'STAN_MIGR', 'Fixed Price', '2026-03-01', '2026-11-30');

-- =========================================================================
-- 18. UPDATE EMPLOYEES WITH EXTENDED ERP DETAILS
-- =========================================================================

UPDATE employees 
SET uan_number = '100987654321', 
    pf_number = 'MH/BAN/1009876/001', 
    pan_card = 'ABCDE1234F', 
    aadhaar_card = '123456789012', 
    marital_status = 'Married', 
    blood_group = 'A+', 
    emergency_contact_name = 'Robert Jenkins', 
    emergency_contact_phone = '+1234509876', 
    emergency_contact_relation = 'Spouse', 
    functional_title_id = '53333333-4444-5555-6666-777777777777',
    current_shift = 'General Shift'
WHERE id = 'e1111111-1111-1111-1111-111111111111';

UPDATE employees 
SET uan_number = '100987654322', 
    pf_number = 'MH/BAN/1009876/002', 
    pan_card = 'BCDEF2345G', 
    aadhaar_card = '234567890123', 
    marital_status = 'Married', 
    blood_group = 'O+', 
    emergency_contact_name = 'Emily Miller', 
    emergency_contact_phone = '+1234509877', 
    emergency_contact_relation = 'Spouse', 
    functional_title_id = '52222222-3333-4444-5555-666666666666',
    current_shift = 'US Shift',
    deputation_details = 'US Client Office Deputation (Q3)'
WHERE id = 'e2222222-2222-2222-2222-222222222222';

UPDATE employees 
SET uan_number = '100987654323', 
    pf_number = 'MH/BAN/1009876/003', 
    pan_card = 'CDEFG3456H', 
    aadhaar_card = '345678901234', 
    marital_status = 'Single', 
    blood_group = 'B+', 
    emergency_contact_name = 'Mary Doe', 
    emergency_contact_phone = '+1234509878', 
    emergency_contact_relation = 'Mother', 
    functional_title_id = '51111111-2222-3333-4444-555555555555',
    current_shift = 'General Shift'
WHERE id = 'e3333333-3333-3333-3333-333333333333';

-- =========================================================================
-- 19. SEED PROJECT ALLOCATIONS (PROJECT MAPPINGS)
-- =========================================================================

INSERT INTO project_mappings (id, organization_id, employee_id, project_id, project_role, allocation_percentage, billing_status, billing_hourly_rate, start_date)
VALUES
('21111111-5555-6666-7777-888888888888', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e2222222-2222-2222-2222-222222222222', '71111111-4444-5555-6666-777777777777', 'Engagement Architect', 50, 'Billable', 150.00, '2026-01-15'),
('22222222-6666-7777-8888-999999999999', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e2222222-2222-2222-2222-222222222222', '73333333-6666-7777-8888-999999999999', 'Technical Lead', 50, 'Billable', 120.00, '2026-02-05'),
('23333333-7777-8888-9999-000000000000', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e3333333-3333-3333-3333-333333333333', '72222222-5555-6666-7777-888888888888', 'Senior React Developer', 100, 'Billable', 85.00, '2025-08-20');

-- =========================================================================
-- 20. SEED EMPLOYEE SKILLSETS
-- =========================================================================

INSERT INTO employee_skillsets (id, organization_id, employee_id, skill_name, proficiency)
VALUES
('80101010-1111-1111-1111-111111111111', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e3333333-3333-3333-3333-333333333333', 'React', 'Expert'),
('80101010-1111-1111-1111-111111111112', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e3333333-3333-3333-3333-333333333333', 'JavaScript', 'Expert'),
('80101010-1111-1111-1111-111111111113', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e3333333-3333-3333-3333-333333333333', 'TypeScript', 'Intermediate'),
('80101010-2222-2222-2222-222222222221', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e2222222-2222-2222-2222-222222222222', 'Python', 'Expert'),
('80101010-2222-2222-2222-222222222222', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e2222222-2222-2222-2222-222222222222', 'Docker', 'Expert'),
('80101010-2222-2222-2222-222222222223', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e2222222-2222-2222-2222-222222222222', 'Kubernetes', 'Intermediate');

-- =========================================================================
-- 21. SEED EMPLOYEE WORK EXPERIENCES
-- =========================================================================

INSERT INTO work_experiences (id, organization_id, employee_id, company_name, designation, tenure_months, start_date, end_date)
VALUES
('40101010-1111-1111-1111-111111111111', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e3333333-3333-3333-3333-333333333333', 'CVS Health', 'Senior UI Developer', 24, '2023-06-01', '2025-06-01'),
('40101010-1111-1111-1111-111111111112', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e3333333-3333-3333-3333-333333333333', 'Cognizant', 'UI Analyst', 18, '2021-11-01', '2023-05-15'),
('40101010-2222-2222-2222-222222222221', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e2222222-2222-2222-2222-222222222222', 'Amazon Inc.', 'Staff Systems Engineer', 48, '2019-02-01', '2023-02-15'),
('40101010-2222-2222-2222-222222222222', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e2222222-2222-2222-2222-222222222222', 'Oracle India', 'Senior Software Engineer', 36, '2016-01-10', '2019-01-15');

-- =========================================================================
-- 22. SEED EMPLOYEE ACADEMIC QUALIFICATIONS
-- =========================================================================

INSERT INTO academic_qualifications (id, organization_id, employee_id, degree, institution, passing_year, cgpa_percentage)
VALUES
('a1010101-1111-1111-1111-111111111111', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e3333333-3333-3333-3333-333333333333', 'B.Tech Computer Science', 'NIT Trichy', 2016, 8.5),
('a1010101-2222-2222-2222-222222222221', 'a8385002-390c-45a8-8e6d-2c8b7468112c', 'e2222222-2222-2222-2222-222222222222', 'M.Tech Computer Science', 'IIT Bombay', 2013, 9.1);

