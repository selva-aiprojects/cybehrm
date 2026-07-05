import React from "react";
import { API_BASE_URL, getErrorMsg } from "../helpers/api";

interface MyProfilePageProps {
  currentEmployee: any;
  currentUser: any;
  projects: any[];
  handleEditProfile: (emp: any) => void;
  token: string | null;
  setActiveView: (view: string) => void;
}

export function MyProfilePage(props: MyProfilePageProps) {
  const { currentEmployee, currentUser, projects, handleEditProfile } = props;

  return (
    <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Profile Hero */}
      <div className="glass-card" style={{
        background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.06) 0%, rgba(var(--accent-rgb),0.03) 100%)",
        border: "1px solid rgba(var(--primary-rgb),0.15)",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "-50%", right: "-20%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(var(--primary-rgb),0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "28px", position: "relative", zIndex: 1, flexWrap: "wrap" }}>
          <div style={{
            width: "88px", height: "88px", borderRadius: "50%",
            background: "var(--grad-brand)", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "32px", fontWeight: 800, color: "#fff", flexShrink: 0,
            boxShadow: "0 0 0 4px rgba(var(--primary-rgb),0.15), 0 8px 32px rgba(var(--primary-rgb),0.25)"
          }}>
            {currentEmployee ? (currentEmployee.first_name?.[0] || "") + (currentEmployee.last_name?.[0] || "") : "U"}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px" }}>
              {currentEmployee ? `${currentEmployee.first_name} ${currentEmployee.last_name}` : currentUser?.email || "User"}
            </h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" }}>
              {currentEmployee?.employee_id && (
                <span className="badge" style={{ background: "rgba(var(--primary-rgb),0.1)", color: "var(--primary)" }}>
                  🆔 {currentEmployee.employee_id}
                </span>
              )}
              {currentUser?.role && (
                <span className="badge" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
                  👤 {currentUser.role.replace(/_/g, " ").toUpperCase()}
                </span>
              )}
              {currentEmployee?.employment_status && (
                <span className="badge" style={{
                  background: currentEmployee.employment_status === "active" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                  color: currentEmployee.employment_status === "active" ? "#10b981" : "#ef4444"
                }}>
                  {currentEmployee.employment_status === "active" ? "● ACTIVE" : "○ INACTIVE"}
                </span>
              )}
              {currentEmployee?.employment_type && (
                <span className="badge" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                  {currentEmployee.employment_type.replace(/-/g, " ").toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => currentEmployee && handleEditProfile(currentEmployee)}>
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Personal Information */}
        <div className="glass-card">
          <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>📋</span> Personal Information
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Date of Birth</div>
              <div style={{ fontWeight: 600 }}>{currentEmployee?.dob || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Gender</div>
              <div style={{ fontWeight: 600 }}>{currentEmployee?.gender || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Blood Group</div>
              <div style={{ fontWeight: 600 }}>{currentEmployee?.blood_group || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Marital Status</div>
              <div style={{ fontWeight: 600 }}>{currentEmployee?.marital_status || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Phone</div>
              <div style={{ fontWeight: 600 }}>{currentEmployee?.phone || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Email</div>
              <div style={{ fontWeight: 600 }}>{currentEmployee?.email || currentUser?.email || "—"}</div>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Address</div>
              <div style={{ fontWeight: 600 }}>{currentEmployee?.address || "—"}</div>
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="glass-card">
          <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>💼</span> Employment Details
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Joining Date</div>
              <div style={{ fontWeight: 600 }}>{currentEmployee?.joining_date || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Grade</div>
              <div style={{ fontWeight: 600 }}>{currentEmployee?.grade || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Department</div>
              <div style={{ fontWeight: 600 }}>{currentEmployee?.department_id || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Designation</div>
              <div style={{ fontWeight: 600 }}>{currentEmployee?.functional_title?.name || currentEmployee?.designation_id || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Current Shift</div>
              <div style={{ fontWeight: 600 }}>{currentEmployee?.current_shift || "General Shift"}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Employment Type</div>
              <div style={{ fontWeight: 600, textTransform: "capitalize" }}>{currentEmployee?.employment_type?.replace(/-/g, " ") || "—"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory & Identification Documents */}
      <div className="glass-card">
        <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>🛡️</span> Statutory & Identification Records
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {[
            { label: "UAN Number", value: currentEmployee?.uan_number },
            { label: "PF Number", value: currentEmployee?.pf_number },
            { label: "PAN Card", value: currentEmployee?.pan_card },
            { label: "Aadhaar Card", value: currentEmployee?.aadhaar_card },
            { label: "ESIC Number", value: currentEmployee?.esic_number },
            { label: "Passport", value: currentEmployee?.passport_number },
          ].map((item, i) => (
            <div key={i} style={{ padding: "14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "rgba(var(--primary-rgb),0.02)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "6px" }}>{item.label}</div>
              <div style={{ fontWeight: 600, fontSize: "15px", fontFamily: "monospace" }}>{item.value || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      {currentEmployee?.emergency_contact_name && (
        <div className="glass-card">
          <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🚨</span> Emergency Contact
          </h3>
          <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Name</div>
              <div style={{ fontWeight: 600 }}>{currentEmployee.emergency_contact_name}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Phone</div>
              <div style={{ fontWeight: 600 }}>{currentEmployee.emergency_contact_phone || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>Relation</div>
              <div style={{ fontWeight: 600 }}>{currentEmployee.emergency_contact_relation || "—"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Skills */}
      {currentEmployee?.skillsets && currentEmployee.skillsets.length > 0 && (
        <div className="glass-card">
          <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>⚡</span> Skills & Competencies
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {currentEmployee.skillsets.map((skill: any, i: number) => (
              <div key={skill.id || i} style={{
                padding: "8px 16px", borderRadius: "var(--radius-full)",
                background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.08), rgba(var(--accent-rgb),0.05))",
                border: "1px solid rgba(var(--primary-rgb),0.15)",
                display: "flex", alignItems: "center", gap: "8px"
              }}>
                <span style={{ fontWeight: 600, fontSize: "13px" }}>{skill.skill_name}</span>
                <span className="badge" style={{
                  fontSize: "9px", fontWeight: 700,
                  background: skill.proficiency === "Expert" ? "rgba(16,185,129,0.15)" :
                    skill.proficiency === "Advanced" ? "rgba(99,102,241,0.15)" :
                    "rgba(245,158,11,0.15)",
                  color: skill.proficiency === "Expert" ? "#10b981" :
                    skill.proficiency === "Advanced" ? "#6366f1" : "#f59e0b"
                }}>
                  {skill.proficiency}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {currentEmployee?.work_experiences && currentEmployee.work_experiences.length > 0 && (
        <div className="glass-card">
          <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🏢</span> Work Experience
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {currentEmployee.work_experiences.map((exp: any, i: number) => (
              <div key={exp.id || i} style={{
                padding: "16px", borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)", background: "rgba(var(--primary-rgb),0.02)",
                display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px"
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "15px" }}>{exp.designation}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>{exp.company_name}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600, color: "var(--primary)" }}>{exp.tenure_months} months</div>
                  {exp.start_date && <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{exp.start_date} — {exp.end_date || "Present"}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Academic Qualifications */}
      {currentEmployee?.academic_qualifications && currentEmployee.academic_qualifications.length > 0 && (
        <div className="glass-card">
          <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🎓</span> Academic Qualifications
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
            {currentEmployee.academic_qualifications.map((aq: any, i: number) => (
              <div key={aq.id || i} style={{
                padding: "16px", borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)", background: "rgba(var(--primary-rgb),0.02)"
              }}>
                <div style={{ fontWeight: 700, fontSize: "15px" }}>{aq.degree}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>{aq.institution}</div>
                <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "13px" }}>
                  {aq.passing_year && <span>🎓 {aq.passing_year}</span>}
                  {aq.cgpa_percentage != null && <span style={{ fontWeight: 600, color: "var(--primary)" }}>📊 {aq.cgpa_percentage}%</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Allocations */}
      {currentEmployee?.project_allocations && currentEmployee.project_allocations.length > 0 && (
        <div className="glass-card">
          <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>📊</span> Current Project Allocations
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {currentEmployee.project_allocations.map((alloc: any, i: number) => {
              const proj = projects.find(p => p.id === alloc.project_id);
              return (
                <div key={alloc.id || i} style={{
                  padding: "16px", borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)", background: "rgba(var(--primary-rgb),0.02)",
                  display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px"
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "15px" }}>{alloc.project_role}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>{proj?.name || "Project"}</div>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", gap: "16px", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Allocation</div>
                      <div style={{ fontWeight: 700, color: "var(--primary)" }}>{alloc.allocation_percentage}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Billing</div>
                      <span className="badge" style={{
                        background: alloc.billing_status === "Billable" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                        color: alloc.billing_status === "Billable" ? "#10b981" : "#f59e0b"
                      }}>{alloc.billing_status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
