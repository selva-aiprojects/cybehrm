# app/models/models.py
import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, Date, Integer, 
    Numeric, ForeignKey, Text, JSON, DECIMAL, Float, Index
)
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID as pgUUID
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid

class UUID(TypeDecorator):
    """Platform-independent UUID type.
    Uses PostgreSQL's UUID type, otherwise CHAR(36), keeping as standard hyphenated string.
    """
    impl = CHAR
    cache_ok = True

    def __init__(self, as_uuid=True, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(pgUUID())
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == 'postgresql':
            return str(value)
        else:
            if isinstance(value, uuid.UUID):
                return str(value)
            try:
                return str(uuid.UUID(str(value)))
            except ValueError:
                return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return value
        try:
            return uuid.UUID(value)
        except ValueError:
            return value

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    subdomain = Column(String(100), unique=True, nullable=True)
    domain = Column(String(255), unique=True, nullable=True)
    subscription_plan = Column(String(50), nullable=False, default="starter")
    subscription_status = Column(String(50), nullable=False, default="active")
    feature_talent_mgmt = Column(Boolean, nullable=False, default=True)
    feature_hr_team = Column(Boolean, nullable=False, default=True)
    feature_resource_mgmt = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)    # Relationships
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    support_tickets = relationship("SupportTicket", back_populates="organization", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False) # 'super_admin', 'hr_admin', 'manager', 'employee', 'payroll_admin', 'recruiter'
    is_active = Column(Boolean, nullable=False, default=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="users")

    employee = relationship("Employee", uselist=False, back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")

    @property
    def employee_id(self):
        if 'employee' in self.__dict__:
            return self.employee.id if self.employee else None
        return None

    @property
    def organization_name(self):
        if 'organization' in self.__dict__:
            return self.organization.name if self.organization else None
        return None

    @property
    def feature_talent_mgmt(self):
        if 'organization' in self.__dict__ and self.organization:
            return self.organization.feature_talent_mgmt
        return True

    @property
    def feature_hr_team(self):
        if 'organization' in self.__dict__ and self.organization:
            return self.organization.feature_hr_team
        return True

    @property
    def feature_resource_mgmt(self):
        if 'organization' in self.__dict__ and self.organization:
            return self.organization.feature_resource_mgmt
        return True


class RolePermission(Base):
    __tablename__ = "role_permissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), nullable=False)  # 'employee', 'manager', 'recruiter', 'payroll_admin'
    feature = Column(String(100), nullable=False)  # 'attendance', 'leave', 'payroll', 'talent', 'appraisals', etc.
    is_enabled = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class Department(Base):
    __tablename__ = "departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employees = relationship("Employee", back_populates="department", foreign_keys="Employee.department_id")
    manager = relationship("Employee", foreign_keys=[manager_id], post_update=True)


class Designation(Base):
    __tablename__ = "designations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(100), nullable=False)
    salary_band_id = Column(UUID(as_uuid=True), ForeignKey("salary_bands.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employees = relationship("Employee", back_populates="designation")
    salary_band = relationship("SalaryBand", back_populates="designations")


class Employee(Base):
    __tablename__ = "employees"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True)
    employee_id = Column(String(50), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    dob = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    designation_id = Column(UUID(as_uuid=True), ForeignKey("designations.id", ondelete="SET NULL"), nullable=True)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    joining_date = Column(Date, nullable=False)
    exit_date = Column(Date, nullable=True)
    employment_type = Column(String(50), nullable=False) # 'permanent', 'probation', 'contract'
    employment_status = Column(String(50), nullable=False, default="active") # 'active', 'terminated', 'on-leave'
    grade = Column(String(20), nullable=False, default="L1") # 'L1', 'L2', 'L3'
    
    # Extended Enterprise Fields
    uan_number = Column(String(50), nullable=True)
    pf_number = Column(String(50), nullable=True)
    pan_card = Column(String(20), nullable=True)
    aadhaar_card = Column(String(20), nullable=True)
    esic_number = Column(String(50), nullable=True)
    marital_status = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    emergency_contact_name = Column(String(100), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    emergency_contact_relation = Column(String(50), nullable=True)
    passport_number = Column(String(50), nullable=True)
    visa_details = Column(Text, nullable=True)
    functional_title_id = Column(UUID(as_uuid=True), ForeignKey("functional_titles.id", ondelete="SET NULL"), nullable=True)
    current_shift = Column(String(50), default="General Shift")
    deputation_details = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="employee")
    department = relationship("Department", back_populates="employees", foreign_keys=[department_id])
    designation = relationship("Designation", back_populates="employees")
    
    # Self-referencing managers
    manager = relationship("Employee", remote_side=[id], backref="direct_reports")
    
    attendance = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")
    leave_requests = relationship("LeaveRequest", back_populates="employee", foreign_keys="LeaveRequest.employee_id", cascade="all, delete-orphan")
    leave_balances = relationship("LeaveBalance", back_populates="employee", cascade="all, delete-orphan")
    salary_structure = relationship("SalaryStructure", uselist=False, back_populates="employee", cascade="all, delete-orphan")
    payslips = relationship("Payslip", back_populates="employee", cascade="all, delete-orphan")
    
    # New tables relationships
    tax_declarations = relationship("TaxDeclaration", back_populates="employee", foreign_keys="[TaxDeclaration.employee_id]", cascade="all, delete-orphan")
    fbp_declarations = relationship("FBPDeclaration", back_populates="employee", cascade="all, delete-orphan")
    insurance_enrollment = relationship("InsuranceEnrollment", uselist=False, back_populates="employee", cascade="all, delete-orphan")
    vehicle_lease = relationship("VehicleLease", uselist=False, back_populates="employee", cascade="all, delete-orphan")
    performance_kras = relationship("PerformanceKRA", back_populates="employee", cascade="all, delete-orphan")
    performance_reviews = relationship("PerformanceReview", back_populates="employee", foreign_keys="PerformanceReview.employee_id", cascade="all, delete-orphan")
    promotion_recommendations = relationship("PromotionRecommendation", back_populates="employee", foreign_keys="[PromotionRecommendation.employee_id]", cascade="all, delete-orphan")
    offboarding_request = relationship("OffboardingRequest", uselist=False, back_populates="employee", cascade="all, delete-orphan")
    functional_title = relationship("FunctionalTitle", back_populates="employees")
    skillsets = relationship("EmployeeSkillset", back_populates="employee", cascade="all, delete-orphan")
    work_experiences = relationship("WorkExperience", back_populates="employee", cascade="all, delete-orphan")
    academic_qualifications = relationship("AcademicQualification", back_populates="employee", cascade="all, delete-orphan")
    project_allocations = relationship("ProjectMapping", back_populates="employee", cascade="all, delete-orphan")
    contractor_details = relationship("ContractVendor", uselist=False, back_populates="employee", cascade="all, delete-orphan")
    resource_requisitions = relationship("ResourceRequisition", back_populates="requested_by_employee", foreign_keys="ResourceRequisition.requested_by", cascade="all, delete-orphan")
    assets = relationship("Asset", back_populates="employee")
    induction_tasks = relationship("InductionTask", back_populates="employee", cascade="all, delete-orphan")


class ContractVendor(Base):
    """Vendor/agency details for contract employees (employment_type == 'contract')"""
    __tablename__ = "contract_vendors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), unique=True, nullable=False)
    vendor_name = Column(String(200), nullable=False)
    vendor_code = Column(String(50), nullable=True)
    contact_person = Column(String(100), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    contract_start_date = Column(Date, nullable=True)
    contract_end_date = Column(Date, nullable=True)
    po_number = Column(String(100), nullable=True)  # Purchase Order number
    billing_rate = Column(Numeric(10, 2), nullable=True)  # Rate per day/hour
    currency = Column(String(10), nullable=False, default="INR")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="contractor_details")


class ResourceRequisition(Base):
    """Resource hiring requisition — must be approved before a recruitment position opens"""
    __tablename__ = "resource_requisitions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    requisition_number = Column(String(50), nullable=False)  # e.g. REQ-2026-001
    title = Column(String(255), nullable=False)  # Role/position title being requested
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    requested_by = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    num_positions = Column(Integer, nullable=False, default=1)
    employment_type = Column(String(50), nullable=False, default="permanent")  # 'permanent', 'probation', 'contract'
    justification = Column(Text, nullable=True)
    expected_joining_date = Column(Date, nullable=True)
    budget_range = Column(String(100), nullable=True)
    skills_required = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="draft")
    # Status flow: 'draft' → 'pending_manager' → 'pending_hr' → 'approved' → 'converted' | 'rejected'
    manager_approved_by = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    manager_approved_at = Column(DateTime(timezone=True), nullable=True)
    hr_approved_by = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    hr_approved_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    position_id = Column(UUID(as_uuid=True), ForeignKey("recruitment_positions.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    department = relationship("Department")
    requested_by_employee = relationship("Employee", back_populates="resource_requisitions", foreign_keys=[requested_by])
    manager_approver = relationship("Employee", foreign_keys=[manager_approved_by])
    hr_approver = relationship("Employee", foreign_keys=[hr_approved_by])
    recruitment_position = relationship("RecruitmentPosition")




class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    check_in = Column(DateTime(timezone=True), nullable=True)
    check_out = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), nullable=False, default="present") # 'present', 'absent', 'half_day', 'leave', 'wfh'
    late_minutes = Column(Integer, nullable=False, default=0)
    overtime_minutes = Column(Integer, nullable=False, default=0)
    work_minutes = Column(Integer, nullable=False, default=0)
    ip_address = Column(String(45), nullable=True)
    location_lat = Column(Numeric(10, 8), nullable=True)
    location_lng = Column(Numeric(11, 8), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="attendance")


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    leave_type = Column(String(50), nullable=False) # 'casual', 'sick', 'earned', 'maternity', 'unpaid'
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_days = Column(Numeric(4, 1), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="pending") # 'pending', 'approved', 'rejected', 'cancelled'
    applied_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    actioned_by = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    actioned_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="leave_requests", foreign_keys=[employee_id])
    approver = relationship("Employee", foreign_keys=[actioned_by])


class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    year = Column(Integer, nullable=False)
    leave_type = Column(String(50), nullable=False)
    allocated = Column(Numeric(4, 1), nullable=False)
    used = Column(Numeric(4, 1), nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="leave_balances")

    @property
    def remaining(self):
        return float(self.allocated - self.used) if self.allocated is not None and self.used is not None else 0.0


class SalaryStructure(Base):
    __tablename__ = "salary_structures"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), unique=True, nullable=False)
    basic = Column(DECIMAL(12, 2), nullable=False)
    hra = Column(DECIMAL(12, 2), nullable=False)
    allowances = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    pf = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    tax = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    nps = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    other_deductions = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    custom_deductions = Column(JSON, nullable=True, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="salary_structure")


