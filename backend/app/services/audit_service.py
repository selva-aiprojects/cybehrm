# app/services/audit_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import AuditLog
from typing import Optional, Any, Dict
from uuid import UUID

class AuditService:
    @staticmethod
    async def log_action(
        db: AsyncSession,
        organization_id: UUID,
        user_id: Optional[UUID],
        action: str,
        module: str,
        details: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        """
        Asynchronously write a compliance audit log entry to the database.
        Registers the acting user, target tenant organization, module context, and change details.
        """
        audit_entry = AuditLog(
            organization_id=organization_id,
            user_id=user_id,
            action=action,
            module=module,
            details=details or {}
        )
        
        db.add(audit_entry)
        # Flush to check relational validation without committing entire transaction
        await db.flush()
        return audit_entry
