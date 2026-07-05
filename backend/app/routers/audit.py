# app/routers/audit.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.models import AuditLog, User
from app.schemas.schemas import AuditLogResponse
from app.routers.dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/audit", tags=["Audit Log Management"])

@router.get("/logs", response_model=List[AuditLogResponse])
async def list_audit_logs(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve recent audit logs for the active user's organization shard.
    Isolated by organization_id to ensure tenant boundaries.
    """
    query = (
        select(AuditLog)
        .options(selectinload(AuditLog.user))
        .where(AuditLog.organization_id == current_user.organization_id)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(query)
    logs = result.scalars().all()
    return logs