class PayrollRun(Base):
    __tablename__ = "payroll_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False, default="draft") # 'draft', 'processed', 'approved', 'paid'
    processed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    payslips = relationship("Payslip", back_populates="payroll_run", cascade="all, delete-orphan")


class Payslip(Base):
    __tablename__ = "payslips"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    payroll_run_id = Column(UUID(as_uuid=True), ForeignKey("payroll_runs.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    basic = Column(DECIMAL(12, 2), nullable=False)
    hra = Column(DECIMAL(12, 2), nullable=False)
    allowances = Column(DECIMAL(12, 2), nullable=False)
    bonus = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    gross_salary = Column(DECIMAL(12, 2), nullable=False)
    pf = Column(DECIMAL(12, 2), nullable=False)
    tax = Column(DECIMAL(12, 2), nullable=False)
    nps = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    professional_tax = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    deductions = Column(DECIMAL(12, 2), nullable=False)
    net_salary = Column(DECIMAL(12, 2), nullable=False)
    custom_deductions = Column(JSON, nullable=True, default=dict)
    status = Column(String(50), nullable=False, default="unpaid") # 'unpaid', 'paid'
    payslip_url = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    payroll_run = relationship("PayrollRun", back_populates="payslips")
    employee = relationship("Employee", back_populates="payslips")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False) # 'leave_request', 'payroll', 'attendance', 'birthday'
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(255), nullable=False)
    module = Column(String(100), nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="audit_logs")


