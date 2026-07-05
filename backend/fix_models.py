import re

with open('app/models/models.py', 'r') as f:
    content = f.read()

classes_to_skip = ['Organization', 'User', 'SupportTicket']

def replacer(match):
    class_name = match.group(2)
    if class_name in classes_to_skip:
        return match.group(0)
    
    # insert organization_id after id = Column...
    id_pattern = r"(    id = Column\(UUID\(as_uuid=True\), primary_key=True, default=uuid\.uuid4\)\n)"
    
    def id_repl(m):
        return m.group(1) + '    organization_id = Column(UUID(as_uuid=True), ForeignKey("HR-Engine.organizations.id", ondelete="CASCADE"), nullable=False)\n'
        
    new_body = re.sub(id_pattern, id_repl, match.group(0))
    return new_body

# Find all classes that inherit from Base
pattern = r"(class ([A-Za-z0-9_]+)\(Base\):[\s\S]*?(?=\nclass |\Z))"

new_content = re.sub(pattern, replacer, content)

with open('app/models/models.py', 'w') as f:
    f.write(new_content)

print("Done fixing models")
