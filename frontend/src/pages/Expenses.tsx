import React from "react";

export function ExpensesPage(props: {
  myExpenses: any[];
  setMyExpenses: (expenses: any) => void;
  expenseTitle: string;
  setExpenseTitle: (title: string) => void;
  expenseCategory: string;
  setExpenseCategory: (cat: string) => void;
  expenseAmount: string;
  setExpenseAmount: (amt: string) => void;
  expenseDate: string;
  setExpenseDate: (date: string) => void;
  expenseDesc: string;
  setExpenseDesc: (desc: string) => void;
  expenseFilter: string;
  setExpenseFilter: (filter: string) => void;
  currentEmployee: any;
}) {
  const {
    myExpenses, setMyExpenses, expenseTitle, setExpenseTitle,
    expenseCategory, setExpenseCategory, expenseAmount, setExpenseAmount,
    expenseDate, setExpenseDate, expenseDesc, setExpenseDesc,
    expenseFilter, setExpenseFilter
  } = props;

  return (
    <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="glass-card" style={{
        background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.06) 0%, rgba(var(--accent-rgb),0.03) 100%)",
        border: "1px solid rgba(var(--primary-rgb),0.15)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "32px" }}>💰</span>
          <div>
            <h2 style={{ margin: 0 }}>My Expense Claims</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Submit and track expense reimbursement requests with receipt uploads and approval status.</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
        {[
          { label: "Total Claims", value: myExpenses.length, color: "var(--primary)", icon: "📋" },
          { label: "Approved", value: myExpenses.filter(e => e.status === "Approved").length, color: "#10b981", icon: "✅" },
          { label: "Pending", value: myExpenses.filter(e => e.status === "Pending").length, color: "#f59e0b", icon: "⏳" },
          { label: "Total Amount", value: `₹${myExpenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0).toLocaleString("en-IN")}`, color: "var(--accent)", icon: "💰" },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ textAlign: "center", padding: "16px" }}>
            <div style={{ fontSize: "24px" }}>{stat.icon}</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: stat.color, marginTop: "4px" }}>{stat.value}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>➕</span> New Expense Claim
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Title</label>
            <input className="form-control" type="text" placeholder="e.g. Client travel" value={expenseTitle} onChange={e => setExpenseTitle(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Category</label>
            <select className="form-control" value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)}>
              <option>Travel</option>
              <option>Food & Dining</option>
              <option>Office Supplies</option>
              <option>Transportation</option>
              <option>Accommodation</option>
              <option>Communication</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Amount (₹)</label>
            <input className="form-control" type="number" placeholder="0" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Date</label>
            <input className="form-control" type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Description</label>
            <input className="form-control" type="text" placeholder="Brief description of expense" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: "14px" }}
          disabled={!expenseTitle || !expenseAmount}
          onClick={() => {
            if (!expenseTitle || !expenseAmount) return;
            setMyExpenses((prev: any[]) => [{
              id: Date.now().toString(),
              title: expenseTitle,
              category: expenseCategory,
              amount: expenseAmount,
              date: expenseDate,
              description: expenseDesc,
              status: "Pending",
              createdAt: new Date().toISOString(),
            }, ...prev]);
            setExpenseTitle(""); setExpenseAmount(""); setExpenseDesc("");
          }}
        >+ Submit Claim</button>
      </div>

      <div className="glass-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>📄</span> Claim History
          </h3>
          <div style={{ display: "flex", gap: "6px" }}>
            {["all", "Pending", "Approved", "Rejected"].map(f => (
              <button key={f} style={{
                padding: "4px 12px", borderRadius: "var(--radius-full)", border: "1px solid var(--border-color)",
                background: expenseFilter === f ? "var(--primary)" : "transparent",
                color: expenseFilter === f ? "#fff" : "var(--text-muted)",
                fontWeight: 600, fontSize: "11px", cursor: "pointer"
              }} onClick={() => setExpenseFilter(f)}>{f === "all" ? "All" : f}</button>
            ))}
          </div>
        </div>
        {myExpenses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px", opacity: 0.5 }}>🧾</div>
            <div>No expense claims yet. Submit your first claim above.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {myExpenses.filter(e => expenseFilter === "all" || e.status === expenseFilter).map(exp => (
              <div key={exp.id} style={{
                display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px",
                borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)",
                background: "rgba(var(--primary-rgb),0.02)"
              }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                  background: exp.category === "Travel" ? "rgba(99,102,241,0.12)" :
                    exp.category === "Food & Dining" ? "rgba(245,158,11,0.12)" :
                    exp.category === "Transportation" ? "rgba(16,185,129,0.12)" :
                    "rgba(var(--primary-rgb),0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px"
                }}>
                  {exp.category === "Travel" ? "✈️" :
                    exp.category === "Food & Dining" ? "🍽️" :
                    exp.category === "Office Supplies" ? "📎" :
                    exp.category === "Transportation" ? "🚗" :
                    exp.category === "Accommodation" ? "🏨" :
                    exp.category === "Communication" ? "📞" : "📦"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>{exp.title}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{exp.category} • {exp.date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, color: "var(--primary)", fontSize: "16px" }}>₹{parseFloat(exp.amount).toLocaleString("en-IN")}</div>
                  <span className="badge" style={{
                    fontSize: "10px", fontWeight: 700,
                    background: exp.status === "Approved" ? "rgba(16,185,129,0.12)" :
                      exp.status === "Rejected" ? "rgba(239,68,68,0.12)" :
                      "rgba(245,158,11,0.12)",
                    color: exp.status === "Approved" ? "#10b981" :
                      exp.status === "Rejected" ? "#ef4444" : "#f59e0b"
                  }}>{exp.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
