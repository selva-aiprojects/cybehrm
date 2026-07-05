# app/routers/attendance.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, text
from app.db.session import get_db
from app.models.models import Attendance, User, Employee
from app.schemas.schemas import AttendanceCheckIn, AttendanceCheckOut, AttendanceResponse, AttendanceAnalyticsResponse
from app.routers.dependencies import get_current_user, get_current_employee, RoleChecker, require_subscription, require_feature_permission
import datetime
from typing import List, Optional
from uuid import UUID

router = APIRouter(prefix="/attendance", tags=["Attendance Management"], dependencies=[Depends(require_subscription("hr_team")), Depends(require_feature_permission("attendance"))])

# Standard shift configuration constants
SHIFT_START_HOUR = 9 # 9:00 AM
SHIFT_START_MINUTE = 15 # 9:15 AM late limit
SHIFT_WORK_HOURS = 8 # 8 hours (480 minutes) standard workday

@router.post("/checkin", response_model=AttendanceResponse)
async def check_in_employee(
    payload: AttendanceCheckIn,
    current_user: User = Depends(get_current_user),
    employee: Employee = Depends(get_current_employee),
    db: AsyncSession = Depends(get_db)
):
    """
    Log clock-in event for the authenticated employee for today.
    Calculates late arrival minutes if check-in is past the shift start (9:15 AM).
    """
    today = datetime.date.today()
    now_time = datetime.datetime.now(datetime.timezone.utc)

    # 1. Verify if already checked in today
    query = select(Attendance).where(
        Attendance.employee_id == employee.id,
        Attendance.date == today
    )
    result = await db.execute(query)
    existing_attendance = result.scalars().first()

    if existing_attendance and existing_attendance.check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You have already clocked in today at {existing_attendance.check_in.strftime('%H:%M:%S')}"
        )

    # 2. Calculate late minutes
    late_minutes = 0
    local_now = datetime.datetime.now() # Local time for shift logic
    shift_start = local_now.replace(hour=SHIFT_START_HOUR, minute=SHIFT_START_MINUTE, second=0, microsecond=0)
    
    if local_now > shift_start:
        difference = local_now - shift_start
        late_minutes = int(difference.total_seconds() / 60)

    # 3. Create or update attendance record
    if existing_attendance:
        # e.g., if pre-marked absent or on leave, but checks in
        existing_attendance.check_in = now_time
        existing_attendance.status = "present"
        existing_attendance.late_minutes = late_minutes
        existing_attendance.ip_address = payload.ip_address
        existing_attendance.location_lat = payload.location_lat
        existing_attendance.location_lng = payload.location_lng
        attendance_record = existing_attendance
    else:
        attendance_record = Attendance(
            organization_id=current_user.organization_id,
            employee_id=employee.id,
            date=today,
            check_in=now_time,
            status="present",
            late_minutes=late_minutes,
            ip_address=payload.ip_address,
            location_lat=payload.location_lat,
            location_lng=payload.location_lng
        )
        db.add(attendance_record)

    await db.commit()

    # Log checkin event
    from app.services.audit_service import AuditService
    await AuditService.log_action(
        db=db,
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        action="Standard Day Shift Check-in Logged",
        module="Attendance",
        details={"late_minutes": late_minutes, "ip_address": payload.ip_address}
    )

    return attendance_record


