# app/routers/usermgmt.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.db.session import get_db
from app.models.models import User, Organization, RolePermission
from app.schemas.schemas import (
    UserCreate, UserUpdate, UserMgmtResponse,
    SubscriptionUpdate, SubscriptionResponse, TokenData,
    RolePermissionResponse, RolePermissionUpdate
)
from app.routers.dependencies import get_current_user_claims, RoleChecker
from app.services.auth_service import AuthService
from typing import List
import datetime

router = APIRouter(
    prefix="/usermgmt",
    tags=["User & Subscription Management"],
    dependencies=[Depends(RoleChecker(["hr_admin"]))]
)

@router.get("/users", response_model=List[UserMgmtResponse])
async def list_tenant_users(
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all users belonging to the active administrator's tenant.
    """
    query = select(User).where(User.organization_id == claims.organization_id).order_by(User.created_at.desc())
    result = await db.execute(query)
    users = result.scalars().all()
    return users

@router.post("/users", response_model=UserMgmtResponse, status_code=status.HTTP_201_CREATED)
async def create_tenant_user(
    payload: UserCreate,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new user portal credential in the active administrator's tenant.
    """
    # Check if email already registered
    check_query = select(User).where(User.email == payload.email)
    check_result = await db.execute(check_query)
    if check_result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address is already registered"
        )
        
    hashed_pwd = AuthService.hash_password(payload.password)
    
    new_user = User(
        organization_id=claims.organization_id,
        email=payload.email,
        password_hash=hashed_pwd,
        role=payload.role,
        is_active=payload.is_active if payload.is_active is not None else True
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.put("/users/{user_id}", response_model=UserMgmtResponse)
async def update_tenant_user(
    user_id: str,
    payload: UserUpdate,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    """
    Update details (role, email, activity status, password) of an existing user within the tenant.
    """
    query = select(User).where(User.id == user_id, User.organization_id == claims.organization_id)
    result = await db.execute(query)
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found in your organization"
        )
        
    if user.id == claims.user_id:
         # Prevent admin from deactivating or changing their own admin role
         if payload.is_active is False or (payload.role is not None and payload.role != "hr_admin"):
             raise HTTPException(
                 status_code=status.HTTP_400_BAD_REQUEST,
                 detail="You cannot deactivate or demote your own active administrator account"
             )

    if payload.email is not None:
        # Check uniqueness if email is changed
        if payload.email != user.email:
            check_query = select(User).where(User.email == payload.email)
            check_result = await db.execute(check_query)
            if check_result.scalars().first():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This email address is already in use by another account"
                )
        user.email = payload.email
        
    if payload.role is not None:
        user.role = payload.role
        
    if payload.is_active is not None:
        user.is_active = payload.is_active
        
    if payload.password is not None and payload.password != "":
        user.password_hash = AuthService.hash_password(payload.password)
        
    user.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    return user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant_user(
    user_id: str,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    """
    Hard delete a tenant user credential.
    """
    query = select(User).where(User.id == user_id, User.organization_id == claims.organization_id)
    result = await db.execute(query)
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found in your organization"
        )
        
    if user.id == claims.user_id:
         raise HTTPException(
             status_code=status.HTTP_400_BAD_REQUEST,
             detail="You cannot delete your own active administrator account"
         )
         
    await db.delete(user)
    await db.commit()
    return None

@router.get("/subscription", response_model=SubscriptionResponse)
async def get_tenant_subscription(
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve subscription status and enabled feature groups for the tenant.
    """
    query = select(Organization).where(Organization.id == claims.organization_id)
    result = await db.execute(query)
    org = result.scalars().first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    return SubscriptionResponse(
        organization_id=org.id,
        feature_talent_mgmt=org.feature_talent_mgmt,
        feature_hr_team=org.feature_hr_team,
        feature_resource_mgmt=org.feature_resource_mgmt
    )

@router.put("/subscription", response_model=SubscriptionResponse)
async def update_tenant_subscription(
    payload: SubscriptionUpdate,
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    """
    Toggle subscription states for the tenant's features.
    """
    query = select(Organization).where(Organization.id == claims.organization_id)
    result = await db.execute(query)
    org = result.scalars().first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
        
    org.feature_talent_mgmt = payload.feature_talent_mgmt
    org.feature_hr_team = payload.feature_hr_team
    org.feature_resource_mgmt = payload.feature_resource_mgmt
    org.updated_at = datetime.datetime.utcnow()
    
    await db.commit()
    await db.refresh(org)
    
    return SubscriptionResponse(
        organization_id=org.id,
        feature_talent_mgmt=org.feature_talent_mgmt,
        feature_hr_team=org.feature_hr_team,
        feature_resource_mgmt=org.feature_resource_mgmt
    )

@router.get("/permissions", response_model=List[RolePermissionResponse])
async def get_role_permissions(
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all role permissions configured for this organization shard.
    """
    query = select(RolePermission).where(RolePermission.organization_id == claims.organization_id)
    result = await db.execute(query)
    perms = result.scalars().all()
    return perms

@router.put("/permissions", response_model=List[RolePermissionResponse])
async def update_role_permissions(
    payload: List[RolePermissionUpdate],
    claims: TokenData = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    """
    Bulk update role permissions for the active tenant shard.
    If a permission record doesn't exist, it will be dynamically created.
    """
    updated_perms = []
    for item in payload:
        # Check if record exists
        query = select(RolePermission).where(
            RolePermission.organization_id == claims.organization_id,
            RolePermission.role == item.role,
            RolePermission.feature == item.feature
        )
        res = await db.execute(query)
        perm = res.scalars().first()
        if perm:
            perm.is_enabled = item.is_enabled
            perm.updated_at = datetime.datetime.utcnow()
        else:
            perm = RolePermission(
                organization_id=claims.organization_id,
                role=item.role,
                feature=item.feature,
                is_enabled=item.is_enabled
            )
            db.add(perm)
        updated_perms.append(perm)
        
    await db.commit()
    for p in updated_perms:
        await db.refresh(p)
    return updated_perms