class LeavePolicy(Base):
    __tablename__ = "leave_policies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    grade = Column(String(20), nullable=False) # 'L1', 'L2', 'L3'
    leave_type = Column(String(50), nullable=False) # 'casual', 'sick', 'earned', 'maternity', 'unpaid'
    annual_allocation = Column(Numeric(4, 1), nullable=False)
    monthly_accrual_rate = Column(Numeric(4, 2), nullable=False)
    max_carry_forward = Column(Numeric(4, 1), nullable=False, default=0.0)
    tenure_months_required = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships


class TaxDeclaration(Base):
    __tablename__ = "tax_declarations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    financial_year = Column(String(10), nullable=False) # e.g. '2025-2026'
    regime = Column(String(20), nullable=False, default="new") # 'old', 'new'
    section_80c = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    section_80d = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    hra_rent_paid = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    landlord_pan = Column(String(20), nullable=True)
    landlord_name = Column(String(255), nullable=True)
    evidence_url = Column(String(512), nullable=True)
    status = Column(String(50), nullable=False, default="pending") # 'pending', 'approved', 'rejected'
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="tax_declarations", foreign_keys=[employee_id])
    reviewer = relationship("Employee", foreign_keys=[reviewed_by])


class GradeAllowance(Base):
    __tablename__ = "grade_allowances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    grade = Column(String(20), nullable=False) # 'L1', 'L2', 'L3'
    fuel_cap = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    lta_cap = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    phone_cap = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    food_cap = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    car_lease_cap = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    insurance_cover = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships


