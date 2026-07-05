import React from "react";

export function PolicyCenterPage(props: {
  policySearch: string;
  setPolicySearch: (v: string) => void;
  policyActiveCategory: string;
  setPolicyActiveCategory: (v: string) => void;
}) {
  const { policySearch, setPolicySearch, policyActiveCategory, setPolicyActiveCategory } = props;

  const policyData = [
    { category: "Human Resources", icon: "👥", color: "#6366f1", policies: [
      { title: "Employee Code of Conduct", desc: "Standards of professional behavior and ethics", version: "2.1", updated: "Jan 2026" },
      { title: "Anti-Harassment Policy", desc: "Workplace harassment prevention and reporting", version: "1.4", updated: "Dec 2025" },
      { title: "Leave & Attendance Policy", desc: "Leave types, accrual, approval workflow", version: "3.0", updated: "Mar 2026" },
      { title: "Performance Review Guidelines", desc: "Annual review process and rating framework", version: "2.0", updated: "Feb 2026" },
    ]},
    { category: "Finance & Compliance", icon: "💰", color: "#10b981", policies: [
      { title: "Expense Reimbursement Policy", desc: "Eligible expenses, limits, and claim process", version: "1.8", updated: "Nov 2025" },
      { title: "Travel & Accommodation Policy", desc: "Booking procedures and reimbursement rates", version: "2.2", updated: "Jan 2026" },
      { title: "Procurement Guidelines", desc: "Vendor selection and purchase approval", version: "1.5", updated: "Oct 2025" },
    ]},
    { category: "IT & Security", icon: "🔒", color: "#f59e0b", policies: [
      { title: "Information Security Policy", desc: "Data protection, access control, incident response", version: "3.1", updated: "Feb 2026" },
      { title: "Password & Authentication Policy", desc: "Password complexity, MFA, account lockout", version: "2.3", updated: "Dec 2025" },
      { title: "BYOD Policy", desc: "Personal device usage guidelines", version: "1.2", updated: "Sep 2025" },
      { title: "Software License Compliance", desc: "Approved software and licensing rules", version: "1.0", updated: "Mar 2026" },
    ]},
    { category: "Payroll & Benefits", icon: "💳", color: "#ec4899", policies: [
      { title: "Salary Structure Policy", desc: "Pay components, revisions, and bands", version: "2.0", updated: "Jan 2026" },
      { title: "Employee Benefits Handbook", desc: "Insurance, wellness, and perk programs", version: "1.6", updated: "Feb 2026" },
      { title: "Vehicle Lease Programme Terms", desc: "Eligibility, EMI, and perquisite rules", version: "1.1", updated: "Mar 2026" },
    ]},
  ];

  const filtered = policyActiveCategory === "all" ? policyData : policyData.filter(c => c.category === policyActiveCategory);
  const searchTerm = policySearch.toLowerCase();

  return (
    <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="glass-card" style={{
        background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.06) 0%, rgba(var(--accent-rgb),0.03) 100%)",
        border: "1px solid rgba(var(--primary-rgb),0.15)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "32px" }}>📋</span>
          <div>
            <h2 style={{ margin: 0 }}>Policy Center</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Browse company policies, handbooks, and compliance documents.</p>
          </div>
        </div>
      </div>

      {/* Search and category filters */}
      <div className="glass-card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <input className="form-control" type="search" placeholder="🔍 Search policies..." value={policySearch} onChange={e => setPolicySearch(e.target.value)}
              style={{ width: "100%" }} />
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {[{ name: "All", key: "all", color: "var(--primary)" }, ...policyData.map(c => ({ name: c.category, key: c.category, color: c.color }))].map(cat => (
              <button key={cat.key} style={{
                padding: "6px 14px", borderRadius: "var(--radius-full)", border: "1px solid transparent",
                background: policyActiveCategory === cat.key ? cat.color : "rgba(var(--primary-rgb),0.06)",
                color: policyActiveCategory === cat.key ? "#fff" : "var(--text-muted)",
                fontWeight: 600, fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap"
              }} onClick={() => setPolicyActiveCategory(cat.key)}>{cat.name}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Policy categories */}
      {filtered.map(cat => {
        const catPolicies = cat.policies.filter(p =>
          !searchTerm || p.title.toLowerCase().includes(searchTerm) || p.desc.toLowerCase().includes(searchTerm)
        );
        if (catPolicies.length === 0) return null;
        return (
          <div key={cat.category} className="glass-card">
            <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{cat.icon}</span> {cat.category}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {catPolicies.map((pol, i) => (
                <div key={i} style={{
                  padding: "16px", borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)", background: "rgba(var(--primary-rgb),0.02)",
                  cursor: "pointer", transition: "all 0.15s"
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.background = `rgba(${cat.color === "#6366f1" ? "99,102,241" : cat.color === "#10b981" ? "16,185,129" : cat.color === "#f59e0b" ? "245,158,11" : "236,72,153"},0.05)`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.background = "rgba(var(--primary-rgb),0.02)"; }}
                  onClick={() => {}}
                >
                  <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>{pol.title}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px" }}>{pol.desc}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)" }}>
                    <span>v{pol.version}</span>
                    <span>Updated {pol.updated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {filtered.every(c => c.policies.filter(p => !searchTerm || p.title.toLowerCase().includes(searchTerm)).length === 0) && (
        <div className="glass-card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "32px", opacity: 0.5, marginBottom: "8px" }}>📋</div>
          <div style={{ color: "var(--text-muted)" }}>No policies match your search.</div>
        </div>
      )}
    </div>
  );
}
