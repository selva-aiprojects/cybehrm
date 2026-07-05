import re

def fix_schemas():
    with open('app/schemas/schemas.py', 'r') as f:
        content = f.read()
    
    # We want to remove `organization_id: UUID` or `organization_id: Optional[UUID]` 
    # from all schemas EXCEPT UserResponse, SupportTicketCreate, SupportTicketUpdate, SupportTicketResponse, 
    # OrganizationResponse, TenantRegister, ShardResponse.
    
    # Let's just find all classes and process them line by line
    lines = content.split('\n')
    new_lines = []
    
    keep_org_classes = [
        'User', 'UserResponse', 'SupportTicket', 'SupportTicketCreate', 
        'SupportTicketUpdate', 'SupportTicketResponse', 'Organization', 
        'OrganizationResponse', 'TenantRegister', 'ShardResponse', 'UserLogin'
    ]
    
    current_class = None
    
    for line in lines:
        class_match = re.match(r'^class (\w+)\(.*\):', line)
        if class_match:
            current_class = class_match.group(1)
            
        if 'organization_id:' in line:
            # check if we should keep it
            should_keep = False
            if current_class:
                for kc in keep_org_classes:
                    if kc in current_class:
                        should_keep = True
                        break
            
            if not should_keep:
                # print(f"Removing from {current_class}: {line}")
                continue # Skip adding this line
                
        new_lines.append(line)
        
    with open('app/schemas/schemas.py', 'w') as f:
        f.write('\n'.join(new_lines))

if __name__ == '__main__':
    fix_schemas()
    print("Fixed schemas.py")
