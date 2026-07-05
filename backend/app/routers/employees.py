# app/routers/employees.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.models import Employee, User, LeaveBalance, ContractVendor
from app.schemas.schemas import EmployeeCreate, EmployeeUpdate, EmployeeResponse, ContractVendorCreate, ContractVendorResponse
from app.routers.dependencies import get_current_user, RoleChecker
from app.services.auth_service import AuthService
from typing import List, Optional
from uuid import UUID
import datetime

router = APIRouter(prefix="/employees", tags=["Employee Management"])

# Helper role dependencies
admin_or_manager = Depends(RoleChecker(["hr_admin", "manager"]))
hr_admin_only = Depends(RoleChecker(["hr_admin"]))

@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    payload: EmployeeCreate,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Onboard a new Employee. Strictly isolated to the authenticated user's organization.
    If email and password are provided, creates a portal login account with requested role.
    """
    # 1. Enforce business custom Employee ID uniqueness within the organization
    existing_emp_id = await db.execute(
        select(Employee).where(
            Employee.organization_id == current_user.organization_id,
            Employee.employee_id == payload.employee_id
        )
    )
    if existing_emp_id.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee ID '{payload.employee_id}' is already registered in your organization"
        )

    # 2. Check if a portal User account needs to be created
    new_user_id = None
    if payload.email:
        # Check email uniqueness globally
        existing_email = await db.execute(select(User).where(User.email == payload.email))
        if existing_email.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A user with email '{payload.email}' is already registered on the platform"
            )
            
        hashed_password = AuthService.hash_password(payload.password or "Welcome@123")
        user_role = payload.role or "employee"
        
        new_portal_user = User(
            organization_id=current_user.organization_id,
            email=payload.email,
            password_hash=hashed_password,
            role=user_role,
            is_active=True
        )
        db.add(new_portal_user)
        await db.flush() # Flush to populate user ID
        new_user_id = new_portal_user.id

    # 3. Create the Employee profile
    new_employee = Employee(
        organization_id=current_user.organization_id,
        user_id=new_user_id,
        employee_id=payload.employee_id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        dob=payload.dob,
        gender=payload.gender,
        phone=payload.phone,
        address=payload.address,
        department_id=payload.department_id,
        designation_id=payload.designation_id,
        manager_id=payload.manager_id,
        joining_date=payload.joining_date,
        employment_type=payload.employment_type,
        employment_status="active"
    )
    db.add(new_employee)
    await db.flush()

    # 4. Generate initial standard leave balances for the current year
    current_year = datetime.datetime.utcnow().year
    leave_types = [
        ("casual", 12.0),
        ("sick", 10.0),
        ("earned", 15.0)
    ]
    for l_type, allocated in leave_types:
        balance = LeaveBalance(
            organization_id=current_user.organization_id,
            employee_id=new_employee.id,
            year=current_year,
            leave_type=l_type,
            allocated=allocated,
            used=0.0
        )
        db.add(balance)

    await db.commit()
    
    # If contract employee, create ContractVendor record
    if payload.employment_type == "contract" and payload.contractor_details:
        vendor_data = payload.contractor_details
        new_vendor = ContractVendor(
            organization_id=current_user.organization_id,
            employee_id=new_employee.id,
            vendor_name=vendor_data.vendor_name,
            vendor_code=vendor_data.vendor_code,
            contact_person=vendor_data.contact_person,
            contact_email=vendor_data.contact_email,
            contact_phone=vendor_data.contact_phone,
            contract_start_date=vendor_data.contract_start_date,
            contract_end_date=vendor_data.contract_end_date,
            po_number=vendor_data.po_number,
            billing_rate=vendor_data.billing_rate,
            currency=vendor_data.currency or "INR",
            notes=vendor_data.notes
        )
        db.add(new_vendor)
        await db.commit()
    
    # Query with options to ensure everything is eagerly loaded
    refreshed_emp = await db.execute(
        select(Employee).options(
            selectinload(Employee.user),
            selectinload(Employee.functional_title),
            selectinload(Employee.skillsets),
            selectinload(Employee.work_experiences),
            selectinload(Employee.academic_qualifications),
            selectinload(Employee.project_allocations),
            selectinload(Employee.contractor_details),
            selectinload(Employee.assets),
            selectinload(Employee.induction_tasks)
        ).where(Employee.id == new_employee.id)
    )
    new_employee = refreshed_emp.scalars().first()
    
    # Map email to response if user was created
    response_data = EmployeeResponse.from_orm(new_employee)
    if payload.email:
        response_data.email = str(payload.email)
        
    return response_data


@router.get("", response_model=List[EmployeeResponse])
async def list_employees(
    search: Optional[str] = Query(None, description="Search by name or employee ID"),
    department_id: Optional[UUID] = Query(None),
    current_user: User = Depends(get_current_user),
    _auth = admin_or_manager,
    db: AsyncSession = Depends(get_db)
):
    """
    List all employees inside the authenticated user's organization.
    Supports basic search and department filters. Strictly enforces multi-tenant boundary.
    """
    query = select(Employee).options(
        selectinload(Employee.user),
        selectinload(Employee.functional_title),
        selectinload(Employee.skillsets),
        selectinload(Employee.work_experiences),
        selectinload(Employee.academic_qualifications),
        selectinload(Employee.project_allocations),
        selectinload(Employee.contractor_details),
        selectinload(Employee.assets),
        selectinload(Employee.induction_tasks)
    ).where(Employee.organization_id == current_user.organization_id)

    # Apply filters
    filters = []
    if search:
        search_term = f"%{search}%"
        filters.append(
            or_(
                Employee.first_name.ilike(search_term),
                Employee.last_name.ilike(search_term),
                Employee.employee_id.ilike(search_term)
            )
        )
    if department_id:
        filters.append(Employee.department_id == department_id)

    if filters:
        query = query.where(and_(*filters))

    result = await db.execute(query)
    employees = result.scalars().all()

    # Populate email addresses by joining User records manually or via ORM mapping
    responses = []
    for emp in employees:
        resp = EmployeeResponse.from_orm(emp)
        # Fetch email if user credentials account is attached
        if emp.user:
            resp.email = emp.user.email
        responses.append(resp)

    return responses


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee_by_id(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch details of a single employee in the organization.
    """
    # Restrict base query to current organization for tenant isolation
    query = select(Employee).options(
        selectinload(Employee.user),
        selectinload(Employee.functional_title),
        selectinload(Employee.skillsets),
        selectinload(Employee.work_experiences),
        selectinload(Employee.academic_qualifications),
        selectinload(Employee.project_allocations),
        selectinload(Employee.contractor_details),
        selectinload(Employee.assets),
        selectinload(Employee.induction_tasks)
    ).where(
        Employee.organization_id == current_user.organization_id,
        Employee.id == employee_id
    )
    result = await db.execute(query)
    employee = result.scalars().first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found in your organization"
        )

    resp = EmployeeResponse.from_orm(employee)
    if employee.user:
        resp.email = employee.user.email
    return resp


