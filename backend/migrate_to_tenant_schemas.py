import asyncio
import os
from dotenv import load_dotenv
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found in environment!")
    exit(1)

# List of central tables that should NOT be copied to tenant schemas
CENTRAL_TABLES = {"organizations", "users", "role_permissions", "support_tickets"}

async def migrate():
    print(f"Connecting to database...")
    engine = create_async_engine(DATABASE_URL, echo=False)
    
    async with engine.begin() as conn:
        # 1. Fetch all registered organizations (tenants)
        res_orgs = await conn.execute(text(
            "SELECT id, name, subdomain FROM public.organizations WHERE subdomain != 'nexus-central'"
        ))
        orgs = res_orgs.fetchall()
        print(f"Found {len(orgs)} tenants to process.")

        # 2. Fetch all tables in public schema
        res_tables = await conn.execute(text(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        ))
        public_tables = [r[0] for r in res_tables.fetchall()]
        tenant_tables = [t for t in public_tables if t not in CENTRAL_TABLES]
        print(f"Found {len(tenant_tables)} tenant-specific tables to provision in each schema.")

        # 3. For each organization, recreate schema, recreate tables, and copy data
        for org_id, org_name, subdomain in orgs:
            if not subdomain:
                print(f"Skipping {org_name} (no subdomain defined)")
                continue
                
            print(f"\n--- Processing Tenant: {org_name} (schema: '{subdomain}') ---")
            
            # Recreate schema cleanly
            await conn.execute(text(f'DROP SCHEMA IF EXISTS "{subdomain}" CASCADE'))
            await conn.execute(text(f'CREATE SCHEMA "{subdomain}"'))
            print(f"Recreated schema '{subdomain}' cleanly.")
            
            # For each tenant table, create and migrate
            for table in tenant_tables:
                print(f"Creating table '{subdomain}.{table}' matching 'public.{table}'...")
                # Create table structure copying defaults, check constraints, and indexes (excluding foreign keys)
                await conn.execute(text(
                    f'CREATE TABLE "{subdomain}"."{table}" '
                    f'(LIKE public."{table}" INCLUDING DEFAULTS INCLUDING CONSTRAINTS INCLUDING INDEXES)'
                ))
                
                # Copy data from public to tenant schema
                res_copy = await conn.execute(text(
                    f'INSERT INTO "{subdomain}"."{table}" '
                    f'SELECT * FROM public."{table}" '
                    f"WHERE organization_id = :org_id"
                ), {"org_id": org_id})
                print(f"Migrated data for '{subdomain}.{table}'.")

    print("\nMigration to tenant-specific schemas completed successfully!")

if __name__ == "__main__":
    asyncio.run(migrate())
