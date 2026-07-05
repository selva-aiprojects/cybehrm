import React from "react";

export function ShiftManagementPage(props: {
  shiftActiveTab: string;
  setShiftActiveTab: (tab: string) => void;
  shiftAssignEmpId: string;
  setShiftAssignEmpId: (id: string) => void;
  shiftAssignTarget: string;
  setShiftAssignTarget: (target: string) => void;
  shiftRoster: Record<string, string[]>;
  setShiftRoster: (roster: any) => void;
  employees: any[];
  functionalTitles: any[];
}) {
  const {
    shiftActiveTab, setShiftActiveTab, shiftAssignEmpId, setShiftAssignEmpId,
    shiftRoster, setShiftRoster, employees, functionalTitles
  } = props;

  return (
    <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="glass-card" style={{
        background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.06) 0%, rgba(var(--accent-rgb),0.03) 100%)",
        border: "1px solid rgba(var(--primary-rgb),0.15)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "32px" }}>⏰</span>
          <div>
            <h2 style={{ margin: 0 }}>Shift Management</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Configure and assign work shifts, rotas, and schedules across teams and departments.</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
        {[
          { name: "General", icon: "🔄", count: employees.filter(e => !e.current_shift || e.current_shift === "General").length, color: "var(--primary)" },
          { name: "Morning (6AM-2PM)", icon: "🌅", count: employees.filter(e => e.current_shift === "Morning").length, color: "#f59e0b" },
          { name: "Evening (2PM-10PM)", icon: "🌇", count: employees.filter(e => e.current_shift === "Evening").length, color: "#f97316" },
          { name: "Night (10PM-6AM)", icon: "🌙", count: employees.filter(e => e.current_shift === "Night").length, color: "#6366f1" },
        ].map((shift, i) => (
          <div key={i} className="glass-card" style={{
            textAlign: "center", padding: "20px", cursor: "pointer", transition: "all 0.15s",
            border: shiftActiveTab === shift.name ? `2px solid ${shift.color}` : "1px solid var(--border-color)"
          }}
            onClick={() => setShiftActiveTab(shift.name)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = shift.color; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = shiftActiveTab === shift.name ? shift.color : "var(--border-color)"; }}
          >
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{shift.icon}</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: shift.color }}>{shift.count}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{shift.name}</div>
          </div>
        ))}
      </div>

      <div className="glass-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>👥</span> Employees — {shiftActiveTab}
          </h3>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select className="form-control" style={{ padding: "6px 10px", fontSize: "13px" }} value={shiftAssignEmpId} onChange={e => setShiftAssignEmpId(e.target.value)}>
              <option value="">Assign employee...</option>
              {employees.filter(e => !shiftRoster[shiftActiveTab]?.includes(e.id || "")).map(emp => (
                <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
              ))}
            </select>
            <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: "13px" }}
              disabled={!shiftAssignEmpId}
              onClick={() => {
                if (!shiftAssignEmpId) return;
                setShiftRoster((prev: Record<string, string[]>) => ({
                  ...prev,
                  [shiftActiveTab]: [...(prev[shiftActiveTab] || []), shiftAssignEmpId]
                }));
                setShiftAssignEmpId("");
              }}
            >+ Assign</button>
          </div>
        </div>
        {(!shiftRoster[shiftActiveTab] || shiftRoster[shiftActiveTab].length === 0) ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px", opacity: 0.5 }}>👥</div>
            <div>No employees assigned to this shift yet.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
            {shiftRoster[shiftActiveTab].map(empId => {
              const emp = employees.find(e => e.id === empId);
              if (!emp) return null;
              const initials = (emp.first_name?.[0] || "") + (emp.last_name?.[0] || "");
              const funcTitle = functionalTitles.find(t => t.id === emp.functional_title_id);
              return (
                <div key={empId} style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px",
                  borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)",
                  background: "rgba(var(--primary-rgb),0.02)"
                }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                    background: "var(--grad-brand)", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 700, color: "#fff"
                  }}>{initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "13px" }}>{emp.first_name} {emp.last_name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{funcTitle?.name || emp.designation_id || "—"}</div>
                  </div>
                  <button style={{
                    background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
                    padding: "4px", borderRadius: "50%", fontSize: "16px", lineHeight: 1
                  }}
                    onClick={() => setShiftRoster((prev: Record<string, string[]>) => ({
                      ...prev,
                      [shiftActiveTab]: prev[shiftActiveTab].filter((id: string) => id !== empId)
                    }))}
                    title="Remove from shift"
                  >✕</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>📅</span> Weekly Schedule Overview
        </h3>
        <div style={{ display: "flex", gap: "4px", alignItems: "end", height: "120px", padding: "20px 0 0" }}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
            const assignedCount = Object.values(shiftRoster).flat().length;
            const height = Math.max(20, assignedCount > 0 ? (assignedCount / 7) * 80 * (1 + Math.sin(i * 1.2) * 0.3) : 20);
            return (
              <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{Math.round(height / 10)}</div>
                <div style={{
                  width: "100%", height: `${height}px`, borderRadius: "6px 6px 0 0",
                  background: `linear-gradient(180deg, var(--primary), rgba(var(--primary-rgb),0.4))`,
                  opacity: 0.4 + (i < 5 ? 0.6 : 0),
                  transition: "height 0.3s"
                }} />
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>{day}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