@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: UUID,
    payload: EmployeeUpdate,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Update selected employee profile parameters.
    """
    query = select(Employee).options(
        selectinload(Employee.user),
        selectinload(Employee.contractor_details)
    ).where(
        Employee.organization_id == current_user.organization_id,
        Employee.id == employee_id
    )
    result = await db.execute(query)
    employee = result.scalars().first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found in your organization"
        )

    # Apply updates
    update_data = payload.dict(exclude_unset=True)
    contractor_data = update_data.pop("contractor_details", None)

    for field, value in update_data.items():
        setattr(employee, field, value)

    # Handle exit date if terminated
    if payload.employment_status == "terminated" and not employee.exit_date:
        employee.exit_date = datetime.date.today()
        # Deactivate associated user portal login if attached
        if employee.user:
            employee.user.is_active = False

    # Handle contractor details updates
    if employee.employment_type == "contract":
        if contractor_data:
            if employee.contractor_details:
                # Update existing ContractVendor
                for field, value in contractor_data.items():
                    setattr(employee.contractor_details, field, value)
                employee.contractor_details.updated_at = datetime.datetime.utcnow()
            else:
                # Create new ContractVendor
                new_vendor = ContractVendor(
                    organization_id=current_user.organization_id,
                    employee_id=employee.id,
                    vendor_name=contractor_data.get("vendor_name", "Unknown Vendor"),
                    vendor_code=contractor_data.get("vendor_code"),
                    contact_person=contractor_data.get("contact_person"),
                    contact_email=contractor_data.get("contact_email"),
                    contact_phone=contractor_data.get("contact_phone"),
                    contract_start_date=contractor_data.get("contract_start_date"),
                    contract_end_date=contractor_data.get("contract_end_date"),
                    po_number=contractor_data.get("po_number"),
                    billing_rate=contractor_data.get("billing_rate"),
                    currency=contractor_data.get("currency", "INR"),
                    notes=contractor_data.get("notes")
                )
                db.add(new_vendor)
    else:
        # If employment type is not contract, delete any associated ContractVendor record
        if employee.contractor_details:
            await db.delete(employee.contractor_details)

    db.add(employee)
    await db.commit()
    
    # Eagerly load updated employee relationships
    refreshed_emp = await db.execute(
        select(Employee).options(
            selectinload(Employee.user),
            selectinload(Employee.functional_title),
            selectinload(Employee.skillsets),
            selectinload(Employee.work_experiences),
            selectinload(Employee.academic_qualifications),
            selectinload(Employee.project_allocations),
            selectinload(Employee.contractor_details),
            selectinload(Employee.assets),
            selectinload(Employee.induction_tasks)
        ).where(Employee.id == employee.id)
    )
    employee = refreshed_emp.scalars().first()

    resp = EmployeeResponse.from_orm(employee)
    if employee.user:
        resp.email = employee.user.email
    return resp


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    _auth = hr_admin_only,
    db: AsyncSession = Depends(get_db)
):
    """
    Hard delete an employee from the organization.
    Usually deactivation/termination (PUT) is preferred for auditing.
    """
    query = select(Employee).where(
        Employee.organization_id == current_user.organization_id,
        Employee.id == employee_id
    )
    result = await db.execute(query)
    employee = result.scalars().first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found in your organization"
        )

    # Delete employee
    await db.delete(employee)
    await db.commit()
    return None
