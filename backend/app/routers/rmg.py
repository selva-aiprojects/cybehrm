# app/routers/rmg.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.models import (
    User, Employee, Asset, InductionTask,
    Client, Project, ProjectMapping, Department, Designation, EmployeeSkillset
)
from app.schemas.schemas import (
    AssetCreate, AssetUpdate, AssetResponse,
    InductionTaskCreate, InductionTaskUpdate, InductionTaskResponse,
    TokenData,
    ClientCreate, ClientUpdate, ClientResponse,
    ProjectCreate, ProjectUpdate, ProjectResponse,
    AllocationCreate, AllocationUpdate, AllocationResponse,
    BenchResourceResponse
)
from app.routers.dependencies import get_current_user, get_current_user_claims, RoleChecker
from typing import List, Optional
import datetime

router = APIRouter(prefix="/rmg", tags=["RMG (Resource Management Group)"])

# Access control dependencies
rmg_write = Depends(RoleChecker(["hr_admin", "Resource Mgmt Group"]))
any_role = Depends(RoleChecker(["hr_admin", "Resource Mgmt Group", "manager", "employee"]))


async def _enrich_asset(asset: Asset, db: AsyncSession) -> AssetResponse:
    """Enrich asset response with employee name."""
    resp = AssetResponse.from_orm(asset)
    if asset.employee:
        resp.employee_name = f"{asset.employee.first_name} {asset.employee.last_name}"
    return resp


async def _enrich_induction_task(task: InductionTask, db: AsyncSession) -> InductionTaskResponse:
    """Enrich induction task response with employee name."""
    resp = InductionTaskResponse.from_orm(task)
    if task.employee:
        resp.employee_name = f"{task.employee.first_name} {task.employee.last_name}"
    return resp


# =========================================================================
# ASSETS MANAGEMENT
# =========================================================================

@router.get("/assets", response_model=List[AssetResponse])
async def list_assets(
    claims: TokenData = any_role,
    db: AsyncSession = Depends(get_db)
):
    """List assets. Employees only see their own assigned assets."""
    query = select(Asset).options(selectinload(Asset.employee)).where(Asset.organization_id == claims.organization_id)
    
    if claims.role == "employee":
        # Resolve employee ID
        emp_query = select(Employee.id).where(Employee.user_id == claims.user_id)
        emp_res = await db.execute(emp_query)
        emp_id = emp_res.scalar()
        if not emp_id:
            return []
        query = query.where(Asset.employee_id == emp_id)
        
    query = query.order_by(Asset.created_at.desc())
    result = await db.execute(query)
    assets = result.scalars().all()
    
    responses = []
    for asset in assets:
        responses.append(await _enrich_asset(asset, db))
    return responses


