import React from "react";
import { API_BASE_URL } from "../helpers/api";

export function PayslipsPage(props: {
  myPayslips: any[];
  currentEmployee: any;
  token: string;
  setActiveView: (view: string) => void;
}) {
  const { myPayslips } = props;

  return (
    <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="glass-card" style={{
        background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.06) 0%, rgba(var(--accent-rgb),0.03) 100%)",
        border: "1px solid rgba(var(--primary-rgb),0.15)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "32px" }}>📋</span>
          <div>
            <h2 style={{ margin: 0 }}>My Payslips</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>View and download your monthly payslips, tax deductions, and salary breakdowns.</p>
          </div>
        </div>
      </div>

      {myPayslips.length > 0 && (() => {
        const latest = myPayslips[0];
        const netPay = latest.net_pay || latest.total_net || 0;
        const grossPay = latest.gross_pay || latest.total_earnings || 0;
        const deductions = latest.total_deductions || 0;
        const breakdown = latest.breakdown || latest.earnings || {};
        return (
          <div className="glass-card" style={{
            background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.06), rgba(var(--accent-rgb),0.04))",
            border: "1px solid rgba(var(--primary-rgb),0.12)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "20px" }}>{latest.pay_period || latest.month || "Current Month"}</h3>
                <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>Generated {latest.generated_at || latest.created_at || "—"}</div>
              </div>
              <button className="btn btn-primary" style={{ padding: "8px 20px" }}
                onClick={() => window.open(latest.pdf_url || `${API_BASE_URL}/payroll/payslips/${latest.id}/download`, "_blank")}
              >📥 Download PDF</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <div style={{ textAlign: "center", padding: "16px", borderRadius: "var(--radius-sm)", background: "rgba(16,185,129,0.06)" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Net Pay</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#10b981", marginTop: "4px" }}>₹{(netPay || 0).toLocaleString("en-IN")}</div>
              </div>
              <div style={{ textAlign: "center", padding: "16px", borderRadius: "var(--radius-sm)", background: "rgba(var(--primary-rgb),0.06)" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Gross Pay</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--primary)", marginTop: "4px" }}>₹{(grossPay || 0).toLocaleString("en-IN")}</div>
              </div>
              <div style={{ textAlign: "center", padding: "16px", borderRadius: "var(--radius-sm)", background: "rgba(239,68,68,0.06)" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Deductions</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#ef4444", marginTop: "4px" }}>₹{(deductions || 0).toLocaleString("en-IN")}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>📈 Earnings</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {(Object.entries(breakdown) as [string, number][]).filter(([, v]) => v > 0).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "4px 0", borderBottom: "1px solid rgba(var(--border-rgb),0.3)" }}>
                      <span style={{ color: "var(--text-muted)" }}>{k.replace(/_/g, " ")}</span>
                      <span style={{ fontWeight: 600 }}>₹{(v || 0).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "#ef4444", display: "flex", alignItems: "center", gap: "6px" }}>📉 Deductions</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {(Object.entries(latest.deductions_breakdown || latest.deductions || {}) as [string, number][]).filter(([, v]) => v > 0).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "4px 0", borderBottom: "1px solid rgba(var(--border-rgb),0.3)" }}>
                      <span style={{ color: "var(--text-muted)" }}>{k.replace(/_/g, " ")}</span>
                      <span style={{ fontWeight: 600 }}>₹{(v || 0).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="glass-card">
        <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>📚</span> All Payslips
          <span style={{ fontSize: "13px", fontWeight: 400, color: "var(--text-muted)", marginLeft: "4px" }}>({myPayslips.length})</span>
        </h3>
        {myPayslips.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px", opacity: 0.5 }}>📋</div>
            <div>No payslips available yet. Payslips are generated after each payroll run.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
            {myPayslips.map((ps, i) => {
              const np = ps.net_pay || ps.total_net || 0;
              const gp = ps.gross_pay || ps.total_earnings || 0;
              return (
                <div key={ps.id || i} style={{
                  padding: "16px", borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)", background: "rgba(var(--primary-rgb),0.02)",
                  display: "flex", flexDirection: "column", gap: "8px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: "15px" }}>{ps.pay_period || ps.month || `Period #${i + 1}`}</span>
                    <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: "11px" }}
                      onClick={() => window.open(ps.pdf_url || `${API_BASE_URL}/payroll/payslips/${ps.id}/download`, "_blank")}
                    >📥 PDF</button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Net Pay</span>
                    <span style={{ fontWeight: 700, color: "#10b981" }}>₹{(np || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Gross</span>
                    <span style={{ fontWeight: 600 }}>₹{(gp || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Status</span>
                    <span className="badge" style={{
                      fontSize: "10px", fontWeight: 700,
                      background: ps.status === "paid" || ps.status === "generated" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                      color: ps.status === "paid" || ps.status === "generated" ? "#10b981" : "#f59e0b"
                    }}>{ps.status || "Generated"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
