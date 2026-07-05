import React from "react";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { AttendanceAnalyticsSection, RecruitmentAnalyticsSection, AppraisalPerspectiveSection } from "./DashboardSections";

export interface DashboardPageProps {
  currentUser: any;
  currentEmployee: any;
  dashboardMetrics: any;
  metricsLoading: boolean;
  showMetricsDashboard: boolean;
  showAiInsightsDashboard: boolean;
  showAttendanceTrendDashboard: boolean;
  showUserProfileDashboard: boolean;
  activeDashboardSlide: number;
  setActiveDashboardSlide: (n: number) => void;
  attendanceAnalytics: any;
  employees: any[];
  kras: any[];
  employeeKras: any[];
  dashAppraisalTab: string;
  setDashAppraisalTab: (tab: string) => void;
  myReviews: any[];
  leaveBalances: any[];
  myAttendance: any[];
  leaveRequests: any[];
  token: string | null;
  setActiveView: (view: string) => void;
  handleLogout: () => void;
  projects: any[];
  clients: any[];
  selectedReviewCycle: string;
  appraisalSelfRating: number;
  setAppraisalSelfRating: (n: number) => void;
  appraisalSelfFeedback: string;
  setAppraisalSelfFeedback: (s: string) => void;
  allReviews: any[];
  appraisalMgrFeedback: string;
  setAppraisalMgrFeedback: (s: string) => void;
  appraisalMgrRating: number;
  setAppraisalMgrRating: (n: number) => void;
  recruitmentSearch: string;
  setRecruitmentSearch: (value: string) => void;
  fetchRecruitmentAnalytics: (search?: string) => void;
  recruitmentFilterStage: string;
  setRecruitmentFilterStage: (value: string) => void;
  setTalentActiveTab: (tab: string) => void;
}

