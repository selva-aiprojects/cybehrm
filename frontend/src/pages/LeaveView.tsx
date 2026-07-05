import React from "react";
import { API_BASE_URL, getErrorMsg } from "../helpers/api";

interface LeaveViewPageProps {
  activeView: string;
  leaveBalances: any[];
  leaveRequests: any[];
  reqLeaveType: string;
  reqStart: string;
  reqEnd: string;
  reqReason: string;
  setReqLeaveType: (val: string) => void;
  setReqStart: (val: string) => void;
  setReqEnd: (val: string) => void;
  setReqReason: (val: string) => void;
  employees: any[];
  setActiveView: (view: string) => void;
  handleSubmitLeave: (e: React.FormEvent) => void;
  currentUser: any;
  handleLeaveAction: (id: string, action: string) => void;
  hrSelectedEmployeeId: string | null;
  setHrSelectedEmployeeId: (id: string) => void;
}

export function LeaveViewPage(props: LeaveViewPageProps) {
  const {
    activeView,
    leaveBalances,
    leaveRequests,
    reqLeaveType,
    reqStart,
    reqEnd,
    reqReason,
    setReqLeaveType,
    setReqStart,
    setReqEnd,
    setReqReason,
    employees,
    handleSubmitLeave,
    currentUser,
    handleLeaveAction,
    hrSelectedEmployeeId,
    setHrSelectedEmployeeId,
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
          <span style={{ fontSize: "32px" }}>🌴</span>
          <div>
            <h2 style={{ margin: 0 }}>Leave Planner &amp; Absence Management</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Apply for and track Casual, Sick, and Earned Leave requests. View live balance entitlements, monitor approval status, and review the organisation-wide leave calendar — all governed by grade-level accrual policies.</p>
          </div>
        </div>
      </div>
      {/* Balances widgets */}
      <div className="stats-grid" style={{ marginBottom: "32px" }}>
        {leaveBalances.map((bal) => (
          <div key={bal.id} className="glass-card stat-card" style={{ borderLeft: "4px solid var(--primary)" }}>
            <div className="stat-title">{bal.leave_type.replace("_", " ")} Leave Balance</div>
            <div className="stat-val">{bal.allocated - bal.used}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{bal.used} days requested and used</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "32px" }}>
        {/* Request form */}
        <div className="glass-card" style={{ height: "fit-content" }}>
          <h3 style={{ marginBottom: "20px" }}>Plan Time Off</h3>
          <form onSubmit={handleSubmitLeave}>
            <div className="form-group">
              <label className="form-label">Leave Type</label>
              <select className="form-control" value={reqLeaveType} onChange={(e) => setReqLeaveType(e.target.value)}>
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="earned">Earned Leave</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" className="form-control" required value={reqStart} onChange={(e) => setReqStart(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input type="date" className="form-control" required value={reqEnd} onChange={(e) => setReqEnd(e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">Reason</label>
              <textarea className="form-control" style={{ height: "80px" }} required value={reqReason} onChange={(e) => setReqReason(e.target.value)} placeholder="Detail your vacation plans..." />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              File Leave Application
            </button>
          </form>
        </div>

        {/* History and team approvals */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {currentUser?.role === "hr_admin" && (
            <div className="glass-card">
              <h3 style={{ marginBottom: "20px" }}>Team Leave Requests (Awaiting Review)</h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Duration</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.filter(r => r.status === "pending").length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>No pending leave approvals outstanding.</td>
                      </tr>
                    ) : (
                      leaveRequests.filter(r => r.status === "pending").map((req) => (
                        <tr key={req.id}>
                          <td style={{ fontWeight: 6 }}>{req.employee_name || "Employee"}</td>
                          <td style={{ textTransform: "capitalize" }}>{req.leave_type}</td>
                          <td>{req.start_date} to {req.end_date}</td>
                          <td>{req.total_days} days</td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button className="btn btn-success" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => handleLeaveAction(req.id, "approved")}>
                                Approve
                              </button>
                              <button className="btn btn-danger" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => handleLeaveAction(req.id, "rejected")}>
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="glass-card">
            <h3 style={{ marginBottom: "20px" }}>Your Application Log</h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>No vacation requests submitted yet.</td>
                    </tr>
                  ) : (
                    leaveRequests.map((req) => (
                      <tr key={req.id}>
                        <td style={{ textTransform: "capitalize", fontWeight: 6 }}>{req.leave_type}</td>
                        <td>{req.start_date} to {req.end_date}</td>
                        <td>{req.total_days} days</td>
                        <td>{req.reason}</td>
                        <td>
                          <span className={`badge ${req.status === "approved" ? "badge-success" : req.status === "pending" ? "badge-warning" : "badge-danger"}`}>
                            {req.status}
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
    </div>
  );
}
