# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from app.db.session import get_db
from app.models.models import Organization, User, Employee, LeaveBalance, Department, GradeAllowance, LeavePolicy, RolePermission
from app.schemas.schemas import UserLogin, Token, UserResponse, TenantRegister, OrganizationBasicResponse
from app.services.auth_service import AuthService
from app.routers.dependencies import get_current_user
import datetime
from typing import List

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_tenant(payload: TenantRegister, db: AsyncSession = Depends(get_db)):
    """
    Bootstrap a new multi-tenant Organization, its super-admin User,
    and associated Employee profile with default configuration rules.
    """
    # 1. Verify email uniqueness
    existing_user = await db.execute(select(User).where(User.email == payload.admin_email))
    if existing_user.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address is already registered"
        )

    # 2. Create the Organization (Tenant)
    new_org = Organization(
        name=payload.organization_name,
        subdomain=payload.subdomain or payload.organization_name.lower().replace(" ", "-"),
        subscription_plan=payload.subscription_plan,
        subscription_status="active",
        feature_talent_mgmt=payload.feature_talent_mgmt,
        feature_hr_team=payload.feature_hr_team,
        feature_resource_mgmt=payload.feature_resource_mgmt
    )
    db.add(new_org)
    await db.flush() # Flush to populate new_org.id for relationships

    # Provision the dedicated schema for this tenant
    from app.routers.dependencies import provision_tenant_schema
    from sqlalchemy import text
    await provision_tenant_schema(db, new_org.subdomain)
    # Set search path for subsequent inserts (Employee, LeaveBalance)
    await db.execute(text(f'SET search_path TO "{new_org.subdomain}", public'))

    # 3. Seed Default Department
    dept_hr = Department(
        organization_id=new_org.id,
        name="Human Resources",
        code="HR"
    )
    db.add(dept_hr)
    await db.flush()

    # 4. Seed Default Grade Allowances (L1, L2, L3)
    ga_l1 = GradeAllowance(
        organization_id=new_org.id, grade="L1",
        fuel_cap=3000.00, lta_cap=25000.00, phone_cap=1000.00,
        food_cap=2200.00, car_lease_cap=0.00, insurance_cover=300000.00
    )
    ga_l2 = GradeAllowance(
        organization_id=new_org.id, grade="L2",
        fuel_cap=5000.00, lta_cap=50000.00, phone_cap=2000.00,
        food_cap=2200.00, car_lease_cap=25000.00, insurance_cover=500000.00
    )
    ga_l3 = GradeAllowance(
        organization_id=new_org.id, grade="L3",
        fuel_cap=8000.00, lta_cap=100000.00, phone_cap=3000.00,
        food_cap=2200.00, car_lease_cap=50000.00, insurance_cover=700000.00
    )
    db.add_all([ga_l1, ga_l2, ga_l3])

    # 5. Seed Standard Leave Policies (L1, L2, L3)
    policies = [
        LeavePolicy(organization_id=new_org.id, grade="L1", leave_type="casual", annual_allocation=12.0, monthly_accrual_rate=1.00),
        LeavePolicy(organization_id=new_org.id, grade="L1", leave_type="sick", annual_allocation=10.0, monthly_accrual_rate=0.83),
        LeavePolicy(organization_id=new_org.id, grade="L1", leave_type="earned", annual_allocation=15.0, monthly_accrual_rate=1.25),
        LeavePolicy(organization_id=new_org.id, grade="L2", leave_type="casual", annual_allocation=14.0, monthly_accrual_rate=1.16),
        LeavePolicy(organization_id=new_org.id, grade="L2", leave_type="sick", annual_allocation=12.0, monthly_accrual_rate=1.00),
        LeavePolicy(organization_id=new_org.id, grade="L2", leave_type="earned", annual_allocation=18.0, monthly_accrual_rate=1.50),
        LeavePolicy(organization_id=new_org.id, grade="L3", leave_type="casual", annual_allocation=16.0, monthly_accrual_rate=1.33),
        LeavePolicy(organization_id=new_org.id, grade="L3", leave_type="sick", annual_allocation=14.0, monthly_accrual_rate=1.16),
        LeavePolicy(organization_id=new_org.id, grade="L3", leave_type="earned", annual_allocation=24.0, monthly_accrual_rate=2.00),
    ]
    db.add_all(policies)
    await db.flush()

    # 6. Create the Super Admin User
    hashed_pwd = AuthService.hash_password(payload.admin_password)
    new_user = User(
        organization_id=new_org.id,
        email=payload.admin_email,
        password_hash=hashed_pwd,
        role="hr_admin",
        is_active=True
    )
    db.add(new_user)
    await db.flush()

    # 7. Create the Admin Employee profile
    new_employee = Employee(
        organization_id=new_org.id,
        user_id=new_user.id,
        employee_id="EMP-1001",
        first_name="Admin",
        last_name="User",
        joining_date=datetime.date.today(),
        employment_type="full-time",
        employment_status="active",
        department_id=dept_hr.id
    )
    db.add(new_employee)
    await db.flush()

    # Set HR manager as this new employee
    dept_hr.manager_id = new_employee.id
    db.add(dept_hr)

    # 8. Populate initial leave balances for the new employee
    current_year = datetime.datetime.utcnow().year
    leave_types = [
        ("casual", 12.0),
        ("sick", 10.0),
        ("earned", 15.0)
    ]
    for l_type, allocated in leave_types:
        balance = LeaveBalance(
            organization_id=new_org.id,
            employee_id=new_employee.id,
            year=current_year,
            leave_type=l_type,
            allocated=allocated,
            used=0.0
        )
        db.add(balance)

    # 9. Seed Default Role Permissions for RBAC
    default_permissions = {
        "employee": ["attendance", "leave", "fbp-tax", "insurance", "car-lease", "appraisals", "offboarding", "ai-copilot"],
        "manager": ["attendance", "leave", "fbp-tax", "insurance", "car-lease", "appraisals", "offboarding", "ai-copilot"],
        "recruiter": ["talent-mgmt", "ai-copilot"],
        "payroll_admin": ["payroll", "fbp-tax", "ai-copilot"],
        "hr_operations": ["project-allocations", "appraisals", "ai-copilot"]
    }
    for role, features in default_permissions.items():
        for feature in features:
            new_perm = RolePermission(
                organization_id=new_org.id,
                role=role,
                feature=feature,
                is_enabled=True
            )
            db.add(new_perm)

    await db.commit()
    result = await db.execute(
        select(User)
        .options(joinedload(User.organization), joinedload(User.employee))
        .where(User.id == new_user.id)
    )
    return result.scalars().first()


