import React from "react";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

// ====================================================================
// Attendance Analytics Section
// ====================================================================
export interface AttendanceAnalyticsSectionProps {
  attendanceAnalytics: any;
}

export function AttendanceAnalyticsSection({ attendanceAnalytics }: AttendanceAnalyticsSectionProps) {
  return (
    <div className="glass-card glow" style={{ border: "1px solid rgba(var(--primary-rgb),0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: "rgba(var(--primary-rgb),0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px"
        }}>🕒</div>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px" }}>Attendance Analytics</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "2px 0 0" }}>Shift distribution, hours worked, and check-in locations</p>
        </div>
      </div>
      {attendanceAnalytics ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          <div style={{ padding: "16px", borderRadius: "var(--radius-sm)", background: "rgba(var(--primary-rgb),0.03)", border: "1px solid var(--border-color)" }}>
            <h4 style={{ marginBottom: "14px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>🔄 Shift Distribution</h4>
            {attendanceAnalytics.shift_distribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={attendanceAnalytics.shift_distribution.map((s: any) => ({ name: s.shift, value: s.count }))} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }: any) => `${(percent * 100).toFixed(0)}%`}>
                    {attendanceAnalytics.shift_distribution.map((_: any, i: number) => (
                      <Cell key={i} fill={["var(--primary)", "var(--accent)", "#f59e0b", "#10b981", "#8b5cf6"][i % 5]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "30px 0", fontSize: "13px" }}>No shift data available</p>
            )}
          </div>
          <div style={{ padding: "16px", borderRadius: "var(--radius-sm)", background: "rgba(var(--primary-rgb),0.03)", border: "1px solid var(--border-color)" }}>
            <h4 style={{ marginBottom: "14px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>📊 Weekly Hours Worked</h4>
            {attendanceAnalytics.hours_worked?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={attendanceAnalytics.hours_worked.map((h: any) => ({ week: h.week?.slice(0, 10) || "", hours: h.total_hours }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border-rgb),0.4)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 9, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px" }} />
                  <Bar dataKey="hours" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "30px 0", fontSize: "13px" }}>No hours data available</p>
            )}
          </div>
          <div style={{ padding: "16px", borderRadius: "var(--radius-sm)", background: "rgba(var(--primary-rgb),0.03)", border: "1px solid var(--border-color)" }}>
            <h4 style={{ marginBottom: "14px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>📍 Geo Check-in Locations</h4>
            {attendanceAnalytics.geo_locations?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {attendanceAnalytics.geo_locations.map((loc: any, i: number) => {
                  const totalCheckins = attendanceAnalytics.geo_locations.reduce((sum: number, l: any) => sum + l.checkins, 0);
                  const pct = totalCheckins > 0 ? Math.round((loc.checkins / totalCheckins) * 100) : 0;
                  return (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                        <span style={{ color: "var(--text-muted)" }}>{loc.ip || `📍 ${parseFloat(loc.lat).toFixed(2)}, ${parseFloat(loc.lng).toFixed(2)}`}</span>
                        <span style={{ fontWeight: 700, color: "var(--primary)" }}>{pct}%</span>
                      </div>
                      <div style={{ height: "6px", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "var(--grad-brand)", borderRadius: "3px", transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "30px 0", fontSize: "13px" }}>No geo-location data available</p>
            )}
          </div>
        </div>
      ) : (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>Loading attendance analytics...</p>
      )}
    </div>
  );
}

// ====================================================================
// Recruitment Analytics Section
// ====================================================================
export interface RecruitmentAnalyticsSectionProps {
  dashboardMetrics: any;
  recruitmentSearch: string;
  setRecruitmentSearch: (value: string) => void;
  fetchRecruitmentAnalytics: (search?: string) => void;
  recruitmentFilterStage: string;
  setRecruitmentFilterStage: (value: string) => void;
  setActiveView: (view: string) => void;
  setTalentActiveTab: (tab: string) => void;
}

export function RecruitmentAnalyticsSection(props: RecruitmentAnalyticsSectionProps) {
  const {
    dashboardMetrics,
    recruitmentSearch,
    setRecruitmentSearch,
    fetchRecruitmentAnalytics,
    recruitmentFilterStage,
    setRecruitmentFilterStage,
    setActiveView,
    setTalentActiveTab,
  } = props;

  return (
    <div className="glass-card glow" style={{ border: "1px solid rgba(var(--primary-rgb),0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: "rgba(var(--accent-rgb),0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px"
        }}>🎯</div>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px" }}>Recruitment Analytics</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "2px 0 0" }}>Candidate pipeline, stage distribution, and search</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", pointerEvents: "none" }}>🔍</span>
          <input type="text" placeholder="Search candidates..." className="form-control"
            style={{ padding: "8px 12px 8px 32px", fontSize: "13px", width: "100%" }}
            value={recruitmentSearch}
            onChange={(e) => { setRecruitmentSearch(e.target.value); fetchRecruitmentAnalytics(e.target.value); }}
          />
        </div>
        <select className="form-control" style={{ maxWidth: "200px", padding: "8px 12px", fontSize: "13px" }}
          value={recruitmentFilterStage}
          onChange={(e) => { setRecruitmentFilterStage(e.target.value); fetchRecruitmentAnalytics(recruitmentSearch); }}
        >
          <option value="">All Stages</option>
          <option value="applied">Applied</option>
          <option value="interview_scheduled">Interview Scheduled</option>
          <option value="interviewed">Interviewed</option>
          <option value="selected">Selected</option>
          <option value="offered">Offered</option>
          <option value="onboarded">Onboarded</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
        <div style={{ padding: "16px", borderRadius: "var(--radius-sm)", background: "rgba(var(--primary-rgb),0.03)", border: "1px solid var(--border-color)" }}>
          <h4 style={{ marginBottom: "14px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>📊 Candidate Stage Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { stage: "Applied", count: dashboardMetrics?.talent?.pipeline_statuses?.applied || 0 },
              { stage: "Interview", count: (dashboardMetrics?.talent?.pipeline_statuses?.interview_scheduled || 0) + (dashboardMetrics?.talent?.pipeline_statuses?.interviewed || 0) },
              { stage: "Selected", count: dashboardMetrics?.talent?.pipeline_statuses?.selected || 0 },
              { stage: "Offered", count: dashboardMetrics?.talent?.pipeline_statuses?.offered || 0 },
              { stage: "Onboarded", count: dashboardMetrics?.talent?.pipeline_statuses?.onboarded || 0 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border-rgb),0.4)" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
                {[
                  { stage: "Applied", count: 0 }, { stage: "Interview", count: 0 }, { stage: "Selected", count: 0 },
                  { stage: "Offered", count: 0 }, { stage: "Onboarded", count: 0 }
                ].map((_, idx) => (
                  <Cell key={idx} fill={["var(--primary)", "var(--accent)", "#f59e0b", "#10b981", "#8b5cf6"][idx]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ flex: 1, padding: "20px", borderRadius: "var(--radius-sm)", background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.06), rgba(var(--accent-rgb),0.03))", border: "1px solid rgba(var(--primary-rgb),0.1)", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>Total Candidates</div>
            <div style={{ fontSize: "52px", fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>
              {dashboardMetrics?.talent?.total_candidates ?? 0}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Active candidates in pipeline</div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "16px" }}>
              <button onClick={() => setActiveView("talent-mgmt")} className="btn btn-primary btn-sm" style={{ padding: "6px 16px", fontSize: "12px" }}>View Full Pipeline</button>
              <button onClick={() => { setActiveView("talent-mgmt"); setTalentActiveTab("matcher"); }} className="btn btn-secondary btn-sm" style={{ padding: "6px 16px", fontSize: "12px" }}>AI Match</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// Appraisal Perspective Section
// ====================================================================
export interface AppraisalPerspectiveSectionProps {
  currentUser: any;
  currentEmployee: any;
  kras: any[];
  dashAppraisalTab: string;
  setDashAppraisalTab: (tab: string) => void;
  myReviews: any[];
  setActiveView: (view: string) => void;
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
}

export function AppraisalPerspectiveSection(props: AppraisalPerspectiveSectionProps) {
  const {
    currentUser,
    currentEmployee,
    kras,
    dashAppraisalTab,
    setDashAppraisalTab,
    myReviews,
    setActiveView,
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
  } = props;

  return (
    <div className="glass-card glow" style={{ border: "1px solid rgba(var(--primary-rgb),0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px"
        }}>📈</div>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px" }}>Appraisal Perspective</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "2px 0 0" }}>KRA goals, self review, manager feedback, and history</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div>
          <h4 style={{ marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
            <span style={{
              width: "28px", height: "28px", borderRadius: "8px",
              background: "rgba(99,102,241,0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "14px"
            }}>🎯</span>
            Key Result Areas
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>
              ({kras.filter(k => k.employee_id === currentEmployee?.id || !k.employee_id).length})
            </span>
          </h4>
          {kras.filter(k => k.employee_id === currentEmployee?.id || !k.employee_id).length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
              <div style={{ fontSize: "32px", opacity: 0.3, marginBottom: "8px" }}>🎯</div>
              No KRAs defined yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {kras.filter(k => k.employee_id === currentEmployee?.id || !k.employee_id).map((kra: any, i: number) => (
                <div key={kra.id || i} style={{
                  padding: "14px 16px", borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)", background: "rgba(var(--primary-rgb),0.02)",
                  transition: "all 0.15s"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 700, fontSize: "13px" }}>{kra.title}</span>
                    <span className="badge" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", fontSize: "10px", fontWeight: 700 }}>{kra.weightage}%</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{kra.description}</div>
                  {kra.target_date && (
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>🎯 Target: {kra.target_date}</div>
                  )}
                  {(kra as any).self_score && (
                    <div style={{ marginTop: "8px", display: "flex", gap: "16px", fontSize: "12px" }}>
                      <span>Self: <strong style={{ color: "var(--primary)" }}>{(kra as any).self_score}/5</strong></span>
                      {(kra as any).manager_score && <span>Mgr: <strong style={{ color: "var(--accent)" }}>{(kra as any).manager_score}/5</strong></span>}
                    </div>
                  )}
                  <div style={{ height: "4px", background: "var(--border-color)", borderRadius: "2px", marginTop: "10px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${kra.weightage}%`, background: "var(--grad-brand)", borderRadius: "2px" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <button className="btn btn-secondary btn-sm" style={{ marginTop: "12px", width: "100%", padding: "6px", fontSize: "12px" }}
            onClick={() => setActiveView("appraisals")}
          >View All KRAs →</button>
        </div>

        <div>
          <div style={{ display: "flex", gap: "4px", marginBottom: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
            {[
              { key: "self", label: "📝 Self Review" },
              { key: "manager", label: "👔 Manager Review" },
              { key: "history", label: "📚 History" },
            ].map(tab => (
              <button key={tab.key} style={{
                padding: "6px 16px", borderRadius: "var(--radius-full)", border: "none",
                background: dashAppraisalTab === tab.key ? "var(--grad-brand)" : "transparent",
                color: dashAppraisalTab === tab.key ? "#fff" : "var(--text-muted)",
                fontWeight: 600, fontSize: "12px", cursor: "pointer", transition: "all 0.15s"
              }} onClick={() => setDashAppraisalTab(tab.key)}>{tab.label}</button>
            ))}
          </div>

          {dashAppraisalTab === "self" && (
            <div>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>Current Cycle: <span style={{ color: "var(--primary)" }}>{selectedReviewCycle}</span></span>
                  {appraisalSelfRating > 0 && (
                    <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", fontSize: "11px" }}>Self Rating: {appraisalSelfRating}/5 ⭐</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} style={{
                      flex: 1, padding: "10px 4px", borderRadius: "8px", border: "2px solid",
                      borderColor: appraisalSelfRating === n ? "var(--primary)" : "var(--border-color)",
                      background: appraisalSelfRating === n ? "rgba(var(--primary-rgb),0.1)" : "transparent",
                      color: appraisalSelfRating === n ? "var(--primary)" : "var(--text-muted)",
                      fontWeight: 700, fontSize: "14px", cursor: "pointer", textAlign: "center",
                      transition: "all 0.15s"
                    }} onClick={() => setAppraisalSelfRating(n)}
                      title={["", "Unsatisfactory", "Needs Improvement", "Meets Expectations", "Highly Valued", "Outstanding"][n]}
                    >
                      {n}
                      <div style={{ fontSize: "8px", fontWeight: 400, marginTop: "2px" }}>
                        {["1 - Unsatisfactory", "2 - Needs Improv.", "3 - Meets Expect.", "4 - Highly Valued", "5 - Outstanding"][n - 1]}
                      </div>
                    </button>
                  ))}
                </div>
                <textarea className="form-control" rows={2} placeholder="Share your self-review commentary..."
                  value={appraisalSelfFeedback} onChange={e => setAppraisalSelfFeedback(e.target.value)}
                  style={{ fontSize: "12px", marginBottom: "10px" }} />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn btn-primary" style={{ flex: 1, padding: "6px", fontSize: "12px" }}>Save Self Review</button>
                  <button className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }}
                    onClick={() => setActiveView("appraisals")}
                  >Full Review →</button>
                </div>
              </div>
              {appraisalSelfFeedback && (
                <div style={{ padding: "10px", borderRadius: "var(--radius-sm)", background: "rgba(var(--primary-rgb),0.04)", border: "1px solid rgba(var(--primary-rgb),0.1)", fontSize: "12px" }}>
                  <strong style={{ fontSize: "11px", color: "var(--primary)" }}>📌 Your Last Commentary:</strong>
                  <p style={{ margin: "6px 0 0", color: "var(--text-muted)" }}>{appraisalSelfFeedback}</p>
                </div>
              )}
            </div>
          )}

          {dashAppraisalTab === "manager" && (
            <div>
              {(allReviews || []).filter((r: any) => r.id && (r.employee_id === currentEmployee?.id)).length === 0 && !appraisalMgrFeedback ? (
                <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
                  <div style={{ fontSize: "28px", opacity: 0.3, marginBottom: "6px" }}>👔</div>
                  No manager review yet for this cycle
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(allReviews || []).filter((r: any) => r.employee_id === currentEmployee?.id).map((rev: any, i: number) => (
                    <div key={rev.id || i} style={{
                      padding: "12px 14px", borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)", background: "rgba(99,102,241,0.03)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontWeight: 700, fontSize: "13px" }}>{rev.review_cycle || selectedReviewCycle}</span>
                        <span className="badge" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6", fontSize: "10px" }}>{rev.manager_rating || appraisalMgrRating}/5</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{rev.manager_feedback || appraisalMgrFeedback}</div>
                    </div>
                  ))}
                  {!appraisalMgrFeedback && (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "8px" }}>
                      Waiting for manager to complete review...
                    </div>
                  )}
                </div>
              )}
              {(currentUser?.role === "hr_admin" || currentUser?.role === "manager") && (
                <div style={{ marginTop: "12px" }}>
                  <select className="form-control" style={{ fontSize: "12px", marginBottom: "8px" }} value={appraisalMgrRating} onChange={e => setAppraisalMgrRating(Number(e.target.value))}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n} - {["Unsatisfactory", "Needs Improvement", "Meets Expectations", "Highly Valued", "Outstanding"][n - 1]}</option>
                    ))}
                  </select>
                  <textarea className="form-control" rows={2} placeholder="Manager feedback..." value={appraisalMgrFeedback} onChange={e => setAppraisalMgrFeedback(e.target.value)} style={{ fontSize: "12px", marginBottom: "8px" }} />
                  <button className="btn btn-accent" style={{ width: "100%", padding: "6px", fontSize: "12px" }}>Submit Manager Review</button>
                </div>
              )}
            </div>
          )}

          {dashAppraisalTab === "history" && (
            <div>
              {(myReviews || []).length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
                  <div style={{ fontSize: "28px", opacity: 0.3, marginBottom: "6px" }}>📚</div>
                  No past appraisal records found
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(myReviews || []).map((rev: any, i: number) => (
                    <div key={rev.id || i} style={{
                      padding: "12px 14px", borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)", background: "rgba(var(--primary-rgb),0.02)",
                      display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "13px" }}>{rev.review_cycle || `Cycle ${i + 1}`}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Self: {rev.self_rating || "—"}/5 · Mgr: {rev.manager_rating || "—"}/5
                        </div>
                      </div>
                      <span className="badge" style={{
                        background: rev.status === "Completed" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                        color: rev.status === "Completed" ? "#10b981" : "#f59e0b", fontSize: "10px"
                      }}>{rev.status || "Draft"}</span>
                    </div>
                  ))}
                </div>
              )}
              <button className="btn btn-secondary btn-sm" style={{ marginTop: "12px", width: "100%", padding: "6px", fontSize: "12px" }}
                onClick={() => setActiveView("appraisals")}
              >View Full History →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

