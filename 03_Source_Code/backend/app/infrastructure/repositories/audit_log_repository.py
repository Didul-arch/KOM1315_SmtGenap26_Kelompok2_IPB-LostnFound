from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from database.models.audit_log_model import AuditLogModel
from database.models.user_model import UserModel

class AuditLogRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_logs_paginated(self, page: int = 1, limit: int = 15) -> dict:
        offset = (page - 1) * limit
        
        # Get total count
        count_query = select(func.count()).select_from(AuditLogModel)
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        
        # Get data with user emails
        query = (
            select(AuditLogModel, UserModel.email)
            .outerjoin(UserModel, AuditLogModel.user_id == UserModel.id)
            .order_by(AuditLogModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        
        result = await self.db.execute(query)
        rows = result.all()
        
        data = []
        for log, user_email in rows:
            data.append({
                "id": log.id,
                "user_id": log.user_id,
                "user_email": user_email,
                "action": log.action,
                "endpoint": log.endpoint,
                "ip_address": log.ip_address,
                "user_agent": log.user_agent,
                "status_code": log.status_code,
                "created_at": log.created_at.isoformat() if log.created_at else None
            })
            
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
            "data": data
        }

    async def get_stats(self) -> dict:
        # Total requests
        total_q = select(func.count()).select_from(AuditLogModel)
        total_result = await self.db.execute(total_q)
        total = total_result.scalar() or 0

        # Login count (action contains /auth/login)
        login_q = select(func.count()).select_from(AuditLogModel).where(
            AuditLogModel.action.ilike("%/auth/login%")
        )
        login_result = await self.db.execute(login_q)
        login_count = login_result.scalar() or 0

        # Logout count (action contains /auth/logout)
        logout_q = select(func.count()).select_from(AuditLogModel).where(
            AuditLogModel.action.ilike("%/auth/logout%")
        )
        logout_result = await self.db.execute(logout_q)
        logout_count = logout_result.scalar() or 0

        # Claims count
        claims_q = select(func.count()).select_from(AuditLogModel).where(
            AuditLogModel.action.ilike("%/claims%")
        )
        claims_result = await self.db.execute(claims_q)
        claims_count = claims_result.scalar() or 0

        # Items count
        items_q = select(func.count()).select_from(AuditLogModel).where(
            AuditLogModel.action.ilike("%/items%")
        )
        items_result = await self.db.execute(items_q)
        items_count = items_result.scalar() or 0

        # Unique users
        unique_q = select(func.count(func.distinct(AuditLogModel.user_id))).select_from(AuditLogModel).where(
            AuditLogModel.user_id.isnot(None)
        )
        unique_result = await self.db.execute(unique_q)
        unique_users = unique_result.scalar() or 0

        return {
            "total_requests": total,
            "login_count": login_count,
            "logout_count": logout_count,
            "claims_count": claims_count,
            "items_count": items_count,
            "unique_users": unique_users,
        }
