# app/schemas/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Union
from datetime import datetime, date
from uuid import UUID as PyUUID
from decimal import Decimal

UUID = Union[PyUUID, str]

# =========================================================================
# 1. AUTHENTICATION SCHEMAS
# =========================================================================

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    organization_id: UUID
    login_origin: str = "Tenant"

class OrganizationBasicResponse(BaseModel):
    id: UUID
    name: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: UUID
    organization_id: UUID
    email: str
    role: str

class UserResponse(BaseModel):
    id: UUID
    organization_id: UUID
    email: str
    role: str
    is_active: bool
    organization_name: Optional[str] = None
    feature_talent_mgmt: Optional[bool] = True
    feature_hr_team: Optional[bool] = True
    feature_resource_mgmt: Optional[bool] = True
    employee_id: Optional[UUID] = None

    class Config:
        from_attributes = True

class TenantRegister(BaseModel):
    organization_name: str
    subdomain: Optional[str] = None
    subscription_plan: str = "growth"
    admin_email: EmailStr
    admin_password: str
    feature_talent_mgmt: bool = True
    feature_hr_team: bool = True
    feature_resource_mgmt: bool = True

# =========================================================================
# 2. DEPARTMENT, DESIGNATION & ERP MASTER SCHEMAS
# =========================================================================

class SalaryBandCreate(BaseModel):
    band_name: str = Field(..., min_length=2, max_length=50)
    min_base_annual: Decimal
    mid_base_annual: Decimal
    max_base_annual: Decimal

class SalaryBandResponse(BaseModel):
    id: UUID
    band_name: str
    min_base_annual: Decimal
    mid_base_annual: Decimal
    max_base_annual: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DepartmentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=2, max_length=50)

class DepartmentResponse(BaseModel):
    id: UUID
    name: str
    code: str
    manager_id: Optional[UUID] = None

    class Config:
        from_attributes = True

class DesignationCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=100)
    salary_band_id: Optional[UUID] = None

class DesignationResponse(BaseModel):
    id: UUID
    title: str
    salary_band_id: Optional[UUID] = None
    salary_band: Optional[SalaryBandResponse] = None

    class Config:
        from_attributes = True

class FunctionalTitleCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    skill_category: Optional[str] = None

class FunctionalTitleResponse(BaseModel):
    id: UUID
    name: str
    skill_category: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ClientCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    code: str = Field(..., min_length=2, max_length=50)
    domain_industry: Optional[str] = None
    country: Optional[str] = "India"

class ClientResponse(BaseModel):
    id: UUID
    name: str
    code: str
    domain_industry: Optional[str] = None
    country: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    client_id: UUID
    name: str = Field(..., min_length=2, max_length=150)
    code: str = Field(..., min_length=2, max_length=50)
    billing_type: Optional[str] = "Time & Material"
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ProjectResponse(BaseModel):
    id: UUID
    client_id: UUID
    name: str
    code: str
    billing_type: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProjectMappingCreate(BaseModel):
    employee_id: UUID
    project_id: UUID
    project_role: str = Field(..., min_length=2, max_length=150)
    allocation_percentage: Optional[int] = 100
    billing_status: Optional[str] = "Billable"
    billing_hourly_rate: Optional[Decimal] = None
    start_date: Optional[date] = None

class ProjectMappingResponse(BaseModel):
    id: UUID
    employee_id: UUID
    project_id: UUID
    project_role: str
    allocation_percentage: int
    billing_status: str
    billing_hourly_rate: Optional[Decimal] = None
    start_date: Optional[date] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EmployeeSkillsetCreate(BaseModel):
    skill_name: str = Field(..., min_length=1, max_length=100)
    proficiency: Optional[str] = "Intermediate"

class EmployeeSkillsetResponse(BaseModel):
    id: UUID
    employee_id: UUID
    skill_name: str
    proficiency: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WorkExperienceCreate(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=150)
    designation: str = Field(..., min_length=1, max_length=100)
    tenure_months: Optional[int] = 12
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class WorkExperienceResponse(BaseModel):
    id: UUID
    employee_id: UUID
    company_name: str
    designation: str
    tenure_months: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AcademicQualificationCreate(BaseModel):
    degree: str = Field(..., min_length=1, max_length=100)
    institution: str = Field(..., min_length=1, max_length=150)
    passing_year: Optional[int] = None
    cgpa_percentage: Optional[float] = None

