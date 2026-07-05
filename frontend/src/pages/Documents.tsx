import React from "react";

export function DocumentsPage(props: {
  myDocuments: any[];
  setMyDocuments: (v: any[] | ((prev: any[]) => any[])) => void;
  docFilter: string;
  setDocFilter: (v: string) => void;
  docSearch: string;
  setDocSearch: (v: string) => void;
  currentEmployee: any;
}) {
  const { myDocuments, setMyDocuments, docFilter, setDocFilter, docSearch, setDocSearch } = props;

  return (
    <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="glass-card" style={{
        background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.06) 0%, rgba(var(--accent-rgb),0.03) 100%)",
        border: "1px solid rgba(var(--primary-rgb),0.15)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "32px" }}>📄</span>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0 }}>My Documents</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Access and manage your HR documents including offer letters, policy acknowledgements, and certificates.</p>
          </div>
          <button className="btn btn-primary" style={{ padding: "8px 18px", fontSize: "13px" }}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".pdf,.doc,.docx,.png,.jpg";
              input.onchange = (e: any) => {
                const file = e.target?.files?.[0];
                if (file) {
                  setMyDocuments(prev => [{
                    id: Date.now().toString(),
                    name: file.name,
                    category: "Other",
                    uploadedAt: new Date().toISOString().split("T")[0],
                    size: `${Math.round(file.size / 1024)} KB`,
                    status: "pending"
                  }, ...prev]);
                }
              };
              input.click();
            }}
          >+ Upload Document</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" }}>
        {[
          { label: "Total Documents", value: myDocuments.length, icon: "📄", color: "var(--primary)" },
          { label: "Verified", value: myDocuments.filter(d => d.status === "verified").length, icon: "✅", color: "#10b981" },
          { label: "Pending", value: myDocuments.filter(d => d.status === "pending").length, icon: "⏳", color: "#f59e0b" },
          { label: "Categories", value: [...new Set(myDocuments.map(d => d.category))].length, icon: "📂", color: "#6366f1" },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ textAlign: "center", padding: "14px" }}>
            <div style={{ fontSize: "22px" }}>{stat.icon}</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search and filter */}
      <div className="glass-card" style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <input className="form-control" type="search" placeholder="🔍 Search documents..." value={docSearch} onChange={e => setDocSearch(e.target.value)} style={{ width: "100%" }} />
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {["all", "Onboarding", "Statutory", "Payroll", "Policy", "Other"].map(f => (
              <button key={f} style={{
                padding: "4px 12px", borderRadius: "var(--radius-full)", border: "1px solid transparent",
                background: docFilter === f ? "var(--primary)" : "rgba(var(--primary-rgb),0.06)",
                color: docFilter === f ? "#fff" : "var(--text-muted)",
                fontWeight: 600, fontSize: "11px", cursor: "pointer"
              }} onClick={() => setDocFilter(f)}>{f === "all" ? "All" : f}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Document grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
        {myDocuments.filter(d => {
          const catMatch = docFilter === "all" || d.category === docFilter;
          const searchMatch = !docSearch || d.name.toLowerCase().includes(docSearch.toLowerCase()) || d.category.toLowerCase().includes(docSearch.toLowerCase());
          return catMatch && searchMatch;
        }).map((doc, i) => {
          const categoryColor = doc.category === "Onboarding" ? "#6366f1" :
            doc.category === "Statutory" ? "#10b981" :
            doc.category === "Payroll" ? "#f59e0b" :
            doc.category === "Policy" ? "#ec4899" : "#6b7280";
          const categoryIcon = doc.category === "Onboarding" ? "🚀" :
            doc.category === "Statutory" ? "🛡️" :
            doc.category === "Payroll" ? "💰" :
            doc.category === "Policy" ? "📋" : "📁";
          return (
            <div key={doc.id || i} style={{
              padding: "16px", borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)", background: "rgba(var(--primary-rgb),0.02)",
              cursor: "pointer", transition: "all 0.15s",
              position: "relative"
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = categoryColor; e.currentTarget.style.background = `rgba(var(--primary-rgb),0.05)`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.background = "rgba(var(--primary-rgb),0.02)"; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{
                  width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
                  background: `${categoryColor}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px"
                }}>{categoryIcon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px", fontSize: "11px", color: "var(--text-muted)", alignItems: "center" }}>
                    <span className="badge" style={{ background: `${categoryColor}15`, color: categoryColor, fontSize: "9px" }}>{doc.category}</span>
                    <span>{doc.size}</span>
                    <span>{doc.uploadedAt}</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <span className="badge" style={{
                    fontSize: "9px", fontWeight: 700,
                    background: doc.status === "verified" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                    color: doc.status === "verified" ? "#10b981" : "#f59e0b"
                  }}>{doc.status === "verified" ? "✓ Verified" : "⏳ Pending"}</span>
                  <button style={{
                    background: "none", border: "none", color: "var(--primary)", cursor: "pointer",
                    fontSize: "16px", padding: "2px"
                  }} title="Download" onClick={(e) => { e.stopPropagation(); }}>⬇️</button>
                </div>
              </div>
              {/* Delete */}
              <div style={{ position: "absolute", top: "8px", right: "8px" }}>
                <button style={{
                  background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
                  fontSize: "12px", padding: "2px 6px", borderRadius: "4px", opacity: 0, transition: "opacity 0.15s"
                }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "0"; }}
                  onClick={(e) => { e.stopPropagation(); setMyDocuments(prev => prev.filter(d => d.id !== doc.id)); }}
                >✕</button>
              </div>
            </div>
          );
        })}
      </div>

      {myDocuments.filter(d => {
        const catMatch = docFilter === "all" || d.category === docFilter;
        const searchMatch = !docSearch || d.name.toLowerCase().includes(docSearch.toLowerCase());
        return catMatch && searchMatch;
      }).length === 0 && (
        <div className="glass-card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "32px", opacity: 0.5, marginBottom: "8px" }}>📄</div>
          <div style={{ color: "var(--text-muted)" }}>No documents found.</div>
        </div>
      )}
    </div>
  );
}