@router.post("/assets", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def create_asset(
    payload: AssetCreate,
    claims: TokenData = rmg_write,
    db: AsyncSession = Depends(get_db)
):
    """Create a new master asset in inventory."""
    # Verify employee exists if assigned
    if payload.employee_id:
        emp_query = select(Employee).where(Employee.id == payload.employee_id, Employee.organization_id == claims.organization_id)
        emp_res = await db.execute(emp_query)
        if not emp_res.scalars().first():
            raise HTTPException(status_code=404, detail="Employee not found")

    new_asset = Asset(
        organization_id=claims.organization_id,
        name=payload.name,
        asset_type=payload.asset_type,
        serial_number=payload.serial_number,
        status=payload.status or "available",
        employee_id=payload.employee_id,
        assigned_at=datetime.datetime.utcnow() if payload.employee_id else None
    )
    db.add(new_asset)
    await db.commit()
    
    # Reload with relationships
    refreshed = await db.execute(
        select(Asset).options(selectinload(Asset.employee)).where(Asset.id == new_asset.id)
    )
    asset = refreshed.scalars().first()
    return await _enrich_asset(asset, db)


@router.put("/assets/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: str,
    payload: AssetUpdate,
    claims: TokenData = rmg_write,
    db: AsyncSession = Depends(get_db)
):
    """Update asset inventory/assignment information."""
    query = select(Asset).options(selectinload(Asset.employee)).where(Asset.id == asset_id, Asset.organization_id == claims.organization_id)
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
        else:
            # Verify employee exists
            emp_query = select(Employee).where(Employee.id == payload.employee_id, Employee.organization_id == claims.organization_id)
            emp_res = await db.execute(emp_query)
            if not emp_res.scalars().first():
                raise HTTPException(status_code=404, detail="Employee not found")
            asset.employee_id = payload.employee_id
            asset.assigned_at = datetime.datetime.utcnow()
            
    asset.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(asset)
    return await _enrich_asset(asset, db)


@router.delete("/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asset(
    asset_id: str,
    claims: TokenData = rmg_write,
    db: AsyncSession = Depends(get_db)
):
    """Delete an asset from the inventory."""
    query = select(Asset).where(Asset.id == asset_id, Asset.organization_id == claims.organization_id)
    result = await db.execute(query)
    asset = result.scalars().first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    await db.delete(asset)
    await db.commit()
    return None


# =========================================================================
# INDUCTION TASKS MANAGEMENT
# =========================================================================

@router.get("/induction-tasks", response_model=List[InductionTaskResponse])
async def list_induction_tasks(
    claims: TokenData = any_role,
    db: AsyncSession = Depends(get_db)
):
    """List all induction tasks. Employees only see their own tasks."""
    query = select(InductionTask).options(selectinload(InductionTask.employee)).where(InductionTask.organization_id == claims.organization_id)
    
    if claims.role == "employee":
        emp_query = select(Employee.id).where(Employee.user_id == claims.user_id)
        emp_res = await db.execute(emp_query)
        emp_id = emp_res.scalar()
        if not emp_id:
            return []
        query = query.where(InductionTask.employee_id == emp_id)
        
    query = query.order_by(InductionTask.created_at.desc())
    result = await db.execute(query)
    tasks = result.scalars().all()
    
    responses = []
    for task in tasks:
        responses.append(await _enrich_induction_task(task, db))
    return responses


@router.post("/induction-tasks", response_model=InductionTaskResponse, status_code=status.HTTP_201_CREATED)
async def create_induction_task(
    payload: InductionTaskCreate,
    claims: TokenData = rmg_write,
    db: AsyncSession = Depends(get_db)
):
    """Log/Assign a new induction task for an employee."""
    # Verify employee exists
    emp_query = select(Employee).where(Employee.id == payload.employee_id, Employee.organization_id == claims.organization_id)
    emp_res = await db.execute(emp_query)
    if not emp_res.scalars().first():
        raise HTTPException(status_code=404, detail="Employee not found")

    new_task = InductionTask(
        organization_id=claims.organization_id,
        employee_id=payload.employee_id,
        task_name=payload.task_name,
        description=payload.description,
        status=payload.status or "pending"
    )
    db.add(new_task)
    await db.commit()
    
    refreshed = await db.execute(
        select(InductionTask).options(selectinload(InductionTask.employee)).where(InductionTask.id == new_task.id)
    )
    task = refreshed.scalars().first()
    return await _enrich_induction_task(task, db)


@router.put("/induction-tasks/{task_id}", response_model=InductionTaskResponse)
async def update_induction_task(
    task_id: str,
    payload: InductionTaskUpdate,
    claims: TokenData = any_role,
    db: AsyncSession = Depends(get_db)
):
    """Update induction task status or details. Employees can only complete their own tasks."""
    query = select(InductionTask).options(selectinload(InductionTask.employee)).where(InductionTask.id == task_id, InductionTask.organization_id == claims.organization_id)
    result = await db.execute(query)
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Induction task not found")
        
    # Check authorization if employee
    if claims.role == "employee":
        emp_query = select(Employee.id).where(Employee.user_id == claims.user_id)
        emp_res = await db.execute(emp_query)
        emp_id = emp_res.scalar()
        if task.employee_id != emp_id:
            raise HTTPException(status_code=403, detail="Access denied. You can only update your own induction tasks.")
            
        # Employees can only change status
        if payload.status is not None:
            task.status = payload.status
            if payload.status == "completed":
                task.completed_at = datetime.datetime.utcnow()
            else:
                task.completed_at = None
    else:
        # RMG/Admin can update anything
        if payload.task_name is not None:
            task.task_name = payload.task_name
        if payload.description is not None:
            task.description = payload.description
        if payload.status is not None:
            task.status = payload.status
            if payload.status == "completed":
                task.completed_at = datetime.datetime.utcnow()
            else:
                task.completed_at = None
                
    task.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(task)
    return await _enrich_induction_task(task, db)


@router.delete("/induction-tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_induction_task(
    task_id: str,
    claims: TokenData = rmg_write,
    db: AsyncSession = Depends(get_db)
):
    """Delete an induction task."""
    query = select(InductionTask).where(InductionTask.id == task_id, InductionTask.organization_id == claims.organization_id)
    result = await db.execute(query)
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Induction task not found")
        
    await db.delete(task)
    await db.commit()
    return None


@router.post("/employees/{employee_id}/auto-assign-induction", response_model=List[InductionTaskResponse])
async def auto_assign_induction_tasks(
    employee_id: str,
    claims: TokenData = rmg_write,
    db: AsyncSession = Depends(get_db)
):
    """Auto-generate default induction onboarding tasks for an employee."""
    emp_query = select(Employee).where(Employee.id == employee_id, Employee.organization_id == claims.organization_id)
    emp_res = await db.execute(emp_query)
    emp = emp_res.scalars().first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    # Check if they already have induction tasks to avoid duplicate auto-assigning
    check_query = select(InductionTask).where(InductionTask.employee_id == employee_id)
    check_res = await db.execute(check_query)
    if check_res.scalars().first():
         raise HTTPException(status_code=400, detail="Employee already has induction tasks assigned.")
         
    default_tasks = [
        ("IT System Provisioning", "Provision workplace laptop, email inbox, Slack access, and development accounts."),
        ("HR Induction & Compliance Signoff", "Verify original certificates, complete handbook acknowledgment, and sign security policies."),
        ("Workspace Setup & ID Card Issue", "Allocate physical seat/desk location, register biometric profile, and print official ID card."),
        ("Finance Bank Account Setup", "Log employee savings bank details, PAN card compliance, and register EPF/UAN portal accounts.")
    ]
    
    new_tasks = []
    for name, desc in default_tasks:
        task = InductionTask(
            organization_id=claims.organization_id,
            employee_id=employee_id,
            task_name=name,
            description=desc,
            status="pending"
        )
        db.add(task)
        new_tasks.append(task)
        
    await db.commit()
    
    # Reload with relationships
    responses = []
    for t in new_tasks:
        refreshed = await db.execute(
            select(InductionTask).options(selectinload(InductionTask.employee)).where(InductionTask.id == t.id)
        )
        task = refreshed.scalars().first()
        responses.append(await _enrich_induction_task(task, db))
        
    return responses


# =========================================================================
# CLIENT MANAGEMENT
# =========================================================================

@router.get("/clients", response_model=List[ClientResponse])
async def list_clients(
    claims: TokenData = any_role,
    db: AsyncSession = Depends(get_db)
):
    """List all clients for the organization."""
    result = await db.execute(
        select(Client)
        .where(Client.organization_id == claims.organization_id)
        .order_by(Client.name)
    )
    return result.scalars().all()


@router.post("/clients", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    payload: ClientCreate,
    claims: TokenData = rmg_write,
    db: AsyncSession = Depends(get_db)
):
    """Create a new client account."""
    client = Client(
        organization_id=claims.organization_id,
        name=payload.name,
        code=payload.code.upper(),
        domain_industry=payload.domain_industry,
        country=payload.country or "India"
    )
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client


@router.put("/clients/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: str,
    payload: ClientUpdate,
    claims: TokenData = rmg_write,
    db: AsyncSession = Depends(get_db)
):
    """Update client details."""
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.organization_id == claims.organization_id)
    )
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if payload.name is not None:
        client.name = payload.name
    if payload.code is not None:
        client.code = payload.code.upper()
    if payload.domain_industry is not None:
        client.domain_industry = payload.domain_industry
    if payload.country is not None:
        client.country = payload.country
    client.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(client)
    return client


