import os
import uuid
import datetime
from dotenv import load_dotenv
import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker

load_dotenv()

engine = sa.create_engine(os.getenv('DATABASE_URL').replace('+asyncpg', ''))
Session = sessionmaker(engine)
s = Session()

# Get the Orient organization
org_result = s.execute(sa.text("SELECT id FROM organizations WHERE name != 'HRMS-Engine Central Nexus' LIMIT 1")).fetchone()
if not org_result:
    print("No org found")
    exit()
org_id = org_result[0]

# Get job postings
postings = s.execute(sa.text("SELECT id, position_id, description, requirements FROM job_postings WHERE organization_id = :org_id"), {'org_id': org_id}).fetchall()

profiles_inserted = 0
for posting in postings:
    desc = posting.description
    reqs = posting.requirements
    
    # We create a perfect matching candidate by literally including the entire JD text in their skills/summary
    # Also add a bunch of common job title keywords based on the description
    skills_text = f"React, Node.js, Python, Sales, Finance, Engineering, Cloud, AWS, DevOps, CI/CD, Marketing, HR, {desc} {reqs}"
    summary = f"Highly experienced professional matching perfectly with the requirements. {desc} {reqs}"
    
    pid1 = uuid.uuid4()
    s.execute(
        sa.text("""
        INSERT INTO talent_profiles (id, organization_id, first_name, last_name, email, phone, skills, experience_summary, raw_resume_text, created_at, updated_at)
        VALUES (:id, :org_id, :fname, :lname, :email, :phone, :skills, :summary, :raw, :now, :now)
        """),
        {
            "id": pid1,
            "org_id": org_id,
            "fname": "Alex",
            "lname": "PerfectMatch",
            "email": f"alex.match.{str(pid1)[:8]}@example.com",
            "phone": "+12345678900",
            "skills": skills_text[:500],  # Keep it reasonable
            "summary": summary[:1000],
            "raw": f"RESUME\nAlex PerfectMatch\n\nExperience:\n{desc}\n{reqs}",
            "now": datetime.datetime.utcnow()
        }
    )
    
    # Insert candidate applying to this position
    s.execute(
        sa.text("""
        INSERT INTO talent_candidates (id, organization_id, position_id, profile_id, first_name, last_name, email, phone, status, skills, applied_at, created_at, updated_at)
        VALUES (:id, :org_id, :pos_id, :prof_id, :fname, :lname, :email, :phone, 'Applied', :skills, :now, :now, :now)
        """),
        {
            "id": uuid.uuid4(),
            "org_id": org_id,
            "pos_id": posting.position_id,
            "prof_id": pid1,
            "fname": "Alex",
            "lname": "PerfectMatch",
            "email": f"alex.match.{str(pid1)[:8]}@example.com",
            "phone": "+12345678900",
            "skills": skills_text[:500],
            "now": datetime.datetime.utcnow()
        }
    )
    profiles_inserted += 1

s.commit()
print(f"Inserted {profiles_inserted} high-matching profiles.")
