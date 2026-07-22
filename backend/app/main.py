# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.session import engine, Base
from app.routers import (
    auth, employees, attendance, leave, payroll, ai,
    tax_fbp_insurance_car, performance_reviews, offboarding,
    reports, erp_masters, usermgmt, talent, nexus, requisition,
    rmg, onboarding, audit, dashboard
)
from app.models import models
from sqlalchemy import text, select
import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="HRMS-Engine - Asynchronous Multi-Tenant SaaS HRMS Backend Services"
)

# Configure CORS Middleware
# Allows seamless API queries from our Vite React frontend
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "https://cybehrm.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Lifecycle hooks
@app.on_event("startup")
async def startup_event():
    """
    Triggers on backend launch.
    Ensures connection, registers extensions, provisions databases schemas,
    applies logical updates, and registers default central global super admin.
    """
    # Ensure schema exists before creating tables
    async with engine.begin() as conn:
        try:
            await conn.execute(text('CREATE SCHEMA IF NOT EXISTS "HR-Engine"'))
            await conn.execute(text('CREATE SCHEMA IF NOT EXISTS "orient-ts"'))
        except Exception as e:
            print(f"Schema creation skipped or failed: {e}")

    # Create database tables mapped by SQLAlchemy models
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Add SaaS feature flags if not present (dynamic SQLite migration)
        try:
            await conn.execute(text("ALTER TABLE organizations ADD COLUMN feature_talent_mgmt BOOLEAN NOT NULL DEFAULT 1"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE organizations ADD COLUMN feature_hr_team BOOLEAN NOT NULL DEFAULT 1"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE organizations ADD COLUMN feature_resource_mgmt BOOLEAN NOT NULL DEFAULT 1"))
        except Exception:
            pass

        # Add index on talent_profiles.organization_id for JD Matcher performance
        try:
            await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_talent_profiles_organization_id ON talent_profiles (organization_id)"))
        except Exception:
            pass

        # Add NPS and custom_deductions to salary_structures
        try:
            await conn.execute(text("ALTER TABLE salary_structures ADD COLUMN nps NUMERIC(12, 2) NOT NULL DEFAULT 0.00"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE salary_structures ADD COLUMN custom_deductions JSONB DEFAULT '{}'"))
        except Exception:
            pass

        # Add NPS, professional_tax and custom_deductions to payslips
        try:
            await conn.execute(text("ALTER TABLE payslips ADD COLUMN nps NUMERIC(12, 2) NOT NULL DEFAULT 0.00"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE payslips ADD COLUMN professional_tax NUMERIC(12, 2) NOT NULL DEFAULT 0.00"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE payslips ADD COLUMN custom_deductions JSONB DEFAULT '{}'"))
        except Exception:
            pass

    # Ensure system central organization and global super admin exist
    from app.db.session import AsyncSessionLocal
    from app.models.models import Organization, User, RolePermission
    from app.services.auth_service import AuthService
    
    async with AsyncSessionLocal() as session:
        try:
            # Check if central org exists
            central_org_id = "00000000-0000-0000-0000-000000000000"
            org_check = await session.execute(select(Organization).where(Organization.id == central_org_id))
            if not org_check.scalars().first():
                central_org = Organization(
                    id=central_org_id,
                    name="HRMS-Engine Central Nexus",
                    subdomain="nexus-central",
                    subscription_plan="enterprise",
                    subscription_status="active"
                )
                session.add(central_org)
                await session.flush()
                
            # Check if super admin user exists
            super_check = await session.execute(select(User).where(User.email == "super@hrms-engine.com"))
            if not super_check.scalars().first():
                hashed_pwd = AuthService.hash_password("Password123")
                super_user = User(
                    organization_id=central_org_id,
                    email="super@hrms-engine.com",
                    password_hash=hashed_pwd,
                    role="super_admin",
                    is_active=True
                )
                session.add(super_user)
                
            # Check if Orient tenant exists
            wk_org_id = "11111111-1111-1111-1111-111111111111"
            wk_org_check = await session.execute(select(Organization).where(Organization.id == wk_org_id))
            if not wk_org_check.scalars().first():
                wk_org = Organization(
                    id=wk_org_id,
                    name="Orient Technology Solutions",
                    subdomain="orient-ts",
                    subscription_plan="enterprise",
                    subscription_status="active"
                )
                session.add(wk_org)
                await session.flush()
                
            # Check if Orient admin exists
            wk_admin_check = await session.execute(select(User).where(User.email == "admin@orient-ts.com"))
            if not wk_admin_check.scalars().first():
                hashed_pwd = AuthService.hash_password("Password123")
                wk_admin = User(
                    organization_id=wk_org_id,
                    email="admin@orient-ts.com",
                    password_hash=hashed_pwd,
                    role="hr_admin",
                    is_active=True
                )
                session.add(wk_admin)

            # Seed default role permissions
            for org_id in [central_org_id, wk_org_id]:
                default_permissions = {
                    "employee": ["attendance", "leave", "fbp-tax", "insurance", "car-lease", "appraisals", "offboarding", "ai-copilot"],
                    "manager": ["attendance", "leave", "fbp-tax", "insurance", "car-lease", "appraisals", "offboarding", "ai-copilot"],
                    "recruiter": ["talent-mgmt", "ai-copilot"],
                    "payroll_admin": ["payroll", "fbp-tax", "ai-copilot"],
                    "hr_operations": ["project-allocations", "appraisals", "ai-copilot"]
                }
                for role, features in default_permissions.items():
                    for feature in features:
                        perm_check = await session.execute(
                            select(RolePermission).where(
                                RolePermission.organization_id == org_id,
                                RolePermission.role == role,
                                RolePermission.feature == feature
                            )
                        )
                        if not perm_check.scalars().first():
                            new_perm = RolePermission(
                                organization_id=org_id,
                                role=role,
                                feature=feature,
                                is_enabled=True
                            )
                            session.add(new_perm)
                
            await session.commit()
        except Exception as e:
            await session.rollback()
            print(f"Error seeding central nexus: {e}")

# Mount Routers
app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(leave.router)
app.include_router(payroll.router)
app.include_router(ai.router)
app.include_router(tax_fbp_insurance_car.router)
app.include_router(performance_reviews.router)
app.include_router(offboarding.router)
app.include_router(reports.router)
app.include_router(erp_masters.router)
app.include_router(usermgmt.router)
app.include_router(talent.router)
app.include_router(nexus.router)
app.include_router(requisition.router)
app.include_router(rmg.router)
app.include_router(onboarding.router)
app.include_router(audit.router)
app.include_router(dashboard.router)


# Health Check Route
@app.get("/")
async def root():
    """
    Core service health check endpoint.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ai_engine": "Groq LPU Interface"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host=settings.HOST, 
        port=settings.PORT, 
        reload=True
    )
