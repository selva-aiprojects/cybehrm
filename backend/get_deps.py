with open("app/routers/erp_masters.py", "r") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "def get_departments(" in line or "def list_departments(" in line:
            print("".join(lines[i:i+10]))
