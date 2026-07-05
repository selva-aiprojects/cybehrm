import asyncio
from sqlalchemy import text
from app.db.session import engine

async def main():
    print("Creating assets and induction_tasks tables...")
    async with engine.begin() as conn:
        # Create assets table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS assets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                asset_type VARCHAR(100) NOT NULL,
                serial_number VARCHAR(255),
                status VARCHAR(50) NOT NULL DEFAULT 'available',
                employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
                assigned_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        # Create induction_tasks table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS induction_tasks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
                employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
                task_name VARCHAR(255) NOT NULL,
                description TEXT,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                completed_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """))
    print("Tables created successfully!")

if __name__ == '__main__':
    asyncio.run(main())