class FBPDeclaration(Base):
    __tablename__ = "fbp_declarations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    fuel_amount = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    lta_amount = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    phone_amount = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    food_amount = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    status = Column(String(50), nullable=False, default="approved") # 'pending', 'approved', 'rejected'
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="fbp_declarations")


class InsuranceEnrollment(Base):
    __tablename__ = "insurance_enrollments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), unique=True, nullable=False)
    tier = Column(String(50), nullable=False) # 'base', 'silver', 'gold'
    has_parents = Column(Boolean, nullable=False, default=False)
    has_spouse = Column(Boolean, nullable=False, default=False)
    children_count = Column(Integer, nullable=False, default=0)
    top_up_sum_insured = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    monthly_surcharge = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    status = Column(String(50), nullable=False, default="active") # 'active', 'cancelled'
    health_card_number = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="insurance_enrollment")


class VehicleLease(Base):
    __tablename__ = "vehicle_leases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), unique=True, nullable=False)
    lease_type = Column(String(50), nullable=False) # 'oyt', 'lease'
    car_model = Column(String(255), nullable=True)
    ex_showroom_price = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    lease_tenure_months = Column(Integer, nullable=False, default=36)
    monthly_emi = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    engine_capacity_cc = Column(Integer, nullable=False, default=1200)
    has_driver = Column(Boolean, nullable=False, default=False)
    perk_value = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    status = Column(String(50), nullable=False, default="active") # 'active', 'terminated'
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="vehicle_lease")