class AcademicQualificationResponse(BaseModel):
    id: UUID
    employee_id: UUID
    degree: str
    institution: str
    passing_year: Optional[int] = None
    cgpa_percentage: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# =========================================================================
# 3. EMPLOYEE SCHEMAS
# =========================================================================

# =========================================================================
# 2b. CONTRACT VENDOR SCHEMAS
# =========================================================================

class ContractVendorCreate(BaseModel):
    vendor_name: str = Field(..., min_length=2, max_length=200)
    vendor_code: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contract_start_date: Optional[date] = None
    contract_end_date: Optional[date] = None
    po_number: Optional[str] = None
    billing_rate: Optional[Decimal] = None
    currency: Optional[str] = "INR"
    notes: Optional[str] = None

class ContractVendorResponse(BaseModel):
    id: UUID
    employee_id: UUID
    vendor_name: str
    vendor_code: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contract_start_date: Optional[date] = None
    contract_end_date: Optional[date] = None
    po_number: Optional[str] = None
    billing_rate: Optional[Decimal] = None
    currency: str = "INR"
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =========================================================================
# 3. EMPLOYEE SCHEMAS
# =========================================================================

class EmployeeCreate(BaseModel):
    employee_id: str
    first_name: str
    last_name: str
    dob: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    department_id: Optional[UUID] = None
    designation_id: Optional[UUID] = None
    manager_id: Optional[UUID] = None
    joining_date: date
    employment_type: str  # 'permanent', 'probation', 'contract'

    # Extended Enterprise Fields
    uan_number: Optional[str] = None
    pf_number: Optional[str] = None
    pan_card: Optional[str] = None
    aadhaar_card: Optional[str] = None
    esic_number: Optional[str] = None
    marital_status: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    passport_number: Optional[str] = None
    visa_details: Optional[str] = None
    functional_title_id: Optional[UUID] = None
    current_shift: Optional[str] = "General Shift"
    deputation_details: Optional[str] = None
    grade: Optional[str] = "L1"

    # Portal login creation fields (optional)
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = "employee"

    # Contractor vendor details (only required when employment_type == 'contract')
    contractor_details: Optional[ContractVendorCreate] = None

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    department_id: Optional[UUID] = None
    designation_id: Optional[UUID] = None
    manager_id: Optional[UUID] = None
    employment_type: Optional[str] = None # 'permanent', 'probation', 'contract'
    employment_status: Optional[str] = None
    
    # Extended Enterprise Fields
    uan_number: Optional[str] = None
    pf_number: Optional[str] = None
    pan_card: Optional[str] = None
    aadhaar_card: Optional[str] = None
    esic_number: Optional[str] = None
    marital_status: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    passport_number: Optional[str] = None
    visa_details: Optional[str] = None
    functional_title_id: Optional[UUID] = None
    current_shift: Optional[str] = None
    deputation_details: Optional[str] = None
    grade: Optional[str] = None

    # Contractor vendor details
    contractor_details: Optional[ContractVendorCreate] = None


class AssetCreate(BaseModel):
    name: str
    asset_type: str
    serial_number: Optional[str] = None
    status: Optional[str] = "available"
    employee_id: Optional[UUID] = None


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    asset_type: Optional[str] = None
    serial_number: Optional[str] = None
    status: Optional[str] = None
    employee_id: Optional[UUID] = None
    assigned_at: Optional[datetime] = None


class AssetResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    asset_type: str
    serial_number: Optional[str] = None
    status: str
    employee_id: Optional[UUID] = None
    employee_name: Optional[str] = None
    assigned_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InductionTaskCreate(BaseModel):
    employee_id: UUID
    task_name: str
    description: Optional[str] = None
    status: Optional[str] = "pending"


class InductionTaskUpdate(BaseModel):
    task_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    completed_at: Optional[datetime] = None


