import React from "react";
import { API_BASE_URL, getErrorMsg } from "../helpers/api";

interface AttendanceViewPageProps {
  activeView: string;
  myAttendance: any[];
  isCheckedIn: boolean;
  currentEmployee: any;
  activities: any[];
  activitiesLoading: boolean;
  token: string | null;
  hrSelectedEmployeeId: string | null;
  setActiveView: (view: string) => void;
  attendanceAnalytics: any;
  setHrSelectedEmployeeId: (id: string) => void;
  employees: any[];
  handleClockIn: () => void;
  handleClockOut: () => void;
}

function AttendanceTrendIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function AttendanceMiniDay({ label, active }: { label: string; active: boolean }) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 10, fontWeight: 700,
      background: active ? "var(--primary)" : "rgba(var(--primary-rgb),0.08)",
      color: active ? "#fff" : "var(--text-muted)"
    }}>
      {label}
    </div>
  );
}

export function AttendanceViewPage(props: AttendanceViewPageProps) {
  const {
    activeView,
    myAttendance,
    isCheckedIn,
    hrSelectedEmployeeId,
    setHrSelectedEmployeeId,
    employees,
    handleClockIn,
    handleClockOut,
  } = props;

  return (
    <div className="animated">
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
      )}
      <div className="glass-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "32px" }}>🕒</span>
          <div>
            <h2 style={{ margin: 0 }}>Attendance &amp; Shift Management</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Geo-verified clock-in/clock-out with automatic late arrival detection, overtime computation, and a full month-wise daily attendance log for each employee.</p>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "32px" }}>
        <div className="glass-card" style={{ height: "fit-content", textAlign: "center", padding: "40px 24px" }}>
          <div style={{ fontSize: "56px", marginBottom: "8px" }}>🕒</div>
          <h2 style={{ fontFamily: "var(--font-heading)" }}>Clock In / Clock Out</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "32px" }}>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {!isCheckedIn ? (
            <div>
              <button className="btn btn-primary" style={{ padding: "20px 48px", borderRadius: "50px", fontSize: "18px" }} onClick={handleClockIn}>
                Clock In Shift
              </button>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "16px" }}>Shift standard limits start: 09:00 AM</p>
            </div>
          ) : (
            <div>
              <button className="btn btn-danger" style={{ padding: "20px 48px", borderRadius: "50px", fontSize: "18px" }} onClick={handleClockOut}>
                Clock Out Shift
              </button>
              <p style={{ fontSize: "12px", color: "var(--success)", fontWeight: 6, marginTop: "16px" }}>You are currently clocked in. Have a great shift!</p>
            </div>
          )}
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: "20px" }}>Clock History (This Month)</h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>No clock sessions logged for this month.</td>
                  </tr>
                ) : (
                  myAttendance.map((att) => (
                    <tr key={att.id}>
                      <td>{att.date}</td>
                      <td>{att.check_in ? new Date(att.check_in).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : "—"}</td>
                      <td>{att.check_out ? new Date(att.check_out).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : "—"}</td>
                      <td>{att.work_minutes ? `${Math.floor(att.work_minutes / 60)}h ${att.work_minutes % 60}m` : "Active"}</td>
                      <td>
                        <span className={`badge ${att.status === "present" ? "badge-success" : att.status === "half_day" ? "badge-warning" : "badge-danger"}`}>
                          {att.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
