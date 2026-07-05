import os
import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv('DATABASE_URL').replace('+asyncpg', '')
engine = sa.create_engine(db_url)
Session = sessionmaker(engine)
s = Session()

import os
import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv('DATABASE_URL').replace('+asyncpg', '')
engine = sa.create_engine(db_url)
Session = sessionmaker(engine)
s = Session()

import os
import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv('DATABASE_URL').replace('+asyncpg', '')
engine = sa.create_engine(db_url)
Session = sessionmaker(engine)
s = Session()

print("--- Users with Talent/Recruiter Roles ---")
users = s.execute(sa.text("SELECT id, email, organization_id, role FROM users WHERE role IN ('Talent Team', 'recruiter')")).fetchall()
for u in users:
    print(f"User ID: {u[0]} | Email: {u[1]} | Org ID: {u[2]} | Role: {u[3]}")






print("\n--- Talent Profiles Count ---")
count_total = s.execute(sa.text("SELECT count(*) FROM talent_profiles")).scalar()
print(f"Total Talent Profiles: {count_total}")

print("\n--- Talent Profiles Grouped by Org ---")
grouped = s.execute(sa.text("SELECT organization_id, count(*) FROM talent_profiles GROUP BY organization_id")).fetchall()
for row in grouped:
    print(f"Org ID: {row[0]} | Count: {row[1]}")

print("\n--- Sample Profiles ---")
samples = s.execute(sa.text("SELECT first_name, last_name, email, organization_id FROM talent_profiles LIMIT 5")).fetchall()
for row in samples:
    print(f"Name: {row[0]} {row[1]} | Email: {row[2]} | Org ID: {row[3]}")