@router.delete("/clients/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: str,
    claims: TokenData = rmg_write,
    db: AsyncSession = Depends(get_db)
):
    """Delete a client (cascades to projects)."""
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.organization_id == claims.organization_id)
    )
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    await db.delete(client)
    await db.commit()
    return None


# =========================================================================
# PROJECT MANAGEMENT
# =========================================================================

async def _enrich_project(project: Project, db: AsyncSession) -> ProjectResponse:
    """Enrich project with client name, status, and allocated headcount."""
    today = datetime.date.today()
    # Determine status
    if project.start_date and project.start_date > today:
        status_val = "pipeline"
    elif project.end_date and project.end_date < today:
        status_val = "completed"
    else:
        status_val = "active"

    # Count allocations
    alloc_res = await db.execute(
        select(func.count(ProjectMapping.id))
        .where(ProjectMapping.project_id == project.id, ProjectMapping.billing_status != "Bench")
    )
    allocated_count = alloc_res.scalar() or 0

    # Get client name
    client_name = None
    if project.client:
        client_name = project.client.name
    else:
        c_res = await db.execute(select(Client.name).where(Client.id == project.client_id))
        client_name = c_res.scalar()

    resp = ProjectResponse.from_orm(project)
    resp.client_name = client_name
    resp.status = status_val
    resp.allocated_count = allocated_count
    return resp


