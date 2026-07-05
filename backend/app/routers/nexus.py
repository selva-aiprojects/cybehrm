# app/routers/nexus.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.models import (
    Organization, User, Employee, SupportTicket,
    Department, GradeAllowance, LeavePolicy, LeaveBalance,
    RolePermission
)
from app.schemas.schemas import (
    ShardCreate, ShardResponse,
    SupportTicketCreate, SupportTicketUpdate, SupportTicketResponse,
    InfraStatusResponse, TokenData
)
from app.routers.dependencies import get_current_user_claims
from app.services.auth_service import AuthService
from typing import List, Optional
import datetime
import os
import uuid

router = APIRouter(prefix="/nexus", tags=["SaaS HRMS-Engine Control Plane"])

# Role checker for Global Super Admin only
def require_super_admin(claims: TokenData = Depends(get_current_user_claims)):
    if claims.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Super Admin privileges required for central Nexus Management."
        )
    return claims


# =========================================================================
# 1. SHARDS & TENANTS PROVISIONING (Super Admin only)
# =========================================================================

@router.get("/shards", response_model=List[ShardResponse])
async def list_tenant_shards(
    _admin = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve list of all active tenant shards (organizations) on the platform,
    along with their subscription plan, features, and active metrics.
    """
    # Fetch all organizations
    query = select(Organization).order_by(Organization.created_at.desc())
    result = await db.execute(query)
    orgs = result.scalars().all()
    
    shards_list = []
    for org in orgs:
        # Avoid displaying the central system nexus organisation itself in active billing list if needed
        # Count users in this shard
        user_count_query = select(func.count(User.id)).where(User.organization_id == org.id)
        user_count_res = await db.execute(user_count_query)
        user_count = user_count_res.scalar() or 0
        
        # Count employees in this shard
        emp_count_query = select(func.count(Employee.id)).join(User, Employee.user_id == User.id).where(User.organization_id == org.id)
        emp_count_res = await db.execute(emp_count_query)
        emp_count = emp_count_res.scalar() or 0
        
        shards_list.append(
            ShardResponse(
                id=org.id,
                name=org.name,
                subdomain=org.subdomain or "",
                subscription_plan=org.subscription_plan,
                subscription_status=org.subscription_status,
                feature_talent_mgmt=org.feature_talent_mgmt,
                feature_hr_team=org.feature_hr_team,
                feature_resource_mgmt=org.feature_resource_mgmt,
                created_at=org.created_at,
                user_count=user_count,
                employee_count=emp_count,
                status_ping="healthy"
            )
        )
    return shards_list


@router.post("/shards", response_model=ShardResponse, status_code=status.HTTP_201_CREATED)
async def provision_tenant_shard(
    payload: ShardCreate,
    _admin = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Bootstrap and provision a new logically-isolated tenant Shard:
    1. Validates unique subdomain & admin email.
    2. Registers the Organization.
    3. Provisions basic masters (Departments: HR, Engineering).
    4. Seeds grade allowances and standard leave policies.
    5. Configures initial hr_admin user credentials.
    6. Registers employee profile with pre-populated leave balances.
    """
    # Validate subdomain uniqueness
    subdomain_check = await db.execute(select(Organization).where(Organization.subdomain == payload.subdomain))
    if subdomain_check.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Subdomain '{payload.subdomain}' is already claimed by another tenant shard."
        )
        
    # Validate email uniqueness globally
    email_check = await db.execute(select(User).where(User.email == payload.admin_email))
    if email_check.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this administrator email address is already registered on the platform."
        )
        
    # 1. Create Organization (Tenant Shard)
    new_org = Organization(
        name=payload.name,
        subdomain=payload.subdomain,
        subscription_plan=payload.subscription_plan,
        subscription_status="active",
        feature_talent_mgmt=payload.feature_talent_mgmt,
        feature_hr_team=payload.feature_hr_team,
        feature_resource_mgmt=payload.feature_resource_mgmt
    )
    db.add(new_org)
    await db.flush()
    
    # Provision the dedicated schema for this tenant shard
    from app.routers.dependencies import provision_tenant_schema
    from sqlalchemy import text
    await provision_tenant_schema(db, new_org.subdomain)
    # Set search path so all subsequent master/transactional seeds go into tenant's schema
    await db.execute(text(f'SET search_path TO "{new_org.subdomain}", public'))
    
    # 2. Seed Default Shard Departments
    dept_hr = Department(
        organization_id=new_org.id,
        name="Human Resources",
        code="HR"
    )
    dept_eng = Department(
        organization_id=new_org.id,
        name="Engineering",
        code="ENG"
    )
    db.add_all([dept_hr, dept_eng])
    await db.flush()
    
    # 3. Seed Default Shard Grade Allowances (L1, L2, L3)
    ga_l1 = GradeAllowance(
        organization_id=new_org.id,
        grade="L1",
        fuel_cap=3000.00,
        lta_cap=25000.00,
        phone_cap=1000.00,
        food_cap=2200.00,
        car_lease_cap=0.00,
        insurance_cover=300000.00
    )
    ga_l2 = GradeAllowance(
        organization_id=new_org.id,
        grade="L2",
        fuel_cap=5000.00,
        lta_cap=50000.00,
        phone_cap=2000.00,
        food_cap=2200.00,
        car_lease_cap=25000.00,
        insurance_cover=500000.00
    )
    ga_l3 = GradeAllowance(
        organization_id=new_org.id,
        grade="L3",
        fuel_cap=8000.00,
        lta_cap=100000.00,
        phone_cap=3000.00,
        food_cap=2200.00,
        car_lease_cap=50000.00,
        insurance_cover=700000.00
    )
    db.add_all([ga_l1, ga_l2, ga_l3])
    
    # 4. Seed Standard Shard Leave Policies (L1, L2, L3)
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

    # 5. Create Shard Super Admin User Credentials
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

    # 6. Create Shard Admin Employee Profile
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

    # 7. Seed Initial Leave Balances for the Admin Employee
    current_year = datetime.datetime.utcnow().year
    leave_types = [("casual", 12.0), ("sick", 10.0), ("earned", 15.0)]
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

    # 8. Seed Default Role Permissions for RBAC
    default_permissions = {
        "employee": ["attendance", "leave", "fbp-tax", "insurance", "car-lease", "appraisals", "offboarding", "ai-copilot"],
        "manager": ["attendance", "leave", "fbp-tax", "insurance", "car-lease", "appraisals", "offboarding", "ai-copilot"],
        "recruiter": ["talent-mgmt", "ai-copilot"],
        "payroll_admin": ["payroll", "fbp-tax", "ai-copilot"]
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
    
    return ShardResponse(
        id=new_org.id,
        name=new_org.name,
        subdomain=new_org.subdomain,
        subscription_plan=new_org.subscription_plan,
        subscription_status=new_org.subscription_status,
        feature_talent_mgmt=new_org.feature_talent_mgmt,
        feature_hr_team=new_org.feature_hr_team,
        feature_resource_mgmt=new_org.feature_resource_mgmt,
        created_at=new_org.created_at,
        user_count=1,
        employee_count=1,
        status_ping="healthy"
    )

from pydantic import BaseModel
class ShardUpdate(BaseModel):
    name: str
    subscription_plan: str
    feature_talent_mgmt: bool
    feature_hr_team: bool
    feature_resource_mgmt: bool

@router.put("/shards/{org_id}", response_model=ShardResponse)
async def update_tenant_shard(
    org_id: str,
    payload: ShardUpdate,
    _admin = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a tenant shard's metadata, subscription plan, and active features.
    """
    org_query = select(Organization).where(Organization.id == org_id)
    org_res = await db.execute(org_query)
    org = org_res.scalars().first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant organization not found"
        )
        
    org.name = payload.name
    org.subscription_plan = payload.subscription_plan
    org.feature_talent_mgmt = payload.feature_talent_mgmt
    org.feature_hr_team = payload.feature_hr_team
    org.feature_resource_mgmt = payload.feature_resource_mgmt
    
    await db.commit()
    await db.refresh(org)
    
    user_count_res = await db.execute(select(func.count(User.id)).where(User.organization_id == org.id))
    user_count = user_count_res.scalar() or 0
    
    emp_count_res = await db.execute(select(func.count(Employee.id)).join(User, Employee.user_id == User.id).where(User.organization_id == org.id))
    emp_count = emp_count_res.scalar() or 0
    
    return ShardResponse(
        id=org.id,
        name=org.name,
        subdomain=org.subdomain or "",
        subscription_plan=org.subscription_plan,
        subscription_status=org.subscription_status,
        feature_talent_mgmt=org.feature_talent_mgmt,
        feature_hr_team=org.feature_hr_team,
        feature_resource_mgmt=org.feature_resource_mgmt,
        created_at=org.created_at,
        user_count=user_count,
        employee_count=emp_count,
        status_ping="healthy"
    )

@router.delete("/shards/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant_shard(
    org_id: str,
    _admin = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Permanently delete a tenant:
    1. Drop its dedicated PostgreSQL schema (if subdomain exists).
    2. Delete the Organization record (cascades to all public tables).
    """
    org_query = select(Organization).where(Organization.id == org_id)
    org_res = await db.execute(org_query)
    org = org_res.scalars().first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant organization not found"
        )
        
    subdomain = org.subdomain
    from sqlalchemy import text
    
    # 1. Drop the dedicated schema if it exists
    if subdomain and subdomain != "nexus-central":
        try:
            await db.execute(text(f'DROP SCHEMA IF EXISTS "{subdomain}" CASCADE'))
        except Exception as e:
            print(f"Error dropping tenant schema '{subdomain}': {e}")
            
    # 2. Delete the organization (cascades to users in public schema)
    await db.delete(org)
    await db.commit()
    return None


# =========================================================================
# 2. SAAS GLOBAL SUPPORT TICKETS QUEUE (Super Admin only)
# =========================================================================

@router.get("/tickets", response_model=List[SupportTicketResponse])
async def list_all_support_tickets(
    _admin = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all support tickets raised by all tenant shards across the platform (Global SaaS Queue).
    """
    query = select(SupportTicket).order_by(SupportTicket.created_at.desc())
    result = await db.execute(query)
    tickets = result.scalars().all()
    
    response_list = []
    for t in tickets:
        # Load associated relationships to present Tenant details nicely
        org_query = select(Organization).where(Organization.id == t.organization_id)
        org_res = await db.execute(org_query)
        org = org_res.scalar()
        
        user_query = select(User).where(User.id == t.user_id)
        user_res = await db.execute(user_query)
        user = user_res.scalar()
        
        response_list.append(
            SupportTicketResponse(
                id=t.id,
                organization_id=t.organization_id,
                organization_name=org.name if org else "Unknown Organization",
                user_id=t.user_id,
                user_email=user.email if user else "Unknown User",
                title=t.title,
                description=t.description,
                category=t.category,
                priority=t.priority,
                status=t.status,
                resolution_notes=t.resolution_notes,
                created_at=t.created_at,
                updated_at=t.updated_at
            )
        )
    return response_list


@router.put("/tickets/{ticket_id}", response_model=SupportTicketResponse)
async def update_support_ticket(
    ticket_id: str,
    payload: SupportTicketUpdate,
    _admin = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Central resolution endpoint.
    Allows Global Super Admin to update ticket status and append official resolution notes.
    """
    ticket_query = select(SupportTicket).where(SupportTicket.id == ticket_id)
    result = await db.execute(ticket_query)
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Support ticket not found."
        )
        
    if payload.status is not None:
        ticket.status = payload.status
    if payload.resolution_notes is not None:
        ticket.resolution_notes = payload.resolution_notes
        
    ticket.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(ticket)
    
    # Reload details for response
    org_res = await db.execute(select(Organization).where(Organization.id == ticket.organization_id))
    org = org_res.scalar()
    user_res = await db.execute(select(User).where(User.id == ticket.user_id))
    user = user_res.scalar()
    
    return SupportTicketResponse(
        id=ticket.id,
        organization_id=ticket.organization_id,
        organization_name=org.name if org else "Unknown Organization",
        user_id=ticket.user_id,
        user_email=user.email if user else "Unknown User",
        title=ticket.title,
        description=ticket.description,
        category=ticket.category,
        priority=ticket.priority,
        status=ticket.status,
        resolution_notes=ticket.resolution_notes,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at
    )


# =========================================================================
# 3. TENANT-LEVEL HELP DESK (Access by any active Tenant user)
# =========================================================================

@router.post("/tickets/tenant", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
async def raise_support_ticket(
    payload: SupportTicketCreate,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    """
    Allow any tenant user (admin or standard employee) to file a central support ticket.
    Enforces shard isolation by automatically stamping the active user's organization_id.
    """
    new_ticket = SupportTicket(
        organization_id=claims.organization_id,
        user_id=claims.user_id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        priority=payload.priority,
        status="open"
    )
    db.add(new_ticket)
    await db.commit()
    await db.refresh(new_ticket)
    
    # Fetch org and user strings for response
    org_res = await db.execute(select(Organization).where(Organization.id == claims.organization_id))
    org = org_res.scalar()
    user_res = await db.execute(select(User).where(User.id == claims.user_id))
    user = user_res.scalar()
    
    return SupportTicketResponse(
        id=new_ticket.id,
        organization_id=new_ticket.organization_id,
        organization_name=org.name if org else "Unknown Organization",
        user_id=new_ticket.user_id,
        user_email=user.email if user else "Unknown User",
        title=new_ticket.title,
        description=new_ticket.description,
        category=new_ticket.category,
        priority=new_ticket.priority,
        status=new_ticket.status,
        resolution_notes=new_ticket.resolution_notes,
        created_at=new_ticket.created_at,
        updated_at=new_ticket.updated_at
    )


@router.get("/tickets/tenant", response_model=List[SupportTicketResponse])
async def list_tenant_support_tickets(
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all support tickets filed specifically by this tenant shard (Logical Shard isolation).
    """
    query = select(SupportTicket).where(SupportTicket.organization_id == claims.organization_id).order_by(SupportTicket.created_at.desc())
    result = await db.execute(query)
    tickets = result.scalars().all()
    
    response_list = []
    for t in tickets:
        # Load associated relationships
        org_query = select(Organization).where(Organization.id == t.organization_id)
        org_res = await db.execute(org_query)
        org = org_res.scalar()
        
        user_query = select(User).where(User.id == t.user_id)
        user_res = await db.execute(user_query)
        user = user_res.scalar()
        
        response_list.append(
            SupportTicketResponse(
                id=t.id,
                organization_id=t.organization_id,
                organization_name=org.name if org else "Unknown Organization",
                user_id=t.user_id,
                user_email=user.email if user else "Unknown User",
                title=t.title,
                description=t.description,
                category=t.category,
                priority=t.priority,
                status=t.status,
                resolution_notes=t.resolution_notes,
                created_at=t.created_at,
                updated_at=t.updated_at
            )
        )
    return response_list


# =========================================================================
# 4. SAAS CENTRAL INFRA MONITORING (Super Admin only)
# =========================================================================

@router.get("/infra-status", response_model=InfraStatusResponse)
async def monitor_infra_status(
    _admin = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Aggregates infrastructure health metrics across all tenant shards.
    Retrieves real-time DB stats and simulates infrastructure diagnostics.
    """
    # Count organizations (shards)
    shards_query = select(func.count(Organization.id))
    shards_res = await db.execute(shards_query)
    total_shards = shards_res.scalar() or 0
    
    # Count total support tickets
    tickets_query = select(func.count(SupportTicket.id))
    tickets_res = await db.execute(tickets_query)
    total_tickets = tickets_res.scalar() or 0
    
    # Count active support tickets
    active_query = select(func.count(SupportTicket.id)).where(SupportTicket.status.in_(["open", "in_progress"]))
    active_res = await db.execute(active_query)
    active_tickets = active_res.scalar() or 0
    
    # Determine local SQLite file size
    db_size = 0
    try:
        # Check standard locations
        if os.path.exists("hrms-engine.db"):
            db_size = os.path.getsize("hrms-engine.db") // 1024
        elif os.path.exists("backend/hrms-engine.db"):
            db_size = os.path.getsize("backend/hrms-engine.db") // 1024
        else:
            db_size = 324  # Fallback
    except Exception:
        db_size = 324

    return InfraStatusResponse(
        total_shards=total_shards,
        total_tickets=total_tickets,
        active_tickets=active_tickets,
        db_engine="PostgreSQL (Supabase) + asyncpg (Multi-Tenant Logical Shard Model)",
        db_size_kb=db_size,
        system_status="healthy",
        load_cpu=12.5,
        load_memory=45.2,
        load_disk_io="OPTIMAL"
    )
