# app/routers/onboarding.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.models import User, Employee, Asset, InductionTask
from app.schemas.schemas import (
    AssetCreate, AssetUpdate, AssetResponse, AssetAssign,
    InductionTaskCreate, InductionTaskResponse, InductionTaskUpdate
)
from app.routers.dependencies import get_current_user, get_current_employee, RoleChecker
from typing import List, Optional
from uuid import UUID
import datetime

router = APIRouter(prefix="/onboarding", tags=["Onboarding & Assets"])

hr_admin_only = Depends(RoleChecker(["hr_admin"]))

# =========================================================================
# 1. INDUCTION CHECKLIST ENDPOINTS
# =========================================================================

@router.get("/checklist/me", response_model=List[InductionTaskResponse])
async def get_my_checklist(
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the checklist tasks for the currently logged-in employee.
    """
    query = select(InductionTask).where(
        InductionTask.organization_id == employee.organization_id,
        InductionTask.employee_id == employee.id
    ).order_by(InductionTask.created_at.asc())
    
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/checklist/employee/{employee_id}", response_model=List[InductionTaskResponse])
async def get_employee_checklist(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Get the checklist tasks for a specific employee (HR Admin only).
    """
    emp_query = select(Employee).where(
        Employee.organization_id == current_user.organization_id,
        Employee.id == employee_id
    )
    emp_res = await db.execute(emp_query)
    if not emp_res.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found in your organization"
        )

    query = select(InductionTask).where(
        InductionTask.organization_id == current_user.organization_id,
        InductionTask.employee_id == employee_id
    ).order_by(InductionTask.created_at.asc())
    
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/checklist/{task_id}", response_model=InductionTaskResponse)
async def update_checklist_task(
    task_id: UUID,
    payload: InductionTaskUpdate,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Update induction task status (pending/completed) (HR Admin only).
    """
    query = select(InductionTask).where(
        InductionTask.organization_id == current_user.organization_id,
        InductionTask.id == task_id
    )
    result = await db.execute(query)
    task = result.scalars().first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Induction task not found"
        )
    
    task.status = payload.status
    if payload.status == "completed":
        task.completed_at = datetime.datetime.utcnow()
    else:
        task.completed_at = None
        
    task.updated_at = datetime.datetime.utcnow()
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.post("/checklist/employee/{employee_id}", response_model=InductionTaskResponse, status_code=status.HTTP_201_CREATED)
async def create_employee_checklist_task(
    employee_id: UUID,
    payload: InductionTaskCreate,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Assign a custom checklist task to an employee (HR Admin only).
    """
    emp_query = select(Employee).where(
        Employee.organization_id == current_user.organization_id,
        Employee.id == employee_id
    )
    emp_res = await db.execute(emp_query)
    if not emp_res.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found in your organization"
        )

    task = InductionTask(
        organization_id=current_user.organization_id,
        employee_id=employee_id,
        task_name=payload.task_name,
        description=payload.description,
        status="pending"
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/checklist/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_checklist_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a checklist task (HR Admin only).
    """
    query = select(InductionTask).where(
        InductionTask.organization_id == current_user.organization_id,
        InductionTask.id == task_id
    )
    result = await db.execute(query)
    task = result.scalars().first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Induction task not found"
        )
        
    await db.delete(task)
    await db.commit()
    return None


@router.post("/checklist/employee/{employee_id}/auto-seed", response_model=List[InductionTaskResponse])
async def auto_seed_checklist(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Auto-seed standard onboarding induction tasks for an employee (HR Admin only).
    """
    emp_query = select(Employee).where(
        Employee.organization_id == current_user.organization_id,
        Employee.id == employee_id
    )
    emp_res = await db.execute(emp_query)
    if not emp_res.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found in your organization"
        )

    # Check if tasks are already assigned
    check_query = select(InductionTask).where(
        InductionTask.organization_id == current_user.organization_id,
        InductionTask.employee_id == employee_id
    )
    check_res = await db.execute(check_query)
    if check_res.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee already has induction checklist tasks assigned"
        )

    default_tasks = [
        ("IT System Provisioning", "Provision workplace laptop, email inbox, Slack access, and development accounts."),
        ("HR Induction & Compliance Signoff", "Verify original certificates, complete handbook acknowledgment, and sign security policies."),
        ("Workspace Setup & ID Card Issue", "Allocate physical seat/desk location, register biometric profile, and print official ID card."),
        ("Finance Bank Account Setup", "Log employee savings bank details, PAN card compliance, and register EPF/UAN portal accounts.")
    ]
    
    for name, desc in default_tasks:
        task = InductionTask(
            organization_id=current_user.organization_id,
            employee_id=employee_id,
            task_name=name,
            description=desc,
            status="pending"
        )
        db.add(task)
        
    await db.commit()
    
    query = select(InductionTask).where(
        InductionTask.organization_id == current_user.organization_id,
        InductionTask.employee_id == employee_id
    ).order_by(InductionTask.created_at.asc())
    
    result = await db.execute(query)
    return result.scalars().all()



# =========================================================================
# 2. ASSET ENDPOINTS
# =========================================================================

