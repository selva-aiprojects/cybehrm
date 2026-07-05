import React from "react";
import { API_BASE_URL, getErrorMsg } from "../helpers/api";

export function InsurancePage(props: {
  insuranceEnrollment: any;
  insTier: string;
  setInsTier: (v: string) => void;
  insHasSpouse: boolean;
  setInsHasSpouse: (v: boolean) => void;
  insHasParents: boolean;
  setInsHasParents: (v: boolean) => void;
  insChildrenCount: number;
  setInsChildrenCount: (v: number) => void;
  insTopUp: number;
  setInsTopUp: (v: number) => void;
  token: string;
  handleSubmitInsuranceEnrollment: (e: React.FormEvent) => void;
  activeView?: string;
  currentUser?: any;
}) {
  const {
    insuranceEnrollment, insTier, setInsTier, insHasSpouse, setInsHasSpouse,
    insHasParents, setInsHasParents, insChildrenCount, setInsChildrenCount,
    insTopUp, setInsTopUp, token, handleSubmitInsuranceEnrollment,
    activeView, currentUser,
  } = props;

  return (
    <>
      {activeView && ["insurance", "my-insurance", "org-insurance"].includes(activeView) && (
        <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <div className="glass-card">
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "32px" }}>🛡️</span>
              <div>
                <h2 style={{ margin: 0 }}>Group Health Insurance &amp; Dependent Coverage</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Enrol in your organisation's corporate group health insurance plan. Choose a coverage tier (Base / Silver / Gold / Platinum), add eligible dependents (spouse, parents, children), and opt for a Critical Illness top-up — all premiums are payroll-deducted monthly.</p>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px" }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                🛡️ Enrol in Corporate Health Insurance
              </h3>
              <form onSubmit={handleSubmitInsuranceEnrollment} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Select Coverage Tier</label>
                  <select className="form-control" value={insTier} onChange={(e) => setInsTier(e.target.value)}>
                    <option value="base">Base Corporate Plan (Free — ₹3,00,000 Sum Insured)</option>
                    <option value="silver">Silver Top-Up Plan (+₹400/mo — ₹5,00,000 Sum Insured)</option>
                    <option value="gold">Gold Premium Plan (+₹800/mo — ₹7,00,000 Sum Insured)</option>
                    <option value="platinum">Platinum VIP Plan (+₹1,400/mo — ₹10,00,000 Sum Insured)</option>
                  </select>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h4 style={{ fontSize: "14px", color: "var(--primary)" }}>Enroll Dependents (Additional Deductions)</h4>
                  <div style={{ display: "flex", gap: "24px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input type="checkbox" checked={insHasSpouse} onChange={(e) => setInsHasSpouse(e.target.checked)} />
                      Spouse (+ ₹300/mo)
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input type="checkbox" checked={insHasParents} onChange={(e) => setInsHasParents(e.target.checked)} />
                      Parents (+ ₹500/mo)
                    </label>
                  </div>
                  <div className="form-group" style={{ marginTop: "8px" }}>
                    <label className="form-label">Number of Children (+ ₹200/mo per child)</label>
                    <input type="number" min="0" max="4" className="form-control" value={insChildrenCount} onChange={(e) => setInsChildrenCount(Number(e.target.value))} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Critical Illness Top-Up Sum Insured (₹)</label>
                  <select className="form-control" value={insTopUp} onChange={(e) => setInsTopUp(Number(e.target.value))}>
                    <option value="0">No Critical Illness Top-up</option>
                    <option value="50000">₹50,000 Sum Insured (+ ₹200/mo)</option>
                    <option value="100000">₹1,00,000 Sum Insured (+ ₹400/mo)</option>
                    <option value="200000">₹2,00,000 Sum Insured (+ ₹700/mo)</option>
                  </select>
                </div>

                <div style={{ background: "rgba(var(--primary-rgb), 0.05)", padding: "16px", borderRadius: "12px", border: "1px dashed var(--primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Live Estimated Surcharge</h4>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Automatically deducted post-tax from salary</span>
                  </div>
                  <strong style={{ fontSize: "20px", color: "var(--primary)" }}>
                    ${(
                      (insTier === "silver" ? 20 : insTier === "gold" ? 40 : insTier === "platinum" ? 70 : 0) +
                      (insHasSpouse ? 15 : 0) +
                      (insHasParents ? 25 : 0) +
                      (insChildrenCount * 10) +
                      (insTopUp === 50000 ? 10 : insTopUp === 100000 ? 20 : insTopUp === 200000 ? 35 : 0)
                    ).toFixed(2)} / mo
                  </strong>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  Confirm Insurance Enrollment & Authorize Surcharge
                </button>
              </form>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="glass-card" style={{ padding: "0px", overflow: "hidden", borderRadius: "24px", border: "1px solid rgba(var(--primary-rgb), 0.3)", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)" }}>
                <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)", padding: "28px", minHeight: "220px", position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#ffffff" }}>
                  <div style={{ position: "absolute", top: "10%", right: "10%", width: "120px", height: "120px", background: "var(--primary)", filter: "blur(50px)", opacity: 0.3 }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 2 }}>
                    <div>
                      <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", letterSpacing: "1px", fontWeight: 7 }}>COGNIPROTECT</h4>
                      <span style={{ fontSize: "9px", letterSpacing: "0.5px", opacity: 0.7, textTransform: "uppercase" }}>Corporate Health Shield</span>
                    </div>
                    <div style={{ background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(5px)", padding: "4px 10px", borderRadius: "8px", fontSize: "10px", fontWeight: 6, textTransform: "uppercase", letterSpacing: "0.5px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                      {insTier === "base" ? "Base Plan" : `${insTier} Tier`}
                    </div>
                  </div>

                  <div style={{ margin: "20px 0", zIndex: 2 }}>
                    <div style={{ width: "40px", height: "30px", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", borderRadius: "6px", opacity: 0.8, marginBottom: "8px" }} />
                    <h5 style={{ fontSize: "16px", letterSpacing: "2px", fontWeight: 5, color: "#cbd5e1" }}>
                      {insuranceEnrollment ? `CH-${insuranceEnrollment.id.substring(0, 4).toUpperCase()}-${insuranceEnrollment.id.substring(4, 8).toUpperCase()}` : "CH-XXXX-XXXX-XXXX"}
                    </h5>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", zIndex: 2 }}>
                    <div>
                      <span style={{ fontSize: "8px", opacity: 0.5, display: "block", textTransform: "uppercase" }}>Card Holder</span>
                      <strong style={{ fontSize: "14px", fontWeight: 6 }}>{currentUser?.email.split("@")[0].toUpperCase() || "Sarah Jenkins"}</strong>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "8px", opacity: 0.5, display: "block", textTransform: "uppercase" }}>Valid Till</span>
                      <strong style={{ fontSize: "12px", fontWeight: 6 }}>31-MAR-2027</strong>
                    </div>
                  </div>
                </div>

                <div style={{ padding: "20px", background: "rgba(255, 255, 255, 0.02)" }}>
                  <h4 style={{ fontSize: "13px", marginBottom: "12px", color: "var(--text-secondary)" }}>Shield Policy Summary</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Status:</span>
                      <span className="badge badge-success">{insuranceEnrollment ? "Active" : "Not Enrolled"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Top-up Coverage:</span>
                      <strong>${insTopUp > 0 ? `$${insTopUp.toLocaleString()}` : "None"}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Enrolled Dependents:</span>
                      <strong>
                        {[
                          insHasSpouse ? "Spouse" : null,
                          insHasParents ? "Parents" : null,
                          insChildrenCount > 0 ? `${insChildrenCount} Child(ren)` : null
                        ].filter(Boolean).join(", ") || "Self Only"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