class InductionTaskResponse(BaseModel):
    id: UUID
    organization_id: UUID
    employee_id: UUID
    employee_name: Optional[str] = None
    task_name: str
    description: Optional[str] = None
    status: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EmployeeResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    employee_id: str
    first_name: str
    last_name: str
    dob: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    department_id: Optional[UUID] = None
    designation_id: Optional[UUID] = None
    manager_id: Optional[UUID] = None
    joining_date: date
    exit_date: Optional[date] = None
    employment_type: str
    employment_status: str
    grade: str = "L1"
    email: Optional[str] = None # Added manually from User relationship
    
    # Extended Enterprise Fields
    uan_number: Optional[str] = None
    pf_number: Optional[str] = None
    pan_card: Optional[str] = None
    aadhaar_card: Optional[str] = None
    esic_number: Optional[str] = None
    marital_status: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    passport_number: Optional[str] = None
    visa_details: Optional[str] = None
    functional_title_id: Optional[UUID] = None
    current_shift: Optional[str] = "General Shift"
    deputation_details: Optional[str] = None
    
    # Nested relationship models (all nullable and optional for backward compatibility)
    functional_title: Optional[FunctionalTitleResponse] = None
    skillsets: Optional[List[EmployeeSkillsetResponse]] = []
    work_experiences: Optional[List[WorkExperienceResponse]] = []
    academic_qualifications: Optional[List[AcademicQualificationResponse]] = []
    project_allocations: Optional[List[ProjectMappingResponse]] = []
    contractor_details: Optional[ContractVendorResponse] = None
    assets: Optional[List[AssetResponse]] = []
    induction_tasks: Optional[List[InductionTaskResponse]] = []

    class Config:
        from_attributes = True

# =========================================================================
# 4. ATTENDANCE SCHEMAS
# =========================================================================

class AttendanceCheckIn(BaseModel):
    ip_address: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None

class AttendanceCheckOut(BaseModel):
    ip_address: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None

class AttendanceResponse(BaseModel):
    id: UUID
    employee_id: UUID
    date: date
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    status: str
    late_minutes: int
    overtime_minutes: int
    work_minutes: int

    class Config:
        from_attributes = True

# =========================================================================
# 5. LEAVE SCHEMAS
# =========================================================================

class LeaveRequestCreate(BaseModel):
    leave_type: str # 'casual', 'sick', 'earned', 'maternity', 'unpaid'
    start_date: date
    end_date: date
    reason: str

class LeaveRequestAction(BaseModel):
    status: str # 'approved', 'rejected'
    rejection_reason: Optional[str] = None

class LeaveRequestResponse(BaseModel):
    id: UUID
    employee_id: UUID
    employee_name: Optional[str] = None
    leave_type: str
    start_date: date
    end_date: date
    total_days: float
    reason: str
    status: str
    applied_at: datetime
    actioned_by: Optional[UUID] = None
    actioned_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True

class LeaveBalanceResponse(BaseModel):
    id: UUID
    employee_id: UUID
    year: int
    leave_type: str
    allocated: float
    used: float
    remaining: float

    class Config:
        from_attributes = True

# =========================================================================
# 6. SALARY & PAYROLL SCHEMAS
# =========================================================================

class SalaryStructureCreate(BaseModel):
    employee_id: UUID
    basic: Decimal
    hra: Decimal
    allowances: Decimal = Decimal("0.00")
    pf: Decimal = Decimal("0.00")
    tax: Decimal = Decimal("0.00")
    nps: Decimal = Decimal("0.00")
    other_deductions: Decimal = Decimal("0.00")
    custom_deductions: Optional[dict] = None

class SalaryStructureResponse(BaseModel):
    id: UUID
    employee_id: UUID
    basic: Decimal
    hra: Decimal
    allowances: Decimal
    pf: Decimal
    tax: Decimal
    nps: Decimal
    other_deductions: Decimal
    custom_deductions: Optional[dict] = None

    class Config:
        from_attributes = True

class PayrollRunCreate(BaseModel):
    month: int = Field(..., ge=1, le=12)
    year: int