@router.get("/projects", response_model=List[ProjectResponse])
async def list_projects(
    claims: TokenData = any_role,
    db: AsyncSession = Depends(get_db)
):
    """List all projects with status and headcount."""
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.client))
        .where(Project.organization_id == claims.organization_id)
        .order_by(Project.start_date.desc())
    )
    projects = result.scalars().all()
    return [await _enrich_project(p, db) for p in projects]


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    claims: TokenData = rmg_write,
    db: AsyncSession = Depends(get_db)
):
    """Create a new project under a client."""
    # Verify client belongs to org
    c_res = await db.execute(
        select(Client).where(Client.id == str(payload.client_id), Client.organization_id == claims.organization_id)
    )
    if not c_res.scalars().first():
        raise HTTPException(status_code=404, detail="Client not found")

    project = Project(
        organization_id=claims.organization_id,
        client_id=str(payload.client_id),
        name=payload.name,
        code=payload.code.upper(),
        billing_type=payload.billing_type or "Time & Material",
        start_date=payload.start_date,
        end_date=payload.end_date
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return await _enrich_project(project, db)


@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    payload: ProjectUpdate,
    claims: TokenData = rmg_write,
    db: AsyncSession = Depends(get_db)
):
    """Update project details."""
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.client))
        .where(Project.id == project_id, Project.organization_id == claims.organization_id)
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if payload.name is not None:
        project.name = payload.name
    if payload.code is not None:
        project.code = payload.code.upper()
    if payload.billing_type is not None:
        project.billing_type = payload.billing_type
    if payload.start_date is not None:
        project.start_date = payload.start_date
    if payload.end_date is not None:
        project.end_date = payload.end_date
    project.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(project)
    return await _enrich_project(project, db)


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    claims: TokenData = rmg_write,
    db: AsyncSession = Depends(get_db)
):
    """Delete a project (cascades to allocations)."""
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.organization_id == claims.organization_id)
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)
    await db.commit()
    return None


# =========================================================================
# RESOURCE ALLOCATION (PROJECT MAPPINGS)
# =========================================================================

