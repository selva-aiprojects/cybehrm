import sqlite3

try:
    conn = sqlite3.connect('hrms-engine.db')
    cursor = conn.cursor()
    cursor.execute("ALTER TABLE talent_candidates ADD COLUMN profile_id CHAR(32);")
    cursor.execute("ALTER TABLE talent_candidates ADD COLUMN match_score DECIMAL(5, 2);")
    conn.commit()
    print("Database altered successfully")
except Exception as e:
    print(f"Error altering database (probably already added): {e}")
finally:
    if conn:
        conn.close()