class PayrollRunResponse(BaseModel):
    id: UUID
    month: int
    year: int
    status: str
    processed_by: Optional[UUID] = None
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PayslipResponse(BaseModel):
    id: UUID
    payroll_run_id: UUID
    employee_id: UUID
    employee_name: Optional[str] = None
    basic: Decimal
    hra: Decimal
    allowances: Decimal
    bonus: Decimal
    gross_salary: Decimal
    pf: Decimal
    tax: Decimal
    nps: Decimal
    professional_tax: Decimal
    deductions: Decimal
    net_salary: Decimal
    custom_deductions: Optional[dict] = None
    status: str
    payslip_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# =========================================================================
# 7. AI SCHEMAS
# =========================================================================

class AIQueryRequest(BaseModel):
    query: str

class AIQueryResponse(BaseModel):
    answer: str
    context_used: bool

# =========================================================================
# 8. PREMIUM MODULE SCHEMAS
# =========================================================================

# --- Flexible Benefits Plan (FBP) & Tax ---
class TaxDeclarationCreate(BaseModel):
    financial_year: str
    regime: str # 'old', 'new'
    section_80c: Decimal = Decimal("0.00")
    section_80d: Decimal = Decimal("0.00")
    hra_rent_paid: Decimal = Decimal("0.00")
    landlord_pan: Optional[str] = None
    landlord_name: Optional[str] = None
    evidence_url: Optional[str] = None

class TaxDeclarationAction(BaseModel):
    status: str # 'approved', 'rejected'
    rejection_reason: Optional[str] = None

class TaxDeclarationResponse(BaseModel):
    id: UUID
    employee_id: UUID
    employee_name: Optional[str] = None
    financial_year: str
    regime: str
    section_80c: Decimal
    section_80d: Decimal
    hra_rent_paid: Decimal
    landlord_pan: Optional[str] = None
    landlord_name: Optional[str] = None
    evidence_url: Optional[str] = None
    status: str
    reviewed_by: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GradeAllowanceResponse(BaseModel):
    id: UUID
    grade: str
    fuel_cap: Decimal
    lta_cap: Decimal
    phone_cap: Decimal
    food_cap: Decimal
    car_lease_cap: Decimal
    insurance_cover: Decimal

    class Config:
        from_attributes = True

class FBPDeclarationCreate(BaseModel):
    fuel_amount: Decimal
    lta_amount: Decimal
    phone_amount: Decimal
    food_amount: Decimal

class FBPDeclarationResponse(BaseModel):
    id: UUID
    employee_id: UUID
    fuel_amount: Decimal
    lta_amount: Decimal
    phone_amount: Decimal
    food_amount: Decimal
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Corporate Insurance ---
class InsuranceEnrollmentCreate(BaseModel):
    tier: str # 'base', 'silver', 'gold'
    has_parents: bool = False
    has_spouse: bool = False
    children_count: int = 0
    top_up_sum_insured: Decimal = Decimal("0.00")

class InsuranceEnrollmentResponse(BaseModel):
    id: UUID
    employee_id: UUID
    tier: str
    has_parents: bool
    has_spouse: bool
    children_count: int
    top_up_sum_insured: Decimal
    monthly_surcharge: Decimal
    status: str
    health_card_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Vehicle Lease ---
class VehicleLeaseCreate(BaseModel):
    lease_type: str # 'oyt', 'lease'
    car_model: Optional[str] = None
    ex_showroom_price: Decimal = Decimal("0.00")
    lease_tenure_months: int = 36
    has_driver: bool = False

class VehicleLeaseResponse(BaseModel):
    id: UUID
    employee_id: UUID
    lease_type: str
    car_model: Optional[str] = None
    ex_showroom_price: Decimal
    lease_tenure_months: int
    monthly_emi: Decimal
    engine_capacity_cc: int
    has_driver: bool
    perk_value: Decimal
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Performance Appraisals & KRAs ---
class PerformanceCycleInitiate(BaseModel):
    cycle_name: str
    target_date: Optional[date] = None
    custom_message: Optional[str] = None

class PerformanceTeamReminder(BaseModel):
    cycle_name: str
    target_date: Optional[date] = None
    custom_message: Optional[str] = None

class PerformanceKRACreate(BaseModel):
    title: str
    description: Optional[str] = None
    weightage: int # e.g. 25
    target_date: Optional[date] = None

class PerformanceKRAResponse(BaseModel):
    id: UUID
    employee_id: UUID
    title: str
    description: Optional[str] = None
    weightage: int
    target_date: Optional[date] = None

    class Config:
        from_attributes = True

