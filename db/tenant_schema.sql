-- Tenant Schema Template
-- Variables: {{tenant_schema}} will be replaced with actual schema name.
-- E.g. CREATE SCHEMA IF NOT EXISTS "tenant_acmecorp"; SET search_path TO "tenant_acmecorp";

-- =========================================================================


-- Organizations Table (Tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NULL,
    domain VARCHAR(255) UNIQUE NULL,
    subscription_plan VARCHAR(50) NOT NULL DEFAULT 'starter', -- 'starter', 'growth', 'enterprise'
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
    feature_talent_mgmt BOOLEAN NOT NULL DEFAULT TRUE,
    feature_hr_team BOOLEAN NOT NULL DEFAULT TRUE,
    feature_resource_mgmt BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_subdomain ON organizations(subdomain);

-- Users Table (Credentials & Roles)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'super_admin', 'hr_admin', 'manager', 'employee', 'payroll_admin', 'recruiter'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_users_email UNIQUE(email)
);



-- =========================================================================
-- 2. STRUCTURE & DEPARTMENT TABLES
-- =========================================================================

-- Departments Table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL, -- e.g., 'ENG', 'HR', 'SALES'
    manager_id UUID, -- reference to employees(id) (added foreign key later due to circular dependency)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_departments_name UNIQUE(name),
    CONSTRAINT uq_departments_code UNIQUE(code)
);



-- Designations Table
CREATE TABLE designations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_designations_title UNIQUE(title)
);



-- =========================================================================
-- 3. EMPLOYEE PROFILE TABLES
-- =========================================================================

-- Employees Table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES "HR-Engine".users(id) ON DELETE SET NULL,
    employee_id VARCHAR(50) NOT NULL, -- business custom employee ID e.g. 'EMP-1002'
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE,
    gender VARCHAR(20),
    phone VARCHAR(20),
    address TEXT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    designation_id UUID REFERENCES designations(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES employees(id) ON DELETE SET NULL, -- Self-referencing FK
    joining_date DATE NOT NULL,
    exit_date DATE,
    employment_type VARCHAR(50) NOT NULL, -- 'full-time', 'part-time', 'contractor', 'intern'
    employment_status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'terminated', 'on-leave', 'suspended'
    grade VARCHAR(20) NOT NULL DEFAULT 'L1', -- 'L1', 'L2', 'L3'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_employees_employee_id UNIQUE(employee_id)
);

CREATE INDEX idx_employees_search ON employees(first_name, last_name);
CREATE INDEX idx_employees_dept ON employees(department_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);

-- Resolve Department-to-Employee Circular Dependency Reference
ALTER TABLE departments ADD CONSTRAINT fk_departments_manager FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

-- =========================================================================
-- 4. OPERATIONS (ATTENDANCE & LEAVE) TABLES
-- =========================================================================

-- Attendance Table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'present', -- 'present', 'absent', 'half_day', 'leave', 'wfh'
    late_minutes INTEGER NOT NULL DEFAULT 0,
    overtime_minutes INTEGER NOT NULL DEFAULT 0,
    work_minutes INTEGER NOT NULL DEFAULT 0,
    ip_address VARCHAR(45),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_attendance_emp_date UNIQUE(employee_id, date)
);

CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_emp_range ON attendance(employee_id, date);

-- Leave Requests Table
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL, -- 'casual', 'sick', 'earned', 'maternity', 'unpaid'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(4, 1) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actioned_by UUID REFERENCES employees(id) ON DELETE SET NULL, -- HR Admin or Manager
    actioned_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_leave_dates CHECK(end_date >= start_date)
);

CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_emp ON leave_requests(employee_id);

-- Leave Balances Table
CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    leave_type VARCHAR(50) NOT NULL, -- 'casual', 'sick', 'earned', 'maternity', 'unpaid'
    allocated NUMERIC(4, 1) NOT NULL,
    used NUMERIC(4, 1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_leave_balances_emp_year_type UNIQUE(employee_id, year, leave_type)
);



-- =========================================================================
-- 5. FINTECH (SALARY & PAYROLL) TABLES
-- =========================================================================