@router.get("/assets", response_model=List[AssetResponse])
async def list_assets(
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    List all assets in the organization (HR Admin only).
    """
    query = select(Asset).options(
        selectinload(Asset.employee)
    ).where(
        Asset.organization_id == current_user.organization_id
    ).order_by(Asset.created_at.desc())
    
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/assets", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def create_asset(
    payload: AssetCreate,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Add a new company asset (HR Admin only).
    """
    status_map = {
        "assigned": "allocated",
        "allocated": "allocated",
        "maintenance": "under_repair",
        "under_repair": "under_repair",
        "available": "available",
        "retired": "retired"
    }
    db_status = status_map.get(payload.status or "available", "available")
    
    emp_id = None
    if payload.employee_id:
        if isinstance(payload.employee_id, str) and payload.employee_id == "":
            emp_id = None
        else:
            emp_id = payload.employee_id

    if emp_id:
        db_status = "allocated"

    asset = Asset(
        organization_id=current_user.organization_id,
        name=payload.name,
        asset_type=payload.asset_type,
        serial_number=payload.serial_number,
        status=db_status,
        employee_id=emp_id
    )
    if emp_id:
        asset.assigned_at = datetime.datetime.utcnow()
        
    db.add(asset)
    await db.commit()
    
    refreshed = await db.execute(
        select(Asset).options(selectinload(Asset.employee)).where(Asset.id == asset.id)
    )
    return refreshed.scalars().first()


@router.put("/assets/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: UUID,
    payload: AssetUpdate,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Update asset inventory/assignment details (HR Admin only).
    """
    query = select(Asset).options(selectinload(Asset.employee)).where(
        Asset.id == asset_id,
        Asset.organization_id == current_user.organization_id
    )
    result = await db.execute(query)
    asset = result.scalars().first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    if payload.name is not None:
        asset.name = payload.name
    if payload.asset_type is not None:
        asset.asset_type = payload.asset_type
    if payload.serial_number is not None:
        asset.serial_number = payload.serial_number
    if payload.status is not None:
        asset.status = payload.status
        
    if payload.employee_id is not None:
        if payload.employee_id == "":
            asset.employee_id = None
            asset.assigned_at = None
            # reset status to available if unassigned, unless it's under repair or retired
            if asset.status == "allocated":
                asset.status = "available"
        else:
            emp_query = select(Employee).where(
                Employee.id == payload.employee_id,
                Employee.organization_id == current_user.organization_id
            )
            emp_res = await db.execute(emp_query)
            if not emp_res.scalars().first():
                raise HTTPException(status_code=404, detail="Employee not found")
            asset.employee_id = payload.employee_id
            asset.assigned_at = datetime.datetime.utcnow()
            asset.status = "allocated"
            
    asset.updated_at = datetime.datetime.utcnow()
    db.add(asset)
    await db.commit()
    
    refreshed = await db.execute(
        select(Asset).options(selectinload(Asset.employee)).where(Asset.id == asset.id)
    )
    return refreshed.scalars().first()



@router.post("/assets/{asset_id}/assign", response_model=AssetResponse)
async def assign_asset(
    asset_id: UUID,
    payload: AssetAssign,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Assign an asset to an employee (HR Admin only).
    """
    asset_query = select(Asset).where(
        Asset.organization_id == current_user.organization_id,
        Asset.id == asset_id
    )
    asset_res = await db.execute(asset_query)
    asset = asset_res.scalars().first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
        
    if asset.status == "allocated" and asset.employee_id != payload.employee_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Asset is already allocated to another employee"
        )
        
    emp_query = select(Employee).where(
        Employee.organization_id == current_user.organization_id,
        Employee.id == payload.employee_id
    )
    emp_res = await db.execute(emp_query)
    if not emp_res.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found in your organization"
        )
        
    asset.employee_id = payload.employee_id
    asset.status = "allocated"
    asset.assigned_at = datetime.datetime.utcnow()
    asset.updated_at = datetime.datetime.utcnow()
    
    db.add(asset)
    await db.commit()
    
    refreshed = await db.execute(
        select(Asset).options(selectinload(Asset.employee)).where(Asset.id == asset.id)
    )
    return refreshed.scalars().first()


@router.post("/assets/{asset_id}/return", response_model=AssetResponse)
async def return_asset(
    asset_id: UUID,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Return/unassign an asset (HR Admin only).
    """
    asset_query = select(Asset).where(
        Asset.organization_id == current_user.organization_id,
        Asset.id == asset_id
    )
    asset_res = await db.execute(asset_query)
    asset = asset_res.scalars().first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
        
    asset.employee_id = None
    asset.status = "available"
    asset.assigned_at = None
    asset.updated_at = datetime.datetime.utcnow()
    
    db.add(asset)
    await db.commit()
    
    refreshed = await db.execute(
        select(Asset).options(selectinload(Asset.employee)).where(Asset.id == asset.id)
    )
    return refreshed.scalars().first()


@router.get("/assets/me", response_model=List[AssetResponse])
async def get_my_assets(
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all company assets assigned to the currently logged-in employee.
    """
    query = select(Asset).options(
        selectinload(Asset.employee)
    ).where(
        Asset.organization_id == employee.organization_id,
        Asset.employee_id == employee.id
    ).order_by(Asset.assigned_at.desc())
    
    result = await db.execute(query)
    return result.scalars().all()


@router.delete("/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asset(
    asset_id: UUID,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Remove an asset from the system (HR Admin only).
    """
    query = select(Asset).where(
        Asset.organization_id == current_user.organization_id,
        Asset.id == asset_id
    )
    result = await db.execute(query)
    asset = result.scalars().first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
        
    await db.delete(asset)
    await db.commit()
    return None