class PerformanceReviewCreate(BaseModel):
    review_cycle: str
    self_rating: Decimal
    self_feedback: str

class PerformanceReviewResponse(BaseModel):
    id: UUID
    employee_id: UUID
    employee_name: Optional[str] = None
    review_cycle: str
    self_rating: Optional[Decimal] = None
    self_feedback: Optional[str] = None
    manager_rating: Optional[Decimal] = None
    manager_feedback: Optional[str] = None
    normalized_category: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PerformanceReviewAction(BaseModel):
    manager_rating: Decimal
    manager_feedback: str

# --- AI Promotions ---
class PromotionRecommendationResponse(BaseModel):
    id: UUID
    employee_id: UUID
    employee_name: Optional[str] = None
    recommended_by: Optional[UUID] = None
    current_grade: str
    target_grade: str
    ai_score: Optional[Decimal] = None
    ai_summary: Optional[str] = None
    risk_flags: Optional[List[str]] = None
    comp_adjustment_pct: Optional[Decimal] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Offboarding & Final Settlement ---
class OffboardingRequestCreate(BaseModel):
    resignation_date: date
    requested_relieving_date: Optional[date] = None
    reason: Optional[str] = None
    initiation_type: Optional[str] = "employee" # 'employee' or 'organization'

class OffboardingAdminInitiate(BaseModel):
    employee_id: UUID
    initiation_type: str # 'employee' or 'organization'
    resignation_date: date
    requested_relieving_date: Optional[date] = None
    reason: Optional[str] = None
    notice_period_days: Optional[int] = 90

class OffboardingRequestResponse(BaseModel):
    id: UUID
    employee_id: UUID
    employee_name: Optional[str] = None
    resignation_date: date
    requested_relieving_date: Optional[date] = None
    approved_relieving_date: Optional[date] = None
    reason: Optional[str] = None
    status: str
    initiation_type: str
    notice_period_days: int
    notice_buyout_days: int
    it_clearance_status: str
    hr_clearance_status: str
    finance_clearance_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class OffboardingRequestAction(BaseModel):
    status: str # 'approved', 'rejected', 'in_clearance', 'completed'
    approved_relieving_date: Optional[date] = None
    notice_buyout_days: int = 0

class OffboardingClearanceAction(BaseModel):
    department: str # 'it', 'hr', 'finance'
    status: str # 'completed', 'pending'

class FinalSettlementResponse(BaseModel):
    id: UUID
    offboarding_request_id: UUID
    employee_name: Optional[str] = None
    gratuity_amount: Decimal
    leave_encashment_amount: Decimal
    notice_buyout_charge: Decimal
    unpaid_salary: Decimal
    other_additions: Decimal
    other_deductions: Decimal
    total_settlement_amount: Decimal
    settlement_date: Optional[date] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- User & SaaS Subscription Management ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str # 'hr_admin', 'Talent Team', 'HR Team', 'Resource Mgmt Group', 'employee'
    is_active: Optional[bool] = True

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserMgmtResponse(BaseModel):
    id: UUID
    organization_id: UUID
    email: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class SubscriptionUpdate(BaseModel):
    feature_talent_mgmt: bool
    feature_hr_team: bool
    feature_resource_mgmt: bool

class SubscriptionResponse(BaseModel):
    feature_talent_mgmt: bool
    feature_hr_team: bool
    feature_resource_mgmt: bool

    class Config:
        from_attributes = True

class RolePermissionResponse(BaseModel):
    id: UUID
    organization_id: UUID
    role: str
    feature: str
    is_enabled: bool

    class Config:
        from_attributes = True

class RolePermissionUpdate(BaseModel):
    role: str
    feature: str
    is_enabled: bool

# --- Talent Management & Recruitment ---
class RecruitmentPositionCreate(BaseModel):
    title: str
    department_id: Optional[UUID] = None
    location: Optional[str] = None
    vacancies: Optional[int] = 1

class RecruitmentPositionResponse(BaseModel):
    id: UUID
    title: str
    department_id: Optional[UUID] = None
    location: Optional[str] = None
    vacancies: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class JobPostingCreate(BaseModel):
    position_id: UUID
    description: str
    requirements: Optional[str] = "Not specified"
    experience_range: Optional[str] = None
    salary_range: Optional[str] = None

