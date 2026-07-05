import React from "react";
import { API_BASE_URL, getErrorMsg } from "../helpers/api";

export function PayrollViewPage(props: {
  activeView: string;
  payrollRuns: any[];
  myPayslips: any[];
  runMonth: number;
  runYear: number;
  ssEmployeeId: string;
  ssBasic: string;
  ssHra: string;
  ssAllowances: string;
  ssPf: string;
  ssTax: string;
  ssNps: string;
  ssCustomDeductionsText: string;
  setRunMonth: (v: number) => void;
  setRunYear: (v: number) => void;
  setSsEmployeeId: (v: string) => void;
  setSsBasic: (v: string) => void;
  setSsHra: (v: string) => void;
  setSsAllowances: (v: string) => void;
  setSsPf: (v: string) => void;
  setSsTax: (v: string) => void;
  setSsNps: (v: string) => void;
  setSsCustomDeductionsText: (v: string) => void;
  employees: any[];
  leaveBalances: any[];
  token: string;
  setActiveView: (v: string) => void;
  handleSubmitPayrollRun: (e: React.FormEvent) => void;
  handleSubmitSalaryStructure: (e: React.FormEvent) => void;
  currentUser?: any;
  hrSelectedEmployeeId?: string;
  setHrSelectedEmployeeId?: (v: string) => void;
}) {
  const {
    activeView, payrollRuns, myPayslips, runMonth, runYear,
    ssEmployeeId, ssBasic, ssHra, ssAllowances, ssPf, ssTax, ssNps, ssCustomDeductionsText,
    setRunMonth, setRunYear, setSsEmployeeId, setSsBasic, setSsHra, setSsAllowances,
    setSsPf, setSsTax, setSsNps, setSsCustomDeductionsText,
    employees, token, setActiveView, handleSubmitPayrollRun, handleSubmitSalaryStructure,
    currentUser, hrSelectedEmployeeId, setHrSelectedEmployeeId,
  } = props;

  return (
    <>
      {["payroll", "my-payroll", "org-payroll"].includes(activeView) && (
        <div className="animated">
          {activeView.startsWith("org-") && (
            <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
              <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
              <select
                className="form-control"
                style={{ maxWidth: "400px" }}
                value={hrSelectedEmployeeId || ""}
                onChange={(e) => setHrSelectedEmployeeId && setHrSelectedEmployeeId(e.target.value)}
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
              <span style={{ fontSize: "32px" }}>💸</span>
              <div>
                <h2 style={{ margin: 0 }}>Payroll Processing &amp; Compensation Fintech</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Run monthly payroll batches with full statutory deduction computation (EPF 12%, Professional Tax slabs, TDS). Configure individual salary structures with Basic, HRA, and Allowances, and download itemised payslips for every employee.</p>
              </div>
            </div>
          </div>
          {currentUser?.role === "hr_admin" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: "32px" }}>
              <div style={{ display: "flex", alignSelf: "flex-start", flexDirection: "column", gap: "32px" }}>
                <div className="glass-card">
                  <h3 style={{ marginBottom: "20px" }}>Trigger Monthly Payroll Batch</h3>
                  <form onSubmit={handleSubmitPayrollRun}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">Month</label>
                        <select className="form-control" value={runMonth} onChange={(e) => setRunMonth(Number(e.target.value))}>
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString(undefined, { month: 'long' })}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Year</label>
                        <input type="number" className="form-control" required value={runYear} onChange={(e) => setRunYear(Number(e.target.value))} />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }}>
                      Run Payroll Computations
                    </button>
                  </form>
                </div>

                <div className="glass-card">
                  <h3 style={{ marginBottom: "20px" }}>Configure Employee Salary Structure</h3>
                  <form onSubmit={handleSubmitSalaryStructure}>
                    <div className="form-group">
                      <label className="form-label">Select Employee Profile</label>
                      <select className="form-control" value={ssEmployeeId} onChange={(e) => setSsEmployeeId(e.target.value)}>
                        <option value="">-- Select --</option>
                        {employees.map((e) => (
                          <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_id})</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">Basic Salary ($)</label>
                        <input type="number" className="form-control" value={ssBasic} onChange={(e) => setSsBasic(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">HRA Allowance ($)</label>
                        <input type="number" className="form-control" value={ssHra} onChange={(e) => setSsHra(e.target.value)} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">Other Allowances ($)</label>
                        <input type="number" className="form-control" value={ssAllowances} onChange={(e) => setSsAllowances(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">PF Deduction ($)</label>
                        <input type="number" className="form-control" value={ssPf} onChange={(e) => setSsPf(e.target.value)} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">Professional Tax Deduction ($)</label>
                        <input type="number" className="form-control" value={ssTax} onChange={(e) => setSsTax(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">NPS Deduction ($)</label>
                        <input type="number" className="form-control" value={ssNps} onChange={(e) => setSsNps(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Custom Deductions (Format: Name:Amount, Name2:Amount2)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Gym:500, Meal Card:1000"
                        value={ssCustomDeductionsText}
                        onChange={(e) => setSsCustomDeductionsText(e.target.value)}
                      />
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                        Separate multiple custom items with commas. Example: Gym:500, Meal Card:1200
                      </span>
                    </div>

                    <button type="submit" className="btn btn-secondary" style={{ width: "100%", marginTop: "8px" }}>
                      Save Salary Structure
                    </button>
                  </form>
                </div>
              </div>

              <div className="glass-card">
                <h3 style={{ marginBottom: "20px" }}>Processed Payroll Runs</h3>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Batch Period</th>
                        <th>Status</th>
                        <th>Processed Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollRuns.length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ textAlign: "center", color: "var(--text-muted)" }}>No payroll runs processed yet. Use the run tool to calculate.</td>
                        </tr>
                      ) : (
                        payrollRuns.map((run) => (
                          <tr key={run.id}>
                            <td style={{ fontWeight: 6 }}>{run.month}/{run.year}</td>
                            <td><span className="badge badge-success">{run.status}</span></td>
                            <td>{new Date(run.processed_at).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card animated">
              <h3 style={{ marginBottom: "20px" }}>Your Historical Payslips</h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Basic</th>
                      <th>HRA</th>
                      <th>Allowances</th>
                      <th>PF</th>
                      <th>NPS</th>
                      <th>PT</th>
                      <th>TDS</th>
                      <th>Other Ded</th>
                      <th>Net Salary</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myPayslips.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: "center", color: "var(--text-muted)" }}>No payslips generated for your profile yet.</td>
                      </tr>
                    ) : (
                      myPayslips.map((p) => {
                        const customDeductionsSum = p.custom_deductions
                          ? Object.values(p.custom_deductions).reduce((sum: number, val: any) => sum + Number(val || 0), 0)
                          : 0;
                        const customTooltip = p.custom_deductions
                          ? Object.entries(p.custom_deductions)
                              .map(([k, v]) => `${k}: $${v}`)
                              .join(", ")
                          : "";
                        return (
                          <tr key={p.id}>
                            <td>${p.basic}</td>
                            <td>${p.hra}</td>
                            <td>${p.allowances}</td>
                            <td>${p.pf}</td>
                            <td>${p.nps || 0}</td>
                            <td>${p.professional_tax || 0}</td>
                            <td>${p.tax}</td>
                            <td title={customTooltip} style={{ cursor: customTooltip ? "help" : "default" }}>
                              ${customDeductionsSum} {customTooltip && "ℹ️"}
                            </td>
                            <td style={{ fontWeight: 7, color: "var(--primary)" }}>${p.net_salary}</td>
                            <td><span className="badge badge-success">{p.status}</span></td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
