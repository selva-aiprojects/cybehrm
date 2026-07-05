import React from "react";
import { DepartmentTree } from "./OrgComponents";

interface OrgStructurePageProps {
  employees: any[];
  hrSelectedEmployeeId: string | null;
  setHrSelectedEmployeeId: (id: string | null) => void;
  setActiveView: (view: string) => void;
  functionalTitles: any[];
}

export function OrgStructurePage({ employees, setHrSelectedEmployeeId, setActiveView, functionalTitles }: OrgStructurePageProps) {
  const grouped: Record<string, any[]> = {};
  employees.forEach((emp) => {
    const dept = emp.department_id || "Unassigned";
    if (!grouped[dept]) grouped[dept] = [];
    grouped[dept].push(emp);
  });
  const sortedDepts = Object.keys(grouped).sort();
  const handleSelectEmployee = (id: string) => {
    setHrSelectedEmployeeId(id);
    setActiveView("attendance");
  };
  return (
    <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="glass-card" style={{ background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.06) 0%, rgba(var(--accent-rgb),0.03) 100%)", border: "1px solid rgba(var(--primary-rgb),0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "32px" }}>&#x1F3D7;&#xFE0F;</span>
          <div>
            <h2 style={{ margin: 0 }}>Org Structure</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Organizational hierarchy by department \u2014 tree view with grade-based levels and connecting lines.</p>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
        <div className="glass-card" style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--primary)" }}>{sortedDepts.length}</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Departments</div>
        </div>
        <div className="glass-card" style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent)" }}>{employees.length}</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Total Employees</div>
        </div>
        <div className="glass-card" style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#f59e0b" }}>{(employees.length / Math.max(sortedDepts.length, 1)).toFixed(1)}</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Avg / Dept</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "24px", overflowX: "auto", padding: "8px 4px 20px", scrollBehavior: "smooth" }}>
        {sortedDepts.map((dept) => (
          <div key={dept} className="glass-card" style={{ padding: "24px 28px", background: "linear-gradient(160deg, rgba(var(--primary-rgb),0.03) 0%, rgba(var(--accent-rgb),0.02) 100%)", border: "1px solid var(--border-color)", minWidth: "max-content", flexShrink: 0, borderRadius: "16px" }}>
            <DepartmentTree dept={dept} employees={grouped[dept]} functionalTitles={functionalTitles} onSelectEmployee={handleSelectEmployee} />
          </div>
        ))}
        {sortedDepts.length === 0 && (
          <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", width: "100%" }}>No departments found.</div>
        )}
      </div>
    </div>
  );
}