@router.post("/checkout", response_model=AttendanceResponse)
async def check_out_employee(
    payload: AttendanceCheckOut,
    employee: Employee = Depends(get_current_employee),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Log clock-out event for the authenticated employee for today.
    Calculates total work minutes and overtime minutes (exceeding 8 hours / 480 minutes).
    """
    today = datetime.date.today()
    now_time = datetime.datetime.now(datetime.timezone.utc)

    # 1. Fetch checkin record
    query = select(Attendance).where(
        Attendance.employee_id == employee.id,
        Attendance.date == today
    )
    result = await db.execute(query)
    attendance_record = result.scalars().first()

    if not attendance_record or not attendance_record.check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot clock out because no clock-in record was found for today"
        )

    if attendance_record.check_out:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You have already clocked out today at {attendance_record.check_out.strftime('%H:%M:%S')}"
        )

    # 2. Calculate work minutes
    check_in_time = attendance_record.check_in
    if check_in_time.tzinfo is not None:
        check_in_time = check_in_time.astimezone(datetime.timezone.utc).replace(tzinfo=None)
    if now_time.tzinfo is not None:
        now_time = now_time.astimezone(datetime.timezone.utc).replace(tzinfo=None)
    work_delta = now_time - check_in_time
    work_minutes = int(work_delta.total_seconds() / 60)

    # 3. Calculate overtime minutes
    standard_minutes = SHIFT_WORK_HOURS * 60
    overtime_minutes = 0
    if work_minutes > standard_minutes:
        overtime_minutes = work_minutes - standard_minutes

    # 4. Save calculations
    attendance_record.check_out = now_time
    attendance_record.work_minutes = work_minutes
    attendance_record.overtime_minutes = overtime_minutes
    
    # Adjust status based on hours worked
    if work_minutes < 240:
        attendance_record.status = "absent"
    elif work_minutes < 480:
        attendance_record.status = "half_day"

    db.add(attendance_record)
    await db.commit()

    # Log checkout event
    from app.services.audit_service import AuditService
    await AuditService.log_action(
        db=db,
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        action="Standard Day Shift Check-out Logged",
        module="Attendance",
        details={"work_minutes": work_minutes, "overtime_minutes": overtime_minutes}
    )

    return attendance_record


@router.get("/me", response_model=List[AttendanceResponse])
async def read_my_attendance(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None),
    employee_id: Optional[UUID] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch the currently logged-in employee's own daily logs for a given month and year.
    """
    # 1. Fetch employee of currently logged in user
    emp_query = select(Employee).where(
        Employee.user_id == current_user.id,
        Employee.organization_id == current_user.organization_id
    )
    emp_res = await db.execute(emp_query)
    employee = emp_res.scalars().first()

    # 2. Determine target employee ID
    target_employee_id = None
    if employee_id and current_user.role in ["hr_admin", "super_admin"]:
        target_employee_id = employee_id
    elif employee:
        target_employee_id = employee.id

    if not target_employee_id:
        # If there's no target employee (e.g. admin checking their own non-existent attendance),
        # return empty list gracefully
        return []

    target_month = month or datetime.date.today().month
    target_year = year or datetime.date.today().year

    # Build date range filter
    start_date = datetime.date(target_year, target_month, 1)
    if target_month == 12:
        end_date = datetime.date(target_year + 1, 1, 1) - datetime.timedelta(days=1)
    else:
        end_date = datetime.date(target_year, target_month + 1, 1) - datetime.timedelta(days=1)

    query = select(Attendance).where(
        Attendance.employee_id == target_employee_id,
        Attendance.date.between(start_date, end_date)
    ).order_by(Attendance.date.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/analytics", response_model=AttendanceAnalyticsResponse)
async def get_attendance_analytics(
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Attendance analytics: monthly heatmap, hours worked, shift distribution, geo locations.
    """
    org_id = current_user.organization_id
    today = datetime.date.today()
    target_month = month or today.month
    target_year = year or today.year

    # Monthly heatmap — attendance status per day
    heatmap_q = await db.execute(
        select(Attendance.date, Attendance.status, Attendance.work_minutes)
        .where(
            Attendance.organization_id == org_id,
            func.extract('month', Attendance.date) == target_month,
            func.extract('year', Attendance.date) == target_year
        )
        .order_by(Attendance.date)
    )
    monthly_heatmap = [
        {"date": str(r[0]), "status": r[1], "work_minutes": r[2]}
        for r in heatmap_q.fetchall()
    ]

    # Hours worked — weekly summary
    hours_q = await db.execute(
        select(
            func.date_trunc(text("'week'"), Attendance.date).label('week'),
            func.sum(Attendance.work_minutes).label('total_minutes')
        )
        .where(
            Attendance.organization_id == org_id,
            func.extract('year', Attendance.date) == target_year
        )
        .group_by(func.date_trunc(text("'week'"), Attendance.date))
        .order_by(func.date_trunc(text("'week'"), Attendance.date))
    )
    hours_worked = [
        {"week": str(r[0]), "total_hours": round((r[1] or 0) / 60, 1)}
        for r in hours_q.fetchall()
    ]

    # Shift distribution (from employee current_shift)
    shift_q = await db.execute(
        select(Employee.current_shift, func.count(Employee.id))
        .where(Employee.organization_id == org_id, Employee.employment_status == "active")
        .group_by(Employee.current_shift)
    )
    shift_distribution = [
        {"shift": r[0] or "General Shift", "count": r[1]}
        for r in shift_q.fetchall()
    ]

    # Geo locations from this month's check-ins
    geo_q = await db.execute(
        select(
            Attendance.location_lat,
            Attendance.location_lng,
            Attendance.ip_address,
            func.count(Attendance.id).label('checkins')
        )
        .where(
            Attendance.organization_id == org_id,
            Attendance.location_lat.isnot(None),
            func.extract('month', Attendance.date) == target_month,
            func.extract('year', Attendance.date) == target_year
        )
        .group_by(Attendance.location_lat, Attendance.location_lng, Attendance.ip_address)
        .limit(100)
    )
    geo_locations = [
        {
            "lat": str(r[0]),
            "lng": str(r[1]),
            "ip": r[2] or "",
            "checkins": r[3]
        }
        for r in geo_q.fetchall()
    ]

    return {
        "monthly_heatmap": monthly_heatmap,
        "hours_worked": hours_worked,
        "shift_distribution": shift_distribution,
        "geo_locations": geo_locations
    }


@router.get("/report", response_model=List[AttendanceResponse])
async def list_attendance_report(
    date: Optional[datetime.date] = Query(None),
    department_id: Optional[UUID] = Query(None),
    current_user: User = Depends(get_current_user),
    _auth = Depends(RoleChecker(["hr_admin", "manager"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch daily/department reports for admin audits. Strictly isolated to organization_id.
    """
    target_date = date or datetime.date.today()
    
    query = select(Attendance).join(Employee).where(
        Attendance.organization_id == current_user.organization_id,
        Attendance.date == target_date
    )

    if department_id:
        query = query.where(Employee.department_id == department_id)

    result = await db.execute(query)
    return result.scalars().all()