class PerformanceKRA(Base):
    __tablename__ = "performance_kras"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    weightage = Column(Integer, nullable=False) # weightage e.g. 25 for 25%
    target_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="performance_kras")


class PerformanceReview(Base):
    __tablename__ = "performance_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    review_cycle = Column(String(100), nullable=False) # e.g. 'FY26-Q1'
    self_rating = Column(DECIMAL(3, 2), nullable=True)
    self_feedback = Column(Text, nullable=True)
    manager_rating = Column(DECIMAL(3, 2), nullable=True)
    manager_feedback = Column(Text, nullable=True)
    normalized_category = Column(String(50), nullable=True) # 'Top', 'Core', 'Low'
    status = Column(String(50), nullable=False, default="pending") # 'pending', 'self_reviewed', 'manager_reviewed', 'completed'
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="performance_reviews", foreign_keys=[employee_id])


class PromotionRecommendation(Base):
    __tablename__ = "promotion_recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    recommended_by = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    current_grade = Column(String(20), nullable=False)
    target_grade = Column(String(20), nullable=False)
    ai_score = Column(DECIMAL(5, 2), nullable=True)
    ai_summary = Column(Text, nullable=True)
    risk_flags = Column(JSON, nullable=True)
    comp_adjustment_pct = Column(DECIMAL(5, 2), nullable=True)
    status = Column(String(50), nullable=False, default="pending") # 'pending', 'approved', 'rejected'
    actioned_by = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    actioned_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="promotion_recommendations", foreign_keys=[employee_id])
    recommender = relationship("Employee", foreign_keys=[recommended_by])
    approver = relationship("Employee", foreign_keys=[actioned_by])


class OffboardingRequest(Base):
    __tablename__ = "offboarding_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), unique=True, nullable=False)
    resignation_date = Column(Date, nullable=False)
    requested_relieving_date = Column(Date, nullable=True)
    approved_relieving_date = Column(Date, nullable=True)
    reason = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="pending") # 'pending', 'approved', 'rejected', 'in_clearance', 'completed'
    initiation_type = Column(String(50), nullable=False, server_default='employee') # 'employee' (resignation) or 'organization' (termination/layoff/retirement)
    notice_period_days = Column(Integer, nullable=False, default=90)
    notice_buyout_days = Column(Integer, nullable=False, default=0)
    it_clearance_status = Column(String(50), nullable=False, default="pending") # 'pending', 'completed'
    hr_clearance_status = Column(String(50), nullable=False, default="pending") # 'pending', 'completed'
    finance_clearance_status = Column(String(50), nullable=False, default="pending") # 'pending', 'completed'
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="offboarding_request")
    final_settlement = relationship("FinalSettlement", uselist=False, back_populates="offboarding_request", cascade="all, delete-orphan")


class FinalSettlement(Base):
    __tablename__ = "final_settlements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    offboarding_request_id = Column(UUID(as_uuid=True), ForeignKey("offboarding_requests.id", ondelete="CASCADE"), unique=True, nullable=False)
    gratuity_amount = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    leave_encashment_amount = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    notice_buyout_charge = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    unpaid_salary = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    other_additions = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    other_deductions = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    total_settlement_amount = Column(DECIMAL(12, 2), nullable=False, default=0.00)
    settlement_date = Column(Date, nullable=True)
    status = Column(String(50), nullable=False, default="draft") # 'draft', 'approved', 'paid'
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    offboarding_request = relationship("OffboardingRequest", back_populates="final_settlement")


class SalaryBand(Base):
    """Governs compensation boundaries per designation level"""
    __tablename__ = "salary_bands"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    band_name = Column(String(50), unique=True, nullable=False) # e.g. "B2-CONS", "B3-MGR"
    min_base_annual = Column(Numeric(12, 2), nullable=False)
    mid_base_annual = Column(Numeric(12, 2), nullable=False)
    max_base_annual = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    designations = relationship("Designation", back_populates="salary_band")


