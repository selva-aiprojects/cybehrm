import re
import os

file_path = r"d:\Training\working\HRMS\frontend\src\App.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add hrSelectedEmployeeId state
if "const [hrSelectedEmployeeId" not in content:
    state_block = """  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<any | null>(null);
  const [hrSelectedEmployeeId, setHrSelectedEmployeeId] = useState<string | null>(null);"""
    content = content.replace("  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<any | null>(null);", state_block)

# 2. Add Employee Self-Service Menu and rename HR menus
ess_menu = """
                {/* EMPLOYEE SELF-SERVICE (ESS) */}
                <div className="menu-section-label" style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }} onClick={() => toggleMenu("My Workspace")}>
                  My Workspace <span>{expandedMenus["My Workspace"] !== false ? "▼" : "▶"}</span>
                </div>
                {expandedMenus["My Workspace"] !== false && (
                  <ul className="menu-list">
                    <li className={`menu-item ${activeView === "my-attendance" ? "active" : ""}`} onClick={() => setActiveView("my-attendance")}>
                      🕒 My Attendance
                    </li>
                    <li className={`menu-item ${activeView === "my-leave" ? "active" : ""}`} onClick={() => setActiveView("my-leave")}>
                      🌴 My Leave Planner
                    </li>
                    <li className={`menu-item ${activeView === "my-payroll" ? "active" : ""}`} onClick={() => setActiveView("my-payroll")}>
                      💸 My Payroll
                    </li>
                    <li className={`menu-item ${activeView === "my-fbp-tax" ? "active" : ""}`} onClick={() => setActiveView("my-fbp-tax")}>
                      🏢 My Tax & FBP
                    </li>
                    <li className={`menu-item ${activeView === "my-insurance" ? "active" : ""}`} onClick={() => setActiveView("my-insurance")}>
                      🛡️ My Insurance
                    </li>
                    <li className={`menu-item ${activeView === "my-car-lease" ? "active" : ""}`} onClick={() => setActiveView("my-car-lease")}>
                      🚗 My Car Lease
                    </li>
                    <li className={`menu-item ${activeView === "my-offboarding" ? "active" : ""}`} onClick={() => setActiveView("my-offboarding")}>
                      🚪 My Exit
                    </li>
                  </ul>
                )}

                {/* HR MANAGEMENT */}"""

if "{/* EMPLOYEE SELF-SERVICE (ESS) */}" not in content:
    content = content.replace("{/* HR MANAGEMENT */}", ess_menu)

# Update HR Management links to be org-*
hr_menu_replacements = [
    ('setActiveView("attendance")', 'setActiveView("org-attendance")'),
    ('activeView === "attendance"', 'activeView === "org-attendance"'),
    ('setActiveView("leave")', 'setActiveView("org-leave")'),
    ('activeView === "leave"', 'activeView === "org-leave"'),
    ('setActiveView("payroll")', 'setActiveView("org-payroll")'),
    ('activeView === "payroll"', 'activeView === "org-payroll"'),
    ('setActiveView("fbp-tax")', 'setActiveView("org-fbp-tax")'),
    ('activeView === "fbp-tax"', 'activeView === "org-fbp-tax"'),
    ('setActiveView("insurance")', 'setActiveView("org-insurance")'),
    ('activeView === "insurance"', 'activeView === "org-insurance"'),
    ('setActiveView("car-lease")', 'setActiveView("org-car-lease")'),
    ('activeView === "car-lease"', 'activeView === "org-car-lease"'),
]

# We only want to replace these inside the HR Management block.
# So we'll slice it.
idx_hr_start = content.find("{/* HR MANAGEMENT */}")
idx_rec_start = content.find("{/* RECRUITMENT */}")
if idx_hr_start != -1 and idx_rec_start != -1:
    hr_block = content[idx_hr_start:idx_rec_start]
    for old, new in hr_menu_replacements:
        hr_block = hr_block.replace(old, new)
    content = content[:idx_hr_start] + hr_block + content[idx_rec_start:]

