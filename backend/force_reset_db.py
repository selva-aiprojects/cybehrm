import asyncio
import asyncpg
from app.config import settings

async def reset_schema():
    # settings.DATABASE_URL looks like: postgresql+asyncpg://...
    # asyncpg expects just postgresql://
    dsn = settings.DATABASE_URL.replace("+asyncpg", "")
    print(f"Connecting to {dsn}")
    
    conn = await asyncpg.connect(dsn)
    try:
        # Drop public and HR-Engine schemas
        print("Dropping schemas...")
        await conn.execute("DROP SCHEMA IF EXISTS public CASCADE;")
        await conn.execute("DROP SCHEMA IF EXISTS \"HR-Engine\" CASCADE;")
        
        print("Recreating public schema...")
        await conn.execute("CREATE SCHEMA public;")
        await conn.execute("GRANT ALL ON SCHEMA public TO postgres;")
        await conn.execute("GRANT ALL ON SCHEMA public TO public;")
    finally:
        await conn.close()
    print("Database completely reset!")

if __name__ == "__main__":
    asyncio.run(reset_schema())