@router.get("/organizations", response_model=List[OrganizationBasicResponse])
async def list_organizations(db: AsyncSession = Depends(get_db)):
    """
    Returns a basic list of all registered organizations for the login dropdown.
    Security Note: In production, consider replacing this with a subdomain or workspace lookup.
    """
    result = await db.execute(select(Organization.id, Organization.name))
    orgs = result.all()
    return [{"id": org.id, "name": org.name} for org in orgs]

@router.post("/login", response_model=Token)
async def login_user(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Authenticate a user based on email and password.
    Returns a secure JWT token carrying their organization context and system role.
    """
    # Reset search_path to ensure we query public schema (avoid stale connection pool state)
    from sqlalchemy import text
    await db.execute(text("SET search_path TO public"))

    # 1. Fetch user by email
    query = select(User).where(User.email == payload.email)
    result = await db.execute(query)
    user = result.scalars().first()

    if not user or not AuthService.verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your user account has been deactivated"
        )

    if str(user.organization_id) != str(payload.organization_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not belong to the selected tenant"
        )

    # 2. Update last login time and origin
    user.last_login_at = datetime.datetime.utcnow()
    user.last_login_origin = payload.login_origin
    db.add(user)
    await db.commit()

    # Log authentication event
    from app.services.audit_service import AuditService
    await AuditService.log_action(
        db=db,
        organization_id=user.organization_id,
        user_id=user.id,
        action="Admin Console Login Session" if user.role == "hr_admin" else "Employee Login Session",
        module="Authentication",
        details={"origin": payload.login_origin}
    )

    # 3. Create Access Token payload claims
    token_claims = {
        "user_id": str(user.id),
        "organization_id": str(user.organization_id),
        "email": user.email,
        "role": user.role
    }
    
    access_token = AuthService.create_access_token(data=token_claims)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: User = Depends(get_current_user)):
    """
    Returns details of the currently authenticated portal session user.
    """
    return current_user