-- Salary Structures Table
CREATE TABLE salary_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    basic DECIMAL(12, 2) NOT NULL,
    hra DECIMAL(12, 2) NOT NULL,
    allowances DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    pf DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    other_deductions DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- Payroll Runs Table
CREATE TABLE payroll_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'processed', 'approved', 'paid'
    processed_by UUID REFERENCES "HR-Engine".users(id) ON DELETE SET NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_payroll_runs_month_year UNIQUE(month, year),
    CONSTRAINT chk_payroll_month CHECK (month >= 1 AND month <= 12)
);

CREATE INDEX idx_payroll_runs_year_month ON payroll_runs(year, month);

-- Payslips Table
CREATE TABLE payslips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    basic DECIMAL(12, 2) NOT NULL,
    hra DECIMAL(12, 2) NOT NULL,
    allowances DECIMAL(12, 2) NOT NULL,
    bonus DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    gross_salary DECIMAL(12, 2) NOT NULL,
    pf DECIMAL(12, 2) NOT NULL,
    tax DECIMAL(12, 2) NOT NULL,
    deductions DECIMAL(12, 2) NOT NULL,
    net_salary DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'paid'
    payslip_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_payslips_run_emp UNIQUE(payroll_run_id, employee_id)
);


CREATE INDEX idx_payslips_emp ON payslips(employee_id);

-- =========================================================================
-- 6. SYSTEM UTILITY TABLES
-- =========================================================================

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "HR-Engine".users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'leave_request', 'payroll', 'attendance', 'birthday'
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES "HR-Engine".users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL, -- e.g. 'login', 'create_employee', 'approve_leave'
    module VARCHAR(100) NOT NULL, -- e.g. 'auth', 'employee', 'leave', 'payroll'
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_module ON audit_logs(module);

-- Leave Policies Table (Master)
CREATE TABLE leave_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade VARCHAR(20) NOT NULL, -- 'L1', 'L2', 'L3'
    leave_type VARCHAR(50) NOT NULL, -- 'casual', 'sick', 'earned', 'maternity', 'unpaid'
    annual_allocation NUMERIC(4, 1) NOT NULL,
    monthly_accrual_rate NUMERIC(4, 2) NOT NULL,
    max_carry_forward NUMERIC(4, 1) NOT NULL DEFAULT 0.0,
    tenure_months_required INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_leave_policies_grade_type UNIQUE(grade, leave_type)
);



-- Tax Declarations Table (Transactional)
CREATE TABLE tax_declarations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    financial_year VARCHAR(10) NOT NULL, -- e.g. '2025-2026'
    regime VARCHAR(20) NOT NULL DEFAULT 'new', -- 'old', 'new'
    section_80c DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    section_80d DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    hra_rent_paid DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    landlord_pan VARCHAR(20),
    landlord_name VARCHAR(255),
    evidence_url VARCHAR(512),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewed_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_tax_declarations_emp_year UNIQUE(employee_id, financial_year)
);



-- Grade Allowances Table (Master)
CREATE TABLE grade_allowances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade VARCHAR(20) NOT NULL, -- 'L1', 'L2', 'L3'
    fuel_cap DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    lta_cap DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    phone_cap DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    food_cap DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    car_lease_cap DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    insurance_cover DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_grade_allowances_grade UNIQUE(grade)
);



-- FBP Declarations Table (Transactional)
CREATE TABLE fbp_declarations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    fuel_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    lta_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    phone_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    food_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_fbp_declarations_emp UNIQUE(employee_id)
);



-- Insurance Enrollments Table (Transactional)
CREATE TABLE insurance_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    tier VARCHAR(50) NOT NULL, -- 'base', 'silver', 'gold'
    has_parents BOOLEAN NOT NULL DEFAULT FALSE,
    has_spouse BOOLEAN NOT NULL DEFAULT FALSE,
    children_count INTEGER NOT NULL DEFAULT 0,
    top_up_sum_insured DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    monthly_surcharge DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'cancelled'
    health_card_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- Vehicle Leases Table (Transactional)
CREATE TABLE vehicle_leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    lease_type VARCHAR(50) NOT NULL, -- 'oyt', 'lease'
    car_model VARCHAR(255),
    ex_showroom_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    lease_tenure_months INTEGER NOT NULL DEFAULT 36,
    monthly_emi DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    engine_capacity_cc INTEGER NOT NULL DEFAULT 1200,
    has_driver BOOLEAN NOT NULL DEFAULT FALSE,
    perk_value DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'terminated'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- Performance KRAs Table (Transactional)