# 3. Update activeView checks for rendering components
view_checks = {
    '{activeView === "attendance" && (': '{["attendance", "my-attendance", "org-attendance"].includes(activeView) && (',
    '{activeView === "leave" && (': '{["leave", "my-leave", "org-leave"].includes(activeView) && (',
    '{activeView === "payroll" && (': '{["payroll", "my-payroll", "org-payroll"].includes(activeView) && (',
    '{activeView === "fbp-tax" && (': '{["fbp-tax", "my-fbp-tax", "org-fbp-tax"].includes(activeView) && (',
    '{activeView === "insurance" && (': '{["insurance", "my-insurance", "org-insurance"].includes(activeView) && (',
    '{activeView === "car-lease" && (': '{["car-lease", "my-car-lease", "org-car-lease"].includes(activeView) && (',
    '{activeView === "offboarding" && (': '{["offboarding", "my-offboarding", "org-offboarding"].includes(activeView) && (',
}

for old, new in view_checks.items():
    content = content.replace(old, new)

# 4. Inject the HR Search dropdown at the top of the views
hr_search_ui = """          <div className="animated">
            {activeView.startsWith("org-") && (
              <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
                <select 
                  className="form-control" 
                  style={{ maxWidth: "400px" }}
                  value={hrSelectedEmployeeId || ""}
                  onChange={(e) => setHrSelectedEmployeeId(e.target.value)}
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            )}"""

content = content.replace('          <div className="animated">', hr_search_ui)

# Fix fetch logic by passing employee_id in URL
# E.g. fetch(`${API_BASE_URL}/attendance/me`) -> fetch(`${API_BASE_URL}/attendance/me${activeView.startsWith('org-') && hrSelectedEmployeeId ? `?employee_id=${hrSelectedEmployeeId}` : ''}`)

fetch_urls = [
    ('fetch(`${API_BASE_URL}/attendance/me`', 'fetch(`${API_BASE_URL}/attendance/me${activeView.startsWith("org-") && hrSelectedEmployeeId ? `?employee_id=${hrSelectedEmployeeId}` : ""}`'),
    ('fetch(`${API_BASE_URL}/leave/balance`', 'fetch(`${API_BASE_URL}/leave/balance${activeView.startsWith("org-") && hrSelectedEmployeeId ? `?employee_id=${hrSelectedEmployeeId}` : ""}`'),
    ('fetch(`${API_BASE_URL}/leave/requests`', 'fetch(`${API_BASE_URL}/leave/requests${activeView.startsWith("org-") && hrSelectedEmployeeId ? `?employee_id=${hrSelectedEmployeeId}` : ""}`'),
    ('fetch(`${API_BASE_URL}/payroll/payslips`', 'fetch(`${API_BASE_URL}/payroll/payslips${activeView.startsWith("org-") && hrSelectedEmployeeId ? `?employee_id=${hrSelectedEmployeeId}` : ""}`'),
    ('fetch(`${API_BASE_URL}/payroll/tax-declarations`', 'fetch(`${API_BASE_URL}/payroll/tax-declarations${activeView.startsWith("org-") && hrSelectedEmployeeId ? `?employee_id=${hrSelectedEmployeeId}` : ""}`'),
]

for old, new in fetch_urls:
    content = content.replace(old, new)

# 5. Fix useEffect dependencies to include hrSelectedEmployeeId
# E.g. }, [currentUser, activeView]); -> }, [currentUser, activeView, hrSelectedEmployeeId]);
content = content.replace("}, [currentUser, activeView]);", "}, [currentUser, activeView, hrSelectedEmployeeId]);")

# Update allowed views in isViewAllowed
allowed_views_old = """    ].includes(activeView);"""
allowed_views_new = """      "my-attendance", "my-leave", "my-payroll", "my-fbp-tax", "my-insurance", "my-car-lease", "my-offboarding",
      "org-attendance", "org-leave", "org-payroll", "org-fbp-tax", "org-insurance", "org-car-lease", "org-offboarding"
    ].includes(activeView);"""

content = content.replace(allowed_views_old, allowed_views_new)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("App.tsx patched successfully!")
