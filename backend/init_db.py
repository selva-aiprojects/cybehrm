import asyncio
from sqlalchemy import text
from sqlalchemy.schema import CreateTable
from app.db.session import engine, Base
import app.models.models  # Force import all models
import traceback

async def main():
    print("Starting Database Initialization...")
    print(f"Registered Tables: {list(Base.metadata.tables.keys())}")
    
    async with engine.begin() as conn:
        print("Creating schema HR-Engine and orient-ts if not exists...")
        await conn.execute(text('CREATE SCHEMA IF NOT EXISTS "HR-Engine"'))
        await conn.execute(text('CREATE SCHEMA IF NOT EXISTS "orient-ts"'))
        
    async with engine.begin() as conn:
        print("Running create_all...")
        try:
            # Force table creation
            await conn.run_sync(Base.metadata.create_all)
            print("create_all completed.")
        except Exception as e:
            print("Error during create_all:")
            traceback.print_exc()

    async with engine.begin() as conn:
        # Verify if organizations table exists
        res = await conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'HR-Engine'"))
        tables = [r[0] for r in res.fetchall()]
        print(f"Tables actually in DB: {tables}")
        if 'organizations' not in tables:
            print("WARNING: organizations table was NOT created!")
            print("Executing raw DDL fallback...")
            # Fallback raw DDL
            ddl = CreateTable(Base.metadata.tables['HR-Engine.organizations']).compile(engine.sync_engine)
            await conn.execute(text(str(ddl)))
            print("Raw DDL executed.")
        else:
            print("SUCCESS: organizations table exists.")

if __name__ == "__main__":
    asyncio.run(main())