CREATE TABLE performance_kras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    weightage INTEGER NOT NULL,
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_performance_kras_emp ON performance_kras(employee_id);

-- Performance Reviews Table (Transactional)
CREATE TABLE performance_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    review_cycle VARCHAR(100) NOT NULL, -- e.g. 'FY26-Q1'
    self_rating DECIMAL(3, 2),
    self_feedback TEXT,
    manager_rating DECIMAL(3, 2),
    manager_feedback TEXT,
    normalized_category VARCHAR(50), -- 'Top', 'Core', 'Low'
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'self_reviewed', 'manager_reviewed', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_performance_reviews_emp_cycle UNIQUE(employee_id, review_cycle)
);



-- Promotion Recommendations Table (Transactional)
CREATE TABLE promotion_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    recommended_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    current_grade VARCHAR(20) NOT NULL,
    target_grade VARCHAR(20) NOT NULL,
    ai_score DECIMAL(5, 2),
    ai_summary TEXT,
    risk_flags JSONB,
    comp_adjustment_pct DECIMAL(5, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    actioned_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    actioned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promotion_recommendations_emp ON promotion_recommendations(employee_id);

-- Offboarding Requests Table (Transactional)
CREATE TABLE offboarding_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    resignation_date DATE NOT NULL,
    requested_relieving_date DATE,
    approved_relieving_date DATE,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'in_clearance', 'completed'
    notice_period_days INTEGER NOT NULL DEFAULT 90,
    notice_buyout_days INTEGER NOT NULL DEFAULT 0,
    it_clearance_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    hr_clearance_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    finance_clearance_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- Final Settlements Table (Transactional)
CREATE TABLE final_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offboarding_request_id UUID UNIQUE NOT NULL REFERENCES offboarding_requests(id) ON DELETE CASCADE,
    gratuity_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    leave_encashment_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    notice_buyout_charge DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    unpaid_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    other_additions DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    other_deductions DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_settlement_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    settlement_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'approved', 'paid'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- =========================================================================
-- 7. TALENT MANAGEMENT & RECRUITMENT TABLES
-- =========================================================================

-- Recruitment Positions Table
CREATE TABLE recruitment_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    location VARCHAR(255),
    vacancies INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'open', -- 'open', 'closed', 'paused'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- Job Postings Table (JD & Requirements)
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID UNIQUE NOT NULL REFERENCES recruitment_positions(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    experience_range VARCHAR(100),
    salary_range VARCHAR(100),
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'expired', 'draft'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- Talent Candidates Table (Recruitment Pipeline)
CREATE TABLE talent_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID NOT NULL REFERENCES recruitment_positions(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    resume_url VARCHAR(512),
    status VARCHAR(50) NOT NULL DEFAULT 'applied', -- 'applied', 'interview_scheduled', 'interviewed', 'selected', 'rejected', 'offered', 'accepted', 'onboarded'
    skills TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_talent_candidates_status ON talent_candidates(status);

-- Call Letters Table
CREATE TABLE call_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES talent_candidates(id) ON DELETE CASCADE,
    interview_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location_or_link VARCHAR(512) NOT NULL,
    email_content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- Talent Interviews Table
CREATE TABLE talent_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES talent_candidates(id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    interview_round VARCHAR(100) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    score DECIMAL(3, 1),
    feedback TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_talent_interviews_candidate ON talent_interviews(candidate_id);

-- Offer Letters Table
CREATE TABLE offer_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID UNIQUE NOT NULL REFERENCES talent_candidates(id) ON DELETE CASCADE,
    joining_date DATE NOT NULL,
    offered_salary DECIMAL(12, 2) NOT NULL,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'full-time',
    grade VARCHAR(20) NOT NULL DEFAULT 'L1',
    designation_id UUID REFERENCES designations(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    offer_status VARCHAR(50) NOT NULL DEFAULT 'sent', -- 'sent', 'accepted', 'rejected', 'onboarded'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actioned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