class FunctionalTitle(Base):
    """Governs technical specialties / capabilities"""
    __tablename__ = "functional_titles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False) # e.g. "React Web Developer"
    skill_category = Column(String(50), nullable=True) # e.g. "Frontend", "Data Engineering"
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employees = relationship("Employee", back_populates="functional_title")


class Client(Base):
    """Enterprise accounts and customers"""
    __tablename__ = "clients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    code = Column(String(50), nullable=False) # e.g. "ACME_CORP"
    domain_industry = Column(String(100), nullable=True) # e.g. "Retail", "Healthcare"
    country = Column(String(100), default="India")
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    projects = relationship("Project", back_populates="client", cascade="all, delete-orphan")


class Project(Base):
    """Engagement deliverables and SOW activities"""
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    code = Column(String(50), nullable=False) # e.g. "MIGRATE_CLOUD"
    billing_type = Column(String(50), default="Time & Material") # T&M, Fixed Price, Internal
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    client = relationship("Client", back_populates="projects")
    employee_allocations = relationship("ProjectMapping", back_populates="project", cascade="all, delete-orphan")


class ProjectMapping(Base):
    """Bridges Employee, Project, and Billing Role"""
    __tablename__ = "project_mappings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    
    project_role = Column(String(150), nullable=False) # e.g. "Onshore Tech Lead", "DevOps Engineer"
    allocation_percentage = Column(Integer, default=100) # e.g. 50 (sharing capacity)
    billing_status = Column(String(50), default="Billable") # Billable, Shadow, Bench, Internal
    billing_hourly_rate = Column(Numeric(10, 2), nullable=True)
    start_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="project_allocations")
    project = relationship("Project", back_populates="employee_allocations")


class EmployeeSkillset(Base):
    __tablename__ = "employee_skillsets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False) # e.g. "React", "Python", "Kubernetes"
    proficiency = Column(String(50), default="Intermediate") # Beginner, Intermediate, Expert
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="skillsets")


class WorkExperience(Base):
    __tablename__ = "work_experiences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    company_name = Column(String(150), nullable=False)
    designation = Column(String(100), nullable=False)
    tenure_months = Column(Integer, default=12)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="work_experiences")


class AcademicQualification(Base):
    __tablename__ = "academic_qualifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    degree = Column(String(100), nullable=False) # e.g. "B.Tech Computer Science", "MBA"
    institution = Column(String(150), nullable=False)
    passing_year = Column(Integer, nullable=True)
    cgpa_percentage = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="academic_qualifications")


class RecruitmentPosition(Base):
    __tablename__ = "recruitment_positions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    location = Column(String(255), nullable=True)
    vacancies = Column(Integer, nullable=False, default=1)
    status = Column(String(50), nullable=False, default="open") # 'open', 'closed', 'paused'
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    department = relationship("Department")
    job_posting = relationship("JobPosting", uselist=False, back_populates="position", cascade="all, delete-orphan")
    candidates = relationship("TalentCandidate", back_populates="position", cascade="all, delete-orphan")


class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    position_id = Column(UUID(as_uuid=True), ForeignKey("recruitment_positions.id", ondelete="CASCADE"), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=False)
    experience_range = Column(String(100), nullable=True)
    salary_range = Column(String(100), nullable=True)
    posted_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    status = Column(String(50), nullable=False, default="active") # 'active', 'expired', 'draft'
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    position = relationship("RecruitmentPosition", back_populates="job_posting")

