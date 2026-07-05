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

print(f"Schemas to migrate: {schemas}")

for schema in schemas:
    if not schema or schema == "nexus-central":
        continue
        
    print(f"\nMigrating schema: '{schema}'")
    
    # Check and add columns to talent_profiles
    try:
        s.execute(sa.text(f'ALTER TABLE "{schema}".talent_profiles ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50);'))
        s.execute(sa.text(f'ALTER TABLE "{schema}".talent_profiles ADD COLUMN IF NOT EXISTS reference_detail VARCHAR(255);'))
        print(f"  talent_profiles columns added successfully.")
    except Exception as e:
        print(f"  Error on talent_profiles: {e}")
        s.rollback()
        
    # Check and add columns to talent_candidates
    try:
        s.execute(sa.text(f'ALTER TABLE "{schema}".talent_candidates ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50);'))
        s.execute(sa.text(f'ALTER TABLE "{schema}".talent_candidates ADD COLUMN IF NOT EXISTS reference_detail VARCHAR(255);'))
        print(f"  talent_candidates columns added successfully.")
    except Exception as e:
        print(f"  Error on talent_candidates: {e}")
        s.rollback()

s.commit()
print("\nMigration completed successfully!")