class JobPostingResponse(BaseModel):
    id: UUID
    position_id: UUID
    description: str
    requirements: str
    experience_range: Optional[str] = None
    salary_range: Optional[str] = None
    posted_at: datetime
    status: str
    created_at: datetime
    updated_at: datetime
    title: Optional[str] = None
    is_active: Optional[bool] = None

    class Config:
        from_attributes = True

class TalentCandidateCreate(BaseModel):
    position_id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    resume_url: Optional[str] = None
    skills: Optional[str] = None
    reference_type: Optional[str] = None
    reference_detail: Optional[str] = None

class TalentCandidateResponse(BaseModel):
    id: UUID
    organization_id: UUID
    position_id: UUID
    profile_id: Optional[UUID] = None
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    resume_url: Optional[str] = None
    status: str
    skills: Optional[str] = None
    match_score: Optional[Decimal] = None
    reference_type: Optional[str] = None
    reference_detail: Optional[str] = None
    applied_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TalentProfileCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    resume_url: Optional[str] = None
    skills: Optional[str] = None
    experience_summary: Optional[str] = None
    raw_resume_text: Optional[str] = None
    reference_type: Optional[str] = None
    reference_detail: Optional[str] = None

class TalentProfileResponse(BaseModel):
    id: UUID
    organization_id: UUID
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    resume_url: Optional[str] = None
    skills: Optional[str] = None
    experience_summary: Optional[str] = None
    raw_resume_text: Optional[str] = None
    reference_type: Optional[str] = None
    reference_detail: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CandidateMatchResponse(BaseModel):
    profile: TalentProfileResponse
    match_percentage: Decimal
    matched_skills: List[str]
    missing_skills: Optional[List[str]] = []
    match_breakdown: Optional[dict] = None  # {required_skills_score, experience_score, general_score}
    confidence_level: Optional[str] = None  # 'high', 'medium', 'low'

class CallLetterCreate(BaseModel):
    candidate_id: UUID
    interview_date: datetime
    location_or_link: str
    email_content: str

class CallLetterResponse(BaseModel):
    id: UUID
    candidate_id: UUID
    interview_date: datetime
    location_or_link: str
    email_content: str
    sent_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class TalentInterviewCreate(BaseModel):
    candidate_id: UUID
    interviewer_id: Optional[UUID] = None
    interview_round: str
    scheduled_at: datetime

class TalentInterviewAction(BaseModel):
    score: Decimal
    feedback: str
    status: str # 'completed', 'cancelled'

class TalentInterviewResponse(BaseModel):
    id: UUID
    candidate_id: UUID
    interviewer_id: Optional[UUID] = None
    interview_round: str
    scheduled_at: datetime
    score: Optional[Decimal] = None
    feedback: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class OfferLetterCreate(BaseModel):
    candidate_id: UUID
    joining_date: date
    offered_salary: Decimal
    employment_type: Optional[str] = 'full-time'
    grade: Optional[str] = 'L1'
    designation_id: Optional[UUID] = None
    department_id: Optional[UUID] = None
    expiry_date: Optional[date] = None

class OfferLetterAction(BaseModel):
    offer_status: str # 'accepted', 'rejected', 'cancelled', 'closed'

class OfferProofUpload(BaseModel):
    proof_attachment: str
    proof_attachment_name: str

class OfferLetterResponse(BaseModel):
    id: UUID
    candidate_id: UUID
    joining_date: date
    offered_salary: Decimal
    employment_type: str
    grade: str
    designation_id: Optional[UUID] = None
    department_id: Optional[UUID] = None
    offer_status: str
    sent_at: datetime
    actioned_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    expiry_date: Optional[date] = None
    proof_attachment: Optional[str] = None
    proof_attachment_name: Optional[str] = None

    class Config:
        from_attributes = True


# --- Resource Requisition Schemas ---
class ResourceRequisitionCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    department_id: Optional[UUID] = None
    num_positions: int = Field(1, ge=1)
    employment_type: str = "permanent"  # 'permanent', 'probation', 'contract'
    justification: Optional[str] = None
    expected_joining_date: Optional[date] = None
    budget_range: Optional[str] = None
    skills_required: Optional[str] = None

