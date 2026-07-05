# app/routers/erp_masters.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.models import (
    User, Employee, SalaryBand, FunctionalTitle, Client, Project, ProjectMapping,
    EmployeeSkillset, WorkExperience, AcademicQualification
)
from app.schemas.schemas import (
    SalaryBandCreate, SalaryBandResponse,
    FunctionalTitleCreate, FunctionalTitleResponse,
    ClientCreate, ClientResponse,
    ProjectCreate, ProjectResponse,
    ProjectMappingCreate, ProjectMappingResponse,
    EmployeeSkillsetCreate, EmployeeSkillsetResponse,
    WorkExperienceCreate, WorkExperienceResponse,
    AcademicQualificationCreate, AcademicQualificationResponse
)
from app.routers.dependencies import get_current_user, RoleChecker
from typing import List, Optional
from uuid import UUID
import datetime

router = APIRouter(prefix="/erp", tags=["ERP Masters"])

# Helper role dependencies
hr_admin_only = Depends(RoleChecker(["hr_admin"]))
all_authenticated = Depends(get_current_user)

# =========================================================================
# 1. SALARY BANDS ENDPOINTS
# =========================================================================

@router.get("/salary-bands", response_model=List[SalaryBandResponse])
async def list_salary_bands(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all compensation salary bands"""
    result = await db.execute(select(SalaryBand).order_by(SalaryBand.band_name))
    return result.scalars().all()

@router.post("/salary-bands", response_model=SalaryBandResponse, status_code=status.HTTP_201_CREATED)
async def create_salary_band(
    payload: SalaryBandCreate,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """Create a new salary band (HR Admin only)"""
    # Check if band name exists
    existing = await db.execute(select(SalaryBand).where(SalaryBand.band_name == payload.band_name))
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Salary Band '{payload.band_name}' already exists"
        )
    
    band = SalaryBand(
        band_name=payload.band_name,
        min_base_annual=payload.min_base_annual,
        mid_base_annual=payload.mid_base_annual,
        max_base_annual=payload.max_base_annual
    )
    db.add(band)
    await db.commit()
    await db.refresh(band)
    return band


# =========================================================================
# 2. FUNCTIONAL TITLES ENDPOINTS
# =========================================================================

@router.get("/functional-titles", response_model=List[FunctionalTitleResponse])
async def list_functional_titles(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all functional titles for the active organization"""
    result = await db.execute(
        select(FunctionalTitle)
        .where(FunctionalTitle.organization_id == current_user.organization_id)
        .order_by(FunctionalTitle.name)
    )
    return result.scalars().all()

@router.post("/functional-titles", response_model=FunctionalTitleResponse, status_code=status.HTTP_201_CREATED)
async def create_functional_title(
    payload: FunctionalTitleCreate,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """Create a new functional title (HR Admin only)"""
    existing = await db.execute(
        select(FunctionalTitle).where(
            FunctionalTitle.organization_id == current_user.organization_id,
            FunctionalTitle.name == payload.name
        )
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Functional Title '{payload.name}' already exists in your organization"
        )
    
    title = FunctionalTitle(
        organization_id=current_user.organization_id,
        name=payload.name,
        skill_category=payload.skill_category
    )
    db.add(title)
    await db.commit()
    await db.refresh(title)
    return title


# =========================================================================
# 3. CLIENTS ENDPOINTS
# =========================================================================

@router.get("/clients", response_model=List[ClientResponse])
async def list_clients(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all clients for the active organization"""
    result = await db.execute(
        select(Client)
        .where(Client.organization_id == current_user.organization_id)
        .order_by(Client.name)
    )
    return result.scalars().all()

@router.post("/clients", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    payload: ClientCreate,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """Create a new client account (HR Admin only)"""
    existing = await db.execute(
        select(Client).where(
            Client.organization_id == current_user.organization_id,
            Client.code == payload.code
        )
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Client with code '{payload.code}' already exists"
        )
    
    client = Client(
        organization_id=current_user.organization_id,
        name=payload.name,
        code=payload.code,
        domain_industry=payload.domain_industry,
        country=payload.country
    )
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client

@router.put("/clients/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: UUID,
    payload: ClientCreate,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """Update client details (HR Admin only)"""
    result = await db.execute(
        select(Client).where(
            Client.organization_id == current_user.organization_id,
            Client.id == client_id
        )
    )
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    
    client.name = payload.name
    client.code = payload.code
    client.domain_industry = payload.domain_industry
    client.country = payload.country
    
    await db.commit()
    await db.refresh(client)
    return client


# =========================================================================
# 4. PROJECTS ENDPOINTS
# =========================================================================

@router.get("/projects", response_model=List[ProjectResponse])
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all projects for the active organization"""
    result = await db.execute(
        select(Project)
        .where(Project.organization_id == current_user.organization_id)
        .order_by(Project.name)
    )
    return result.scalars().all()

@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """Create a new SOW project under a client (HR Admin only)"""
    # Verify client exists and belongs to organization
    client_res = await db.execute(
        select(Client).where(
            Client.organization_id == current_user.organization_id,
            Client.id == payload.client_id
        )
    )
    if not client_res.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid client selected")

    existing = await db.execute(
        select(Project).where(
            Project.organization_id == current_user.organization_id,
            Project.code == payload.code
        )
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Project with code '{payload.code}' already exists"
        )
    
    project = Project(
        organization_id=current_user.organization_id,
        client_id=payload.client_id,
        name=payload.name,
        code=payload.code,
        billing_type=payload.billing_type,
        start_date=payload.start_date,
        end_date=payload.end_date
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project

@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """Update project details (HR Admin only)"""
    result = await db.execute(
        select(Project).where(
            Project.organization_id == current_user.organization_id,
            Project.id == project_id
        )
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    project.client_id = payload.client_id
    project.name = payload.name
    project.code = payload.code
    project.billing_type = payload.billing_type
    project.start_date = payload.start_date
    project.end_date = payload.end_date
    
    await db.commit()
    await db.refresh(project)
    return project


# =========================================================================
# 5. PROJECT ALLOCATIONS (PROJECT MAPPINGS) ENDPOINTS
# =========================================================================

@router.get("/project-allocations", response_model=List[ProjectMappingResponse])
async def list_project_allocations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all project active allocations for multi-tenant scope"""
    result = await db.execute(
        select(ProjectMapping)
        .where(ProjectMapping.organization_id == current_user.organization_id)
        .order_by(ProjectMapping.created_at.desc())
    )
    return result.scalars().all()

@router.post("/project-allocations", response_model=ProjectMappingResponse, status_code=status.HTTP_201_CREATED)
async def create_project_allocation(
    payload: ProjectMappingCreate,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """Allocate an employee to a project (HR Admin only)"""
    # Verify employee exists and belongs to organization
    emp_res = await db.execute(
        select(Employee).where(
            Employee.organization_id == current_user.organization_id,
            Employee.id == payload.employee_id
        )
    )
    if not emp_res.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid employee selected")
        
    # Verify project exists and belongs to organization
    proj_res = await db.execute(
        select(Project).where(
            Project.organization_id == current_user.organization_id,
            Project.id == payload.project_id
        )
    )
    if not proj_res.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid project selected")

    allocation = ProjectMapping(
        organization_id=current_user.organization_id,
        employee_id=payload.employee_id,
        project_id=payload.project_id,
        project_role=payload.project_role,
        allocation_percentage=payload.allocation_percentage,
        billing_status=payload.billing_status,
        billing_hourly_rate=payload.billing_hourly_rate,
        start_date=payload.start_date
    )
    db.add(allocation)
    await db.commit()
    await db.refresh(allocation)
    return allocation

@router.put("/project-allocations/{allocation_id}", response_model=ProjectMappingResponse)
async def update_project_allocation(
    allocation_id: UUID,
    payload: ProjectMappingCreate,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """Update project allocation details (HR Admin only)"""
    result = await db.execute(
        select(ProjectMapping).where(
            ProjectMapping.organization_id == current_user.organization_id,
            ProjectMapping.id == allocation_id
        )
    )
    allocation = result.scalars().first()
    if not allocation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Allocation record not found")
        
    allocation.employee_id = payload.employee_id
    allocation.project_id = payload.project_id
    allocation.project_role = payload.project_role
    allocation.allocation_percentage = payload.allocation_percentage
    allocation.billing_status = payload.billing_status
    allocation.billing_hourly_rate = payload.billing_hourly_rate
    allocation.start_date = payload.start_date
    
    await db.commit()
    await db.refresh(allocation)
    return allocation

@router.delete("/project-allocations/{allocation_id}", status_code=status.HTTP_200_OK)
async def delete_project_allocation(
    allocation_id: UUID,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """De-allocate employee from project (HR Admin only)"""
    result = await db.execute(
        select(ProjectMapping).where(
            ProjectMapping.organization_id == current_user.organization_id,
            ProjectMapping.id == allocation_id
        )
    )
    allocation = result.scalars().first()
    if not allocation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Allocation record not found")
        
    await db.delete(allocation)
    await db.commit()
    return {"message": "Employee successfully deallocated from project"}


# =========================================================================
# 6. EMPLOYEE DETAILED PROFILE CONFIGS (SKILLSETS, EXPERIENCES, ACADEMICS)
# =========================================================================

# Helper function to check authorization
async def check_employee_profile_auth(employee_id: UUID, current_user: User, db: AsyncSession) -> Employee:
    result = await db.execute(
        select(Employee).where(
            Employee.organization_id == current_user.organization_id,
            Employee.id == employee_id
        )
    )
    employee = result.scalars().first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found in organization")
        
    # Standard security: user matches employee record OR user is hr_admin/manager
    if current_user.role not in ["hr_admin", "manager"] and employee.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this employee profile")
        
    return employee

@router.post("/employees/{employee_id}/skillsets", response_model=EmployeeSkillsetResponse, status_code=status.HTTP_201_CREATED)
async def add_employee_skillset(
    employee_id: UUID,
    payload: EmployeeSkillsetCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a professional skillset to employee profile"""
    await check_employee_profile_auth(employee_id, current_user, db)
    
    skill = EmployeeSkillset(
        employee_id=employee_id,
        skill_name=payload.skill_name,
        proficiency=payload.proficiency
    )
    db.add(skill)
    await db.commit()
    await db.refresh(skill)
    return skill

@router.delete("/skillsets/{skillset_id}", status_code=status.HTTP_200_OK)
async def delete_employee_skillset(
    skillset_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove a skillset from employee profile"""
    result = await db.execute(
        select(EmployeeSkillset).where(EmployeeSkillset.id == skillset_id)
    )
    skill = result.scalars().first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skillset record not found")
        
    # Check parent employee auth
    await check_employee_profile_auth(skill.employee_id, current_user, db)
    
    await db.delete(skill)
    await db.commit()
    return {"message": "Skillset successfully deleted"}

@router.post("/employees/{employee_id}/work-experiences", response_model=WorkExperienceResponse, status_code=status.HTTP_201_CREATED)
async def add_employee_experience(
    employee_id: UUID,
    payload: WorkExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a professional work experience to employee profile"""
    await check_employee_profile_auth(employee_id, current_user, db)
    
    exp = WorkExperience(
        employee_id=employee_id,
        company_name=payload.company_name,
        designation=payload.designation,
        tenure_months=payload.tenure_months,
        start_date=payload.start_date,
        end_date=payload.end_date
    )
    db.add(exp)
    await db.commit()
    await db.refresh(exp)
    return exp

@router.delete("/work-experiences/{experience_id}", status_code=status.HTTP_200_OK)
async def delete_employee_experience(
    experience_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove a work experience from employee profile"""
    result = await db.execute(
        select(WorkExperience).where(WorkExperience.id == experience_id)
    )
    exp = result.scalars().first()
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work experience record not found")
        
    # Check parent employee auth
    await check_employee_profile_auth(exp.employee_id, current_user, db)
    
    await db.delete(exp)
    await db.commit()
    return {"message": "Work experience successfully deleted"}

@router.post("/employees/{employee_id}/academic-qualifications", response_model=AcademicQualificationResponse, status_code=status.HTTP_201_CREATED)
async def add_employee_academic(
    employee_id: UUID,
    payload: AcademicQualificationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add an academic qualification to employee profile"""
    await check_employee_profile_auth(employee_id, current_user, db)
    
    acad = AcademicQualification(
        employee_id=employee_id,
        degree=payload.degree,
        institution=payload.institution,
        passing_year=payload.passing_year,
        cgpa_percentage=payload.cgpa_percentage
    )
    db.add(acad)
    await db.commit()
    await db.refresh(acad)
    return acad

@router.delete("/academic-qualifications/{academic_id}", status_code=status.HTTP_200_OK)
async def delete_employee_academic(
    academic_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove an academic qualification from employee profile"""
    result = await db.execute(
        select(AcademicQualification).where(AcademicQualification.id == academic_id)
    )
    acad = result.scalars().first()
    if not acad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Academic qualification record not found")
        
    # Check parent employee auth
    await check_employee_profile_auth(acad.employee_id, current_user, db)
    
    await db.delete(acad)
    await db.commit()
    return {"message": "Academic qualification successfully deleted"}