export function DashboardPage(props: DashboardPageProps) {
  const {
    currentUser,
    currentEmployee,
    dashboardMetrics,
    metricsLoading,
    showUserProfileDashboard,
    attendanceAnalytics,
    kras,
    dashAppraisalTab,
    setDashAppraisalTab,
    myReviews,
    token,
    setActiveView,
    handleLogout,
    projects,
    clients,
    selectedReviewCycle,
    appraisalSelfRating,
    setAppraisalSelfRating,
    appraisalSelfFeedback,
    setAppraisalSelfFeedback,
    allReviews,
    appraisalMgrFeedback,
    setAppraisalMgrFeedback,
    appraisalMgrRating,
    setAppraisalMgrRating,
    recruitmentSearch,
    setRecruitmentSearch,
    fetchRecruitmentAnalytics,
    recruitmentFilterStage,
    setRecruitmentFilterStage,
    setTalentActiveTab,
  } = props;

  return (
    <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ===== DASHBOARD HEADER ===== */}
      <div className="glass-card glow" style={{
        background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.08) 0%, rgba(var(--accent-rgb),0.04) 100%)",
        border: "1px solid rgba(var(--primary-rgb),0.15)",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "-60%", right: "-10%", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(var(--primary-rgb),0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-40%", left: "-5%", width: "250px", height: "250px", borderRadius: "50%", background: "radial-gradient(circle, rgba(var(--accent-rgb),0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "14px",
              background: "var(--grad-brand)", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "24px", boxShadow: "0 4px 16px rgba(var(--primary-rgb),0.3)"
            }}>📊</div>
            <div>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, letterSpacing: "-0.3px" }}>Organisation Dashboard</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>
                Real-time HR intelligence · Live operational metrics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TOP METRICS ROW ===== */}
      {metricsLoading ? (
        <div className="glass-card glow" style={{ padding: "48px", textAlign: "center" }}>
          <div className="loading-spinner" style={{ margin: "0 auto 16px" }}></div>
          <h3 style={{ margin: 0 }}>Syncing Dashboard Metrics</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "8px 0 0" }}>Retrieving live operational data...</p>
        </div>
      ) : (
        <>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "16px"
        }}>
          {[
            { icon: "👥", label: "Headcount", value: dashboardMetrics?.hr?.total_employees ?? 0, suffix: "", color: "var(--primary)", trend: "+3", trendUp: true, sub: "Active employees" },
            { icon: "📉", label: "Attrition", value: (dashboardMetrics?.hr?.attrition_rate ?? 0), suffix: "%", color: (dashboardMetrics?.hr?.attrition_rate ?? 0) > 10 ? "#ef4444" : "#10b981", trend: "-0.5%", trendUp: false, sub: "Termination rate" },
            { icon: "💼", label: "Open Reqs", value: dashboardMetrics?.talent?.open_positions ?? 0, suffix: "", color: "var(--accent)", trend: "+2", trendUp: true, sub: "Active job roles" },
            { icon: "🌴", label: "Leave %", value: (dashboardMetrics?.hr?.leave_usage_pct ?? 0), suffix: "%", color: "#f59e0b", trend: "+1.2%", trendUp: true, sub: "Today's leave usage" },
            { icon: "✅", label: "Attendance %", value: (dashboardMetrics?.hr?.daily_attendance_pct ?? 0), suffix: "%", color: "#10b981", trend: "+2.1%", trendUp: true, sub: "Clock-in today" },
            { icon: "💰", label: "Payroll Cost", value: (dashboardMetrics?.hr?.payroll_cost ?? 0), suffix: "", color: "#8b5cf6", prefix: "₹", sub: "Total payroll" },
          ].map((card, i) => (
            <div key={i} className="glass-card glow" style={{
              padding: "18px", position: "relative", overflow: "hidden",
              border: `1px solid rgba(var(--primary-rgb),0.08)`,
              transition: "all 0.2s"
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(var(--primary-rgb),0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: `radial-gradient(circle, ${card.color}12 0%, transparent 70%)`, pointerEvents: "none" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "22px" }}>{card.icon}</span>
                {card.trend && (
                  <span style={{
                    fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px",
                    color: card.trendUp ? "#10b981" : "#ef4444",
                    background: card.trendUp ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)"
                  }}>
                    {card.trendUp ? "↑" : "↓"} {card.trend}
                  </span>
                )}
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: card.color, marginTop: "8px", letterSpacing: "-0.5px" }}>
                {card.prefix || ""}{typeof card.value === "number" ? card.value.toLocaleString("en-IN") : card.value}{card.suffix}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500, marginTop: "2px" }}>{card.label}</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* ===== CHARTS SECTION ===== */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "24px" }}>
          {/* Headcount by Dept — Bar Chart */}
          <div className="glass-card glow" style={{ border: "1px solid rgba(var(--primary-rgb),0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4 style={{ margin: 0, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>📊 Headcount by Department</h4>
              <span className="badge" style={{ background: "rgba(var(--primary-rgb),0.08)", color: "var(--primary)", fontSize: "10px" }}>
                {dashboardMetrics?.hr?.headcount_by_dept ? Object.keys(dashboardMetrics.hr.headcount_by_dept).length : 0} depts
              </span>
            </div>
            {dashboardMetrics?.hr?.headcount_by_dept && Object.keys(dashboardMetrics.hr.headcount_by_dept).length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={Object.entries(dashboardMetrics.hr.headcount_by_dept).map(([name, count]) => ({ name: name.length > 10 ? name.slice(0, 10) + "\u2026" : name, count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border-rgb),0.4)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid rgba(var(--primary-rgb),0.2)", borderRadius: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }} />
                  <defs>
                    <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="count" fill="url(#barGrad1)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "28px", opacity: 0.4, marginBottom: "6px" }}>📊</div>
                No department data available
              </div>
            )}
          </div>

          {/* Monthly Payroll Trend — Line Chart */}
          <div className="glass-card glow" style={{ border: "1px solid rgba(var(--primary-rgb),0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4 style={{ margin: 0, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>📈 Monthly Payroll Trend</h4>
            </div>
            {dashboardMetrics?.hr?.monthly_payroll && dashboardMetrics.hr.monthly_payroll.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={dashboardMetrics.hr.monthly_payroll.map((d: any) => ({ ...d, month: d.month?.slice(0, 7) || d.month }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border-rgb),0.4)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid rgba(var(--primary-rgb),0.2)", borderRadius: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }} />
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Line type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={3} dot={{ r: 5, fill: "var(--accent)", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7, fill: "var(--accent)", stroke: "#fff", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "28px", opacity: 0.4, marginBottom: "6px" }}>📈</div>
                No payroll data available
              </div>
            )}
          </div>

          {/* Candidate Pipeline — Bar Chart */}
          <div className="glass-card glow" style={{ border: "1px solid rgba(var(--primary-rgb),0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4 style={{ margin: 0, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>🎯 Recruitment Pipeline</h4>
              <span className="badge" style={{ background: "rgba(var(--accent-rgb),0.08)", color: "var(--accent)", fontSize: "10px" }}>
                {dashboardMetrics?.talent?.total_candidates ?? 0} total
              </span>
            </div>
            {dashboardMetrics?.talent?.pipeline_statuses && Object.keys(dashboardMetrics.talent.pipeline_statuses).length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={Object.entries(dashboardMetrics.talent.pipeline_statuses).map(([stage, count]) => ({ stage: stage.replace(/_/g, " "), count }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border-rgb),0.4)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="stage" tick={{ fontSize: 10, fill: "var(--text-muted)" }} width={90} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid rgba(var(--primary-rgb),0.2)", borderRadius: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }} />
                  <Bar dataKey="count" fill="var(--accent)" radius={[0, 6, 6, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "28px", opacity: 0.4, marginBottom: "6px" }}>🎯</div>
                No pipeline data available
              </div>
            )}
          </div>

          {/* Workforce — Pie/Donut Chart */}
          <div className="glass-card glow" style={{ border: "1px solid rgba(var(--primary-rgb),0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4 style={{ margin: 0, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>🧑‍💼 Workforce Composition</h4>
            </div>
            {dashboardMetrics?.hr?.total_employees > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Active", value: dashboardMetrics.hr.total_employees - (dashboardMetrics.hr?.attrition_rate || 0) * dashboardMetrics.hr.total_employees / 100 },
                      { name: "Attrited", value: (dashboardMetrics.hr?.attrition_rate || 0) * dashboardMetrics.hr.total_employees / 100 || 1 }
                    ]}
                    cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid rgba(var(--primary-rgb),0.2)", borderRadius: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "28px", opacity: 0.4, marginBottom: "6px" }}>🧑‍💼</div>
                No workforce data available
              </div>
            )}
          </div>
        </div>

        {/* ===== ATTENDANCE ANALYTICS ===== */}
        <AttendanceAnalyticsSection attendanceAnalytics={attendanceAnalytics} />

        {/* ===== RECRUITMENT ANALYTICS ===== */}
        <RecruitmentAnalyticsSection
          dashboardMetrics={dashboardMetrics}
          recruitmentSearch={recruitmentSearch}
          setRecruitmentSearch={setRecruitmentSearch}
          fetchRecruitmentAnalytics={fetchRecruitmentAnalytics}
          recruitmentFilterStage={recruitmentFilterStage}
          setRecruitmentFilterStage={setRecruitmentFilterStage}
          setActiveView={setActiveView}
          setTalentActiveTab={setTalentActiveTab}
        />

        {/* ===== APPRAISAL PERSPECTIVE ===== */}
        <AppraisalPerspectiveSection
          currentUser={currentUser}
          currentEmployee={currentEmployee}
          kras={kras}
          dashAppraisalTab={dashAppraisalTab}
          setDashAppraisalTab={setDashAppraisalTab}
          myReviews={myReviews}
          setActiveView={setActiveView}
          selectedReviewCycle={selectedReviewCycle}
          appraisalSelfRating={appraisalSelfRating}
          setAppraisalSelfRating={setAppraisalSelfRating}
          appraisalSelfFeedback={appraisalSelfFeedback}
          setAppraisalSelfFeedback={setAppraisalSelfFeedback}
          allReviews={allReviews}
          appraisalMgrFeedback={appraisalMgrFeedback}
          setAppraisalMgrFeedback={setAppraisalMgrFeedback}
          appraisalMgrRating={appraisalMgrRating}
          setAppraisalMgrRating={setAppraisalMgrRating}
        />
        </>
      )}

      {currentUser?.role === "employee" && currentEmployee && showUserProfileDashboard && (
        <div className="glass-card animated" style={{ marginTop: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px", marginBottom: "20px" }}>
            <span style={{ fontSize: "24px" }}>👤</span>
            <div>
              <h3 style={{ margin: 0 }}>My Deep Employee Profile</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: 0 }}>Self-Service statutory records, skills repository & active project roles</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {/* Left Column: Statutory & Emergency */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <h4 style={{ color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px", marginBottom: "12px" }}>Statutory & Personal Identifiers</h4>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "6px 0", color: "var(--text-muted)", fontWeight: 500 }}>PAN Card:</td>
                      <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600 }}>{currentEmployee.pan_card || "Not Filled"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "var(--text-muted)", fontWeight: 500 }}>Aadhaar Card:</td>
                      <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600 }}>{currentEmployee.aadhaar_card || "Not Filled"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "var(--text-muted)", fontWeight: 500 }}>EPF UAN Number:</td>
                      <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600 }}>{currentEmployee.uan_number || "Not Filled"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "var(--text-muted)", fontWeight: 500 }}>PF Account No:</td>
                      <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600 }}>{currentEmployee.pf_number || "Not Filled"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "var(--text-muted)", fontWeight: 500 }}>ESIC Insurance No:</td>
                      <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600 }}>{currentEmployee.esic_number || "Not Filled"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "var(--text-muted)", fontWeight: 500 }}>Shift / Roster:</td>
                      <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600 }}>
                        <span className="badge" style={{ background: "rgba(0,194,212,0.1)", color: "var(--primary)" }}>{currentEmployee.current_shift || "General Shift"}</span>
                      </td>
                    </tr>
                    {currentEmployee.deputation_details && (
                      <tr>
                        <td style={{ padding: "6px 0", color: "var(--text-muted)", fontWeight: 500 }}>Deputation:</td>
                        <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600 }}>{currentEmployee.deputation_details}</td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ padding: "6px 0", color: "var(--text-muted)", fontWeight: 500 }}>Phone:</td>
                      <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600 }}>{currentEmployee.phone || "\u2014"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 style={{ color: "var(--accent)", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px", marginBottom: "12px" }}>Emergency Medical Context</h4>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "6px 0", color: "var(--text-muted)", fontWeight: 500 }}>Blood Group:</td>
                      <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600 }}>{currentEmployee.blood_group || "\u2014"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "var(--text-muted)", fontWeight: 500 }}>Contact Name:</td>
                      <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600 }}>{currentEmployee.emergency_contact_name || "\u2014"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "var(--text-muted)", fontWeight: 500 }}>Relation:</td>
                      <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600 }}>{currentEmployee.emergency_contact_relation || "\u2014"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "var(--text-muted)", fontWeight: 500 }}>Phone:</td>
                      <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600 }}>{currentEmployee.emergency_contact_phone || "\u2014"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Middle Column: Skills & Allocations */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <h4 style={{ color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px", marginBottom: "12px" }}>Active Capacity & Project Roles</h4>
                {!currentEmployee.project_allocations || currentEmployee.project_allocations.length === 0 ? (
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>Bench (Unassigned) - Standard Operating Capacity</div>
                ) : (
                  currentEmployee.project_allocations.map((alloc: any) => {
                    const proj = projects.find(p => p.id === alloc.project_id);
                    const projName = proj ? proj.name : "Unknown Project";
                    const client = proj ? clients.find(c => c.id === proj.client_id) : null;
                    const clientName = client ? client.name : "";
                    return (
                      <div key={alloc.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "10px", marginBottom: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700 }}>
                          <span>{projName}</span>
                          <span style={{ color: "var(--primary)" }}>{alloc.allocation_percentage}%</span>
                        </div>
                        {clientName && <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Client: {clientName}</div>}
                        <div style={{ fontSize: "12px", marginTop: "6px" }}>
                          Role: <strong style={{ color: "var(--accent)" }}>{alloc.project_role}</strong>
                        </div>
                        <div style={{ height: "6px", background: "var(--border-color)", borderRadius: "3px", marginTop: "8px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${alloc.allocation_percentage}%`, background: "var(--grad-brand)", borderRadius: "3px" }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div>
                <h4 style={{ color: "var(--accent)", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px", marginBottom: "12px" }}>Skills Cloud</h4>
                {!currentEmployee.skillsets || currentEmployee.skillsets.length === 0 ? (
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>No skills listed. Request HR Admin to update.</div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {currentEmployee.skillsets.map((skill: any) => (
                      <span key={skill.id} className="badge" style={{ background: "var(--grad-brand)", color: "#fff", padding: "6px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 }}>
                        {skill.skill_name} \u2022 {skill.proficiency}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Work Experience & Academic History */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <h4 style={{ color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px", marginBottom: "12px" }}>Employment Timeline (Historic)</h4>
                {!currentEmployee.work_experiences || currentEmployee.work_experiences.length === 0 ? (
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>No prior company experience loaded</div>
                ) : (
                  currentEmployee.work_experiences.map((exp: any) => (
                    <div key={exp.id} style={{ borderLeft: "2px solid var(--primary)", paddingLeft: "12px", marginBottom: "12px", fontSize: "12px" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{exp.designation} at {exp.company_name}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                        {exp.start_date || "N/A"} to {exp.end_date || "Present"} ({exp.tenure_months} months)
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div>
                <h4 style={{ color: "var(--accent)", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px", marginBottom: "12px" }}>Academic Qualifications</h4>
                {!currentEmployee.academic_qualifications || currentEmployee.academic_qualifications.length === 0 ? (
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>No academic records loaded</div>
                ) : (
                  currentEmployee.academic_qualifications.map((acad: any) => (
                    <div key={acad.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "6px", marginBottom: "6px", fontSize: "12px" }}>
                      <div>
                        <strong style={{ color: "var(--text-primary)" }}>{acad.degree}</strong>
                        <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>{acad.institution} \u2022 {acad.passing_year}</div>
                      </div>
                      <span className="badge" style={{ alignSelf: "center", background: "rgba(139, 92, 246, 0.1)", color: "var(--accent)" }}>{acad.cgpa_percentage} CGPA</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