class TalentProfile(Base):
    __tablename__ = "talent_profiles"
    __table_args__ = (
        Index("ix_talent_profiles_organization_id", "organization_id"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    resume_url = Column(String(512), nullable=True)
    skills = Column(Text, nullable=True)
    experience_summary = Column(Text, nullable=True)
    raw_resume_text = Column(Text, nullable=True)
    reference_type = Column(String(50), nullable=True)
    reference_detail = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    applications = relationship("TalentCandidate", back_populates="profile", cascade="all, delete-orphan")


class TalentCandidate(Base):
    __tablename__ = "talent_candidates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("talent_profiles.id", ondelete="SET NULL"), nullable=True)
    position_id = Column(UUID(as_uuid=True), ForeignKey("recruitment_positions.id", ondelete="CASCADE"), nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    resume_url = Column(String(512), nullable=True)
    status = Column(String(50), nullable=False, default="applied") # 'applied', 'interview_scheduled', 'interviewed', 'selected', 'rejected', 'offered', 'accepted', 'onboarded'
    skills = Column(Text, nullable=True)
    match_score = Column(DECIMAL(5, 2), nullable=True)
    reference_type = Column(String(50), nullable=True)
    reference_detail = Column(String(255), nullable=True)
    applied_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    position = relationship("RecruitmentPosition", back_populates="candidates")
    profile = relationship("TalentProfile", back_populates="applications")
    call_letters = relationship("CallLetter", back_populates="candidate", cascade="all, delete-orphan")
    interviews = relationship("TalentInterview", back_populates="candidate", cascade="all, delete-orphan")
    offer_letter = relationship("OfferLetter", uselist=False, back_populates="candidate", cascade="all, delete-orphan")


class CallLetter(Base):
    __tablename__ = "call_letters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("talent_candidates.id", ondelete="CASCADE"), nullable=False)
    interview_date = Column(DateTime(timezone=True), nullable=False)
    location_or_link = Column(String(512), nullable=False)
    email_content = Column(Text, nullable=False)
    sent_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

    # Relationships
    candidate = relationship("TalentCandidate", back_populates="call_letters")


class TalentInterview(Base):
    __tablename__ = "talent_interviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("talent_candidates.id", ondelete="CASCADE"), nullable=False)
    interviewer_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    interview_round = Column(String(100), nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    score = Column(DECIMAL(3, 1), nullable=True)
    feedback = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="scheduled") # 'scheduled', 'completed', 'cancelled'
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    candidate = relationship("TalentCandidate", back_populates="interviews")
    interviewer = relationship("Employee")


class OfferLetter(Base):
    __tablename__ = "offer_letters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("talent_candidates.id", ondelete="CASCADE"), unique=True, nullable=False)
    joining_date = Column(Date, nullable=False)
    offered_salary = Column(DECIMAL(12, 2), nullable=False)
    employment_type = Column(String(50), nullable=False, default="full-time")
    grade = Column(String(20), nullable=False, default="L1")
    designation_id = Column(UUID(as_uuid=True), ForeignKey("designations.id", ondelete="SET NULL"), nullable=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    offer_status = Column(String(50), nullable=False, default="sent") # 'sent', 'accepted', 'rejected', 'onboarded'
    sent_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    actioned_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    expiry_date = Column(Date, nullable=True)
    proof_attachment = Column(Text, nullable=True)
    proof_attachment_name = Column(String(255), nullable=True)
    candidate = relationship("TalentCandidate", back_populates="offer_letter")
    designation = relationship("Designation")
    department = relationship("Department")


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)  # 'billing', 'technical', 'infrastructure', 'access_control', 'other'
    priority = Column(String(50), nullable=False, default="medium")  # 'low', 'medium', 'high', 'critical'
    status = Column(String(50), nullable=False, default="open")  # 'open', 'in_progress', 'resolved', 'closed'
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="support_tickets")
    user = relationship("User")


class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)
    recipient_email = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    sent_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    status = Column(String(50), nullable=False, default="sent")


class Asset(Base):
    __tablename__ = "assets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    asset_type = Column(String(100), nullable=False)
    serial_number = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="available")
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    assigned_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="assets")


class InductionTask(Base):
    __tablename__ = "induction_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    task_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="pending")
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="induction_tasks")