async def _enrich_allocation(mapping: ProjectMapping, db: AsyncSession) -> AllocationResponse:
    """Enrich allocation with employee and project details."""
    resp = AllocationResponse.from_orm(mapping)
    # Enrich employee details
    if mapping.employee:
        emp = mapping.employee
        resp.employee_name = f"{emp.first_name} {emp.last_name}"
        resp.employee_code = emp.employee_code
        if emp.department:
            resp.department_name = emp.department.name
        if emp.designation:
            resp.designation_title = emp.designation.title
    else:
        # Fallback: fetch directly
        emp_res = await db.execute(
            select(Employee)
            .options(selectinload(Employee.department), selectinload(Employee.designation))
            .where(Employee.id == mapping.employee_id)
        )
        emp = emp_res.scalars().first()
        if emp:
            resp.employee_name = f"{emp.first_name} {emp.last_name}"
            resp.employee_code = emp.employee_code
            resp.department_name = emp.department.name if emp.department else None
            resp.designation_title = emp.designation.title if emp.designation else None

    # Enrich project details
    if mapping.project:
        proj = mapping.project
        resp.project_name = proj.name
        resp.project_code = proj.code
        # Get client name
        if proj.client:
            resp.client_name = proj.client.name
        else:
            c_res = await db.execute(select(Client.name).where(Client.id == proj.client_id))
            resp.client_name = c_res.scalar()
    else:
        proj_res = await db.execute(
            select(Project)
            .options(selectinload(Project.client))
            .where(Project.id == mapping.project_id)
        )
        proj = proj_res.scalars().first()
        if proj:
            resp.project_name = proj.name
            resp.project_code = proj.code
            resp.client_name = proj.client.name if proj.client else None
    return resp


@router.get("/allocations", response_model=List[AllocationResponse])
async def list_allocations(
    project_id: Optional[str] = None,
    billing_status: Optional[str] = None,
    claims: TokenData = any_role,
    db: AsyncSession = Depends(get_db)
):
    """List all project allocations. Filter by project_id or billing_status."""
    query = (
        select(ProjectMapping)
        .options(
            selectinload(ProjectMapping.employee).selectinload(Employee.department),
            selectinload(ProjectMapping.employee).selectinload(Employee.designation),
            selectinload(ProjectMapping.project).selectinload(Project.client)
        )
        .where(ProjectMapping.organization_id == claims.organization_id)
    )
    if project_id:
        query = query.where(ProjectMapping.project_id == project_id)
    if billing_status:
        query = query.where(ProjectMapping.billing_status == billing_status)
    query = query.order_by(ProjectMapping.created_at.desc())
    result = await db.execute(query)
    mappings = result.scalars().all()
    return [await _enrich_allocation(m, db) for m in mappings]


@router.post("/allocations", response_model=AllocationResponse, status_code=status.HTTP_201_CREATED)
async def create_allocation(
    payload: AllocationCreate,
    claims: TokenData = rmg_write,
    db: AsyncSession = Depends(get_db)
):
    """Assign an employee to a project (create allocation)."""
    # Verify employee belongs to org
    emp_res = await db.execute(
        select(Employee).where(Employee.id == str(payload.employee_id), Employee.organization_id == claims.organization_id)
    )
    if not emp_res.scalars().first():
        raise HTTPException(status_code=404, detail="Employee not found")

    # Verify project belongs to org
    proj_res = await db.execute(
        select(Project).where(Project.id == str(payload.project_id), Project.organization_id == claims.organization_id)
    )
    if not proj_res.scalars().first():
        raise HTTPException(status_code=404, detail="Project not found")

    mapping = ProjectMapping(
        organization_id=claims.organization_id,
        employee_id=str(payload.employee_id),
        project_id=str(payload.project_id),
        project_role=payload.project_role,
        allocation_percentage=payload.allocation_percentage or 100,
        billing_status=payload.billing_status or "Billable",
        billing_hourly_rate=payload.billing_hourly_rate,
        start_date=payload.start_date
    )
    db.add(mapping)
    await db.commit()
    await db.refresh(mapping)
    return await _enrich_allocation(mapping, db)


