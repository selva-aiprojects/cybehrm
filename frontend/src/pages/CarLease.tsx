import React from "react";
import { API_BASE_URL, getErrorMsg } from "../helpers/api";

const showToast = {
  success: (msg: string) => {
    try { (window as any).showToast?.success?.(msg); } catch {}
  },
  error: (msg: string) => {
    try { (window as any).showToast?.error?.(msg); } catch {}
  }
};

export function CarLeasePage(props: {
  vehicleLease: any;
  leaseType: string;
  setLeaseType: (v: string) => void;
  carModel: string;
  setCarModel: (v: string) => void;
  exShowroomPrice: number;
  setExShowroomPrice: (v: number) => void;
  leaseTenure: number;
  setLeaseTenure: (v: number) => void;
  leaseHasDriver: boolean;
  setLeaseHasDriver: (v: boolean) => void;
  currentEmployee: any;
  token: string;
  gradeAllowance?: any;
}) {
  const { vehicleLease, leaseType, setLeaseType, carModel, setCarModel, exShowroomPrice, setExShowroomPrice, leaseTenure, setLeaseTenure, leaseHasDriver, setLeaseHasDriver, currentEmployee, token, gradeAllowance } = props;

  const fetchCarLeaseData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vehicle-lease/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/vehicle-lease`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          lease_type: leaseType,
          car_model: carModel,
          ex_showroom_price: exShowroomPrice,
          lease_tenure_months: leaseTenure,
          has_driver: leaseHasDriver
        })
      });
      if (res.ok) {
        showToast.success("Vehicle lease saved successfully!");
        fetchCarLeaseData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Vehicle lease submission failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div className="glass-card">
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "32px" }}>🚗</span>
          <div>
            <h2 style={{ margin: 0 }}>Corporate Vehicle Lease &amp; Car Benefit Programme</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Elect between the OYT Reimbursement Programme or a Company-Leased Car arrangement. The system computes monthly EMI, engine-capacity-based perquisite value (as per IT Rules), and applicable driver allowance for pre-tax salary structuring.</p>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px" }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            🚗 Configure Vehicle Benefit
          </h3>
          <form onSubmit={handleLeaseSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Vehicle Program Option</label>
              <div style={{ display: "flex", gap: "16px" }}>
                <label style={{ flex: 1, padding: "12px", borderRadius: "8px", border: `1px solid ${leaseType === "oyt" ? "var(--primary)" : "var(--border-color)"}`, background: leaseType === "oyt" ? "rgba(var(--primary-rgb), 0.05)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                  <input type="radio" name="lease_type" checked={leaseType === "oyt"} onChange={() => setLeaseType("oyt")} />
                  <div>
                    <strong>OYT Program</strong>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Own Your Technology (Reimbursement)</div>
                  </div>
                </label>
                <label style={{ flex: 1, padding: "12px", borderRadius: "8px", border: `1px solid ${leaseType === "lease" ? "var(--primary)" : "var(--border-color)"}`, background: leaseType === "lease" ? "rgba(var(--primary-rgb), 0.05)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                  <input type="radio" name="lease_type" checked={leaseType === "lease"} onChange={() => setLeaseType("lease")} />
                  <div>
                    <strong>Corporate Lease Program</strong>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Company Leased Car (Pre-tax Savings)</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Car Model & Specs</label>
              <input type="text" className="form-control" placeholder="e.g. Tesla Model 3 / BMW 3 Series" value={carModel} onChange={(e) => setCarModel(e.target.value)} required />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Ex-Showroom Price (₹)</label>
                <input type="number" className="form-control" value={exShowroomPrice} onChange={(e) => setExShowroomPrice(Number(e.target.value))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Lease Tenure (Months)</label>
                <select className="form-control" value={leaseTenure} onChange={(e) => setLeaseTenure(Number(e.target.value))}>
                  <option value="36">36 Months (3 Years)</option>
                  <option value="48">48 Months (4 Years)</option>
                  <option value="60">60 Months (5 Years)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input type="checkbox" checked={leaseHasDriver} onChange={(e) => setLeaseHasDriver(e.target.checked)} />
                Provide Professional Chauffeur Option (Adds ₹900/mo taxable perquisite)
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }}>
              Submit Vehicle Program Application
            </button>
          </form>
        </div>

        {/* Calculations and Grade checks */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: "16px" }}>📊 Financial Pre-tax & Rule 3 Review</h3>

            {gradeAllowance && (
              <div style={{ background: exShowroomPrice > Number(gradeAllowance.car_lease_cap) ? "rgba(239, 68, 68, 0.05)" : "rgba(16, 185, 129, 0.05)", padding: "16px", borderRadius: "12px", border: `1px solid ${exShowroomPrice > Number(gradeAllowance.car_lease_cap) ? "var(--danger)" : "var(--success)"}`, marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Grade {currentEmployee?.grade || "L3"} Car Lease Cap:</span>
                  <strong>₹{Number(gradeAllowance.car_lease_cap).toLocaleString()}</strong>
                </div>
                {exShowroomPrice > Number(gradeAllowance.car_lease_cap) && (
                  <div style={{ fontSize: "11px", color: "var(--danger)", marginTop: "8px", fontWeight: 6 }}>
                    ⚠️ Warning: Ex-showroom price exceeds your grade car lease cap! Special approvals will be routed to HR.
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                <span>Estimated Monthly Pre-tax EMI:</span>
                <strong style={{ color: "var(--primary)" }}>
                  ₹{exShowroomPrice > 0 ? Math.round(exShowroomPrice / leaseTenure).toLocaleString() : 0} / mo
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                <span>Engine Capacity Perquisite (IT Rule 3):</span>
                <strong>
                  ₹{exShowroomPrice > 1000000 ? "2,400" : "1,800"} / mo
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                <span>Driver Surcharge Perquisite:</span>
                <strong>₹{leaseHasDriver ? "900" : "0"} / mo</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", fontWeight: 7 }}>
                <span>Total Taxable Perquisite Value:</span>
                <strong style={{ color: "var(--warning)" }}>
                  ₹{((exShowroomPrice > 1000000 ? 2400 : 1800) + (leaseHasDriver ? 900 : 0))} / mo
                </strong>
              </div>
            </div>

            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "16px", lineHeight: 1.5 }}>
              ℹ️ Under the Indian Income Tax Rule 3 perquisite rules, if a corporate-leased car is provided for mixed personal and business usage, only the specified pro-rated perquisite is added as a taxable component to your monthly gross, while the massive actual monthly lease EMI is fully exempt from pre-tax taxable brackets.
            </div>
          </div>

          {vehicleLease && (
            <div className="glass-card animated" style={{ border: "1px solid rgba(var(--primary-rgb), 0.2)" }}>
              <h3 style={{ marginBottom: "12px", color: "var(--primary)" }}>🚗 Approved Lease Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Car Model:</span>
                  <strong>{vehicleLease.car_model}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Ex-Showroom Price:</span>
                  <strong>₹{Number(vehicleLease.ex_showroom_price).toLocaleString()}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Lease Status:</span>
                  <span className="badge badge-success" style={{ textTransform: "capitalize" }}>{vehicleLease.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
