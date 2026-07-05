import React from "react";
import { API_BASE_URL, getErrorMsg } from "../helpers/api";

export function FbpTaxPage(props: {
  taxRegime: string;
  setTaxRegime: (v: string) => void;
  sec80c: number;
  setSec80c: (v: number) => void;
  sec80d: number;
  setSec80d: (v: number) => void;
  rentPaid: number;
  setRentPaid: (v: number) => void;
  landlordPan: string;
  setLandlordPan: (v: string) => void;
  landlordName: string;
  setLandlordName: (v: string) => void;
  evidenceUrl: string;
  setEvidenceUrl: (v: string) => void;
  gradeAllowance: any;
  fuelFbp: number;
  setFuelFbp: (v: number) => void;
  ltaFbp: number;
  setLtaFbp: (v: number) => void;
  phoneFbp: number;
  setPhoneFbp: (v: number) => void;
  foodFbp: number;
  setFoodFbp: (v: number) => void;
  token: string;
  setActiveView: (v: string) => void;
  handleSubmitTaxDeclaration: (e: React.FormEvent) => void;
  handleSubmitFbpDeclaration: (e: React.FormEvent) => void;
  activeView?: string;
  currentUser?: any;
  currentEmployee?: any;
  allTaxDeclarations?: any[];
  handleTaxAction?: (id: string, status: string) => void;
}) {
  const {
    taxRegime, setTaxRegime, sec80c, setSec80c, sec80d, setSec80d,
    rentPaid, setRentPaid, landlordPan, setLandlordPan, landlordName, setLandlordName,
    evidenceUrl, setEvidenceUrl, gradeAllowance,
    fuelFbp, setFuelFbp, ltaFbp, setLtaFbp, phoneFbp, setPhoneFbp, foodFbp, setFoodFbp,
    token, setActiveView, handleSubmitTaxDeclaration, handleSubmitFbpDeclaration,
    activeView, currentUser, currentEmployee, allTaxDeclarations, handleTaxAction,
  } = props;

  return (
    <>
      {activeView && ["fbp-tax", "my-fbp-tax", "org-fbp-tax"].includes(activeView) && (
        <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <div className="glass-card">
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "32px" }}>🏛️</span>
              <div>
                <h2 style={{ margin: 0 }}>Flexible Benefits Plan (FBP) &amp; Income Tax Portal</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Declare investments under Old or New Tax Regime (Section 80C / 80D / HRA with landlord PAN validation), configure Flexible Benefit allocations (Fuel, LTA, Phone, Food), and track HR review status for your FY declarations.</p>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px" }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                🏛️ Annual Income Tax Declaration
              </h3>
              <form onSubmit={handleSubmitTaxDeclaration} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Tax Regime</label>
                  <select className="form-control" value={taxRegime} onChange={(e) => setTaxRegime(e.target.value)}>
                    <option value="new">New Tax Regime (Simplified, Standard Ded: ₹75k)</option>
                    <option value="old">Old Tax Regime (Exemptions, Standard Ded: ₹50k)</option>
                  </select>
                </div>

                {taxRegime === "old" && (
                  <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "16px", background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                    <h4 style={{ fontSize: "14px", color: "var(--primary)", marginBottom: "4px" }}>Deductions & Exemptions (Section 80)</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">Section 80C (Max ₹1.5L)</label>
                        <input type="number" className="form-control" value={sec80c} onChange={(e) => setSec80c(Number(e.target.value))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Section 80D (Medical, Max ₹50k)</label>
                        <input type="number" className="form-control" value={sec80d} onChange={(e) => setSec80d(Number(e.target.value))} />
                      </div>
                    </div>

                    <h4 style={{ fontSize: "14px", color: "var(--primary)", marginTop: "8px", marginBottom: "4px" }}>House Rent Allowance (HRA)</h4>
                    <div className="form-group">
                      <label className="form-label">Annual Rent Paid (₹)</label>
                      <input type="number" className="form-control" value={rentPaid} onChange={(e) => setRentPaid(Number(e.target.value))} />
                    </div>

                    {rentPaid > 100000 && (
                      <div className="animated" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="form-group">
                          <label className="form-label" style={{ color: "var(--danger)" }}>Landlord PAN (10 chars)*</label>
                          <input type="text" className="form-control" maxLength={10} value={landlordPan} onChange={(e) => setLandlordPan(e.target.value.toUpperCase())} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Landlord Name*</label>
                          <input type="text" className="form-control" value={landlordName} onChange={(e) => setLandlordName(e.target.value)} required />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Evidence / Investment Proof URL</label>
                  <input type="text" className="form-control" placeholder="https://drive.google.com/proofs" value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }}>
                  Save & Declare Income Tax
                </button>
              </form>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              <div className="glass-card">
                <h3 style={{ marginBottom: "16px" }}>💵 Grade-wise Perks & FBP Structure</h3>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                  Employee Grade: <span className="badge badge-success" style={{ fontSize: "12px" }}>{currentEmployee?.grade || "L3"}</span>
                </div>

                {gradeAllowance ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                      <span>Fuel Allowance Cap:</span>
                      <strong style={{ color: "var(--primary)" }}>₹{gradeAllowance.fuel_cap} / mo</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                      <span>LTA Tax-free Cap:</span>
                      <strong style={{ color: "var(--primary)" }}>₹{gradeAllowance.lta_cap} / mo</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                      <span>Phone / Internet Cap:</span>
                      <strong style={{ color: "var(--primary)" }}>₹{gradeAllowance.phone_cap} / mo</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                      <span>Food Coupons Cap:</span>
                      <strong style={{ color: "var(--primary)" }}>₹{gradeAllowance.food_cap} / mo</strong>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: "var(--text-muted)", fontStyle: "italic", marginBottom: "24px" }}>No grade allowances mapped.</div>
                )}

                <h4 style={{ fontSize: "14px", marginBottom: "12px", color: "var(--secondary)" }}>Restructure Flexible Benefits (FBP)</h4>
                <form onSubmit={handleSubmitFbpDeclaration} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="form-group">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <label className="form-label">Fuel Reimbursement (₹)</label>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Max: ₹{gradeAllowance?.fuel_cap || 0}</span>
                    </div>
                    <input type="range" min="0" max={gradeAllowance?.fuel_cap || 5000} step="500" className="form-control" value={fuelFbp} onChange={(e) => setFuelFbp(Number(e.target.value))} />
                    <input type="number" className="form-control" style={{ marginTop: "4px" }} value={fuelFbp} onChange={(e) => setFuelFbp(Number(e.target.value))} />
                  </div>

                  <div className="form-group">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <label className="form-label">Leave Travel Allowance (LTA) (₹)</label>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Max: ₹{gradeAllowance?.lta_cap || 0}</span>
                    </div>
                    <input type="range" min="0" max={gradeAllowance?.lta_cap || 10000} step="1000" className="form-control" value={ltaFbp} onChange={(e) => setLtaFbp(Number(e.target.value))} />
                    <input type="number" className="form-control" style={{ marginTop: "4px" }} value={ltaFbp} onChange={(e) => setLtaFbp(Number(e.target.value))} />
                  </div>

                  <div className="form-group">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <label className="form-label">Phone & Broadband (₹)</label>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Max: ₹{gradeAllowance?.phone_cap || 0}</span>
                    </div>
                    <input type="range" min="0" max={gradeAllowance?.phone_cap || 3000} step="200" className="form-control" value={phoneFbp} onChange={(e) => setPhoneFbp(Number(e.target.value))} />
                    <input type="number" className="form-control" style={{ marginTop: "4px" }} value={phoneFbp} onChange={(e) => setPhoneFbp(Number(e.target.value))} />
                  </div>

                  <div className="form-group">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <label className="form-label">Food Coupon Allowance (₹)</label>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Max: ₹{gradeAllowance?.food_cap || 0}</span>
                    </div>
                    <input type="range" min="0" max={gradeAllowance?.food_cap || 4000} step="500" className="form-control" value={foodFbp} onChange={(e) => setFoodFbp(Number(e.target.value))} />
                    <input type="number" className="form-control" style={{ marginTop: "4px" }} value={foodFbp} onChange={(e) => setFoodFbp(Number(e.target.value))} />
                  </div>

                  <button type="submit" className="btn btn-secondary" style={{ width: "100%", marginTop: "8px" }}>
                    Reallocate FBP Splits
                  </button>
                </form>
              </div>
            </div>
          </div>

          {(currentUser?.role === "hr_admin" || currentUser?.role === "payroll_admin") && (
            <div className="glass-card">
              <h3 style={{ marginBottom: "20px" }}>🛡️ Tax & Investment Proof Verification Console</h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Regime</th>
                      <th>Rent (₹)</th>
                      <th>80C / 80D (₹)</th>
                      <th>Landlord PAN / Name</th>
                      <th>Evidence Proof</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!allTaxDeclarations || allTaxDeclarations.length === 0) ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center", color: "var(--text-muted)" }}>No declarations submitted for approval yet.</td>
                      </tr>
                    ) : (
                      (allTaxDeclarations || []).map((decl: any) => (
                        <tr key={decl.id}>
                          <td style={{ fontWeight: 6 }}>{decl.employee?.first_name} {decl.employee?.last_name}</td>
                          <td style={{ textTransform: "capitalize" }}>{decl.regime}</td>
                          <td>₹{decl.hra_rent_paid}</td>
                          <td>₹{decl.section_80c} / ₹{decl.section_80d}</td>
                          <td>{decl.landlord_pan ? `${decl.landlord_pan} (${decl.landlord_name})` : "N/A"}</td>
                          <td>
                            {decl.evidence_url ? (
                              <a href={decl.evidence_url} target="_blank" rel="noreferrer" style={{ color: "var(--secondary)", textDecoration: "underline" }}>View Proof</a>
                            ) : "No Proof"}
                          </td>
                          <td>
                            <span className={`badge badge-${decl.status === "approved" ? "success" : decl.status === "rejected" ? "danger" : "warning"}`}>
                              {decl.status}
                            </span>
                          </td>
                          <td>
                            {decl.status === "pending" && (
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => handleTaxAction?.(decl.id, "approved")}>
                                  Approve
                                </button>
                                <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11px", backgroundColor: "var(--danger)" }} onClick={() => handleTaxAction?.(decl.id, "rejected")}>
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
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
