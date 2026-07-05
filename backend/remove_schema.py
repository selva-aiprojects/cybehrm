with open("app/models/models.py", "r") as f:
    content = f.read()

# Remove __table_args__ = {"schema": "HR-Engine"}
content = content.replace('    __table_args__ = {"schema": "HR-Engine"}\n', "")

# Update Foreign Keys
content = content.replace('"HR-Engine.organizations.id"', '"organizations.id"')
content = content.replace('"HR-Engine.users.id"', '"users.id"')

with open("app/models/models.py", "w") as f:
    f.write(content)

print("Removed HR-Engine schema from models.py")
