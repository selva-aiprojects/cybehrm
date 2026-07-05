import React from "react";

export const GRADE_ORDER = ["L6", "L5", "L4", "L3", "L2", "L1"];
export const GRADE_LABELS: Record<string, string> = {
  L6: "Director",
  L5: "Principal Consultant",
  L4: "Technical Lead",
  L3: "Senior Consultant",
  L2: "Consultant",
  L1: "Associate",
};
export const GRADE_COLORS: Record<string, string> = {
  L6: "#8b5cf6",
  L5: "#3b82f6",
  L4: "#10b981",
  L3: "#f59e0b",
  L2: "#f97316",
  L1: "#6b7280",
};

export const CARD_W = 170;
export const CARD_GAP = 20;
export const SVG_H = 48;

function getInitials(emp: any): string {
  return ((emp.first_name?.[0] || "") + (emp.last_name?.[0] || "")).toUpperCase() || "?";
}

function getFunctionalTitle(emp: any, functionalTitles: any[]): string {
  const ft = functionalTitles.find((t: any) => t.id === emp.functional_title_id);
  return ft?.name || emp.designation_id || "\u2014";
}

export function GradeBadge({ grade }: { grade: string }) {
  const color = GRADE_COLORS[grade] || "#6b7280";
  const label = GRADE_LABELS[grade] || grade;
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: "999px",
      fontSize: "10px", fontWeight: 600, letterSpacing: "0.3px",
      background: `${color}18`, color, border: `1px solid ${color}30`,
      whiteSpace: "nowrap",
    }}>
      {grade} \u00B7 {label}
    </span>
  );
}

export function EmployeeCard({ emp, functionalTitles, onClick }: { emp: any; functionalTitles: any[]; onClick: () => void }) {
  const initials = getInitials(emp);
  const title = getFunctionalTitle(emp, functionalTitles);
  const gradeColor = GRADE_COLORS[emp.grade] || "#6b7280";
  return (
    <div onClick={onClick} style={{
      width: CARD_W, background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)", border: "1px solid var(--border-color)",
      borderRadius: "12px", padding: "14px 12px", cursor: "pointer",
      transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
      textAlign: "center", position: "relative", overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px) scale(1.02)"; e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${gradeColor}, var(--primary))`, opacity: 0.7 }} />
      <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--grad-brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 700, color: "#fff", boxShadow: `0 4px 14px ${gradeColor}40`, flexShrink: 0 }}>{initials}</div>
      <div style={{ minHeight: "32px" }}>
        <div style={{ fontWeight: 600, fontSize: "13px", lineHeight: 1.3, color: "var(--text-primary)" }}>{emp.first_name} {emp.last_name}</div>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", lineHeight: 1.3 }}>{title}</div>
      </div>
      <GradeBadge grade={emp.grade || "L1"} />
    </div>
  );
}

export function LevelConnector({ upperCount, lowerCount, width }: { upperCount: number; lowerCount: number; width: number }) {
  if (upperCount === 0 || lowerCount === 0) return null;
  const upperRowW = upperCount * CARD_W + (upperCount - 1) * CARD_GAP;
  const lowerRowW = lowerCount * CARD_W + (lowerCount - 1) * CARD_GAP;
  const upperOff = Math.max(0, (width - upperRowW) / 2);
  const lowerOff = Math.max(0, (width - lowerRowW) / 2);
  const getCX = (i: number, offset: number) => offset + i * (CARD_W + CARD_GAP) + CARD_W / 2;
  const topY = 0; const midY = SVG_H / 2; const botY = SVG_H;
  const upperCXs = Array.from({ length: upperCount }, (_, i) => getCX(i, upperOff));
  const lowerCXs = Array.from({ length: lowerCount }, (_, i) => getCX(i, lowerOff));
  const upperMin = Math.min(...upperCXs); const upperMax = Math.max(...upperCXs);
  const lowerMin = Math.min(...lowerCXs); const lowerMax = Math.max(...lowerCXs);
  const d: string[] = [];
  for (const cx of upperCXs) d.push(`M${cx},${topY + 4} L${cx},${midY}`);
  const hMin = Math.min(upperMin, lowerMin); const hMax = Math.max(upperMax, lowerMax);
  d.push(`M${hMin},${midY} L${hMax},${midY}`);
  for (const cx of lowerCXs) d.push(`M${cx},${midY} L${cx},${botY - 4}`);
  return (
    <svg width={width} height={SVG_H} style={{ display: "block", overflow: "visible" }}>
      <path d={d.join(" ")} fill="none" stroke="var(--border-color)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
    </svg>
  );
}

export function DepartmentTree({ dept, employees, functionalTitles, onSelectEmployee }: {
  dept: string; employees: any[]; functionalTitles: any[]; onSelectEmployee: (id: string) => void;
}) {
  const groupedByGrade: Record<string, any[]> = {};
  for (const emp of employees) {
    const g = emp.grade || "L1";
    if (!groupedByGrade[g]) groupedByGrade[g] = [];
    groupedByGrade[g].push(emp);
  }
  const presentGrades = GRADE_ORDER.filter((g) => groupedByGrade[g]?.length > 0);
  if (presentGrades.length === 0) {
    return <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "13px" }}>{employees.length} employee{employees.length !== 1 ? "s" : ""} (no grade assigned)</div>;
  }
  const maxCards = Math.max(...presentGrades.map((g) => groupedByGrade[g].length));
  const treeWidth = maxCards * CARD_W + (maxCards - 1) * CARD_GAP;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      <div style={{ background: "var(--grad-brand)", borderRadius: "14px", padding: "12px 32px", boxShadow: "0 8px 32px rgba(139,92,246,0.25)", position: "relative", zIndex: 2 }}>
        <div style={{ fontWeight: 800, fontSize: "16px", color: "#fff", letterSpacing: "0.5px" }}>{dept}</div>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>{employees.length} member{employees.length !== 1 ? "s" : ""}</div>
      </div>
      {presentGrades.length > 0 && (() => {
        const firstCount = groupedByGrade[presentGrades[0]].length;
        const firstRowW = firstCount * CARD_W + (firstCount - 1) * CARD_GAP;
        const svgW = Math.max(treeWidth, firstRowW);
        return <svg width={svgW} height={34} style={{ display: "block", overflow: "visible" }}><line x1={svgW / 2} y1={0} x2={svgW / 2} y2={34} stroke="var(--border-color)" strokeWidth={1.5} opacity={0.5} strokeLinecap="round" /></svg>;
      })()}
      {presentGrades.map((grade, gi) => {
        const emps = groupedByGrade[grade];
        const count = emps.length;
        const rowW = count * CARD_W + (count - 1) * CARD_GAP;
        const svgW = Math.max(treeWidth, rowW);
        const offsetX = Math.max(0, (treeWidth - rowW) / 2);
        return (
          <React.Fragment key={grade}>
            {gi > 0 && (() => {
              const prevEmps = groupedByGrade[presentGrades[gi - 1]];
              return <LevelConnector upperCount={prevEmps.length} lowerCount={count} width={svgW} />;
            })()}
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: `${GRADE_COLORS[grade]}90`, marginBottom: "8px" }}>{grade} \u2014 {GRADE_LABELS[grade]}</div>
            <div style={{ display: "flex", gap: `${CARD_GAP}px`, paddingLeft: `${offsetX}px` }}>
              {emps.map((emp) => <EmployeeCard key={emp.id} emp={emp} functionalTitles={functionalTitles} onClick={() => { if (emp.id) onSelectEmployee(emp.id); }} />)}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