class ResourceRequisitionAction(BaseModel):
    notes: Optional[str] = None  # Approval / rejection notes

class ResourceRequisitionResponse(BaseModel):
    id: UUID
    requisition_number: str
    title: str
    department_id: Optional[UUID] = None
    department_name: Optional[str] = None
    requested_by: Optional[UUID] = None
    requested_by_name: Optional[str] = None
    num_positions: int
    employment_type: str
    justification: Optional[str] = None
    expected_joining_date: Optional[date] = None
    budget_range: Optional[str] = None
    skills_required: Optional[str] = None
    status: str
    manager_approved_by: Optional[UUID] = None
    manager_approved_at: Optional[datetime] = None
    hr_approved_by: Optional[UUID] = None
    hr_approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    position_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Support Tickets Schemas ---
class SupportTicketCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: str = Field(..., min_length=5)
    category: str = Field(..., pattern="^(billing|technical|infrastructure|access_control|other)$")
    priority: str = Field("medium", pattern="^(low|medium|high|critical)$")

class SupportTicketUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(open|in_progress|resolved|closed)$")
    resolution_notes: Optional[str] = None

class SupportTicketResponse(BaseModel):
    id: UUID
    organization_id: UUID
    organization_name: Optional[str] = None
    user_id: UUID
    user_email: Optional[str] = None
    title: str
    description: str
    category: str
    priority: str
    status: str
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Shard / Tenant Provisioning Schemas ---
class ShardCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    subdomain: str = Field(..., min_length=2, max_length=100)
    subscription_plan: str = "growth"
    admin_email: EmailStr
    admin_password: str = Field(..., min_length=6)
    feature_talent_mgmt: bool = True
    feature_hr_team: bool = True
    feature_resource_mgmt: bool = True

class ShardResponse(BaseModel):
    id: UUID
    name: str
    subdomain: str
    subscription_plan: str
    subscription_status: str
    feature_talent_mgmt: bool
    feature_hr_team: bool
    feature_resource_mgmt: bool
    created_at: Optional[datetime] = None
    user_count: int
    employee_count: int
    status_ping: str = "healthy"

    class Config:
        from_attributes = True


# --- Infrastructure Diagnostics Schemas ---
class InfraStatusResponse(BaseModel):
    total_shards: int
    total_tickets: int
    active_tickets: int
    db_engine: str
    db_size_kb: int
    system_status: str = "healthy"
    load_cpu: float
    load_memory: float
    load_disk_io: str


# --- Asset & Onboarding Induction Schemas ---
class AssetCreate(BaseModel):
    name: str
    asset_type: str
    serial_number: Optional[str] = None
    status: Optional[str] = "available"
    employee_id: Optional[Union[UUID, str]] = None

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    asset_type: Optional[str] = None
    serial_number: Optional[str] = None
    status: Optional[str] = None
    employee_id: Optional[Union[UUID, str]] = None


class AssetEmployeeInfo(BaseModel):
    id: UUID
    employee_id: str
    first_name: str
    last_name: str

    class Config:
        from_attributes = True

class AssetResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    asset_type: str
    serial_number: Optional[str] = None
    status: str
    employee_id: Optional[UUID] = None
    assigned_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    employee: Optional[AssetEmployeeInfo] = None

    class Config:
        from_attributes = True

class AssetAssign(BaseModel):
    employee_id: UUID

class InductionTaskCreate(BaseModel):
    task_name: str
    description: Optional[str] = None

class InductionTaskResponse(BaseModel):
    id: UUID
    organization_id: UUID
    employee_id: UUID
    task_name: str
    description: Optional[str] = None
    status: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InductionTaskUpdate(BaseModel):
    status: str


# =========================================================================
# 9. AUDIT LOG SCHEMAS
# =========================================================================

class AuditLogUserResponse(BaseModel):
    email: str
    role: str

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: UUID
    organization_id: UUID
    user_id: Optional[UUID] = None
    action: str
    module: str
    details: Optional[dict] = None
    created_at: datetime
    user: Optional[AuditLogUserResponse] = None

    class Config:
        from_attributes = True


