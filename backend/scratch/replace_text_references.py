import os

replacements = {
    "whitekraaft.com": "orient-ts.com",
    "whitekraaft": "orient-ts",
    "Whitekraaft Solutions": "Orient Technology Solutions",
    "Whitekraaft Inc": "Orient Technology Solutions Inc",
    "Whitekraaft": "Orient",
    "WHITEKRAAFT": "ORIENT"
}

files_to_update = [
    "test_talent_apis.py",
    "test_render_login.py",
    "test_me_route.py",
    "test_local_login.py",
    "test_delay.py",
    "test_db_login.py",
    "seed_rich_profiles.py",
    "seed_realistic_candidates.py",
    "seed_onboarding.py",
    "seed_demo_data.py",
    "seed_complete_flow.py",
    "scratch/verify_mobile_endpoints.py",
    "scratch/test_prod_jwt.py",
    "scratch/test_prod_employees.py",
    "scratch/test_leave_request.py",
    "scratch/test_dashboard_metrics.py",
    "scratch/force_clear_whitekraaft.py",
    "scratch/fix_admin_employee.py",
    "scratch/check_whitekraaft_schema.py",
    "scratch/check_whitekraaft.py",
    "scratch/check_rmg_data.py",
    "scratch/check_render_time.py",
    "scratch/check_counts.py",
    "scratch/check_admin_employee.py",
    "add_high_match_profiles.py"
]

backend_dir = "d:/Training/working/HRMS/backend"
for filename in files_to_update:
    path = os.path.join(backend_dir, filename)
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            orig = content
            # Do replacements in correct order (longest key first to prevent partial matches)
            sorted_keys = sorted(replacements.keys(), key=len, reverse=True)
            for k in sorted_keys:
                content = content.replace(k, replacements[k])
            
            if content != orig:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Updated {filename}")
        except Exception as e:
            print(f"Error updating {filename}: {e}")
