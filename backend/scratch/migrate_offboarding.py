import os
import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv('DATABASE_URL').replace('+asyncpg', '')
engine = sa.create_engine(db_url)
Session = sessionmaker(engine)
s = Session()

# 1. Fetch all tenant subdomains from the organizations table
orgs = s.execute(sa.text("SELECT subdomain FROM organizations")).fetchall()
subdomains = [org[0] for org in orgs if org[0]]

# Add 'public' as a schema to migrate
schemas = ['public'] + subdomains

print(f"Schemas to migrate offboarding_requests: {schemas}")

for schema in schemas:
    if not schema or schema == "nexus-central":
        continue
        
    print(f"\nMigrating schema: '{schema}'")
    
    # Check and add columns to offboarding_requests
    try:
        # Check if column exists first to avoid error, or use ADD COLUMN IF NOT EXISTS
        s.execute(sa.text(f'ALTER TABLE "{schema}".offboarding_requests ADD COLUMN IF NOT EXISTS initiation_type VARCHAR(50) DEFAULT \'employee\';'))
        print(f"  offboarding_requests column 'initiation_type' added successfully.")
    except Exception as e:
        print(f"  Error on offboarding_requests in schema {schema}: {e}")
        s.rollback()

s.commit()
print("\nMigration completed successfully!")
