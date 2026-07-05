# app/routers/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from app.db.session import get_db
from app.services.auth_service import AuthService
from app.models.models import User, Employee, Organization
from app.schemas.schemas import TokenData
from typing import List, Callable

# Bearer Token Scheme Parser
security = HTTPBearer()

async def provision_tenant_schema(db: AsyncSession, subdomain: str):
    """
    Creates a dedicated schema for a tenant and replicates all tenant-specific tables.
    """
    from sqlalchemy import text
    
    # 1. Create schema
    await db.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{subdomain}"'))
    
    # 2. Get list of all tables in public schema
    res_tables = await db.execute(text(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    ))
    public_tables = [r[0] for r in res_tables.fetchall()]
    
    central_tables = {"organizations", "users", "role_permissions", "support_tickets", "email_logs"}
    tenant_tables = [t for t in public_tables if t not in central_tables]
    
    # 3. Replicate each tenant-specific table
    for table in tenant_tables:
        # Check if table already exists in the tenant's schema
        res_check = await db.execute(text(
            f"SELECT EXISTS (SELECT 1 FROM information_schema.tables "
            f"WHERE table_schema = '{subdomain}' AND table_name = '{table}')"
        ))
        if not res_check.scalar():
            await db.execute(text(
                f'CREATE TABLE "{subdomain}"."{table}" '
                f'(LIKE public."{table}" INCLUDING DEFAULTS INCLUDING CONSTRAINTS INCLUDING INDEXES)'
            ))

async def get_current_user_claims(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> TokenData:
    """
    Decodes the JWT credentials, dynamically sets the database search_path to the tenant's schema,
    and returns the core token claims.
    Throws standard authentication exceptions if invalid/expired.
    """
    token = credentials.credentials
    payload = AuthService.decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    try:
        user_id = payload.get("user_id")
        org_id = payload.get("organization_id")
        email = payload.get("email")
        role = payload.get("role")
        
        if not user_id or not org_id or not email or not role:
            raise ValueError()
            
        # Dynamically set search_path to organization schema if not central admin
        from sqlalchemy import text
        org_query = select(Organization.subdomain).where(Organization.id == org_id)
        org_res = await db.execute(org_query)
        subdomain = org_res.scalar()
        
        if subdomain and subdomain != "nexus-central":
            await db.execute(text(f'SET search_path TO "{subdomain}", public'))
            
        return TokenData(
            user_id=user_id,
            organization_id=org_id,
            email=email,
            role=role
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing required authorization claims",
        )

async def get_current_user(
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Retrieves the full User database object corresponding to the JWT claims.
    Verifies that the user remains active.
    """
    query = select(User).options(
        joinedload(User.organization),
        joinedload(User.employee)
    ).where(User.id == claims.user_id, User.organization_id == claims.organization_id)
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account no longer exists in this tenant"
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user account has been deactivated"
        )
        
    return user

async def get_current_employee(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Employee:
    """
    Retrieves the active Employee profile associated with the authenticated portal user.
    """
    query = select(Employee).where(Employee.user_id == user.id, Employee.organization_id == user.organization_id)
    result = await db.execute(query)
    employee = result.scalars().first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Employee profile found matching this authenticated user"
        )
        
    return employee

class RoleChecker:
    """
    FastAPI Router Dependency verifying that the authenticated user possesses
    one of the allowed enterprise roles for the target route.
    """
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, claims: TokenData = Depends(get_current_user_claims)) -> TokenData:
        # Tenant admins (hr_admin) bypass standard role checks for all modules
        if claims.role == "hr_admin":
            return claims
        if claims.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(self.allowed_roles)}"
            )
        return claims

def require_subscription(feature_group: str) -> Callable:
    """
    FastAPI dependency that checks if a specific feature group subscription is enabled for the organization.
    Returns 403 Forbidden if not.
    """
    async def dependency(
        claims: TokenData = Depends(get_current_user_claims),
        db: AsyncSession = Depends(get_db)
    ):
        query = select(Organization).where(Organization.id == claims.organization_id)
        result = await db.execute(query)
        org = result.scalars().first()
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization tenant not found"
            )
        if org.subscription_status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Organization subscription is currently inactive/suspended"
            )
        
        flag_name = f"feature_{feature_group}"
        if not getattr(org, flag_name, True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"The '{feature_group}' suite is not enabled in your tenant's subscription plan"
            )
        return org
    return dependency

def require_feature_permission(feature_name: str) -> Callable:
    """
    FastAPI dependency verifying that the active user's role has permission
    for the target feature, according to the tenant's dynamic RolePermission settings.
    """
    async def dependency(
        claims: TokenData = Depends(get_current_user_claims),
        db: AsyncSession = Depends(get_db)
    ):
        # Tenant admins (hr_admin) and super_admins bypass all role/feature limits
        if claims.role in ["hr_admin", "super_admin"]:
            return claims
            
        # Check database for dynamic RolePermission
        from app.models.models import RolePermission
        query = select(RolePermission).where(
            RolePermission.organization_id == claims.organization_id,
            RolePermission.role == claims.role,
            RolePermission.feature == feature_name
        )
        res = await db.execute(query)
        perm = res.scalars().first()
        
        # If record exists and is disabled, block access
        if perm and not perm.is_enabled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. The '{feature_name}' module is disabled for your role '{claims.role}' in this tenant."
            )
            
        # If record doesn't exist, we check standard fallback default permissions
        default_permissions = {
            "employee": ["attendance", "leave", "fbp-tax", "insurance", "car-lease", "appraisals", "offboarding", "ai-copilot"],
            "manager": ["attendance", "leave", "fbp-tax", "insurance", "car-lease", "appraisals", "offboarding", "ai-copilot"],
            "recruiter": ["talent-mgmt", "ai-copilot"],
            "Talent Team": ["talent-mgmt", "ai-copilot"],
            "HR Team": ["ai-copilot"],
            "Resource Mgmt Group": ["appraisals", "project-allocations", "ai-copilot"],
            "payroll_admin": ["payroll", "fbp-tax", "ai-copilot"],
            "hr_operations": ["project-allocations", "appraisals", "ai-copilot"]
        }
        allowed_features = default_permissions.get(claims.role, [])
        if not perm and feature_name not in allowed_features:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Your role '{claims.role}' does not have permission for the '{feature_name}' module."
            )
            
        return claims
    return dependency

