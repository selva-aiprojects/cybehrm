import sqlite3
import bcrypt

# Generate a fresh, valid bcrypt hash for "Password123"
raw_password = b"Password123"
salt = bcrypt.gensalt(rounds=12)
fresh_hash = bcrypt.hashpw(raw_password, salt).decode('utf-8')
print("Generated fresh hash:", fresh_hash)
print("Verifying fresh hash:", bcrypt.checkpw(raw_password, fresh_hash.encode('utf-8')))

# 1. Update SQLite Database
db_path = "cybehrm.db"
print(f"Updating {db_path} users with fresh password hash...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("UPDATE users SET password_hash = ?", (fresh_hash,))
conn.commit()
print("Updated rows in users table:", cursor.rowcount)
conn.close()

# 2. Update db/seed.sql
seed_path = "../db/seed.sql"
print(f"Updating {seed_path} with fresh password hash...")
with open(seed_path, "r", encoding="utf-8") as f:
    seed_content = f.read()

# Replace the hash comment and occurrences
old_hash = "$2b$12$Epf9.1K14D415J/o576B3Osh/P4n1Nskz4W2P3G/UvS6kK8XGgL52"
updated_content = seed_content.replace(old_hash, fresh_hash)

with open(seed_path, "w", encoding="utf-8") as f:
    f.write(updated_content)
print("Updated seed.sql successfully!")