@router.put("/allocations/{allocation_id}", response_model=AllocationResponse)
async def update_allocation(
    allocation_id: str,
    payload: AllocationUpdate,
    claims: TokenData = rmg_write,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing project allocation (reassign, change role/status)."""
    result = await db.execute(
        select(ProjectMapping)
        .options(
            selectinload(ProjectMapping.employee).selectinload(Employee.department),
            selectinload(ProjectMapping.employee).selectinload(Employee.designation),
            selectinload(ProjectMapping.project).selectinload(Project.client)
        )
        .where(ProjectMapping.id == allocation_id, ProjectMapping.organization_id == claims.organization_id)
    )
    mapping = result.scalars().first()
    if not mapping:
        raise HTTPException(status_code=404, detail="Allocation not found")

    if payload.project_id is not None:
        # Verify new project belongs to org
        proj_res = await db.execute(
            select(Project).where(Project.id == str(payload.project_id), Project.organization_id == claims.organization_id)
        )
        if not proj_res.scalars().first():
            raise HTTPException(status_code=404, detail="Project not found")
        mapping.project_id = str(payload.project_id)
    if payload.project_role is not None:
        mapping.project_role = payload.project_role
    if payload.allocation_percentage is not None:
        mapping.allocation_percentage = payload.allocation_percentage
    if payload.billing_status is not None:
        mapping.billing_status = payload.billing_status
    if payload.billing_hourly_rate is not None:
        mapping.billing_hourly_rate = payload.billing_hourly_rate
    if payload.start_date is not None:
        mapping.start_date = payload.start_date

    mapping.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(mapping)
    return await _enrich_allocation(mapping, db)


@router.delete("/allocations/{allocation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_allocation(
    allocation_id: str,
    claims: TokenData = rmg_write,
    db: AsyncSession = Depends(get_db)
):
    """Remove an employee from a project."""
    result = await db.execute(
        select(ProjectMapping).where(ProjectMapping.id == allocation_id, ProjectMapping.organization_id == claims.organization_id)
    )
    mapping = result.scalars().first()
    if not mapping:
        raise HTTPException(status_code=404, detail="Allocation not found")
    await db.delete(mapping)
    await db.commit()
    return None


# =========================================================================
# BENCH RESOURCES
# =========================================================================

@router.get("/bench", response_model=List[BenchResourceResponse])
async def list_bench_resources(
    claims: TokenData = any_role,
    db: AsyncSession = Depends(get_db)
):
    """List all active employees who have no active (non-Bench) project allocation."""
    # Subquery: employee IDs with an active allocation
    active_sub = (
        select(ProjectMapping.employee_id)
        .where(
            ProjectMapping.organization_id == claims.organization_id,
            ProjectMapping.billing_status != "Bench"
        )
        .distinct()
        .scalar_subquery()
    )
    # Get employees NOT in that set
    result = await db.execute(
        select(Employee)
        .options(
            selectinload(Employee.department),
            selectinload(Employee.designation),
            selectinload(Employee.skillsets)
        )
        .where(
            Employee.organization_id == claims.organization_id,
            Employee.employment_status == "active",
            Employee.id.notin_(active_sub)
        )
        .order_by(Employee.join_date)
    )
    employees = result.scalars().all()

    bench_list = []
    for emp in employees:
        skills = [s.skill_name for s in emp.skillsets] if emp.skillsets else []
        bench_list.append(BenchResourceResponse(
            employee_id=emp.id,
            employee_name=f"{emp.first_name} {emp.last_name}",
            employee_code=emp.employee_code,
            department_name=emp.department.name if emp.department else None,
            designation_title=emp.designation.title if emp.designation else None,
            bench_since=emp.join_date,
            skills=skills
        ))
    return bench_list