# =========================================================================
# 10. DASHBOARD METRICS SCHEMAS
# =========================================================================

class TalentMetrics(BaseModel):
    open_positions: int
    closed_positions: int
    total_candidates: int
    pending_offers: int
    interviews_scheduled: int
    resources_onboarding: int
    pipeline_statuses: Optional[dict] = None

class HRMetrics(BaseModel):
    total_employees: int
    daily_attendance_pct: float
    pending_leaves: int
    payslips_processed: int
    attrition_rate: float = 0.0
    leave_usage_pct: float = 0.0
    payroll_cost: float = 0.0
    headcount_by_dept: Optional[dict] = None
    monthly_payroll: Optional[list] = None

class ResourceMetrics(BaseModel):
    assigned_assets: int
    total_assets: int
    induction_progress_pct: float
    active_allocations: int
    bench_resources: int
    project_resources: int
    expecting_to_bench: int
    pipeline_projects: int

class AdminMetrics(BaseModel):
    total_users: int
    active_support_tickets: int
    custom_role_permissions: int
    subscription_plan: str

class DashboardMetricsResponse(BaseModel):
    talent: TalentMetrics
    hr: HRMetrics
    resource: ResourceMetrics
    administration: AdminMetrics

class AttendanceHeatmapDay(BaseModel):
    date: str
    status: str
    work_minutes: int

class AttendanceAnalyticsResponse(BaseModel):
    monthly_heatmap: list[AttendanceHeatmapDay]
    hours_worked: list[dict]
    shift_distribution: list[dict]
    geo_locations: list[dict]

class RecruitmentAnalyticsResponse(BaseModel):
    total_candidates: int
    stage_counts: list[dict]
    pipeline_summary: Optional[dict] = None

# =========================================================================
# 11. PROJECT RESOURCE MANAGEMENT (RMG - Clients, Projects, Allocations)
# =========================================================================

class ClientCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    code: str = Field(..., min_length=2, max_length=50)
    domain_industry: Optional[str] = None
    country: Optional[str] = "India"

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    domain_industry: Optional[str] = None
    country: Optional[str] = None

class ClientResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    code: str
    domain_industry: Optional[str] = None
    country: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectCreate(BaseModel):
    client_id: UUID
    name: str = Field(..., min_length=2, max_length=150)
    code: str = Field(..., min_length=2, max_length=50)
    billing_type: Optional[str] = "Time & Material"
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    billing_type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ProjectResponse(BaseModel):
    id: UUID
    organization_id: UUID
    client_id: UUID
    client_name: Optional[str] = None
    name: str
    code: str
    billing_type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None  # "active", "pipeline", "completed"
    allocated_count: Optional[int] = 0
    created_at: datetime

    class Config:
        from_attributes = True


class AllocationCreate(BaseModel):
    employee_id: UUID
    project_id: UUID
    project_role: str = Field(..., min_length=2, max_length=150)
    allocation_percentage: Optional[int] = 100
    billing_status: Optional[str] = "Billable"  # Billable, Shadow, Bench, Internal
    billing_hourly_rate: Optional[Decimal] = None
    start_date: Optional[date] = None

class AllocationUpdate(BaseModel):
    project_id: Optional[UUID] = None
    project_role: Optional[str] = None
    allocation_percentage: Optional[int] = None
    billing_status: Optional[str] = None
    billing_hourly_rate: Optional[Decimal] = None
    start_date: Optional[date] = None

class AllocationResponse(BaseModel):
    id: UUID
    organization_id: UUID
    employee_id: UUID
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    department_name: Optional[str] = None
    designation_title: Optional[str] = None
    project_id: UUID
    project_name: Optional[str] = None
    project_code: Optional[str] = None
    client_name: Optional[str] = None
    project_role: str
    allocation_percentage: int
    billing_status: str
    billing_hourly_rate: Optional[Decimal] = None
    start_date: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BenchResourceResponse(BaseModel):
    employee_id: UUID
    employee_name: str
    employee_code: Optional[str] = None
    department_name: Optional[str] = None
    designation_title: Optional[str] = None
    bench_since: Optional[date] = None   # join_date or last project end
    skills: Optional[List[str]] = []



