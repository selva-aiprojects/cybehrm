// App.tsx - Premium Multi-Tenant HRMS Interface (CogniHR)
import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import { Toaster } from "react-hot-toast";
import { showToast } from "./utils/toast";
import LandingPage from "./pages/LandingPage";
import ConfirmModal from "./components/ConfirmModal";
import PromptModal from "./components/PromptModal";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

// API Base URL config
// Load the API base URL from Vite's environment variables, defaulting to localhost for local dev
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Zero-dependency SVG Icon helper component
export function HeaderIcon({ name, size = 16, className = "", style = {} }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  const icons: Record<string, React.ReactNode> = {
    profile: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    attendance: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    leave: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
    expenses: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </>
    ),
    payslips: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </>
    ),
    payroll: (
      <>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <line x1="6" y1="12" x2="6.01" y2="12" />
        <line x1="18" y1="12" x2="18.01" y2="12" />
      </>
    ),
    tax: (
      <>
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <line x1="9" y1="22" x2="9" y2="16" />
        <line x1="15" y1="22" x2="15" y2="16" />
        <line x1="9" y1="16" x2="15" y2="16" />
      </>
    ),
    insurance: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </>
    ),
    assets: (
      <>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </>
    ),
    documents: (
      <>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </>
    ),
    ai: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="15" x2="23" y2="15" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="15" x2="4" y2="15" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
    dashboard: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </>
    ),
    tickets: (
      <>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </>
    ),
    notifications: (
      <>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9z" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </>
    ),
    core_hr: (
      <>
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <line x1="9" y1="22" x2="9" y2="16" />
        <line x1="15" y1="22" x2="15" y2="16" />
        <line x1="9" y1="16" x2="15" y2="16" />
      </>
    ),
    talent: (
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
    performance: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    )
  };

  const svgContent = icons[name] || null;
  if (!svgContent) return null;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    >
      {svgContent}
    </svg>
  );
}

const getErrorMsg = (data: any, defaultMsg: string): string => {
  if (!data) return defaultMsg;
  const detail = data.detail || data;
  if (!detail) return defaultMsg;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((e: any) => {
      const field = Array.isArray(e.loc) ? e.loc.slice(1).join('.') : e.loc;
      return field ? `${field}: ${e.msg}` : e.msg;
    }).join(', ');
  }
  if (typeof detail === "object") {
    return JSON.stringify(detail);
  }
  return String(detail);
};

interface UserProfile {
  id: string;
  organization_id: string;
  email: string;
  role: string;
  is_active: boolean;
  organization_name?: string;
  feature_talent_mgmt?: boolean;
  feature_hr_team?: boolean;
  feature_resource_mgmt?: boolean;
}

interface Employee {
  id: string;
  organization_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  dob?: string;
  gender?: string;
  phone?: string;
  address?: string;
  department_id?: string;
  designation_id?: string;
  joining_date: string;
  employment_type: string;
  employment_status: string;
  email?: string;
  grade?: string;
  uan_number?: string;
  pf_number?: string;
  pan_card?: string;
  aadhaar_card?: string;
  esic_number?: string;
  marital_status?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  passport_number?: string;
  visa_details?: string;
  functional_title_id?: string;
  current_shift?: string;
  deputation_details?: string;
  functional_title?: { id: string; name: string; skill_category?: string };
  skillsets?: { id: string; skill_name: string; proficiency: string }[];
  work_experiences?: { id: string; company_name: string; designation: string; tenure_months: number; start_date?: string; end_date?: string }[];
  academic_qualifications?: { id: string; degree: string; institution: string; passing_year?: number; cgpa_percentage?: number }[];
  project_allocations?: { id: string; project_id: string; project_role: string; allocation_percentage: number; billing_status: string; billing_hourly_rate?: number; start_date?: string }[];
}

interface Attendance {
  id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: string;
  late_minutes: number;
  overtime_minutes: number;
  work_minutes: number;
}

interface LeaveBalance {
  id: string;
  leave_type: string;
  allocated: number;
  used: number;
  remaining: number;
}

interface LeaveRequest {
  id: string;
  employee_name?: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: string;
  applied_at: string;
}

interface Payslip {
  id: string;
  employee_name?: string;
  basic: number;
  hra: number;
  allowances: number;
  bonus: number;
  gross_salary: number;
  pf: number;
  tax: number;
  nps?: number;
  professional_tax?: number;
  deductions: number;
  net_salary: number;
  status: string;
  custom_deductions?: { [key: string]: number };
  month?: string;
  pay_period?: string;
  net_pay?: number;
  total_net?: number;
  gross_pay?: number;
  total_earnings?: number;
  total_deductions?: number;
  breakdown?: Record<string, number>;
  earnings?: Record<string, number>;
  deductions_breakdown?: Record<string, number>;
  pdf_url?: string;
  generated_at?: string;
  created_at?: string;
}

interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
}

// --- Dynamic SVG Dashboard Charts ---
const FunnelChart = ({ data }: { data: any }) => {
  const openPos = data?.open_positions || 0;
  const cands = data?.total_candidates || 0;
  const interviews = data?.interviews_scheduled || 0;
  const offers = data?.pending_offers || 0;
  
  const maxVal = Math.max(openPos, cands, interviews, offers, 1);
  const w1 = 300;
  const w2 = Math.max(80, (cands / maxVal) * 300);
  const w3 = Math.max(60, (interviews / maxVal) * 300);
  const w4 = Math.max(40, (offers / maxVal) * 300);

  const steps = [
    { label: "Open Positions", value: openPos, width: w1, grad: "url(#funnel-grad-1)" },
    { label: "Active Candidates", value: cands, width: w2, grad: "url(#funnel-grad-2)" },
    { label: "Interviews Scheduled", value: interviews, width: w3, grad: "url(#funnel-grad-3)" },
    { label: "Offers Sent", value: offers, width: w4, grad: "url(#funnel-grad-4)" }
  ];

  return (
    <svg viewBox="0 0 400 240" width="100%" height="240" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="funnel-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f2fe" />
          <stop offset="100%" stopColor="#0F52BA" />
        </linearGradient>
        <linearGradient id="funnel-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00c2d4" />
          <stop offset="100%" stopColor="#00A88F" />
        </linearGradient>
        <linearGradient id="funnel-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
        <linearGradient id="funnel-grad-4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10d9a0" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        
        <filter id="funnel-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.25"/>
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {steps.map((step, idx) => {
        const y = 10 + idx * 58;
        const x = (400 - step.width) / 2;
        
        // Calculate conversion rate percentage
        let conversionRate = null;
        if (idx > 0) {
          const prevVal = steps[idx - 1].value;
          if (prevVal > 0) {
            conversionRate = Math.round((step.value / prevVal) * 100);
          }
        }

        return (
          <g key={idx} style={{ cursor: "pointer" }}>
            {/* Conversion rate bridge / connection bridges */}
            {idx < steps.length - 1 && (
              <g>
                <polygon
                  points={`
                    ${x + 15},${y + 36} 
                    ${x + step.width - 15},${y + 36} 
                    ${(400 - steps[idx+1].width) / 2 + 15},${y + 58} 
                    ${(400 - steps[idx+1].width) / 2 + steps[idx+1].width - 15},${y + 58}
                  `}
                  fill="var(--border-color)"
                  opacity={0.12}
                />
                {/* Arrow connector line */}
                <line 
                  x1="200" 
                  y1={y + 36} 
                  x2="200" 
                  y2={y + 54} 
                  stroke="var(--text-muted)" 
                  strokeWidth="1.5" 
                  strokeDasharray="3,3"
                  opacity={0.6}
                />
              </g>
            )}

            {/* Glowing Main Capsule Rect */}
            <rect
              x={x}
              y={y}
              width={step.width}
              height="36"
              rx="18"
              fill={step.grad}
              filter="url(#funnel-glow)"
              style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
            />

            {/* Glossy shine overlay */}
            <rect
              x={x + 2}
              y={y + 2}
              width={step.width - 4}
              height="14"
              rx="7"
              fill="rgba(255, 255, 255, 0.15)"
              style={{ pointerEvents: "none" }}
            />

            {/* Conversion Badge on the right */}
            {conversionRate !== null && (
              <g transform={`translate(${x + step.width - 45}, ${y + 10})`}>
                <rect width="36" height="16" rx="8" fill="rgba(0, 0, 0, 0.3)" />
                <text x="18" y="11" textAnchor="middle" fill="#00f2fe" style={{ fontSize: "8.5px", fontWeight: 700, fontFamily: "var(--font-sans)" }}>
                  {conversionRate}%
                </text>
              </g>
            )}

            <text
              x={idx === 0 || conversionRate === null ? 200 : 200 - 15}
              y={y + 22}
              textAnchor="middle"
              fill="#ffffff"
              style={{ fontSize: "11px", fontWeight: 800, fontFamily: "var(--font-sans)", pointerEvents: "none", letterSpacing: "0.5px" }}
            >
              {step.label}: {step.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const AttendanceTrendChart = ({ pct }: { pct: number }) => {
  const baseData = [85, 90, pct > 0 ? pct : 92, 88, 95, pct > 0 ? pct : 91];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Today"];
  
  const points = baseData.map((val, idx) => {
    const x = 40 + idx * 64;
    const y = 150 - (val / 100) * 110;
    return { x, y, val };
  });

  // Generate cubic bezier curve path through points
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p0.x + (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${pathD} L ${points[points.length-1].x} 150 L ${points[0].x} 150 Z`;

  return (
    <svg viewBox="0 0 400 180" width="100%" height="180" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="attendanceAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.0} />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--primary)" />
        </linearGradient>
        <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid Lines */}
      {[0, 25, 50, 75, 100].map((gridVal, i) => {
        const y = 150 - (gridVal / 100) * 110;
        return (
          <g key={i}>
            <line
              x1="40"
              y1={y}
              x2="360"
              y2={y}
              stroke="var(--border-color)"
              strokeDasharray="4,4"
              opacity={0.15}
            />
            <text
              x="25"
              y={y + 3}
              fill="var(--text-muted)"
              style={{ fontSize: "8px", fontWeight: 6, fontFamily: "var(--font-sans)", textAnchor: "end" }}
            >
              {gridVal}%
            </text>
          </g>
        );
      })}

      <path d={areaD} fill="url(#attendanceAreaGrad)" />
      
      <path
        d={pathD}
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#lineGlow)"
      />

      {points.map((p, idx) => (
        <g key={idx} style={{ cursor: "pointer" }}>
          {/* Node Glow background */}
          <circle
            cx={p.x}
            cy={p.y}
            r="8"
            fill="var(--accent)"
            opacity={0.15}
          />
          <circle
            cx={p.x}
            cy={p.y}
            r="4.5"
            fill="#ffffff"
            stroke="var(--accent)"
            strokeWidth="3.5"
            style={{ transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          />
          {/* Glowing value tooltip */}
          <g transform={`translate(${p.x}, ${p.y - 12})`}>
            <rect
              x="-16"
              y="-12"
              width="32"
              height="15"
              rx="4"
              fill="var(--bg-app)"
              stroke="var(--border-color)"
              strokeWidth="0.5"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
            />
            <text
              x="0"
              y="-1"
              textAnchor="middle"
              fill="var(--text-primary)"
              style={{ fontSize: "9px", fontWeight: 800, fontFamily: "var(--font-sans)" }}
            >
              {Math.round(p.val)}%
            </text>
          </g>
          <text
            x={p.x}
            y="168"
            textAnchor="middle"
            fill="var(--text-muted)"
            style={{ fontSize: "10px", fontWeight: 7, fontFamily: "var(--font-sans)" }}
          >
            {days[idx]}
          </text>
        </g>
      ))}
    </svg>
  );
};

const AllocationDonutChart = ({ assigned, total }: { assigned: number; total: number }) => {
  const totalVal = Math.max(total, 1);
  const assignedVal = Math.min(assigned, totalVal);
  const benchVal = Math.max(0, totalVal - assignedVal);
  const pct = Math.round((assignedVal / totalVal) * 100);

  const radius = 55;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const assignedOffset = circumference - (assignedVal / totalVal) * circumference;

  return (
    <svg viewBox="0 0 180 180" width="100%" height="180" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="donutGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="50%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="#00f2fe" />
        </linearGradient>
        <filter id="donutGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.08} />
          <stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Inner background radial lighting */}
      <circle cx="90" cy="90" r="75" fill="url(#centerGlow)" />

      {/* Donut base track */}
      <circle
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke="var(--border-color)"
        strokeWidth={strokeWidth - 2}
        opacity={0.15}
      />

      {/* Donut active indicator progress track */}
      <circle
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke="url(#donutGrad)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={assignedOffset}
        strokeLinecap="round"
        transform="rotate(-90 90 90)"
        filter="url(#donutGlow)"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
      />

      {/* Interactive text section */}
      <g transform="translate(90, 90)">
        <text y="-4" textAnchor="middle" fill="var(--text-primary)" style={{ fontSize: "26px", fontWeight: 800, fontFamily: "var(--font-heading)" }}>
          {pct}%
        </text>
        <text y="15" textAnchor="middle" fill="var(--text-muted)" style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Allocated
        </text>
      </g>

      <text x="50" y="160" textAnchor="middle" fill="var(--accent)" style={{ fontSize: "11px", fontWeight: 800, fontFamily: "var(--font-sans)" }}>
        ● Active: {assignedVal}
      </text>
      <text x="130" y="160" textAnchor="middle" fill="var(--text-muted)" style={{ fontSize: "11px", fontWeight: 7, fontFamily: "var(--font-sans)" }}>
        ○ Bench: {benchVal}
      </text>
    </svg>
  );
};

const TicketsBarChart = ({ activeTickets }: { activeTickets: number }) => {
  const categories = [
    { name: "Payroll", count: Math.round(activeTickets * 0.3) || 1, grad: "url(#bar-purple)" },
    { name: "Access", count: Math.round(activeTickets * 0.4) || 2, grad: "url(#bar-blue)" },
    { name: "Leave", count: Math.round(activeTickets * 0.2) || 1, grad: "url(#bar-teal)" },
    { name: "Other", count: Math.max(0, activeTickets - (Math.round(activeTickets * 0.3) + Math.round(activeTickets * 0.4) + Math.round(activeTickets * 0.2))) || 0, grad: "url(#bar-orange)" }
  ];

  const maxVal = Math.max(...categories.map(c => c.count), 4);
  
  return (
    <svg viewBox="0 0 360 170" width="100%" height="170" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="bar-purple" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
        <linearGradient id="bar-blue" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0F52BA" />
          <stop offset="100%" stopColor="#00f2fe" />
        </linearGradient>
        <linearGradient id="bar-teal" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#00A88F" />
          <stop offset="100%" stopColor="#00c2d4" />
        </linearGradient>
        <linearGradient id="bar-orange" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>

        <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15"/>
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid horizontal guidelines */}
      {[0, 0.5, 1].map((ratio, i) => {
        const y = 130 - ratio * 100;
        return (
          <line
            key={i}
            x1="40"
            y1={y}
            x2="320"
            y2={y}
            stroke="var(--border-color)"
            strokeDasharray="4,4"
            opacity={0.15}
          />
        );
      })}
      
      <line x1="40" y1="130" x2="320" y2="130" stroke="var(--border-color)" strokeWidth="1.5" opacity={0.4} />

      {categories.map((cat, idx) => {
        const x = 55 + idx * 70;
        const barHeight = (cat.count / maxVal) * 100;
        const y = 130 - barHeight;

        return (
          <g key={idx} style={{ cursor: "pointer" }}>
            {/* Main Gradient Rounded Bar */}
            <rect
              x={x}
              y={y}
              width="30"
              height={Math.max(barHeight, 4)}
              rx="6"
              fill={cat.grad}
              filter="url(#barGlow)"
              style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
            />
            {/* Shine top overlay */}
            <rect
              x={x + 2}
              y={y + 2}
              width="26"
              height="8"
              rx="3"
              fill="rgba(255, 255, 255, 0.12)"
              style={{ pointerEvents: "none" }}
            />
            <text
              x={x + 15}
              y={y - 8}
              textAnchor="middle"
              fill="var(--text-primary)"
              style={{ fontSize: "11px", fontWeight: 800, fontFamily: "var(--font-sans)" }}
            >
              {cat.count}
            </text>
            <text
              x={x + 15}
              y="148"
              textAnchor="middle"
              fill="var(--text-secondary)"
              style={{ fontSize: "10px", fontWeight: 7, fontFamily: "var(--font-sans)" }}
            >
              {cat.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default function App() {
  // Theme State
  const [appTheme, setAppTheme] = useState<"light" | "mixed" | "enterprise" | "corporate">("light");

  // Loading states for premium UX spinners
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [postingLoading, setPostingLoading] = useState<boolean>(false);
  const [positionLoading, setPositionLoading] = useState<boolean>(false);
  const [candidateLoading, setCandidateLoading] = useState<boolean>(false);
  const [offerLoading, setOfferLoading] = useState<boolean>(false);
  const [shardLoading, setShardLoading] = useState<boolean>(false);
  const [activeManagementTab, setActiveManagementTab] = useState<string>("");
  const [uiDensity, setUiDensity] = useState<"comfort" | "compact">("comfort");
  const [enableAnimations, setEnableAnimations] = useState<boolean>(true);

  // WordPress layout: Screen Options and Help Panels State
  const [showScreenOptions, setShowScreenOptions] = useState<boolean>(false);
  const [showHelpPanel, setShowHelpPanel] = useState<boolean>(false);
  
  // Dashboard card visibility options
  const [showMetricsDashboard, setShowMetricsDashboard] = useState<boolean>(true);
  const [showAiInsightsDashboard, setShowAiInsightsDashboard] = useState<boolean>(true);
  const [showAttendanceTrendDashboard, setShowAttendanceTrendDashboard] = useState<boolean>(true);
  const [showUserProfileDashboard, setShowUserProfileDashboard] = useState<boolean>(true);

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "Operations": true,
    "Employee Self Service (ESS)": true,
    "Core HR": true,
    "Talent Hub": true,
    "Performance Hub": true,
    "Management Hub": true,
  });

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [benefitsDropdownOpen, setBenefitsDropdownOpen] = useState<boolean>(false);

  // Authentication & Session States
  const [token, setToken] = useState<string | null>(localStorage.getItem("hrms-engine_token"));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<any | null>(null);
  const [orgName, setOrgName] = useState<string>("Acme Corporation");

  const userRole = currentUser?.role ?? "";
  const showHr = currentUser?.feature_hr_team || ["hr_admin", "HR Team"].includes(userRole);
  const showRecruitment = currentUser?.feature_talent_mgmt || ["hr_admin", "recruiter", "Talent Team"].includes(userRole);
  const showResource = currentUser?.feature_resource_mgmt || ["hr_admin", "Resource Mgmt Group", "manager", "hr_operations"].includes(userRole);

  const availableTabs = [
    ...(showHr ? [{ id: "hr_management", label: "Core HR" }] : []),
    ...(showRecruitment ? [{ id: "recruitment", label: "Talent Hub" }] : []),
    ...(showResource ? [{ id: "resource_management", label: "Performance Hub" }] : []),
  ];

  useEffect(() => {
    if (activeManagementTab !== "" && !availableTabs.some(t => t.id === activeManagementTab)) {
      setActiveManagementTab("");
      setActiveView("my-attendance");
    }
  }, [currentUser, showHr, showRecruitment, showResource]);

  useEffect(() => {
    if (!benefitsDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBenefitsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [benefitsDropdownOpen]);

  // Auth Portal States
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>("admin@orient-ts.com");
  const [loginPassword, setLoginPassword] = useState<string>("Password123");
  
  interface Organization {
    id: string;
    name: string;
  }
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  
  // Registration States
  const [regOrgName, setRegOrgName] = useState<string>("");
  const [regSubdomain, setRegSubdomain] = useState<string>("");
  const [regAdminEmail, setRegAdminEmail] = useState<string>("");
  const [regAdminPassword, setRegAdminPassword] = useState<string>("");

  // Error/Success Message banners
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Active Screen View Switcher
  const [activeView, setActiveView] = useState<string>("my-attendance");

  // API Domain Data States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState<string>("");
  const [showOnboardModal, setShowOnboardModal] = useState<boolean>(false);
  
  // New Employee Form States
  const [empId, setEmpId] = useState<string>("");
  const [empFirst, setEmpFirst] = useState<string>("");
  const [empLast, setEmpLast] = useState<string>("");
  const [empDob, setEmpDob] = useState<string>("");
  const [empGender, setEmpGender] = useState<string>("Male");
  const [empPhone, setEmpPhone] = useState<string>("");
  const [empAddress, setEmpAddress] = useState<string>("");
  const [empJoining, setEmpJoining] = useState<string>(new Date().toISOString().split("T")[0]);
  const [empType, setEmpType] = useState<string>("full-time");
  const [empEmail, setEmpEmail] = useState<string>("");
  const [empPassword, setEmpPassword] = useState<string>("");
  const [empRole, setEmpRole] = useState<string>("employee");

  // Attendance state
  const [myAttendance, setMyAttendance] = useState<Attendance[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState<boolean>(false);

  // Leave State
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [reqLeaveType, setReqLeaveType] = useState<string>("casual");
  const [reqStart, setReqStart] = useState<string>("");
  const [reqEnd, setReqEnd] = useState<string>("");
  const [reqReason, setReqReason] = useState<string>("");

  // Payroll fintech States
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [myPayslips, setMyPayslips] = useState<Payslip[]>([]);
  const [runMonth, setRunMonth] = useState<number>(new Date().getMonth() + 1);
  const [runYear, setRunYear] = useState<number>(2026);
  
  // Salary structure configuration states
  const [ssEmployeeId, setSsEmployeeId] = useState<string>("");
  const [ssBasic, setSsBasic] = useState<string>("45000");
  const [ssHra, setSsHra] = useState<string>("22500");
  const [ssAllowances, setSsAllowances] = useState<string>("10000");
  const [ssPf, setSsPf] = useState<string>("5400");
  const [ssTax, setSsTax] = useState<string>("4000");
  const [ssNps, setSsNps] = useState<string>("0");
  const [ssCustomDeductionsText, setSsCustomDeductionsText] = useState<string>("");

  // Groq AI Chat States
  const [aiQuery, setAiQuery] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: "assistant", text: "Hello! I am CogniHR, your AI Assistant powered by Groq LPUs. Ask me about company policy, vacation balance, or salary calculations." }
  ]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // --- FBP & Tax Portal States ---
  const [taxDeclarations, setTaxDeclarations] = useState<any[]>([]);
  const [allTaxDeclarations, setAllTaxDeclarations] = useState<any[]>([]);
  const [taxRegime, setTaxRegime] = useState<string>("new");
  const [sec80c, setSec80c] = useState<number>(0);
  const [sec80d, setSec80d] = useState<number>(0);
  const [rentPaid, setRentPaid] = useState<number>(0);
  const [landlordPan, setLandlordPan] = useState<string>("");
  const [landlordName, setLandlordName] = useState<string>("");
  const [evidenceUrl, setEvidenceUrl] = useState<string>("");
  const [gradeAllowance, setGradeAllowance] = useState<any>(null);
  const [fbpDecl, setFbpDecl] = useState<any>(null);
  const [fuelFbp, setFuelFbp] = useState<number>(0);
  const [ltaFbp, setLtaFbp] = useState<number>(0);
  const [phoneFbp, setPhoneFbp] = useState<number>(0);
  const [foodFbp, setFoodFbp] = useState<number>(0);

  // --- Corporate Benefits States ---
  const [insuranceEnrollment, setInsuranceEnrollment] = useState<any>(null);
  const [insTier, setInsTier] = useState<string>("base");
  const [insHasSpouse, setInsHasSpouse] = useState<boolean>(false);
  const [insHasParents, setInsHasParents] = useState<boolean>(false);

  // --- RMG Asset & Induction States ---
  const [rmgAssets, setRmgAssets] = useState<any[]>([]);
  const [rmgInductionTasks, setRmgInductionTasks] = useState<any[]>([]);
  const [rmgActiveTab, setRmgActiveTab] = useState<string>("assets");
  const [selectedInductionEmployeeFilter, setSelectedInductionEmployeeFilter] = useState<string>("");
  // --- Project Resource Allocation States ---
  const [rmgClients, setRmgClients] = useState<any[]>([]);
  const [rmgProjects, setRmgProjects] = useState<any[]>([]);
  const [rmgAllocations, setRmgAllocations] = useState<any[]>([]);
  const [rmgBench, setRmgBench] = useState<any[]>([]);
  const [allocActiveTab, setAllocActiveTab] = useState<string>("projects");
  const [showAllocModal, setShowAllocModal] = useState<boolean>(false);
  const [editingAlloc, setEditingAlloc] = useState<any | null>(null);
  const [allocEmpId, setAllocEmpId] = useState<string>("");
  const [rmgAllocProjectId, setRmgAllocProjectId] = useState<string>("");
  const [rmgAllocRole, setRmgAllocRole] = useState<string>("Developer");
  const [allocPct, setAllocPct] = useState<number>(100);
  const [rmgAllocBillingStatus, setRmgAllocBillingStatus] = useState<string>("Billable");
  const [allocStartDate, setAllocStartDate] = useState<string>("");
  const [allocProjectFilter, setAllocProjectFilter] = useState<string>("");
  const [allocTenureEmpId, setAllocTenureEmpId] = useState<string>("");
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [projName, setProjName] = useState<string>("");
  const [projCode, setProjCode] = useState<string>("");
  const [projClientId, setProjClientId] = useState<string>("");
  const [projBillingType, setProjBillingType] = useState<string>("Time & Material");
  const [projStartDate, setProjStartDate] = useState<string>("");
  const [projEndDate, setProjEndDate] = useState<string>("");

  const [showAssetModal, setShowAssetModal] = useState<boolean>(false);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const [assetName, setAssetName] = useState<string>("");
  const [assetType, setAssetType] = useState<string>("Laptop");
  const [assetSerial, setAssetSerial] = useState<string>("");
  const [assetStatus, setAssetStatus] = useState<string>("available");
  const [assetEmployeeId, setAssetEmployeeId] = useState<string>("");

  // --- Shift Management States ---
  const [shiftActiveTab, setShiftActiveTab] = useState<string>("General");
  const [shiftAssignEmpId, setShiftAssignEmpId] = useState<string>("");
  const [shiftAssignTarget, setShiftAssignTarget] = useState<string>("");
  const [shiftRoster, setShiftRoster] = useState<Record<string, string[]>>({
    "General": [],
    "Morning (6AM-2PM)": [],
    "Evening (2PM-10PM)": [],
    "Night (10PM-6AM)": [],
  });

  // --- Expense Management States ---
  const [myExpenses, setMyExpenses] = useState<any[]>([]);
  const [expenseTitle, setExpenseTitle] = useState<string>("");
  const [expenseCategory, setExpenseCategory] = useState<string>("Travel");
  const [expenseAmount, setExpenseAmount] = useState<string>("");
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [expenseDesc, setExpenseDesc] = useState<string>("");
  const [expenseFilter, setExpenseFilter] = useState<string>("all");

  // --- Policy Center States ---
  const [policySearch, setPolicySearch] = useState<string>("");
  const [policyActiveCategory, setPolicyActiveCategory] = useState<string>("all");

  // --- Document Management States ---
  const [myDocuments, setMyDocuments] = useState<any[]>([
    { id: "1", name: "Offer Letter", category: "Onboarding", uploadedAt: "2024-01-15", size: "245 KB", status: "verified" },
    { id: "2", name: "Employee Handbook Acknowledgment", category: "Policy", uploadedAt: "2024-01-20", size: "124 KB", status: "verified" },
    { id: "3", name: "PAN Card Copy", category: "Statutory", uploadedAt: "2024-01-10", size: "89 KB", status: "verified" },
    { id: "4", name: "Aadhaar Card Copy", category: "Statutory", uploadedAt: "2024-01-10", size: "156 KB", status: "verified" },
    { id: "5", name: "Bank Account Proof", category: "Payroll", uploadedAt: "2024-01-12", size: "67 KB", status: "pending" },
    { id: "6", name: "Latest Payslip", category: "Payroll", uploadedAt: "2026-03-01", size: "312 KB", status: "verified" },
  ]);
  const [docFilter, setDocFilter] = useState<string>("all");
  const [docSearch, setDocSearch] = useState<string>("");

  const [showInductionModal, setShowInductionModal] = useState<boolean>(false);
  const [inductionTaskName, setInductionTaskName] = useState<string>("");
  const [inductionDescription, setInductionDescription] = useState<string>("");
  const [inductionEmployeeId, setInductionEmployeeId] = useState<string>("");

  const [myAssets, setMyAssets] = useState<any[]>([]);
  const [myInductionTasks, setMyInductionTasks] = useState<any[]>([]);
  const [insChildrenCount, setInsChildrenCount] = useState<number>(0);
  const [insTopUp, setInsTopUp] = useState<number>(0);

  // --- Car Lease / Vehicle Hub States ---
  const [vehicleLease, setVehicleLease] = useState<any>(null);
  const [leaseType, setLeaseType] = useState<string>("oyt");
  const [carModel, setCarModel] = useState<string>("");
  const [exShowroomPrice, setExShowroomPrice] = useState<number>(0);
  const [leaseTenure, setLeaseTenure] = useState<number>(36);
  const [leaseHasDriver, setLeaseHasDriver] = useState<boolean>(false);

  // --- Appraisals & Bell Curve States ---
  const [kras, setKras] = useState<any[]>([]);
  const [employeeKras, setEmployeeKras] = useState<any[]>([]);
  const [newKraTitle, setNewKraTitle] = useState<string>("");
  const [newKraDesc, setNewKraDesc] = useState<string>("");
  const [newKraWeight, setNewKraWeight] = useState<number>(20);
  const [newKraTarget, setNewKraTarget] = useState<string>("");
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [selectedReviewCycle, setSelectedReviewCycle] = useState<string>("H1-2026");
  const [appraisalSelfRating, setAppraisalSelfRating] = useState<number>(3);
  const [appraisalSelfFeedback, setAppraisalSelfFeedback] = useState<string>("");
  const [appraisalMgrRating, setAppraisalMgrRating] = useState<number>(3);
  const [appraisalMgrFeedback, setAppraisalMgrFeedback] = useState<string>("");
  const [bellCurveData, setBellCurveData] = useState<any>(null);

  // --- Dashboard Appraisal Perspective Tabs ---
  const [dashAppraisalTab, setDashAppraisalTab] = useState<string>("self");

  // --- Standalone Appraisal View Tab ---
  const [appraisalTab, setAppraisalTab] = useState<string>("self");
  const [initCycleName, setInitCycleName] = useState<string>("H1-2026 (Apr - Sep)");
  const [initCycleTargetDate, setInitCycleTargetDate] = useState<string>("2026-10-31");
  const [initCycleMessage, setInitCycleMessage] = useState<string>("Please finalize your KRAs and self-assessments on priority.");
  const [teamRemindCycleName, setTeamRemindCycleName] = useState<string>("H1-2026");
  const [teamRemindTargetDate, setTeamRemindTargetDate] = useState<string>("2026-10-31");
  const [teamRemindMessage, setTeamRemindMessage] = useState<string>("Ensure your 6-month objectives are defined with 100% weightage.");

  // --- Achievements & Awards State ---
  const [awardsList, setAwardsList] = useState<any[]>([
    { id: "1", title: "Spot Award - Q1 Excellence", category: "Performance Spot", date: "2026-05-15", recipient: "Current Employee", points: 2500, description: "Delivered core API module 2 weeks ahead of schedule with zero critical bugs.", issuer: "Reporting Manager" },
    { id: "2", title: "Employee of the Month", category: "Leadership & Impact", date: "2026-04-30", recipient: "Current Employee", points: 5000, description: "Demonstrated exceptional team mentoring and resolved critical customer escalation.", issuer: "HR Operations" }
  ]);
  const [newAwardTitle, setNewAwardTitle] = useState<string>("");
  const [newAwardCategory, setNewAwardCategory] = useState<string>("Spot Award");
  const [newAwardPoints, setNewAwardPoints] = useState<number>(1000);
  const [newAwardDesc, setNewAwardDesc] = useState<string>("");

  // --- AI Promotion Insights Panel States ---
  const [promotionRecommendations, setPromotionRecommendations] = useState<any[]>([]);
  const [selectedPromoEmployee, setSelectedPromoEmployee] = useState<string>("");
  const [promoTargetGrade, setPromoTargetGrade] = useState<string>("");
  const [promotionAnalysis, setPromotionAnalysis] = useState<any>(null);
  const [promoLoading, setPromoLoading] = useState<boolean>(false);

  // --- HR Reports Dashboard States ---
  const [reportData, setReportData] = useState<any>(null);
  const [activeReport, setActiveReport] = useState<string>('headcount');
  const [reportLoading, setReportLoading] = useState<boolean>(false);

  // --- Dashboard Metrics & Carousel/Slider States ---
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [activeDashboardSlide, setActiveDashboardSlide] = useState<number>(0);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);
  const [attendanceAnalytics, setAttendanceAnalytics] = useState<any>(null);
  const [recruitmentSearch, setRecruitmentSearch] = useState<string>("");
  const [recruitmentFilterStage, setRecruitmentFilterStage] = useState<string>("");
  const [statutoryMonth, setStatutoryMonth] = useState<number>(new Date().getMonth() + 1);
  const [statutoryYear, setStatutoryYear] = useState<number>(2026);
  const [expandedSection, setExpandedSection] = useState<string>('');

  // --- Exit / Offboarding Center States ---
  const [myResignation, setMyResignation] = useState<any>(null);
  const [allResignations, setAllResignations] = useState<any[]>([]);
  const [resignationDate, setResignationDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [requestedRelievingDate, setRequestedRelievingDate] = useState<string>("");
  const [resignationReason, setResignationReason] = useState<string>("");
  const [activeFFSettlement, setActiveFFSettlement] = useState<any>(null);
  const [ffNoticeBuyoutDays, setFfNoticeBuyoutDays] = useState<number>(0);
  const [ffApprovedRelievingDate, setFfApprovedRelievingDate] = useState<string>("");

  // --- System Configuration States ---
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectAllocations, setProjectAllocations] = useState<any[]>([]);
  const [salaryBands, setSalaryBands] = useState<any[]>([]);
  const [functionalTitles, setFunctionalTitles] = useState<any[]>([]);
  const [erpActiveTab, setErpActiveTab] = useState<string>("clients");
  const [erpLoading, setErpLoading] = useState<boolean>(false);

  // ERP Form States
  // Client Form
  const [clientName, setClientName] = useState<string>("");
  const [clientCode, setClientCode] = useState<string>("");
  const [clientIndustry, setClientIndustry] = useState<string>("");
  const [clientCountry, setClientCountry] = useState<string>("India");
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  // Project Form
  const [projectName, setProjectName] = useState<string>("");
  const [projectCode, setProjectCode] = useState<string>("");
  const [projectClientId, setProjectClientId] = useState<string>("");
  const [projectBillingType, setProjectBillingType] = useState<string>("Time & Material");
  const [projectStart, setProjectStart] = useState<string>("");
  const [projectEnd, setProjectEnd] = useState<string>("");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Project Allocation Form
  const [allocEmployeeId, setAllocEmployeeId] = useState<string>("");
  const [allocProjectId, setAllocProjectId] = useState<string>("");
  const [allocRole, setAllocRole] = useState<string>("");
  const [allocPercentage, setAllocPercentage] = useState<number>(100);
  const [allocBillingStatus, setAllocBillingStatus] = useState<string>("Billable");
  const [allocHourlyRate, setAllocHourlyRate] = useState<number>(0);
  const [allocStart, setAllocStart] = useState<string>("");
  const [editingAllocationId, setEditingAllocationId] = useState<string | null>(null);

  // Salary Band & Functional Title Forms
  const [newBandName, setNewBandName] = useState<string>("");
  const [newBandMin, setNewBandMin] = useState<number>(0);
  const [newBandMid, setNewBandMid] = useState<number>(0);
  const [newBandMax, setNewBandMax] = useState<number>(0);

  const [newTitleName, setNewTitleName] = useState<string>("");
  const [newTitleCategory, setNewTitleCategory] = useState<string>("");

  // --- Employee Deep Profile Edit Modal States ---
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<any | null>(null);
  const [hrSelectedEmployeeId, setHrSelectedEmployeeId] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [profileActiveTab, setProfileActiveTab] = useState<string>("basic");

  // Profile Form States
  const [profileGrade, setProfileGrade] = useState<string>("L1");
  const [profileUan, setProfileUan] = useState<string>("");
  const [profilePf, setProfilePf] = useState<string>("");
  const [profilePan, setProfilePan] = useState<string>("");
  const [profileAadhaar, setProfileAadhaar] = useState<string>("");
  const [profileEsic, setProfileEsic] = useState<string>("");
  const [profileMarital, setProfileMarital] = useState<string>("Single");
  const [profileBlood, setProfileBlood] = useState<string>("");
  const [profileEmergName, setProfileEmergName] = useState<string>("");
  const [profileEmergPhone, setProfileEmergPhone] = useState<string>("");
  const [profilePhone, setProfilePhone] = useState<string>("");
  const [profileEmergRel, setProfileEmergRel] = useState<string>("");
  const [profilePassport, setProfilePassport] = useState<string>("");
  const [profileVisa, setProfileVisa] = useState<string>("");
  const [profileFuncTitleId, setProfileFuncTitleId] = useState<string>("");
  const [profileShift, setProfileShift] = useState<string>("General Shift");
  const [profileDeputation, setProfileDeputation] = useState<string>("");

  // Sub-items forms
  const [newSkillName, setNewSkillName] = useState<string>("");
  const [newSkillProf, setNewSkillProf] = useState<string>("Intermediate");

  const [newExpCompany, setNewExpCompany] = useState<string>("");
  const [newExpDesig, setNewExpDesig] = useState<string>("");
  const [newExpTenure, setNewExpTenure] = useState<number>(12);
  const [newExpStart, setNewExpStart] = useState<string>("");
  const [newExpEnd, setNewExpEnd] = useState<string>("");

  const [newAcadDegree, setNewAcadDegree] = useState<string>("");
  const [newAcadInst, setNewAcadInst] = useState<string>("");
  const [newAcadYear, setNewAcadYear] = useState<number>(new Date().getFullYear());
  const [newAcadCgpa, setNewAcadCgpa] = useState<number>(0);

  // --- central SaaS Nexus Control Panel States ---
  const [shards, setShards] = useState<any[]>([]);
  const [nexusActiveTab, setNexusActiveTab] = useState<string>("shards");
  const [globalTickets, setGlobalTickets] = useState<any[]>([]);
  const [infraStatus, setInfraStatus] = useState<any>(null);
  const [showProvisionModal, setShowProvisionModal] = useState<boolean>(false);
  const [provName, setProvName] = useState<string>("");
  const [provSubdomain, setProvSubdomain] = useState<string>("");
  const [provAdminEmail, setProvAdminEmail] = useState<string>("");
  const [provAdminPassword, setProvAdminPassword] = useState<string>("");
  const [provPlan, setProvPlan] = useState<string>("growth");
  const [provTalent, setProvTalent] = useState<boolean>(true);
  const [provHr, setProvHr] = useState<boolean>(true);
  const [provResource, setProvResource] = useState<boolean>(true);
  const [selectedTicketForResolution, setSelectedTicketForResolution] = useState<any | null>(null);
  const [ticketResolutionNotes, setTicketResolutionNotes] = useState<string>("");
  const [selectedTicketStatus, setSelectedTicketStatus] = useState<string>("open");
  const [showEditShardModal, setShowEditShardModal] = useState<boolean>(false);
  const [selectedShardToEdit, setSelectedShardToEdit] = useState<any | null>(null);
  const [editShardName, setEditShardName] = useState<string>("");
  const [editShardPlan, setEditShardPlan] = useState<string>("growth");
  const [editShardTalent, setEditShardTalent] = useState<boolean>(true);
  const [editShardHr, setEditShardHr] = useState<boolean>(true);
  const [editShardResource, setEditShardResource] = useState<boolean>(true);
  const [nexusLogs, setNexusLogs] = useState<string[]>([
    "[SYSTEM] Nexus central logical control plane active.",
    "[SYSTEM] Checking tenant isolation boundaries... OK.",
    "[SYSTEM] Ready to accept provisioning and billing claims."
  ]);

  // --- SaaS Help Desk States ---
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [newTicketTitle, setNewTicketTitle] = useState<string>("");
  const [newTicketCategory, setNewTicketCategory] = useState<string>("bug");
  const [newTicketPriority, setNewTicketPriority] = useState<string>("medium");
  const [newTicketDescription, setNewTicketDescription] = useState<string>("");

  // --- User Management States ---
  const [tenantUsers, setTenantUsers] = useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const [userMgmtSubTab, setUserMgmtSubTab] = useState<string>("users");
  const [userMgmtModalOpen, setUserMgmtModalOpen] = useState<boolean>(false);
  const [userMgmtEditMode, setUserMgmtEditMode] = useState<boolean>(false);
  const [selectedMgmtUserId, setSelectedMgmtUserId] = useState<string | null>(null);
  const [mgmtEmail, setMgmtEmail] = useState<string>("");
  const [mgmtRole, setMgmtRole] = useState<string>("employee");
  const [mgmtPassword, setMgmtPassword] = useState<string>("");
  const [mgmtIsActive, setMgmtIsActive] = useState<boolean>(true);

  // --- Talent Management Suite States ---
  const [talentActiveTab, setTalentActiveTab] = useState<string>("positions");
  const [talentPositions, setTalentPositions] = useState<any[]>([]);
  const [talentPostings, setTalentPostings] = useState<any[]>([]);
  const [talentCandidates, setTalentCandidates] = useState<any[]>([]);
  const [talentInterviews, setTalentInterviews] = useState<any[]>([]);
  const [talentOffers, setTalentOffers] = useState<any[]>([]);

  // --- Resource Requisition States ---
  const [resourceRequisitions, setResourceRequisitions] = useState<any[]>([]);
  const [showRequisitionModal, setShowRequisitionModal] = useState<boolean>(false);
  const [reqTitle, setReqTitle] = useState<string>("");
  const [reqDeptId, setReqDeptId] = useState<string>("");
  const [reqNumPositions, setReqNumPositions] = useState<number>(1);
  const [reqEmploymentType, setReqEmploymentType] = useState<string>("permanent");
  const [reqJustification, setReqJustification] = useState<string>("");
  const [reqBudgetRange, setReqBudgetRange] = useState<string>("");
  const [reqSkills, setReqSkills] = useState<string>("");
  const [reqJoiningDate, setReqJoiningDate] = useState<string>("");
  const [requisitionLoading, setRequisitionLoading] = useState<boolean>(false);

  // --- New NLP Matching States ---
  const [talentProfiles, setTalentProfiles] = useState<any[]>([]);
  const [matchResults, setMatchResults] = useState<any[]>([]);
  const [showMatchModal, setShowMatchModal] = useState<boolean>(false);
  const [matchJobId, setMatchJobId] = useState<string>("");

  // Talent suite form states
  const [showPositionModal, setShowPositionModal] = useState<boolean>(false);
  const [posTitle, setPosTitle] = useState<string>("");
  const [posDeptId, setPosDeptId] = useState<string>("");
  const [posRequirements, setPosRequirements] = useState<string>("");
  const [posSkills, setPosSkills] = useState<string>("");

  const [showProfileUploadModal, setShowProfileUploadModal] = useState<boolean>(false);
  const [profFirst, setProfFirst] = useState<string>("");
  const [profLast, setProfLast] = useState<string>("");
  const [profEmail, setProfEmail] = useState<string>("");
  const [profPhone, setProfPhone] = useState<string>("");
  const [profResumeUrl, setProfResumeUrl] = useState<string>("");
  const [profSkills, setProfSkills] = useState<string>("");
  const [profExpSummary, setProfExpSummary] = useState<string>("");
  const [profRawResumeText, setProfRawResumeText] = useState<string>("");
  const [profRefType, setProfRefType] = useState<string>("none");
  const [profRefDetail, setProfRefDetail] = useState<string>("");
  const [profileUploadLoading, setProfileUploadLoading] = useState<boolean>(false);

  const [showPostingModal, setShowPostingModal] = useState<boolean>(false);
  const [selectedPositionId, setSelectedPositionId] = useState<string>("");
  const [onboardDuplicateWarning, setOnboardDuplicateWarning] = useState<boolean>(false);
  
  const [viewResumeProfile, setViewResumeProfile] = useState<any | null>(null);
  const [postingTitle, setPostingTitle] = useState<string>("");
  const [postingDescription, setPostingDescription] = useState<string>("");
  const [postingSalary, setPostingSalary] = useState<string>("");

  const [showCandidateModal, setShowCandidateModal] = useState<boolean>(false);
  const [candFirst, setCandFirst] = useState<string>("");
  const [candLast, setCandLast] = useState<string>("");
  const [candEmail, setCandEmail] = useState<string>("");
  const [candPhone, setCandPhone] = useState<string>("");
  const [selectedPostingId, setSelectedPostingId] = useState<string>("");
  const [candFormError, setCandFormError] = useState<string>("");
  const [candResumeUrl, setCandResumeUrl] = useState<string>("");
  const [candSkills, setCandSkills] = useState<string>("");
  const [candRefType, setCandRefType] = useState<string>("none");
  const [candRefDetail, setCandRefDetail] = useState<string>("");

  const [showCallLetterModal, setShowCallLetterModal] = useState<boolean>(false);
  const [selectedCandId, setSelectedCandId] = useState<string>("");
  const [interviewDate, setInterviewDate] = useState<string>("");

  const [showInterviewModal, setShowInterviewModal] = useState<boolean>(false);
  const [selectedCandIdForInt, setSelectedCandIdForInt] = useState<string>("");
  const [interviewType, setInterviewType] = useState<string>("technical");
  const [interviewTime, setInterviewTime] = useState<string>("");

  const [showOfferModal, setShowOfferModal] = useState<boolean>(false);
  const [selectedCandIdForOffer, setSelectedCandIdForOffer] = useState<string>("");
  const [offerSalary, setOfferSalary] = useState<string>("50000");
  const [offerJoiningDate, setOfferJoiningDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [offerGrade, setOfferGrade] = useState<string>("L1");
  const [offerDeptId, setOfferDeptId] = useState<string>("");
  const [offerDesignationId, setOfferDesignationId] = useState<string>("");
  const [offerExpiryDate, setOfferExpiryDate] = useState<string>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

  // --- Confirm/Prompt Modal State ---
  const [confirmState, setConfirmState] = useState<{
    message: string; resolve: (v: boolean) => void; title?: string;
    confirmLabel?: string; cancelLabel?: string;
  } | null>(null);

  const [promptState, setPromptState] = useState<{
    message: string; defaultValue: string; resolve: (v: string | null) => void;
    title?: string; placeholder?: string;
  } | null>(null);

  const showConfirm = (message: string, title?: string, confirmLabel?: string, cancelLabel?: string): Promise<boolean> =>
    new Promise((resolve) => setConfirmState({ message, resolve, title, confirmLabel, cancelLabel }));

  const showPrompt = (message: string, defaultValue: string = "", title?: string, placeholder?: string): Promise<string | null> =>
    new Promise((resolve) => setPromptState({ message, defaultValue, resolve, title, placeholder }));

  // --- Fetch & Submit Handler Functions ---
  const fetchTaxAndFbpData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tax-declarations/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTaxDeclarations(data);
        if (data.length > 0) {
          const dec = data[0];
          setTaxRegime(dec.regime);
          setSec80c(Number(dec.section_80c));
          setSec80d(Number(dec.section_80d));
          setRentPaid(Number(dec.hra_rent_paid));
          setLandlordPan(dec.landlord_pan || "");
          setLandlordName(dec.landlord_name || "");
          setEvidenceUrl(dec.evidence_url || "");
        }
      }
      
      const gaRes = await fetch(`${API_BASE_URL}/grade-allowances/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (gaRes.ok) {
        const data = await gaRes.json();
        setGradeAllowance(data);
      }

      const fbpRes = await fetch(`${API_BASE_URL}/fbp-declarations/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (fbpRes.ok) {
        const data = await fbpRes.json();
        setFbpDecl(data);
        setFuelFbp(Number(data.fuel_amount));
        setLtaFbp(Number(data.lta_amount));
        setPhoneFbp(Number(data.phone_amount));
        setFoodFbp(Number(data.food_amount));
      }

      if (currentUser?.role === "hr_admin" || currentUser?.role === "payroll_admin") {
        const allRes = await fetch(`${API_BASE_URL}/tax-declarations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (allRes.ok) {
          setAllTaxDeclarations(await allRes.json());
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rentPaid > 100000 && (!landlordPan || landlordPan.trim().length !== 10)) {
      showToast.error("A valid 10-character Landlord PAN is required when HRA rent exceeds ₹1,00,000.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/tax-declarations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          financial_year: "2026-2027",
          regime: taxRegime,
          section_80c: sec80c,
          section_80d: sec80d,
          hra_rent_paid: rentPaid,
          landlord_pan: landlordPan || null,
          landlord_name: landlordName || null,
          evidence_url: evidenceUrl || null
        })
      });
      if (res.ok) {
        showToast.success("Tax declaration submitted successfully!");
        fetchTaxAndFbpData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Tax declaration submission failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaxAction = async (declId: string, actionStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tax-declarations/${declId}/action`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: actionStatus,
          rejection_reason: actionStatus === "rejected" ? "Proof verification failed" : null
        })
      });
      if (res.ok) {
        showToast.success(`Tax declaration successfully ${actionStatus}!`);
        fetchTaxAndFbpData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Verification action failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFbpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/fbp-declarations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fuel_amount: fuelFbp,
          lta_amount: ltaFbp,
          phone_amount: phoneFbp,
          food_amount: foodFbp
        })
      });
      if (res.ok) {
        showToast.success("Salary FBP restructured and allocated successfully!");
        fetchTaxAndFbpData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "FBP submission failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInsuranceData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/insurance/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInsuranceEnrollment(data);
        setInsTier(data.tier);
        setInsHasSpouse(data.has_spouse);
        setInsHasParents(data.has_parents);
        setInsChildrenCount(data.children_count);
        setInsTopUp(Number(data.top_up_sum_insured));
      } else {
        setInsuranceEnrollment(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInsuranceEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/insurance/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tier: insTier,
          has_parents: insHasParents,
          has_spouse: insHasSpouse,
          children_count: insChildrenCount,
          top_up_sum_insured: insTopUp
        })
      });
      if (res.ok) {
        showToast.success("Corporate Group Health Insurance enrollment saved successfully!");
        fetchInsuranceData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Insurance enrollment failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCarLeaseData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vehicle-lease/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVehicleLease(data);
        setLeaseType(data.lease_type);
        setCarModel(data.car_model);
        setExShowroomPrice(Number(data.ex_showroom_price));
        setLeaseTenure(data.lease_tenure_months);
        setLeaseHasDriver(data.has_driver);
      } else {
        setVehicleLease(null);
      }
      
      const gaRes = await fetch(`${API_BASE_URL}/grade-allowances/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (gaRes.ok) {
        setGradeAllowance(await gaRes.json());
      }
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

  const fetchAppraisalData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/performance/kras/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setKras(await res.json());
      }

      const revRes = await fetch(`${API_BASE_URL}/performance/reviews/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (revRes.ok) {
        const data = await revRes.json();
        setMyReviews(data);
        if (data.length > 0) {
          const rev = data.find((r: any) => r.review_cycle === selectedReviewCycle) || data[0];
          setAppraisalSelfRating(rev.self_rating);
          setAppraisalSelfFeedback(rev.self_feedback || "");
        }
      }

      if (currentUser?.role === "hr_admin" || currentUser?.role === "manager") {
        const allRes = await fetch(`${API_BASE_URL}/performance/reviews`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (allRes.ok) {
          setAllReviews(await allRes.json());
        }

        const bcRes = await fetch(`${API_BASE_URL}/performance/bell-curve`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (bcRes.ok) {
          setBellCurveData(await bcRes.json());
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleKraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/performance/kras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newKraTitle,
          description: newKraDesc,
          weightage: Number(newKraWeight),
          target_date: newKraTarget || null
        })
      });
      if (res.ok) {
        showToast.success("Key Result Area (KRA) created successfully!");
        setNewKraTitle("");
        setNewKraDesc("");
        fetchAppraisalData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to create KRA. Check weightage limit.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelfReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/performance/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          review_cycle: selectedReviewCycle,
          self_rating: appraisalSelfRating,
          self_feedback: appraisalSelfFeedback
        })
      });
      if (res.ok) {
        showToast.success("Self-review rating submitted successfully!");
        fetchAppraisalData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Self-review submission failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManagerReviewSubmit = async (reviewId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/performance/reviews/${reviewId}/manager-review`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          manager_rating: appraisalMgrRating,
          manager_feedback: appraisalMgrFeedback
        })
      });
      if (res.ok) {
        showToast.success("Manager evaluation scores submitted and normalized!");
        fetchAppraisalData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Manager review submission failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInitiateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/performance/cycles/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cycle_name: initCycleName,
          target_date: initCycleTargetDate || null,
          custom_message: initCycleMessage || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast.success(`🚀 ${data.message} (${data.emails_sent} emails dispatched)`);
      } else {
        showToast.error(data.detail || "Failed to initiate KRA cycle.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInitiateTeamReminders = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/performance/kras/initiate-team`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cycle_name: teamRemindCycleName,
          target_date: teamRemindTargetDate || null,
          custom_message: teamRemindMessage || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast.success(`📋 ${data.message} (${data.emails_sent} emails dispatched)`);
      } else {
        showToast.error(data.detail || "Failed to send team KRA reminders.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishFinalRatings = async (cycle: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/performance/reviews/publish-all?review_cycle=${encodeURIComponent(cycle)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        showToast.success(`🏆 ${data.message} (${data.emails_sent} emails dispatched)`);
        fetchAppraisalData();
      } else {
        showToast.error(data.detail || "Failed to publish final ratings.");
      }
    } catch (err) {
      console.error(err);
    }
  };


  const handleCreateAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAwardTitle || !newAwardDesc) return;
    const newAward = {
      id: String(Date.now()),
      title: newAwardTitle,
      category: newAwardCategory,
      date: new Date().toISOString().split("T")[0],
      recipient: `${currentEmployee?.first_name || "Employee"} ${currentEmployee?.last_name || ""}`.trim(),
      points: Number(newAwardPoints),
      description: newAwardDesc,
      issuer: `${currentUser?.email?.split('@')[0].toUpperCase() || "MANAGER"}`
    };
    setAwardsList([newAward, ...awardsList]);
    setNewAwardTitle("");
    setNewAwardDesc("");
    showToast.success("🏆 Achievement recognition awarded successfully!");
  };


  const fetchPromotionData = async () => {
    try {
      if (currentUser?.role === "hr_admin") {
        const res = await fetch(`${API_BASE_URL}/ai/promotion-recommendations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setPromotionRecommendations(await res.json());
        }
        
        const empRes = await fetch(`${API_BASE_URL}/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (empRes.ok) {
          setEmployees(await empRes.json());
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyzePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromoEmployee) {
      showToast.error("Please select an employee to analyze.");
      return;
    }
    setPromoLoading(true);
    setPromotionAnalysis(null);
    try {
      const url = `${API_BASE_URL}/ai/analyze-promotion?employee_id=${selectedPromoEmployee}${promoTargetGrade ? `&target_grade=${promoTargetGrade}` : ""}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPromotionAnalysis(data);
        fetchPromotionData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to analyze promotion");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPromoLoading(false);
    }
  };

  const handlePromotionAction = async (recId: string, approvalStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/promotion-recommendations/${recId}/action?status_payload=${approvalStatus}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        showToast.success(`Promotion recommendation ${approvalStatus} successfully!`);
        fetchPromotionData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Action failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOffboardingData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/offboarding/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMyResignation(await res.json());
      } else {
        setMyResignation(null);
      }

      if (currentUser?.role === "hr_admin" || currentUser?.role === "finance_admin") {
        const reqRes = await fetch(`${API_BASE_URL}/offboarding/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (reqRes.ok) {
          setAllResignations(await reqRes.json());
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/offboarding/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          resignation_date: resignationDate,
          requested_relieving_date: requestedRelievingDate || null,
          reason: resignationReason
        })
      });
      if (res.ok) {
        showToast.success("Resignation filed successfully. 90-day standard notice period initialized.");
        setResignationReason("");
        fetchOffboardingData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to submit resignation");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResignAction = async (reqId: string, isApproved: boolean) => {
    try {
      const relievingDate = ffApprovedRelievingDate || null;
      const statusValue = isApproved ? "approved" : "rejected";
      const res = await fetch(`${API_BASE_URL}/offboarding/requests/${reqId}/action`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: statusValue,
          approved_relieving_date: relievingDate,
          notice_buyout_days: Number(ffNoticeBuyoutDays)
        })
      });
      if (res.ok) {
        showToast.success(`Resignation ${statusValue} successfully!`);
        fetchOffboardingData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Resignation action failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearanceAction = async (reqId: string, dept: string, clearanceStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/offboarding/requests/${reqId}/clearance`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          department: dept,
          status: clearanceStatus
        })
      });
      if (res.ok) {
        showToast.success(`${dept.toUpperCase()} Clearance marked as ${clearanceStatus}!`);
        fetchOffboardingData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Clearance action failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalculateSettlement = async (reqId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/offboarding/requests/${reqId}/settlement`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setActiveFFSettlement(await res.json());
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to calculate settlement");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettlement = async (reqId: string) => {
    if (!activeFFSettlement) return;
    try {
      const res = await fetch(`${API_BASE_URL}/offboarding/requests/${reqId}/settlement/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(activeFFSettlement)
      });
      if (res.ok) {
        showToast.success("F&F Settlement finalized and approved successfully!");
        fetchOffboardingData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to save settlement");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaySettlement = async (reqId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/offboarding/requests/${reqId}/settlement/pay`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        showToast.success("F&F Exit Settlement payout marked as disbursed!");
        fetchOffboardingData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Payout failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- HR Reports fetch function ---
  const fetchReport = async (reportType?: string) => {
    const rType = reportType || activeReport;
    setReportLoading(true);
    setReportData(null);
    const endpoints: Record<string, string> = {
      'headcount': '/reports/workforce/headcount',
      'payroll': '/reports/payroll/cost-summary?year=2026',
      'leave': '/reports/leave/utilization?year=2026',
      'insurance': '/reports/insurance/coverage',
      'car-lease': '/reports/vehicle-lease/portfolio',
      'performance': '/reports/performance/appraisal-summary?review_cycle=Q1-2026',
      'promotions': '/reports/promotions/pipeline',
      'exit': '/reports/exit/attrition-summary?year=2026',
      'statutory': `/reports/compliance/statutory?month=${statutoryMonth}&year=${statutoryYear}`
    };
    try {
      const res = await fetch(`${API_BASE_URL}${endpoints[rType]}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setReportData(await res.json());
    } catch (err) { console.error(err); }
    finally { setReportLoading(false); }
  };

  const handleReportTabChange = (tab: string) => {
    setActiveReport(tab);
    fetchReport(tab);
  };

  // --- System Configuration fetch and CRUD functions ---
  const fetchErpData = async () => {
    setErpLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [clientsRes, projectsRes, allocRes, bandsRes, titlesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/erp/clients`, { headers }),
        fetch(`${API_BASE_URL}/erp/projects`, { headers }),
        fetch(`${API_BASE_URL}/erp/project-allocations`, { headers }),
        fetch(`${API_BASE_URL}/erp/salary-bands`, { headers }),
        fetch(`${API_BASE_URL}/erp/functional-titles`, { headers })
      ]);

      if (clientsRes.ok) setClients(await clientsRes.json());
      if (projectsRes.ok) setProjects(await projectsRes.json());
      if (allocRes.ok) setProjectAllocations(await allocRes.json());
      if (bandsRes.ok) setSalaryBands(await bandsRes.json());
      if (titlesRes.ok) setFunctionalTitles(await titlesRes.json());
    } catch (err) {
      console.error("Failed to fetch ERP data:", err);
    } finally {
      setErpLoading(false);
    }
  };

  const saveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingClientId 
        ? `${API_BASE_URL}/erp/clients/${editingClientId}`
        : `${API_BASE_URL}/erp/clients`;
      const method = editingClientId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: clientName,
          code: clientCode,
          domain_industry: clientIndustry || null,
          country: clientCountry
        })
      });
      if (res.ok) {
        setClientName("");
        setClientCode("");
        setClientIndustry("");
        setClientCountry("India");
        setEditingClientId(null);
        fetchErpData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to save client");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProjectId
        ? `${API_BASE_URL}/erp/projects/${editingProjectId}`
        : `${API_BASE_URL}/erp/projects`;
      const method = editingProjectId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          client_id: projectClientId,
          name: projectName,
          code: projectCode,
          billing_type: projectBillingType,
          start_date: projectStart || null,
          end_date: projectEnd || null
        })
      });
      if (res.ok) {
        setProjectClientId("");
        setProjectName("");
        setProjectCode("");
        setProjectBillingType("Time & Material");
        setProjectStart("");
        setProjectEnd("");
        setEditingProjectId(null);
        fetchErpData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to save project");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingAllocationId
        ? `${API_BASE_URL}/erp/project-allocations/${editingAllocationId}`
        : `${API_BASE_URL}/erp/project-allocations`;
      const method = editingAllocationId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          employee_id: allocEmployeeId,
          project_id: allocProjectId,
          project_role: allocRole,
          allocation_percentage: Number(allocPercentage),
          billing_status: allocBillingStatus,
          billing_hourly_rate: allocHourlyRate ? Number(allocHourlyRate) : null,
          start_date: allocStart || null
        })
      });
      if (res.ok) {
        setAllocEmployeeId("");
        setAllocProjectId("");
        setAllocRole("");
        setAllocPercentage(100);
        setAllocBillingStatus("Billable");
        setAllocHourlyRate(0);
        setAllocStart("");
        setEditingAllocationId(null);
        fetchErpData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to save allocation");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAllocation = async (id: string) => {
    if (!(await showConfirm("Are you sure you want to deallocate this employee?"))) return;
    try {
      const res = await fetch(`${API_BASE_URL}/erp/project-allocations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchErpData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to deallocate");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveSalaryBand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/erp/salary-bands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          band_name: newBandName,
          min_base_annual: Number(newBandMin),
          mid_base_annual: Number(newBandMid),
          max_base_annual: Number(newBandMax)
        })
      });
      if (res.ok) {
        setNewBandName("");
        setNewBandMin(0);
        setNewBandMid(0);
        setNewBandMax(0);
        fetchErpData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to save salary band");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveFunctionalTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/erp/functional-titles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newTitleName,
          skill_category: newTitleCategory || null
        })
      });
      if (res.ok) {
        setNewTitleName("");
        setNewTitleCategory("");
        fetchErpData();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to save functional title");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProfile = (emp: any) => {
    setSelectedProfileEmployee(emp);
    setProfileGrade(emp.grade || "L1");
    setProfilePhone(emp.phone || "");
    setProfileUan(emp.uan_number || "");
    setProfilePf(emp.pf_number || "");
    setProfilePan(emp.pan_card || "");
    setProfileAadhaar(emp.aadhaar_card || "");
    setProfileEsic(emp.esic_number || "");
    setProfileMarital(emp.marital_status || "Single");
    setProfileBlood(emp.blood_group || "");
    setProfileEmergName(emp.emergency_contact_name || "");
    setProfileEmergPhone(emp.emergency_contact_phone || "");
    setProfileEmergRel(emp.emergency_contact_relation || "");
    setProfilePassport(emp.passport_number || "");
    setProfileVisa(emp.visa_details || "");
    setProfileFuncTitleId(emp.functional_title_id || "");
    setProfileShift(emp.current_shift || "General Shift");
    setProfileDeputation(emp.deputation_details || "");
    setProfileActiveTab("basic");
    setShowProfileModal(true);
  };

  const saveProfileGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileEmployee) return;
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${selectedProfileEmployee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          grade: profileGrade,
          phone: profilePhone || null,
          uan_number: profileUan || null,
          pf_number: profilePf || null,
          pan_card: profilePan || null,
          aadhaar_card: profileAadhaar || null,
          esic_number: profileEsic || null,
          marital_status: profileMarital,
          blood_group: profileBlood || null,
          emergency_contact_name: profileEmergName || null,
          emergency_contact_phone: profileEmergPhone || null,
          emergency_contact_relation: profileEmergRel || null,
          passport_number: profilePassport || null,
          visa_details: profileVisa || null,
          functional_title_id: profileFuncTitleId || null,
          current_shift: profileShift,
          deputation_details: profileDeputation || null
        })
      });
      if (res.ok) {
        const updated = await res.json();
        fetchEmployees();
        setSelectedProfileEmployee(updated);
        showToast.success("Employee profile successfully updated!");
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to update profile details");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addProfileSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileEmployee) return;
    try {
      const res = await fetch(`${API_BASE_URL}/erp/employees/${selectedProfileEmployee.id}/skillsets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          skill_name: newSkillName,
          proficiency: newSkillProf
        })
      });
      if (res.ok) {
        setNewSkillName("");
        setNewSkillProf("Intermediate");
        const freshRes = await fetch(`${API_BASE_URL}/employees/${selectedProfileEmployee.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (freshRes.ok) {
          const freshEmp = await freshRes.json();
          setSelectedProfileEmployee(freshEmp);
        }
        fetchEmployees();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to add skillset");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProfileSkill = async (skillId: string) => {
    if (!selectedProfileEmployee) return;
    try {
      const res = await fetch(`${API_BASE_URL}/erp/skillsets/${skillId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const freshRes = await fetch(`${API_BASE_URL}/employees/${selectedProfileEmployee.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (freshRes.ok) {
          const freshEmp = await freshRes.json();
          setSelectedProfileEmployee(freshEmp);
        }
        fetchEmployees();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to delete skillset");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addProfileExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileEmployee) return;
    try {
      const res = await fetch(`${API_BASE_URL}/erp/employees/${selectedProfileEmployee.id}/work-experiences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          company_name: newExpCompany,
          designation: newExpDesig,
          tenure_months: Number(newExpTenure),
          start_date: newExpStart || null,
          end_date: newExpEnd || null
        })
      });
      if (res.ok) {
        setNewExpCompany("");
        setNewExpDesig("");
        setNewExpTenure(12);
        setNewExpStart("");
        setNewExpEnd("");
        const freshRes = await fetch(`${API_BASE_URL}/employees/${selectedProfileEmployee.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (freshRes.ok) {
          const freshEmp = await freshRes.json();
          setSelectedProfileEmployee(freshEmp);
        }
        fetchEmployees();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to add work experience");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProfileExperience = async (expId: string) => {
    if (!selectedProfileEmployee) return;
    try {
      const res = await fetch(`${API_BASE_URL}/erp/work-experiences/${expId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const freshRes = await fetch(`${API_BASE_URL}/employees/${selectedProfileEmployee.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (freshRes.ok) {
          const freshEmp = await freshRes.json();
          setSelectedProfileEmployee(freshEmp);
        }
        fetchEmployees();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to delete work experience");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addProfileAcademic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileEmployee) return;
    try {
      const res = await fetch(`${API_BASE_URL}/erp/employees/${selectedProfileEmployee.id}/academic-qualifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          degree: newAcadDegree,
          institution: newAcadInst,
          passing_year: newAcadYear ? Number(newAcadYear) : null,
          cgpa_percentage: newAcadCgpa ? Number(newAcadCgpa) : null
        })
      });
      if (res.ok) {
        setNewAcadDegree("");
        setNewAcadInst("");
        setNewAcadYear(new Date().getFullYear());
        setNewAcadCgpa(0);
        const freshRes = await fetch(`${API_BASE_URL}/employees/${selectedProfileEmployee.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (freshRes.ok) {
          const freshEmp = await freshRes.json();
          setSelectedProfileEmployee(freshEmp);
        }
        fetchEmployees();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to add academic qualification");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProfileAcademic = async (acadId: string) => {
    if (!selectedProfileEmployee) return;
    try {
      const res = await fetch(`${API_BASE_URL}/erp/academic-qualifications/${acadId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const freshRes = await fetch(`${API_BASE_URL}/employees/${selectedProfileEmployee.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (freshRes.ok) {
          const freshEmp = await freshRes.json();
          setSelectedProfileEmployee(freshEmp);
        }
        fetchEmployees();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to delete academic qualification");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger Class Theme mapping on body
  useEffect(() => {
    const bodyClass = document.body.classList;
    bodyClass.remove("corporate-theme", "mixed-theme", "enterprise-theme");
    if (appTheme === "mixed") {
      bodyClass.add("mixed-theme");
    } else if (appTheme === "enterprise") {
      bodyClass.add("enterprise-theme");
    } else if (appTheme === "corporate") {
      bodyClass.add("corporate-theme");
    }
  }, [appTheme]);

  // Handle UI Density class mapping
  useEffect(() => {
    const bodyClass = document.body.classList;
    bodyClass.remove("density-compact", "density-comfort");
    bodyClass.add(`density-${uiDensity}`);
  }, [uiDensity]);

  // Handle Animations class mapping
  useEffect(() => {
    const bodyClass = document.body.classList;
    if (!enableAnimations) {
      bodyClass.add("no-animations");
    } else {
      bodyClass.remove("no-animations");
    }
  }, [enableAnimations]);

  // Load user data upon receiving token
  useEffect(() => {
    if (token) {
      localStorage.setItem("hrms-engine_token", token);
      fetchUserProfile();
    } else {
      localStorage.removeItem("hrms-engine_token");
      setCurrentUser(null);
      setCurrentEmployee(null);
    }
  }, [token]);

  // Fetch Organizations on Mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/organizations`);
        if (res.ok) {
          const data = await res.json();
          setOrganizations(data);
          if (data.length > 0) {
            // Try to find Orient by default or fallback to first
            const defaultOrg = data.find((o: Organization) => o.name === "Orient Technology Solutions") || data[0];
            setSelectedOrgId(defaultOrg.id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch organizations:", err);
      }
    };
    fetchOrganizations();
  }, []);

  // Sync Organization Name when User or Organizations load
  useEffect(() => {
    if (currentUser && organizations.length > 0) {
      if (currentUser.role === "super_admin") {
        setOrgName("CogniHR Core Control");
      } else {
        const org = organizations.find((o: Organization) => o.id === currentUser.organization_id);
        if (org) {
          setOrgName(org.name);
        }
      }
    }
  }, [currentUser, organizations]);

  // Poll for pipeline status updates periodically
  // Trigger domain data loads when view or user profile changes
  useEffect(() => {
    if (currentUser) {
      if (activeView === "dashboard") {
        fetchOverviewData();
      } else if (activeView === "employees") {
        fetchEmployees();
        fetchErpData(); // Pre-fetch for title mappings, etc.
      } else if (["attendance", "my-attendance", "org-attendance"].includes(activeView)) {
        fetchAttendance();
      } else if (["leave", "my-leave", "org-leave"].includes(activeView)) {
        fetchLeaveData();
      } else if (["payroll", "my-payroll", "org-payroll"].includes(activeView)) {
        fetchPayrollData();
      } else if (["fbp-tax", "my-fbp-tax", "org-fbp-tax"].includes(activeView)) {
        fetchTaxAndFbpData();
      } else if (["insurance", "my-insurance", "org-insurance"].includes(activeView)) {
        fetchInsuranceData();
      } else if (["car-lease", "my-car-lease", "org-car-lease"].includes(activeView)) {
        fetchCarLeaseData();
      } else if (activeView === "appraisals") {
        fetchAppraisalData();
      } else if (activeView === "ai-promotions") {
        fetchPromotionData();
      } else if (activeView === "offboarding") {
        fetchOffboardingData();
      } else if (activeView === 'reports') {
        fetchReport();
      } else if (activeView === "erp-masters") {
        fetchErpData();
        fetchEmployees();
      } else if (activeView === "nexus-mgmt") {
        fetchNexusShards();
        fetchGlobalTickets();
        fetchInfraStatus();
      } else if (activeView === "support-desk") {
        fetchMyTickets();
      } else if (activeView === "user-mgmt") {
        fetchTenantUsers();
        fetchRolePermissions();
      } else if (activeView === "talent-mgmt") {
        fetchResourceRequisitions();
        fetchTalentProfiles();
        fetchTalentPositions();
        fetchTalentPostings();
        fetchTalentCandidates();
        fetchTalentInterviews();
        fetchTalentOffers();
      } else if (activeView === "onboarding-checklist" || activeView === "rmg-checklist") {
        fetchRmgInductionTasks();
        fetchEmployees();
      } else if (activeView === "asset-registry") {
        fetchRmgAssets();
        fetchEmployees();
      } else if (activeView === "project-allocations") {
        fetchRmgClients();
        fetchRmgProjects();
        fetchRmgAllocations();
        fetchRmgBench();
        fetchEmployees();
      } else if (activeView === "my-assets-induction") {
        fetchMyAssetsAndInduction();
      }
    }
  }, [currentUser, activeView, hrSelectedEmployeeId]);

  // Auto scroll chat bubbles
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Core API Fetch Profile
  const fetchUserProfile = async () => {
    try {
      // 1. Fetch Auth details
      const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!userRes.ok) throw new Error("Auth token invalid");
      const userData = await userRes.json();
      setCurrentUser(userData);

      // Extract organization context e.g. capitalize
      if (userData.role === "super_admin") {
        setOrgName("CogniHR Core Control");
        setActiveView("nexus-mgmt");
      } else {
        const org = organizations.find(o => o.id === selectedOrgId);
        setOrgName(org ? org.name : "CogniHR Tenant");
      }

      // 2. Fetch Employee matching profile
      const empRes = await fetch(`${API_BASE_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (empRes.ok) {
        const list = await empRes.json();
        // Locate employee profile representing this logged-in account
        const profile = list.find((e: any) => e.user_id === userData.id);
        if (profile) {
          setCurrentEmployee(profile);
        }
      }
    } catch (err) {
      handleLogout();
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("hrms-engine_token");
  };

  // Global fetch interceptor for 401 Unauthorized / expired sessions
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        const currentToken = localStorage.getItem("hrms-engine_token");
        if (currentToken) {
          handleLogout();
          showToast.error("Your session has expired or credentials could not be validated. Please log in again.");
        }
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // --- CENTRAL SAAS NEXUS CONTROL PLANE APIS ---
  const fetchNexusShards = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/nexus/shards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setShards(data);
      }
    } catch (err) {
      console.error("Error fetching shards:", err);
    }
  };

  const fetchGlobalTickets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/nexus/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGlobalTickets(data);
      }
    } catch (err) {
      console.error("Error fetching global support tickets:", err);
    }
  };

  const fetchInfraStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/nexus/infra-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInfraStatus(data);
      }
    } catch (err) {
      console.error("Error fetching infra status:", err);
    }
  };

  const handleProvisionShard = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setShardLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/nexus/shards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: provName,
          subdomain: provSubdomain,
          admin_email: provAdminEmail,
          admin_password: provAdminPassword,
          subscription_plan: provPlan,
          feature_talent_mgmt: provTalent,
          feature_hr_team: provHr,
          feature_resource_mgmt: provResource
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to provision new tenant shard.");
      
      setAuthSuccess(`Tenant shard '${provName}' successfully provisioned!`);
      setShowProvisionModal(false);
      setShards((prev) => [data, ...prev]);
      setNexusLogs((prev) => [
        `[TENANT PROVISION] Shard '${provSubdomain}' bootstrap initiated.`,
        `[TENANT PROVISION] Schema seeded for '${provSubdomain}'. Admin is '${provAdminEmail}'.`,
        ...prev
      ]);
      // Reset form
      setProvName("");
      setProvSubdomain("");
      setProvAdminEmail("");
      setProvAdminPassword("");
      setProvPlan("growth");
      setProvTalent(true);
      setProvHr(true);
      setProvResource(true);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setShardLoading(false);
    }
  };

  const handleUpdateShard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShardToEdit) return;
    try {
      const res = await fetch(`${API_BASE_URL}/nexus/shards/${selectedShardToEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editShardName,
          subscription_plan: editShardPlan,
          feature_talent_mgmt: editShardTalent,
          feature_hr_team: editShardHr,
          feature_resource_mgmt: editShardResource
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update tenant shard configuration.");
      
      setShards((prev) => prev.map((s) => s.id === selectedShardToEdit.id ? data : s));
      setShowEditShardModal(false);
      setSelectedShardToEdit(null);
      setNexusLogs((prev) => [
        `[TENANT UPDATE] Shard '${data.subdomain}' successfully updated.`,
        ...prev
      ]);
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  const handleDeleteShard = async (orgId: string, orgName: string) => {
    if (!(await showConfirm(`Are you absolutely sure you want to permanently delete the tenant shard "${orgName}"? This will drop its dedicated schema and cascade delete all associated employee, attendance, and payroll records. This action cannot be undone.`))) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/nexus/shards/${orgId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to delete tenant shard.");
      }
      setShards((prev) => prev.filter((shard) => shard.id !== orgId));
      setNexusLogs((prev) => [
        `[TENANT DELETE] Shard organization ID '${orgId}' (${orgName}) permanently deleted.`,
        ...prev
      ]);
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForResolution) return;
    try {
      const res = await fetch(`${API_BASE_URL}/nexus/tickets/${selectedTicketForResolution.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: selectedTicketStatus,
          resolution_notes: ticketResolutionNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update ticket.");
      
      setGlobalTickets((prev) =>
        prev.map((t) => (t.id === selectedTicketForResolution.id ? data : t))
      );
      setSelectedTicketForResolution(null);
      setTicketResolutionNotes("");
      setNexusLogs((prev) => [
        `[TICKET RESOLUTION] Ticket #${data.id.substring(0, 8)} updated to ${selectedTicketStatus}.`,
        ...prev
      ]);
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  // --- TENANT HELP DESK SUPPORT APIS ---
  const fetchMyTickets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/nexus/tickets/tenant`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyTickets(data);
      }
    } catch (err) {
      console.error("Error fetching tenant tickets:", err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/nexus/tickets/tenant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTicketTitle,
          category: newTicketCategory,
          priority: newTicketPriority,
          description: newTicketDescription
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to raise support ticket.");
      
      setMyTickets((prev) => [data, ...prev]);
      setNewTicketTitle("");
      setNewTicketDescription("");
      showToast.success("Support ticket successfully raised to central SaaS Admin!");
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  // --- USER MANAGEMENT APIS ---
  const fetchTenantUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/usermgmt/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTenantUsers(data);
      }
    } catch (err) {
      console.error("Error fetching tenant users:", err);
    }
  };

  const fetchRolePermissions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/usermgmt/permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRolePermissions(data);
      }
    } catch (err) {
      console.error("Error fetching role permissions:", err);
    }
  };

  const handleSavePermissions = async (updatedMatrix: any[]) => {
    try {
      const res = await fetch(`${API_BASE_URL}/usermgmt/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedMatrix)
      });
      if (res.ok) {
        const data = await res.json();
        setRolePermissions(data);
        showToast.success("Role-Based Access Control matrix updated successfully!");
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to update role permissions.");
      }
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  const handleCreateOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (userMgmtEditMode && selectedMgmtUserId) {
        const res = await fetch(`${API_BASE_URL}/usermgmt/users/${selectedMgmtUserId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            email: mgmtEmail,
            role: mgmtRole,
            password: mgmtPassword || undefined,
            is_active: mgmtIsActive
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to update user.");
        setTenantUsers((prev) => prev.map((u) => (u.id === selectedMgmtUserId ? data : u)));
        showToast.success("Portal user updated successfully!");
      } else {
        const res = await fetch(`${API_BASE_URL}/usermgmt/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            email: mgmtEmail,
            role: mgmtRole,
            password: mgmtPassword,
            is_active: mgmtIsActive
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to create user.");
        setTenantUsers((prev) => [data, ...prev]);
        showToast.success("Portal user created successfully!");
      }
      setUserMgmtModalOpen(false);
      // Reset form
      setMgmtEmail("");
      setMgmtRole("employee");
      setMgmtPassword("");
      setMgmtIsActive(true);
      setSelectedMgmtUserId(null);
      setUserMgmtEditMode(false);
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!(await showConfirm("Are you sure you want to permanently delete this user portal credential?"))) return;
    try {
      const res = await fetch(`${API_BASE_URL}/usermgmt/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to delete user.");
      }
      setTenantUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast.success("Portal user deleted successfully!");
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  // --- TALENT RECRUITMENT & ONBOARDING SUITE APIS ---
  const fetchTalentProfiles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/talent/profiles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setTalentProfiles(await res.json());
    } catch (e) { console.error(e); }
  };
  
  const fetchJobMatches = async (jobId: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      const res = await fetch(`${API_BASE_URL}/talent/jobs/${jobId}/match`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) setMatchResults(await res.json());
    } catch (e: any) {
      if (e.name === "AbortError") {
        console.error("JD Matcher request timed out after 45s");
        alert("JD Matcher request timed out. Please try again or narrow down your search.");
      } else {
        console.error(e);
      }
    }
  };

  const fetchTalentPositions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/talent/positions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setTalentPositions(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchTalentPostings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/talent/postings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setTalentPostings(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchTalentCandidates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/talent/candidates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTalentCandidates(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchTalentInterviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/talent/interviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTalentInterviews(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchTalentOffers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/talent/offers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTalentOffers(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchResourceRequisitions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/requisitions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResourceRequisitions(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const handleCreateRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequisitionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/requisitions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: reqTitle,
          department_id: undefined,
          num_positions: reqNumPositions,
          employment_type: reqEmploymentType,
          justification: reqJustification,
          budget_range: reqBudgetRange,
          skills_required: reqSkills,
          expected_joining_date: reqJoiningDate || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create requisition.");
      setResourceRequisitions((prev) => [data, ...prev]);
      setShowRequisitionModal(false);
      setReqTitle("");
      setReqDeptId("");
      setReqNumPositions(1);
      setReqEmploymentType("permanent");
      setReqJustification("");
      setReqBudgetRange("");
      setReqSkills("");
      setReqJoiningDate("");
      showToast.success("Resource requisition created successfully!");
    } catch (err: any) { showToast.error(err.message); }
    finally { setRequisitionLoading(false); }
  };

  const handleSubmitRequisition = async (reqId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/requisitions/${reqId}/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to submit requisition.");
      }
      const data = await res.json();
      setResourceRequisitions((prev) => prev.map((r) => (r.id === reqId ? data : r)));
      showToast.success("Requisition submitted for approval!");
    } catch (err: any) { showToast.error(err.message); }
  };

  const handleApproveManagerReq = async (reqId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/requisitions/${reqId}/approve-manager`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to approve.");
      }
      const data = await res.json();
      setResourceRequisitions((prev) => prev.map((r) => (r.id === reqId ? data : r)));
      showToast.success("Requisition approved by manager!");
    } catch (err: any) { showToast.error(err.message); }
  };

  const handleApproveHrReq = async (reqId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/requisitions/${reqId}/approve-hr`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to approve.");
      }
      const data = await res.json();
      setResourceRequisitions((prev) => prev.map((r) => (r.id === reqId ? data : r)));
      showToast.success("Requisition approved by HR!");
    } catch (err: any) { showToast.error(err.message); }
  };

  const handleRejectRequisition = async (reqId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/requisitions/${reqId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to reject.");
      }
      const data = await res.json();
      setResourceRequisitions((prev) => prev.map((r) => (r.id === reqId ? data : r)));
      showToast.success("Requisition rejected.");
    } catch (err: any) { showToast.error(err.message); }
  };

  const handleConvertRequisition = async (reqId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/requisitions/${reqId}/convert-to-position`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to convert.");
      }
      const data = await res.json();
      setResourceRequisitions((prev) => prev.map((r) => (r.id === reqId ? data : r)));
      showToast.success("Requisition converted to position! Go to Positions tab.");
      fetchTalentPositions();
    } catch (err: any) { showToast.error(err.message); }
  };

  const handleCreatePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    setPositionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/talent/positions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: posTitle,
          department_id: posDeptId || undefined,
          job_description: posRequirements,
          skill_requirements: posSkills
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMsg(data, "Failed to create position."));
      setTalentPositions((prev) => [data, ...prev]);
      setShowPositionModal(false);
      setPosTitle("");
      setPosDeptId("");
      setPosRequirements("");
      setPosSkills("");
      showToast.success("Recruitment position created successfully!");
    } catch (err: any) { showToast.error(err.message); }
    finally { setPositionLoading(false); }
  };

  const handleCreatePosting = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostingLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/talent/postings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          position_id: selectedPositionId,
          description: postingDescription,
          requirements: postingDescription || "Not specified",
          salary_range: postingSalary
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMsg(data, "Failed to create posting."));
      setTalentPostings((prev) => [data, ...prev]);
      setShowPostingModal(false);
      setPostingTitle("");
      setPostingDescription("");
      setPostingSalary("");
      showToast.success("Job posting published successfully!");
    } catch (err: any) { showToast.error(err.message); }
    finally { setPostingLoading(false); }
  };

  const handleUploadProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileUploadLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/talent/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: profFirst,
          last_name: profLast,
          email: profEmail,
          phone: profPhone,
          resume_url: profResumeUrl,
          skills: profSkills,
          experience_summary: profExpSummary,
          raw_resume_text: profRawResumeText,
          reference_type: profRefType === "none" ? null : profRefType,
          reference_detail: profRefType === "none" ? null : profRefDetail
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMsg(data, "Failed to ingest talent profile."));
      setTalentProfiles((prev) => [data, ...prev]);
      setShowProfileUploadModal(false);
      setProfFirst("");
      setProfLast("");
      setProfEmail("");
      setProfPhone("");
      setProfResumeUrl("");
      setProfSkills("");
      setProfExpSummary("");
      setProfRawResumeText("");
      setProfRefType("none");
      setProfRefDetail("");
    } catch (err: any) {
      showToast.error(err.message);
    } finally {
      setProfileUploadLoading(false);
    }
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCandidateLoading(true);
    try {
      if (!selectedPostingId) {
        setCandFormError("Please select an active Career Opening before logging this candidate.");
        return;
      }
      const selectedPosting = talentPostings.find(p => p.id === selectedPostingId);
      if (!selectedPosting) {
        setCandFormError("Please select a valid Career Opening.");
        return;
      }
      const positionId = selectedPosting.position_id;
      const res = await fetch(`${API_BASE_URL}/talent/candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          position_id: positionId,
          first_name: candFirst,
          last_name: candLast,
          email: candEmail,
          phone: candPhone,
          resume_url: candResumeUrl || null,
          skills: candSkills || null,
          reference_type: candRefType === "none" ? null : candRefType,
          reference_detail: candRefType === "none" ? null : candRefDetail
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMsg(data, "Failed to create candidate profile."));
      setTalentCandidates((prev) => [data, ...prev]);
      setShowCandidateModal(false);
      setCandFirst("");
      setCandLast("");
      setCandEmail("");
      setCandPhone("");
      setCandResumeUrl("");
      setCandSkills("");
      setCandRefType("none");
      setCandRefDetail("");
      setCandFormError("");
      showToast.success("Candidate screening application logged successfully!");
    } catch (err: any) { 
      setCandFormError(err.message || "Failed to create candidate profile.");
    }
    finally { setCandidateLoading(false); }
  };

  const handleSendCallLetter = async (candidateId: string) => {
    const rawDate = await showPrompt("Please specify call letter interview date (YYYY-MM-DD):", new Date().toISOString().split("T")[0]);
    if (!rawDate) return;
    const location = await showPrompt("Specify interview location or video link:", "Office Meeting Room A or MS Teams Link");
    if (!location) return;
    const content = await showPrompt("Specify email message content:", "Dear Candidate, you are invited to attend the screening round.");
    if (!content) return;
    try {
      const res = await fetch(`${API_BASE_URL}/talent/call-letters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          candidate_id: candidateId,
          interview_date: `${rawDate}T10:00:00`,
          location_or_link: location,
          email_content: content
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMsg(data, "Failed to issue call letter."));
      showToast.success("Official candidate call letter generated & emailed successfully!");
      fetchTalentCandidates();
    } catch (err: any) { showToast.error(err.message); }
  };

  const handleScheduleInterview = async (candidateId: string) => {
    const rawTime = await showPrompt("Specify interview time (e.g. 2026-05-25T14:30:00):", `${new Date().toISOString().split("T")[0]}T11:00:00`);
    if (!rawTime) return;
    const type = await showPrompt("Specify interview type ('screening', 'technical', 'managerial', 'hr'):", "technical");
    if (!type) return;
    try {
      const res = await fetch(`${API_BASE_URL}/talent/interviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          candidate_id: candidateId,
          interview_round: type,
          scheduled_at: rawTime
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to schedule interview.");
      setTalentInterviews((prev) => [data, ...prev]);
      showToast.success("Recruitment interview slot successfully locked!");
      fetchTalentCandidates();
    } catch (err: any) { showToast.error(err.message); }
  };

  const handleInterviewAction = async (interviewId: string, action: string) => {
    const scoreStr = await showPrompt("Provide interview feedback score (0.0 to 10.0):", "8.0");
    if (!scoreStr) return;
    const feed = await showPrompt("Provide standard interview evaluation notes:", "Passed technical screening beautifully.");
    if (!feed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/talent/interviews/${interviewId}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: action,
          score: parseFloat(scoreStr),
          feedback: feed
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to evaluate interview.");
      setTalentInterviews((prev) => prev.map((i) => (i.id === interviewId ? data : i)));
      showToast.success(`Interview status updated to '${action}'!`);
      fetchTalentCandidates();
    } catch (err: any) { showToast.error(err.message); }
  };

  const handleSelectCandidate = async (candidateId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/talent/candidates/${candidateId}/select`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMsg(data, "Failed to select candidate."));
      setTalentCandidates((prev) => prev.map((c) => (c.id === candidateId ? data : c)));
      showToast.success("Candidate selection approved! You may now draft the Offer Letter.");
    } catch (err: any) { showToast.error(err.message); }
  };

  const handleRejectCandidate = async (candidateId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/talent/candidates/${candidateId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMsg(data, "Failed to reject candidate."));
      setTalentCandidates((prev) => prev.map((c) => (c.id === candidateId ? data : c)));
      showToast.success("Candidate application archived/rejected.");
    } catch (err: any) { showToast.error(err.message); }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfferLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/talent/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          candidate_id: selectedCandIdForOffer,
          offered_salary: parseFloat(offerSalary),
          joining_date: offerJoiningDate,
          grade: offerGrade,
          department_id: offerDeptId || undefined,
          designation_id: offerDesignationId || undefined,
          expiry_date: offerExpiryDate
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMsg(data, "Failed to create offer letter."));
      setTalentOffers((prev) => [data, ...prev]);
      setShowOfferModal(false);
      showToast.success("Official tenant offer letter successfully drafted and generated!");
      fetchTalentCandidates();
    } catch (err: any) { showToast.error(err.message); }
    finally { setOfferLoading(false); }
  };

  const handleOfferAction = async (offerId: string, action: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/talent/offers/${offerId}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ offer_status: action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to process offer action.");
      setTalentOffers((prev) => prev.map((o) => (o.id === offerId ? data : o)));
      showToast.success(`Offer letter marked as '${action}'!`);
      fetchTalentCandidates();
    } catch (err: any) { showToast.error(err.message); }
  };

  const handleOnboardCandidate = async (candidateId: string) => {
    if (!(await showConfirm("This will promote the selected candidate to a full active employee: provision user credentials, auto-seed default leave balances, and instantiate their core HR profile. Continue?"))) return;
    try {
      const res = await fetch(`${API_BASE_URL}/talent/candidates/${candidateId}/onboard`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(data.detail || errData.detail || "Failed to onboard candidate.");
      }
      showToast.success(`Seamless transition complete! Created Employee profile with Sequential ID: ${data.employee_id}. Default Portal login credentials sent to candidate.`);
      fetchTalentCandidates();
      fetchTalentOffers();
      fetchTalentPostings();
      fetchEmployees();
    } catch (err: any) { showToast.error(err.message); }
  };

  // Fetch Dashboard Stats & Overview details
  const [reportLoadingPlaceholder, setReportLoadingPlaceholder] = useState<boolean>(false); // placeholder if needed to preserve layout
  const fetchDashboardMetrics = async () => {
    if (!token) return;
    setMetricsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardMetrics(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard metrics:", err);
    } finally {
      setMetricsLoading(false);
    }
  };

  const fetchAttendanceAnalytics = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAttendanceAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch attendance analytics:", err);
    }
  };

  const fetchRecruitmentAnalytics = async (search?: string) => {
    if (!token) return;
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const qs = params.toString();
      const res = await fetch(`${API_BASE_URL}/talent/analytics/pipeline${qs ? `?${qs}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardMetrics((prev: any) => prev ? { ...prev, talent: { ...prev.talent, ...data } } : prev);
      }
    } catch (err) {
      console.error("Failed to fetch recruitment analytics:", err);
    }
  };

  const fetchOverviewData = async () => {
    await fetchAttendance();
    await fetchDashboardMetrics();
    await fetchAttendanceAnalytics();
    await fetchRecruitmentAnalytics();
  };


  // Fetch RMG Assets
  const fetchRmgAssets = async () => {
    const res = await fetch(`${API_BASE_URL}/rmg/assets`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setRmgAssets(data);
    }
  };

  // Fetch RMG Induction Tasks
  const fetchRmgInductionTasks = async () => {
    const res = await fetch(`${API_BASE_URL}/rmg/induction-tasks`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setRmgInductionTasks(data);
    }
  };

  // Fetch RMG Clients
  const fetchRmgClients = async () => {
    const res = await fetch(`${API_BASE_URL}/rmg/clients`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setRmgClients(await res.json());
  };

  // Fetch RMG Projects
  const fetchRmgProjects = async () => {
    const res = await fetch(`${API_BASE_URL}/rmg/projects`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setRmgProjects(await res.json());
  };

  // Fetch RMG Allocations (optionally filtered by project)
  const fetchRmgAllocations = async (projectId?: string) => {
    const url = projectId
      ? `${API_BASE_URL}/rmg/allocations?project_id=${projectId}`
      : `${API_BASE_URL}/rmg/allocations`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setRmgAllocations(await res.json());
  };

  // Fetch Bench Resources
  const fetchRmgBench = async () => {
    const res = await fetch(`${API_BASE_URL}/rmg/bench`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setRmgBench(await res.json());
  };

  // Fetch Employee's Personal Assets & Induction Tasks

  const fetchMyAssetsAndInduction = async () => {
    try {
      const res1 = await fetch(`${API_BASE_URL}/onboarding/assets/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res1.ok) {
        const data1 = await res1.json();
        setMyAssets(data1);
      }
      const res2 = await fetch(`${API_BASE_URL}/onboarding/checklist/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res2.ok) {
        const data2 = await res2.json();
        setMyInductionTasks(data2);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Employees List
  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/employees${employeeSearch ? `?search=${employeeSearch}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Attendance Log histories
  const fetchAttendance = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/me${activeView.startsWith("org-") && hrSelectedEmployeeId ? `?employee_id=${hrSelectedEmployeeId}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyAttendance(data);
        // Check if checked in today
        const todayStr = new Date().toISOString().split("T")[0];
        const clockedToday = data.some((att: Attendance) => att.date === todayStr);
        setIsCheckedIn(clockedToday);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch recent audit logs
  const fetchActivities = async () => {
    setActivitiesLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/audit/logs?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setActivities(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Fetch Leave Balances & requests
  const fetchLeaveData = async () => {
    try {
      // 1. Fetch balances
      const balRes = await fetch(`${API_BASE_URL}/leave/balance${activeView.startsWith("org-") && hrSelectedEmployeeId ? `?employee_id=${hrSelectedEmployeeId}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (balRes.ok) {
        const data = await balRes.json();
        setLeaveBalances(data);
      }
      // 2. Fetch requests
      const reqRes = await fetch(`${API_BASE_URL}/leave/requests${activeView.startsWith("org-") && hrSelectedEmployeeId ? `?employee_id=${hrSelectedEmployeeId}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (reqRes.ok) {
        const data = await reqRes.json();
        setLeaveRequests(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Payslips & runs
  const fetchPayrollData = async () => {
    try {
      // 1. Employee payslips
      const payRes = await fetch(`${API_BASE_URL}/payroll/payslips/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (payRes.ok) {
        const data = await payRes.json();
        setMyPayslips(data);
      }
      // 2. HR Admin Runs list
      if (currentUser?.role === "hr_admin" || currentUser?.role === "payroll_admin") {
        const runsRes = await fetch(`${API_BASE_URL}/payroll/runs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (runsRes.ok) {
          const data = await runsRes.json();
          setPayrollRuns(data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Authenticate Login Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);
    try {
      let loginOrigin = "Tenant";
      if (selectedOrgId === "00000000-0000-0000-0000-000000000000") {
        loginOrigin = "Nexus";
      }

      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: loginEmail, 
          password: loginPassword,
          organization_id: selectedOrgId,
          login_origin: loginOrigin
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Authentication Failed");
      }
      setToken(data.access_token);
      setAuthSuccess("Authentication successful! Welcome to CogniHR.");
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Bootstrap tenant self-registration handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_name: regOrgName,
          subdomain: regSubdomain,
          admin_email: regAdminEmail,
          admin_password: regAdminPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Registration failed");
      }
      setAuthSuccess("Tenant bootstrap successful! Please login with your credentials.");
      setIsRegisterMode(false);
      setLoginEmail(regAdminEmail);
      setLoginPassword(regAdminPassword);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Onboard new employee form submission
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isNameDuplicate = employees.some(
        (emp) =>
          emp.first_name.trim().toLowerCase() === empFirst.trim().toLowerCase() &&
          emp.last_name.trim().toLowerCase() === empLast.trim().toLowerCase()
      );
      if (isNameDuplicate && !onboardDuplicateWarning) {
        setOnboardDuplicateWarning(true);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          employee_id: empId,
          first_name: empFirst,
          last_name: empLast,
          dob: empDob || null,
          gender: empDob ? empGender : null,
          phone: empPhone || null,
          address: empAddress || null,
          joining_date: empJoining,
          employment_type: empType,
          email: empEmail || null,
          password: empPassword || null,
          role: empRole
        })
      });
      if (res.ok) {
        setShowOnboardModal(false);
        setOnboardDuplicateWarning(false);
        fetchEmployees();
        // Clear fields
        setEmpId("");
        setEmpFirst("");
        setEmpLast("");
        setEmpEmail("");
        setEmpPassword("");
        setEmpPhone("");
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to onboard employee");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Clock-in trigger handler
  const handleClockIn = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ip_address: "192.168.1.15",
          location_lat: 12.9716,
          location_lng: 77.5946
        })
      });
      if (res.ok) {
        fetchAttendance();
        fetchActivities();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Clock-in failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Clock-out trigger handler
  const handleClockOut = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ip_address: "192.168.1.15",
          location_lat: 12.9716,
          location_lng: 77.5946
        })
      });
      if (res.ok) {
        fetchAttendance();
        fetchActivities();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Clock-out failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit leave request form handler
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/leave/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          leave_type: reqLeaveType,
          start_date: reqStart,
          end_date: reqEnd,
          reason: reqReason
        })
      });
      if (res.ok) {
        fetchLeaveData();
        fetchActivities();
        // Clear
        setReqStart("");
        setReqEnd("");
        setReqReason("");
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to submit leave request");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Process manager approval action on leave request
  const handleLeaveAction = async (requestId: string, statusAction: "approved" | "rejected") => {
    try {
      const res = await fetch(`${API_BASE_URL}/leave/requests/${requestId}/action`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: statusAction,
          rejection_reason: statusAction === "rejected" ? "Manager rejected" : null
        })
      });
      if (res.ok) {
        fetchLeaveData();
        fetchActivities();
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to action leave request");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Process monthly batch payroll math
  const handleProcessPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/payroll/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          month: Number(runMonth),
          year: Number(runYear)
        })
      });
      if (res.ok) {
        fetchPayrollData();
        showToast.success("Payroll run batch executed successfully for all active employees!");
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to run payroll");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Setup salary structure configuration
  const handleSalarySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssEmployeeId) {
      showToast.error("Please select or input an Employee ID");
      return;
    }

    const parsedCustomDeductions: { [key: string]: number } = {};
    if (ssCustomDeductionsText.trim()) {
      ssCustomDeductionsText.split(",").forEach((item) => {
        const parts = item.split(":");
        if (parts.length === 2) {
          const key = parts[0].trim();
          const val = Number(parts[1].trim());
          if (key && !isNaN(val)) {
            parsedCustomDeductions[key] = val;
          }
        }
      });
    }

    try {
      const res = await fetch(`${API_BASE_URL}/payroll/salary-structure`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          employee_id: ssEmployeeId,
          basic: Number(ssBasic),
          hra: Number(ssHra),
          allowances: Number(ssAllowances),
          pf: Number(ssPf),
          tax: Number(ssTax),
          nps: Number(ssNps),
          custom_deductions: parsedCustomDeductions
        })
      });
      if (res.ok) {
        showToast.success("Salary structure successfully configured!");
      } else {
        const data = await res.json();
        showToast.error(data.detail || "Failed to configure salary");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Groq AI Chat Message sender
  const handleSendAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const userMessage = aiQuery;
    setChatMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setAiQuery("");
    setIsAiLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/ai/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ query: userMessage })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { sender: "assistant", text: data.answer }]);
      } else {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { sender: "assistant", text: `⚠️ Error: ${data.detail || "Unable to retrieve response from Groq."}` }]);
      }
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: "assistant", text: "⚠️ Server connectivity error. Is your FastAPI backend running?" }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Mock Resume Parser OCR upload simulator
  const handleOcrMockUpload = () => {
    setIsAiLoading(true);
    setChatMessages((prev) => [...prev, { sender: "user", text: "📎 [Uploaded file: resume_sample.pdf]" }]);
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { 
        sender: "assistant", 
        text: "🔍 **[Groq AI OCR Resume Parser]** Successfully processed and auto-extracted data:\n\n- **Name:** Alex Mercer\n- **Skills:** Python, React, PostgreSQL, LangChain\n- **Experience:** 3 Years Software Engineer\n\nWould you like me to auto-fill the new Employee Onboarding Form with these extracted details?" 
      }]);
      setIsAiLoading(false);
    }, 2000);
  };

  // Clean Login/Register screens
  if (!token) {
    if (showLanding) {
      return <LandingPage onLoginClick={() => setShowLanding(false)} />;
    }
    return (
      <div className="auth-split-layout">
        <div className="auth-brand-side">
          <div className="brand-content">
            <div style={{ marginBottom: "24px" }}>
              <img src="/logo.png" alt="Logo" style={{ height: "56px", width: "auto", objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span style="color:#fff;font-weight:bold;font-size:32px;">HR</span>'; }} />
            </div>
            <h1 style={{ fontSize: "48px", fontWeight: "800", color: "#fff", marginBottom: "24px", lineHeight: 1.1, letterSpacing: "-1px" }}>
              The Intelligence Engine<br/>for Modern HR.
            </h1>
            <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.8)", maxWidth: "480px", lineHeight: 1.6 }}>
              CogniHR empowers enterprises to autonomously manage recruitment, payroll, and compliance through advanced NLP and predictive models.
            </p>
            
            <div className="auth-floating-badges" style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "48px" }}>
              <div className="badge-glass">✨ AI-Powered NLP Matching</div>
              <div className="badge-glass">🔒 Enterprise Multi-Tenant</div>
              <div className="badge-glass">🇮🇳 Statutory Compliance</div>
            </div>
          </div>
          
          <div className="auth-mesh-bg"></div>
        </div>

        <div className="auth-form-side">
          <div style={{ position: "absolute", top: "24px", right: "24px" }}>
            <button className="theme-toggle-btn" onClick={() => setAppTheme(t => t === "light" ? "mixed" : t === "mixed" ? "enterprise" : t === "enterprise" ? "corporate" : "light")} title="Toggle Theme" style={{ background: "transparent" }}>
              {appTheme === "light" ? "✨" : appTheme === "mixed" ? "🌗" : appTheme === "enterprise" ? "🏢" : "💼"}
            </button>
          </div>
          
          <div className="auth-form-container">
            <button 
              onClick={() => setShowLanding(true)} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', padding: 0 }}
            >
              ← Back to Home
            </button>
            <div style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "32px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.5px" }}>
                Welcome back
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
                {isRegisterMode ? "Bootstrap your Multi-Tenant SaaS HRMS Workspace" : "Enter your tenant credentials to access CogniHR"}
              </p>
            </div>

            {authError && (
              <div style={{ background: "var(--danger-bg)", color: "var(--danger)", padding: "16px", borderRadius: "12px", fontSize: "14px", marginBottom: "24px", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>⚠️</span> {authError}
              </div>
            )}
            {authSuccess && (
              <div style={{ background: "var(--success-bg)", color: "var(--success)", padding: "16px", borderRadius: "12px", fontSize: "14px", marginBottom: "24px", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>✅</span> {authSuccess}
              </div>
            )}

            {!isRegisterMode ? (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group" style={{ marginBottom: "24px" }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-secondary)" }}>Tenant Workspace</label>
                  <select className="form-control auth-input" value={selectedOrgId} onChange={(e) => setSelectedOrgId(e.target.value)} required>
                    <option value="" disabled>Select your workspace...</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: "24px" }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-secondary)" }}>Work Email</label>
                  <input type="email" className="form-control auth-input" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required placeholder="you@company.com" />
                </div>
                <div className="form-group" style={{ marginBottom: "32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-secondary)" }}>Password</label>
                    <a href="#" style={{ fontSize: "13px", color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>Forgot password?</a>
                  </div>
                  <input type="password" className="form-control auth-input" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required placeholder="••••••••" />
                </div>
                <button type="submit" className="auth-submit-btn" disabled={authLoading}>
                  {authLoading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <div className="loading-spinner" style={{ width: "20px", height: "20px", borderWidth: "2px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff", boxShadow: "none" }}></div>
                      <span>Verifying Workspace...</span>
                    </div>
                  ) : "Sign In to Workspace"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-secondary)" }}>Organization Name</label>
                  <input type="text" className="form-control auth-input" value={regOrgName} onChange={(e) => setRegOrgName(e.target.value)} required placeholder="e.g. Acme Corp" />
                </div>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-secondary)" }}>Requested Subdomain</label>
                  <input type="text" className="form-control auth-input" value={regSubdomain} onChange={(e) => setRegSubdomain(e.target.value)} required placeholder="e.g. acme" />
                </div>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-secondary)" }}>Admin Email</label>
                  <input type="email" className="form-control auth-input" value={regAdminEmail} onChange={(e) => setRegAdminEmail(e.target.value)} required placeholder="admin@company.com" />
                </div>
                <div className="form-group" style={{ marginBottom: "32px" }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-secondary)" }}>Password</label>
                  <input type="password" className="form-control auth-input" value={regAdminPassword} onChange={(e) => setRegAdminPassword(e.target.value)} required placeholder="••••••••" />
                </div>
                <button type="submit" className="auth-submit-btn" disabled={authLoading}>
                  {authLoading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <div className="loading-spinner" style={{ width: "20px", height: "20px", borderWidth: "2px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff", boxShadow: "none" }}></div>
                      <span>Bootstrapping Tenant...</span>
                    </div>
                  ) : "Bootstrap Enterprise Tenant"}
                </button>
                
                <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
                  Already have a workspace?{" "}
                  <span style={{ color: "var(--primary)", fontWeight: 6, cursor: "pointer" }} onClick={() => setIsRegisterMode(false)}>
                    Sign In
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (token && !currentUser) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-app)", color: "var(--text-primary)" }}>
        <div className="glass-card" style={{ padding: "48px", borderRadius: "var(--radius-md)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", maxWidth: "400px", border: "1px solid var(--border-color)" }}>
          <div className="loading-spinner"></div>
          <div>
            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", fontFamily: "var(--font-heading)" }}>Securing Connection</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "8px 0 0", lineHeight: "1.5" }}>Verifying tenant permissions & security credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  const getActiveProjectRole = (emp: any) => {
    if (!emp.project_allocations || emp.project_allocations.length === 0) {
      return <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Bench (Unassigned)</span>;
    }
    return emp.project_allocations.map((alloc: any) => {
      const proj = projects.find(p => p.id === alloc.project_id);
      const projName = proj ? proj.name : "Unknown Project";
      const client = proj ? clients.find(c => c.id === proj.client_id) : null;
      const clientName = client ? client.name : "";
      return (
        <div key={alloc.id} style={{ fontSize: "12px", marginBottom: "4px" }}>
          <strong>{alloc.project_role}</strong> <span style={{ color: "var(--text-muted)" }}>({alloc.allocation_percentage}%) on {projName}</span>
          {clientName && <div style={{ fontSize: "11px", color: "var(--primary)" }}>at {clientName}</div>}
        </div>
      );
    });
  };  const isViewAllowed = (view: string): boolean => {
    if (!currentUser) return false;

    // Normalize "my-*" / "org-*" prefixed views to base name for generic checks
    const baseView = view.replace(/^(my|org)-/, "");

    // Super admin ONLY sees nexus-mgmt
    if (currentUser.role === "super_admin") {
      return view === "nexus-mgmt";
    }

    // Normal tenant users cannot see nexus-mgmt
    if (view === "nexus-mgmt") {
      return false;
    }

    // Help desk / Support is open to all tenant users
    if (view === "support-desk") {
      return true;
    }

    // 1. PRIORITIZE FEATURE FLAG SUBSCRIPTION CHECKS FIRST
    // Talent Management views require feature_talent_mgmt
    if (view === "talent-mgmt") {
      const talentEnabled = currentUser.feature_talent_mgmt !== false;
      if (!talentEnabled) return false;
    }

    // HR Team Fintech views require feature_hr_team
    const hrTeamViews = ["attendance", "leave", "payroll", "fbp-tax", "insurance", "car-lease", "org-structure", "shift-management", "policy-center"];
    if (hrTeamViews.includes(baseView)) {
      if (!currentUser.feature_hr_team) return false;
    }

    // Resource Management views require feature_resource_mgmt
    const resourceMgmtViews = ["appraisals", "ai-promotions", "offboarding", "project-allocations", "achievements-awards"];
    if (resourceMgmtViews.includes(baseView)) {
      if (!currentUser.feature_resource_mgmt) return false;
    }

    if (view === "onboarding-checklist" || view === "rmg-checklist" || view === "asset-registry" || view === "project-allocations") {
      if (!currentUser.feature_resource_mgmt) return false;
    }

    // 2. NOW APPLY ROLE CHECK BYPASS FOR HR ADMIN (subject to subscription limits)
    if (currentUser.role === "hr_admin") {
      return true;
    }

    // Portal User Management and Employees require hr_admin (which failed above)
    if (view === "user-mgmt" || view === "employees") {
      return false;
    }

    if (view === "onboarding-checklist" || view === "rmg-checklist" || view === "asset-registry") {
      return currentUser.role === "Resource Mgmt Group";
    }
    if (view === "project-allocations") {
      return currentUser.role === "Resource Mgmt Group" || currentUser.role === "hr_operations";
    }
    if (view === "my-assets-induction" || view === "my-profile" || view === "my-expenses" || view === "my-payslips" || view === "my-documents") {
      return true;
    }

    // Consult dynamic role permissions from DB matrix if loaded
    // Try both the original view name and the normalized base view
    const permRecord = rolePermissions.find(p => p.role === currentUser.role && (p.feature === view || p.feature === baseView));
    if (permRecord) {
      if (!permRecord.is_enabled) return false;
    } else {
      // Fallback defaults check if not loaded
      const default_permissions: any = {
        "employee": ["dashboard", "attendance", "leave", "fbp-tax", "insurance", "car-lease", "appraisals", "offboarding", "ai-copilot", "achievements-awards"],
        "manager": ["dashboard", "attendance", "leave", "fbp-tax", "insurance", "car-lease", "appraisals", "offboarding", "ai-copilot", "achievements-awards"],
        "recruiter": ["dashboard", "talent-mgmt", "ai-copilot"],
        "Talent Team": ["dashboard", "talent-mgmt", "ai-copilot"],
        "HR Team": ["dashboard", "ai-copilot"],
        "Resource Mgmt Group": ["dashboard", "appraisals", "project-allocations", "ai-copilot", "achievements-awards"],
        "payroll_admin": ["dashboard", "payroll", "fbp-tax", "ai-copilot"],
        "hr_admin": ["dashboard", "attendance", "leave", "payroll", "fbp-tax", "insurance", "car-lease", "appraisals", "ai-promotions", "offboarding", "talent-mgmt", "ai-copilot", "employees", "user-mgmt", "org-structure", "shift-management", "policy-center", "project-allocations", "rmg-checklist", "onboarding-checklist", "asset-registry", "achievements-awards"],
        "hr_operations": ["dashboard", "project-allocations", "appraisals", "ai-copilot", "achievements-awards"]
      };
      const allowed = (default_permissions[currentUser.role] || []).includes(baseView);
      if (!allowed) return false;
    }

    // Double check specific roles for Talent view
    if (view === "talent-mgmt") {
      const isTalentRole = ["recruiter", "Talent Team"].includes(currentUser.role);
      return isTalentRole;
    }
    
    return true;
  };

  const renderAccessDenied = () => {
    const isNoSubscription = [
      "attendance", "leave", "payroll", "fbp-tax", "insurance", "car-lease",
      "appraisals", "ai-promotions", "offboarding", "talent-mgmt",
      "my-attendance", "my-leave", "my-payroll", "my-fbp-tax", "my-insurance", "my-car-lease", "my-offboarding",
      "my-profile", "my-expenses", "my-payslips", "my-documents",
      "org-attendance", "org-leave", "org-payroll", "org-fbp-tax", "org-insurance", "org-car-lease", "org-offboarding",
      "org-structure", "shift-management", "policy-center",
      "project-allocations", "rmg-checklist", "onboarding-checklist", "asset-registry"
    ].includes(activeView);
    
    return (
      <div className="animated" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "40px" }}>
        <div className="glass-card" style={{ maxWidth: "550px", textAlign: "center", padding: "48px", border: "1px solid rgba(239, 68, 68, 0.2)", background: "rgba(239, 68, 68, 0.02)", backdropFilter: "blur(8px)" }}>
          <div style={{ fontSize: "64px", marginBottom: "24px", filter: "drop-shadow(0 0 10px rgba(239, 68, 68, 0.4))" }}>🛡️</div>
          <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "16px", background: "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {isNoSubscription ? "Subscription Required" : "Access Denied"}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: "1.6", marginBottom: "32px" }}>
            {isNoSubscription 
              ? `Your organization '${orgName}' does not have an active subscription for this feature set. Please contact your system administrator to unlock it in the central control plane.`
              : `You are not authorized to view the requested section. This panel is strictly restricted to authorized roles (e.g. HR Admin, Recruiter, Talent Team).`
            }
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={() => {
              if (currentUser?.role === "super_admin") {
                setActiveView("nexus-mgmt");
              } else {
                setActiveView("dashboard");
              }
            }}>
              Return to Safety
            </button>
            {isNoSubscription && currentUser?.role === "hr_admin" && (
              <button className="btn btn-secondary" onClick={() => setActiveView("support-desk")}>
                Request Subscription Upgrade
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderNexusManagement = () => {
    return (
      <div className="animated">
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "28px" }}>🌐</span>
              <div>
                <h2 style={{ margin: 0 }}>Central SaaS CogniHR Control Plane</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>Provision Logical Tenant Shards, Manage Global Support Tickets, and Track Infra Resources Telemetry</p>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowProvisionModal(true)}>
              ➕ Provision Tenant Shard
            </button>
          </div>

          <div className="tabs-header" style={{ marginBottom: "20px" }}>
            <button className={`tab-btn${nexusActiveTab === "shards" ? " active" : ""}`} onClick={() => setNexusActiveTab("shards")}>🗂️ Active Shards</button>
            <button className={`tab-btn${nexusActiveTab === "tickets" ? " active" : ""}`} onClick={() => setNexusActiveTab("tickets")}>🎫 Global Tickets Queue ({globalTickets.filter(t => t.status !== 'resolved').length})</button>
            <button className={`tab-btn${nexusActiveTab === "infra" ? " active" : ""}`} onClick={() => setNexusActiveTab("infra")}>⚙️ Infra Diagnostic Telemetry</button>
          </div>

          {nexusActiveTab === "shards" && (
            <div>
              <h3>Enterprise Tenant Shard Registry</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12.5px", marginBottom: "16px" }}>Logical multi-tenant isolation database shards mapped by Organization ID boundaries</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                {shards.length === 0 ? (
                  <div className="glass-card" style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No tenant shards provisioned yet.
                  </div>
                ) : (
                  shards.map((shard) => (
                    <div key={shard.id} className="glass-card" style={{ border: "1px solid var(--border-color)", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", background: "rgba(255,255,255,0.01)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{shard.name}</h4>
                        <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", fontSize: "10px", fontWeight: 700 }}>{shard.status_ping === 'healthy' ? "● ACTIVE & SECURE" : "○ OFFLINE"}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        <div>Subdomain: <strong>{shard.subdomain}.hrms-engine.com</strong></div>
                        <div>Plan: <span style={{ textTransform: "uppercase", fontWeight: 6 }}>{shard.subscription_plan}</span></div>
                        <div>Created: {new Date(shard.created_at).toLocaleDateString()}</div>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "4px" }}>
                        <span className="badge" style={{ fontSize: "9.5px", background: shard.feature_talent_mgmt ? "rgba(0,194,212,0.1)" : "rgba(255,255,255,0.05)", color: shard.feature_talent_mgmt ? "var(--primary)" : "var(--text-muted)" }}>🎯 Talent Mgmt</span>
                        <span className="badge" style={{ fontSize: "9.5px", background: shard.feature_hr_team ? "rgba(0,194,212,0.1)" : "rgba(255,255,255,0.05)", color: shard.feature_hr_team ? "var(--primary)" : "var(--text-muted)" }}>💸 HR Team</span>
                        <span className="badge" style={{ fontSize: "9.5px", background: shard.feature_resource_mgmt ? "rgba(0,194,212,0.1)" : "rgba(255,255,255,0.05)", color: shard.feature_resource_mgmt ? "var(--primary)" : "var(--text-muted)" }}>🚀 Resource Mgmt</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "12px", fontSize: "12px" }}>
                        <span>Users: <strong>{shard.user_count}</strong></span>
                        <span>Active Staff: <strong>{shard.employee_count}</strong></span>
                      </div>
                      <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "4px" }}>
                        <button className="btn btn-secondary" style={{ flex: 1, padding: "6px", fontSize: "11px" }} onClick={() => {
                          setSelectedShardToEdit(shard);
                          setEditShardName(shard.name);
                          setEditShardPlan(shard.subscription_plan);
                          setEditShardTalent(shard.feature_talent_mgmt);
                          setEditShardHr(shard.feature_hr_team);
                          setEditShardResource(shard.feature_resource_mgmt);
                          setShowEditShardModal(true);
                        }}>
                          ✏️ Edit Plan
                        </button>
                        <button className="btn btn-danger" style={{ flex: 1, padding: "6px", fontSize: "11px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }} onClick={() => handleDeleteShard(shard.id, shard.name)}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {nexusActiveTab === "tickets" && (
            <div>
              <h3>Global Support Tickets Desk</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12.5px", marginBottom: "16px" }}>Cross-tenant help claims submitted by isolated organization administrators</p>
              
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tenant</th>
                      <th>Category & Title</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Raised At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {globalTickets.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>No support tickets registered in system queue.</td>
                      </tr>
                    ) : (
                      globalTickets.map((t) => (
                        <tr key={t.id}>
                          <td>
                            <strong style={{ display: "block" }}>{t.organization_name}</strong>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.user_email}</span>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span className="badge" style={{ textTransform: "uppercase", fontSize: "9px", background: "rgba(0,194,212,0.1)", color: "var(--primary)" }}>{t.category}</span>
                              <span style={{ fontWeight: 600 }}>{t.title}</span>
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{t.description}</div>
                            {t.resolution_notes && (
                              <div style={{ fontSize: "11px", color: "var(--success)", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)", padding: "6px", borderRadius: "4px", marginTop: "6px" }}>
                                <strong>Resolution:</strong> {t.resolution_notes}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="badge" style={{
                              fontWeight: 700,
                              fontSize: "10px",
                              background: t.priority === "critical" ? "rgba(239,68,68,0.1)" : t.priority === "high" ? "rgba(249,115,22,0.1)" : t.priority === "medium" ? "rgba(245,158,11,0.1)" : "rgba(100,116,139,0.1)",
                              color: t.priority === "critical" ? "#ef4444" : t.priority === "high" ? "#f97316" : t.priority === "medium" ? "#f59e0b" : "#64748b"
                            }}>
                              {t.priority.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span className="badge" style={{
                              fontWeight: 700,
                              fontSize: "10px",
                              background: t.status === "resolved" ? "rgba(16,185,129,0.1)" : t.status === "in_progress" ? "rgba(99,102,241,0.1)" : "rgba(0,194,212,0.1)",
                              color: t.status === "resolved" ? "#10b981" : t.status === "in_progress" ? "#6366f1" : "var(--primary)"
                            }}>
                              {t.status.replace("_", " ").toUpperCase()}
                            </span>
                          </td>
                          <td style={{ fontSize: "12px" }}>{new Date(t.created_at).toLocaleString()}</td>
                          <td>
                            <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => {
                              setSelectedTicketForResolution(t);
                              setTicketResolutionNotes(t.resolution_notes || "");
                              setSelectedTicketStatus(t.status);
                            }}>
                              ⚙️ Resolve
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {nexusActiveTab === "infra" && (
            <div>
              <h3>Platform Infrastructure Diagnostic Diagnostics</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12.5px", marginBottom: "20px" }}>Telemetry signals from core PostgreSQL/SQLite storage engine and application clusters</p>
              
              {infraStatus && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
                  <div className="glass-card" style={{ padding: "16px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.01)" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Shard Databases</div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--primary)", marginTop: "4px" }}>{infraStatus.total_shards}</div>
                    <div style={{ fontSize: "11px", color: "var(--success)", marginTop: "4px" }}>● 100% Online & Secure</div>
                  </div>
                  <div className="glass-card" style={{ padding: "16px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.01)" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Storage Engine Model</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, marginTop: "12px", wordBreak: "break-word" }}>{infraStatus.db_engine}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Size: {infraStatus.db_size_kb} KB</div>
                  </div>
                  <div className="glass-card" style={{ padding: "16px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.01)" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Global CPU Compute Load</div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--primary)", marginTop: "4px" }}>{infraStatus.load_cpu}%</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Memory: {infraStatus.load_memory}% allocated</div>
                  </div>
                  <div className="glass-card" style={{ padding: "16px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.01)" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Unresolved Support Tickets</div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: infraStatus.active_tickets > 0 ? "#f59e0b" : "var(--success)", marginTop: "4px" }}>{infraStatus.active_tickets}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Total platform claims: {infraStatus.total_tickets}</div>
                  </div>
                </div>
              )}

              <h4 style={{ marginBottom: "12px" }}>💻 SaaS Real-time Operations Console Logs</h4>
              <div style={{ background: "#0d0e12", border: "1px solid #1f2937", borderRadius: "8px", padding: "16px", fontFamily: "Courier New, monospace", fontSize: "12.5px", color: "#34d399", height: "240px", overflowY: "auto", display: "flex", flexDirection: "column-reverse", gap: "6px", borderLeft: "4px solid var(--primary)" }}>
                {nexusLogs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Shard Provisioning Modal */}
        {showProvisionModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" }}>
            <div className="glass-card animated" style={{ width: "100%", maxWidth: "550px", padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>Provision Logically-Isolated Shard</h3>
                <span style={{ cursor: "pointer", fontSize: "24px", fontWeight: 700, color: "var(--text-muted)", lineHeight: 1 }} onClick={() => setShowProvisionModal(false)}>×</span>
              </div>
              <form onSubmit={handleProvisionShard}>
                <div className="form-group">
                  <label className="form-label">Organization Legal Name</label>
                  <input type="text" className="form-control" required placeholder="e.g. Globex Industries" value={provName} onChange={(e) => setProvName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Shard Subdomain Prefix</label>
                  <input type="text" className="form-control" required placeholder="e.g. globex" value={provSubdomain} onChange={(e) => setProvSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>Domain will resolve to: https://<strong>{provSubdomain || "subdomain"}</strong>.hrms-engine.com</span>
                </div>
                <div className="form-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label className="form-label">Shard Admin Email</label>
                    <input type="email" className="form-control" required placeholder="admin@globex.com" value={provAdminEmail} onChange={(e) => setProvAdminEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Shard Admin Password</label>
                    <input type="password" className="form-control" required placeholder="Password123" value={provAdminPassword} onChange={(e) => setProvAdminPassword(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Billing Subscription Plan</label>
                  <select className="form-control" value={provPlan} onChange={(e) => setProvPlan(e.target.value)}>
                    <option value="growth">Growth Enterprise ($199/mo)</option>
                    <option value="scale">Scale Suite ($499/mo)</option>
                    <option value="nexus">Global Nexus Enterprise ($1299/mo)</option>
                  </select>
                </div>
                <div className="form-group" style={{ border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px", background: "rgba(255,255,255,0.01)", marginTop: "16px", marginBottom: "20px" }}>
                  <label className="form-label" style={{ marginBottom: "12px", display: "block" }}>📦 Feature Model Subscriptions</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", cursor: "pointer" }}>
                      <input type="checkbox" checked={provTalent} onChange={(e) => setProvTalent(e.target.checked)} />
                      <span><strong>Recruitment Talent Suite</strong> (Position JD drafting, Call letters, Job posting, Screening, Offers, Promoted Onboarding)</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", cursor: "pointer" }}>
                      <input type="checkbox" checked={provHr} onChange={(e) => setProvHr(e.target.checked)} />
                      <span><strong>HR Fintech Core</strong> (Attendance punchcard, Leave planner, Payroll bands, Taxes, Insurance & Car Lease hub)</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", cursor: "pointer" }}>
                      <input type="checkbox" checked={provResource} onChange={(e) => setProvResource(e.target.checked)} />
                      <span><strong>Resource Management Group</strong> (Appraisal evaluation reviews, AI promotions scorecard, Exit offboarding)</span>
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>
                  Initialize Database Shard Architecture
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Shard Edit Modal */}
        {showEditShardModal && selectedShardToEdit && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" }}>
            <div className="glass-card animated" style={{ width: "100%", maxWidth: "550px", padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>Configure Tenant Shard</h3>
                <span style={{ cursor: "pointer", fontSize: "24px", fontWeight: 700, color: "var(--text-muted)", lineHeight: 1 }} onClick={() => { setShowEditShardModal(false); setSelectedShardToEdit(null); }}>×</span>
              </div>
              <form onSubmit={handleUpdateShard}>
                <div className="form-group">
                  <label className="form-label">Organization Legal Name</label>
                  <input type="text" className="form-control" required value={editShardName} onChange={(e) => setEditShardName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Shard Subdomain Prefix</label>
                  <input type="text" className="form-control" disabled value={`${selectedShardToEdit.subdomain}.hrms-engine.com`} />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>Subdomain cannot be modified after initialization.</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Billing Subscription Plan</label>
                  <select className="form-control" value={editShardPlan} onChange={(e) => setEditShardPlan(e.target.value)}>
                    <option value="growth">Growth Enterprise ($199/mo)</option>
                    <option value="scale">Scale Suite ($499/mo)</option>
                    <option value="nexus">Global Nexus Enterprise ($1299/mo)</option>
                  </select>
                </div>
                <div className="form-group" style={{ border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px", background: "rgba(255,255,255,0.01)", marginTop: "16px", marginBottom: "20px" }}>
                  <label className="form-label" style={{ marginBottom: "12px", display: "block" }}>📦 Feature Model Subscriptions</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", cursor: "pointer" }}>
                      <input type="checkbox" checked={editShardTalent} onChange={(e) => setEditShardTalent(e.target.checked)} />
                      <span><strong>Recruitment Talent Suite</strong></span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", cursor: "pointer" }}>
                      <input type="checkbox" checked={editShardHr} onChange={(e) => setEditShardHr(e.target.checked)} />
                      <span><strong>HR Fintech Core</strong></span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", cursor: "pointer" }}>
                      <input type="checkbox" checked={editShardResource} onChange={(e) => setEditShardResource(e.target.checked)} />
                      <span><strong>Resource Management Group</strong></span>
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>
                  Update Shard Settings
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Ticket Resolution slide-out pane */}
        {selectedTicketForResolution && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" }}>
            <div className="glass-card animated" style={{ width: "100%", maxWidth: "500px", padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>Resolve Support Claim</h3>
                <span style={{ cursor: "pointer", fontSize: "24px", fontWeight: 700, color: "var(--text-muted)", lineHeight: 1 }} onClick={() => setSelectedTicketForResolution(null)}>×</span>
              </div>
              <form onSubmit={handleResolveTicket}>
                <div style={{ marginBottom: "16px", fontSize: "13.5px" }}>
                  <div>Tenant: <strong>{selectedTicketForResolution.organization_name}</strong></div>
                  <div>User Email: <span style={{ color: "var(--text-muted)" }}>{selectedTicketForResolution.user_email}</span></div>
                  <div>Category: <span className="badge" style={{ background: "rgba(0,194,212,0.1)", color: "var(--primary)", fontSize: "11px" }}>{selectedTicketForResolution.category.toUpperCase()}</span></div>
                  <div style={{ marginTop: "12px", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "6px", background: "rgba(255,255,255,0.01)" }}>
                    <strong>Issue Title:</strong> {selectedTicketForResolution.title}
                    <div style={{ marginTop: "6px", color: "var(--text-muted)", fontSize: "12.5px" }}>{selectedTicketForResolution.description}</div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Support Ticket Status</label>
                  <select className="form-control" value={selectedTicketStatus} onChange={(e) => setSelectedTicketStatus(e.target.value)}>
                    <option value="open">Open (Awaiting review)</option>
                    <option value="in_progress">In Progress (Investigating infra)</option>
                    <option value="resolved">Resolved (Fix pushed)</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">Official Resolution Remarks</label>
                  <textarea className="form-control" required rows={4} placeholder="e.g. Cleared SQLite lock and allocated extra disk storage limits. Confirmed subdomain health." value={ticketResolutionNotes} onChange={(e) => setTicketResolutionNotes(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px 16px" }}>
                  Commit Resolution Changes
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSupportDesk = () => {
    return (
      <div className="animated">
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "32px" }}>🎫</span>
            <div>
              <h2 style={{ margin: 0 }}>Customer Support Desk &amp; Issue Tracker</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Raise and track support tickets directly with the CogniHR central SaaS administration team. Report technical bugs, billing queries, infrastructure incidents, or request a subscription plan upgrade — with full priority classification and resolution audit trail.</p>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 2fr", gap: "24px" }}>
          
          {/* Raise ticket form */}
          <div className="glass-card" style={{ height: "fit-content" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "24px" }}>🛠️</span>
              <h3 style={{ margin: 0 }}>Raise a New Support Ticket</h3>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "12.5px", marginBottom: "20px" }}>Submit a detailed support request to the CogniHR SaaS Administration team. Include replication steps, screenshots, or your subscription upgrade requirements.</p>
            
            <form onSubmit={handleCreateTicket}>
              <div className="form-group">
                <label className="form-label">Issue Title</label>
                <input type="text" className="form-control" required placeholder="e.g. EPF Allowances band miscalculation" value={newTicketTitle} onChange={(e) => setNewTicketTitle(e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="form-group">
                <div>
                  <label className="form-label">Category</label>
                  <select className="form-control" value={newTicketCategory} onChange={(e) => setNewTicketCategory(e.target.value)}>
                    <option value="billing">Billing Inquiry</option>
                    <option value="technical">Technical Bug</option>
                    <option value="infrastructure">Infrastructure Issue</option>
                    <option value="access_control">Access Control / RBAC</option>
                    <option value="other">Other Claim</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={newTicketPriority} onChange={(e) => setNewTicketPriority(e.target.value)}>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Blockers</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label">Full Problem Statement Description</label>
                <textarea className="form-control" required rows={5} placeholder="Provide precise replication details, browser standard outputs, or requested subscription upgrade features." value={newTicketDescription} onChange={(e) => setNewTicketDescription(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px 16px" }}>
                Submit Support Claim
              </button>
            </form>
          </div>

          {/* Active tickets directory */}
          <div className="glass-card">
            <h3>My Support Tickets History</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "12.5px", marginBottom: "16px" }}>Interactive resolutions tracking raised by your isolated tenant space</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "580px", overflowY: "auto" }}>
              {myTickets.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontStyle: "italic" }}>
                  No active support claims on file.
                </div>
              ) : (
                myTickets.map((t) => (
                  <div key={t.id} style={{ display: "flex", flexDirection: "column", gap: "10px", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px", background: "rgba(255,255,255,0.01)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                      <strong style={{ fontSize: "15px" }}>{t.title}</strong>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <span className="badge" style={{
                          fontSize: "9.5px",
                          background: t.priority === "critical" ? "rgba(239,68,68,0.1)" : t.priority === "high" ? "rgba(249,115,22,0.1)" : t.priority === "medium" ? "rgba(245,158,11,0.1)" : "rgba(100,116,139,0.1)",
                          color: t.priority === "critical" ? "#ef4444" : t.priority === "high" ? "#f97316" : t.priority === "medium" ? "#f59e0b" : "#64748b"
                        }}>{t.priority.toUpperCase()}</span>
                        <span className="badge" style={{
                          fontSize: "9.5px",
                          background: t.status === "resolved" ? "rgba(16,185,129,0.1)" : t.status === "in_progress" ? "rgba(99,102,241,0.1)" : "rgba(0,194,212,0.1)",
                          color: t.status === "resolved" ? "#10b981" : t.status === "in_progress" ? "#6366f1" : "var(--primary)"
                        }}>{t.status.replace("_", " ").toUpperCase()}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{t.description}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "8px", marginTop: "4px" }}>
                      Category: <strong>{t.category.toUpperCase()}</strong> • Raised at {new Date(t.created_at).toLocaleString()}
                    </div>
                    {t.resolution_notes ? (
                      <div style={{ fontSize: "12px", color: "var(--success)", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)", padding: "10px", borderRadius: "6px", marginTop: "6px" }}>
                        <strong>✓ Central SaaS Admin Resolution Remarks:</strong>
                        <div style={{ marginTop: "4px" }}>{t.resolution_notes}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", background: "rgba(255,255,255,0.02)", padding: "8px", borderRadius: "4px", marginTop: "4px" }}>
                        🕒 Awaiting resolution. The operations team is investigating your shard environment...
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUserManagement = () => {
    const rolesList = ["employee", "manager", "recruiter", "hr_admin", "Resource Mgmt Group"];
    const featuresList = [
      { id: "attendance", label: "🕒 Attendance" },
      { id: "leave", label: "🌴 Leave Planner" },
      { id: "payroll", label: "💸 Payroll Fintech" },
      { id: "fbp-tax", label: "🏢 FBP & Tax Portal" },
      { id: "insurance", label: "🛡️ Benefits" },
      { id: "car-lease", label: "🚗 Car Lease Hub" },
      { id: "appraisals", label: "📈 Appraisals" },
      { id: "ai-promotions", label: "🤖 AI Promotions" },
      { id: "offboarding", label: "🚪 Exit Center" },
      { id: "talent-mgmt", label: "🎯 Talent Acquisition" },
      { id: "employees", label: "👥 Employee Directory" },
      { id: "user-mgmt", label: "🔐 User Management" },
      { id: "org-structure", label: "🏛️ Org Structure" },
      { id: "project-allocations", label: "🗂️ Allocations" },
      { id: "rmg-checklist", label: "📋 Checklist" },
      { id: "onboarding-checklist", label: "🚀 Onboarding" },
      { id: "asset-registry", label: "📦 Asset Registry" },
      { id: "achievements-awards", label: "🏆 Achievements & Awards" },
      { id: "ai-copilot", label: "🤖 AI Copilot" }
    ];

    const isPermissionChecked = (role: string, feature: string) => {
      const record = rolePermissions.find(p => p.role === role && p.feature === feature);
      if (record) return record.is_enabled;
      
      const default_permissions: any = {
        "employee": ["attendance", "leave", "fbp-tax", "insurance", "car-lease", "appraisals", "offboarding", "ai-copilot", "achievements-awards"],
        "manager": ["attendance", "leave", "fbp-tax", "insurance", "car-lease", "appraisals", "offboarding", "ai-copilot", "achievements-awards"],
        "recruiter": ["talent-mgmt", "ai-copilot"],
        "payroll_admin": ["payroll", "fbp-tax", "ai-copilot"],
        "hr_admin": ["attendance", "leave", "payroll", "fbp-tax", "insurance", "car-lease", "appraisals", "ai-promotions", "offboarding", "talent-mgmt", "ai-copilot", "employees", "user-mgmt", "org-structure", "shift-management", "policy-center", "project-allocations", "rmg-checklist", "onboarding-checklist", "asset-registry", "achievements-awards"],
        "Resource Mgmt Group": ["appraisals", "project-allocations", "ai-copilot", "achievements-awards"],
        "hr_operations": ["project-allocations", "appraisals", "ai-copilot", "achievements-awards"]
      };
      return (default_permissions[role] || []).includes(feature);
    };

    const handleTogglePermission = (role: string, feature: string, currentValue: boolean) => {
      const payloadItem = {
        role: role,
        feature: feature,
        is_enabled: !currentValue
      };
      handleSavePermissions([payloadItem]);
    };

    return (
      <div className="animated">
        {/* Sub-navigation tabs */}
        <div className="tabs-header" style={{ marginBottom: "24px" }}>
          <button className={`tab-btn ${userMgmtSubTab === "users" ? "active" : ""}`} onClick={() => setUserMgmtSubTab("users")}>
            👥 Portal User Directory
          </button>
          <button className={`tab-btn ${userMgmtSubTab === "rbac" ? "active" : ""}`} onClick={() => setUserMgmtSubTab("rbac")}>
            🛡️ Role Permissions (RBAC) Control Matrix
          </button>
        </div>

        {userMgmtSubTab === "users" ? (
          <div className="glass-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: 0 }}>Credential Portal User Directory</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "2px 0 0" }}>Manage employees' credentials, dynamic platform login status, and RBAC roles strictly inside your organization shard.</p>
              </div>
              <button className="btn btn-primary" onClick={() => {
                setUserMgmtEditMode(false);
                setMgmtEmail("");
                setMgmtRole("employee");
                setMgmtPassword("");
                setMgmtIsActive(true);
                setSelectedMgmtUserId(null);
                setUserMgmtModalOpen(true);
              }}>
                ➕ Catalog New Portal User
              </button>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User Profile Email</th>
                    <th>Enterprise RBAC Role</th>
                    <th>Authentication Status</th>
                    <th>System Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)" }}>No portal user credentials cataloged yet inside this Shard.</td>
                    </tr>
                  ) : (
                    tenantUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: "14.5px" }}>{u.email}</div>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>UID: {u.id.substring(0, 18)}...</span>
                        </td>
                        <td>
                          <span className="badge" style={{
                            fontWeight: 700,
                            fontSize: "11px",
                            background: u.role === "hr_admin" ? "rgba(99,102,241,0.1)" : u.role === "recruiter" ? "rgba(0,194,212,0.1)" : "rgba(139,92,246,0.1)",
                            color: u.role === "hr_admin" ? "#6366f1" : u.role === "recruiter" ? "var(--primary)" : "var(--accent)"
                          }}>
                            {u.role.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className="badge" style={{
                            fontWeight: 700,
                            fontSize: "11px",
                            background: u.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                            color: u.is_active ? "#10b981" : "#ef4444"
                          }}>
                            {u.is_active ? "● ACTIVE" : "○ DEACTIVATED"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => {
                              setSelectedMgmtUserId(u.id);
                              setMgmtEmail(u.email);
                              setMgmtRole(u.role);
                              setMgmtPassword(""); // Reset password field in UI
                              setMgmtIsActive(u.is_active);
                              setUserMgmtEditMode(true);
                              setUserMgmtModalOpen(true);
                            }}>
                              ✏️ Edit Role
                            </button>
                            {currentUser?.id !== u.id && (
                              <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px", color: "var(--danger)" }} onClick={() => handleDeleteUser(u.id)}>
                                🗑️ Revoke
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-card">
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>Role-Based Access Control (RBAC) Matrix</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>
                Instantly enable or disable core features for specific enterprise roles globally inside your tenant shard.
              </p>
            </div>
            
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Module / Feature</th>
                    {rolesList.map(r => (
                      <th key={r} style={{ textAlign: "center", textTransform: "uppercase", fontSize: "11px", color: "var(--primary)" }}>
                        {r.replace("_", " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {featuresList.map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600, fontSize: "14px", padding: "16px 20px" }}>{f.label}</td>
                      {rolesList.map(r => {
                        const checked = isPermissionChecked(r, f.id);
                        return (
                          <td key={`${r}-${f.id}`} style={{ textAlign: "center", padding: "16px 20px" }}>
                            <input 
                              type="checkbox" 
                              checked={checked} 
                              style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--primary)" }}
                              onChange={() => handleTogglePermission(r, f.id, checked)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create/Edit Portal User Modal */}
        {userMgmtModalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" }}>
            <div className="glass-card animated" style={{ width: "100%", maxWidth: "450px", padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>{userMgmtEditMode ? "Modify Portal User Access" : "Create Portal User Access"}</h3>
                <span style={{ cursor: "pointer", fontSize: "24px", fontWeight: 700, color: "var(--text-muted)", lineHeight: 1 }} onClick={() => setUserMgmtModalOpen(false)}>×</span>
              </div>
              <form onSubmit={handleCreateOrUpdateUser}>
                <div className="form-group">
                  <label className="form-label">User Login Email</label>
                  <input type="email" className="form-control" required placeholder="name@company.com" value={mgmtEmail} onChange={(e) => setMgmtEmail(e.target.value)} disabled={userMgmtEditMode} />
                </div>
                <div className="form-group">
                  <label className="form-label">Access Password {userMgmtEditMode && "(Leave blank to keep unchanged)"}</label>
                  <input type="password" className="form-control" required={!userMgmtEditMode} placeholder="••••••••" value={mgmtPassword} onChange={(e) => setMgmtPassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Enterprise Access Role</label>
                  <select className="form-control" value={mgmtRole} onChange={(e) => setMgmtRole(e.target.value)}>
                    <option value="employee">👤 Employee (Self-Service)</option>
                    <option value="manager">👥 Manager (Team Reviewer)</option>
                    <option value="recruiter">🎯 HR (Talent Acquisition)</option>
                    <option value="hr_admin">⚙️ HR (System Administrator)</option>
                    <option value="Resource Mgmt Group">📊 HR (Resource Management)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: "24px" }}>
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <input type="checkbox" checked={mgmtIsActive} onChange={(e) => setMgmtIsActive(e.target.checked)} />
                    <span>Enable active authentication log-in permissions</span>
                  </label>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px 16px" }}>
                  {userMgmtEditMode ? "Save Custom Permissions" : "Generate Account Credentials"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTalentSuite = () => {
    return (
      <div className="animated">
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "28px" }}>🎯</span>
              <div>
                <h2 style={{ margin: 0 }}>Talent Acquisition Management Suite</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>Draft Job Descriptions, Publish Open Positions, Issue Call Letters, Process Interviews, Extend Offer Letters & Complete Promotions Onboarding</p>
              </div>
            </div>
            
            {talentActiveTab === "requisitions" && (
              <button className="btn btn-primary" onClick={() => {
                setShowRequisitionModal(true);
              }}>
                ➕ New Resource Requisition
              </button>
            )}
            {talentActiveTab === "profiles" && (
              <button className="btn btn-primary" onClick={() => setShowProfileUploadModal(true)}>
                📁 Ingest Talent Profile
              </button>
            )}
            {talentActiveTab === "positions" && (
              <button className="btn btn-primary" onClick={() => setShowPositionModal(true)}>
                ➕ Add Position Req
              </button>
            )}
            {talentActiveTab === "postings" && (
              <button className="btn btn-primary" onClick={() => {
                if (talentPositions.length === 0) {
                  showToast.error("Please catalog a Position Requirement requisition first!");
                  return;
                }
                setSelectedPositionId(talentPositions[0].id);
                setShowPostingModal(true);
              }}>
                ➕ Publish Career Opening
              </button>
            )}
            {talentActiveTab === "candidates" && (
              <button className="btn btn-primary" onClick={() => {
                setSelectedPostingId(talentPostings[0]?.id || "");
                setShowCandidateModal(true);
              }}>
                ➕ Catalog Applicant Screening
              </button>
            )}
          </div>

          <div className="tabs-header" style={{ marginBottom: "24px" }}>
            <button className={`tab-btn${talentActiveTab === "requisitions" ? " active" : ""}`} onClick={() => setTalentActiveTab("requisitions")}>📋 1. Workforce Planning ({resourceRequisitions.length})</button>
            <button className={`tab-btn${talentActiveTab === "positions" ? " active" : ""}`} onClick={() => setTalentActiveTab("positions")}>👔 2. Job Requisition ({talentPositions.length})</button>
            <button className={`tab-btn${talentActiveTab === "postings" ? " active" : ""}`} onClick={() => setTalentActiveTab("postings")}>📢 3. Open Positions ({talentPostings.length})</button>
            <button className={`tab-btn${talentActiveTab === "candidates" ? " active" : ""}`} onClick={() => setTalentActiveTab("candidates")}>👥 4. Candidate Pipeline ({talentCandidates.length})</button>
            <button className={`tab-btn${talentActiveTab === "interviews" ? " active" : ""}`} onClick={() => setTalentActiveTab("interviews")}>🕒 5. Interview ({talentInterviews.length})</button>
            <button className={`tab-btn${talentActiveTab === "offers" ? " active" : ""}`} onClick={() => setActiveView("offer-mgmt")}>📜 6. Offer ({talentOffers.length})</button>
            <button className={`tab-btn${talentActiveTab === "onboarding" ? " active" : ""}`} onClick={() => setActiveView("onboarding-checklist")}>🚀 7. Onboarding</button>
            <button className={`tab-btn${talentActiveTab === "profiles" ? " active" : ""}`} onClick={() => setTalentActiveTab("profiles")}>🗄️ 8. Talent Pool ({talentProfiles.length})</button>
            <button className={`tab-btn${talentActiveTab === "matcher" ? " active" : ""}`} onClick={() => setTalentActiveTab("matcher")}>🤖 9. AI Match</button>
          </div>

          {/* Subtab 1: Workforce Planning */}
          {talentActiveTab === "requisitions" && (
            <div>
              <h3>Workforce Planning</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12.5px", marginBottom: "16px" }}>
                Hiring requests requiring approval before positions are created. Flow: Draft → Manager Approval → HR Approval → Convert to Position
              </p>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Requisition ID</th>
                      <th>Title & Department</th>
                      <th>Headcount & Type</th>
                      <th>Budget & Skills</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resourceRequisitions.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>No resource requisitions yet. Click "New Resource Requisition" to start the hiring process.</td>
                      </tr>
                    ) : (
                      resourceRequisitions.map((req) => (
                        <tr key={req.id}>
                          <td style={{ fontSize: "12px", fontWeight: 600 }}>{req.requisition_number}</td>
                          <td>
                            <strong>{req.title}</strong>
                            {req.department_name && (
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{req.department_name}</div>
                            )}
                          </td>
                          <td>
                            <div>{req.num_positions} position(s)</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "capitalize" }}>{req.employment_type}</div>
                          </td>
                          <td style={{ fontSize: "12px" }}>
                            {req.budget_range && <div>💰 {req.budget_range}</div>}
                            {req.skills_required && (
                              <div style={{ fontSize: "11px", color: "var(--text-muted)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                Skills: {req.skills_required}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="badge" style={{
                              fontWeight: 700, fontSize: "10.5px",
                              background: req.status === "approved" ? "rgba(16,185,129,0.1)" :
                                req.status === "draft" ? "rgba(255,255,255,0.05)" :
                                req.status === "pending_manager" || req.status === "pending_hr" ? "rgba(245,158,11,0.1)" :
                                req.status === "converted" ? "rgba(99,102,241,0.1)" : "rgba(239,68,68,0.1)",
                              color: req.status === "approved" ? "#10b981" :
                                req.status === "draft" ? "var(--text-muted)" :
                                req.status === "pending_manager" || req.status === "pending_hr" ? "#f59e0b" :
                                req.status === "converted" ? "#6366f1" : "#ef4444"
                            }}>
                              {req.status.replace("_", " ").toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                              {req.status === "draft" && (
                                <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "10.5px" }}
                                  onClick={() => handleSubmitRequisition(req.id)}>
                                  📤 Submit
                                </button>
                              )}
                              {req.status === "pending_manager" && (
                                <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "10.5px", background: "rgba(16,185,129,0.05)", color: "#10b981" }}
                                  onClick={() => handleApproveManagerReq(req.id)}>
                                  ✓ Approve (Mgr)
                                </button>
                              )}
                              {req.status === "pending_hr" && (
                                <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "10.5px", background: "rgba(16,185,129,0.05)", color: "#10b981" }}
                                  onClick={() => handleApproveHrReq(req.id)}>
                                  ✓ Approve (HR)
                                </button>
                              )}
                              {(req.status === "pending_manager" || req.status === "pending_hr") && (
                                <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "10.5px", color: "var(--danger)" }}
                                  onClick={() => handleRejectRequisition(req.id)}>
                                  ✕ Reject
                                </button>
                              )}
                              {req.status === "approved" && (
                                <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "10.5px" }}
                                  onClick={() => handleConvertRequisition(req.id)}>
                                  ➡️ Convert to Position
                                </button>
                              )}
                              {req.status === "converted" && (
                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>✓ Done</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 1: Talent Profiles */}
          {talentActiveTab === "profiles" && (
            <div>
              <h3>Talent Pool Database</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12.5px", marginBottom: "16px" }}>Global database of clean resumes and parsed profiles</p>
              
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Candidate Name</th>
                      <th>Skills Extract</th>
                      <th>Resume Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {talentProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: "center", color: "var(--text-muted)" }}>No profiles cataloged yet.</td>
                      </tr>
                    ) : (
                      talentProfiles.map((prof) => (
                        <tr key={prof.id}>
                          <td>
                            <strong>{prof.first_name} {prof.last_name}</strong>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{prof.email}</div>
                            {prof.reference_type && prof.reference_type !== "none" && (
                              <div style={{ fontSize: "11px", color: "#0d9488", marginTop: "2px", fontWeight: "500" }}>
                                Referral: {prof.reference_type.replace("_", " ")} ({prof.reference_detail || ""})
                              </div>
                            )}
                          </td>
                          <td style={{ fontSize: "12px" }}>{prof.skills}</td>
                          <td>
                            <a href={prof.resume_url || "#"} target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>View Resume</a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 1: Positions */}
          {talentActiveTab === "positions" && (
            <div>
              <h3>Requisition Position Catalog</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12.5px", marginBottom: "16px" }}>Open budget position requests currently logged for hiring</p>
              
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Requisition Code & Title</th>
                      <th>Core Capability Skills Needed</th>
                      <th>Position JD details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {talentPositions.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: "center", color: "var(--text-muted)" }}>No positions logged in catalog yet.</td>
                      </tr>
                    ) : (
                      talentPositions.map((pos) => (
                        <tr key={pos.id}>
                          <td style={{ width: "250px" }}>
                            <strong style={{ fontSize: "15px" }}>{pos.title}</strong>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>REQ ID: {pos.id.substring(0, 18)}...</div>
                          </td>
                          <td style={{ width: "280px" }}>
                            {(pos.skill_requirements || "").split(",").map((s: string, idx: number) => (
                              <span key={idx} className="badge" style={{ background: "rgba(0,194,212,0.1)", color: "var(--primary)", margin: "2px", fontSize: "11px" }}>{s.trim()}</span>
                            ))}
                          </td>
                          <td style={{ whiteSpace: "pre-line", fontSize: "13px", color: "var(--text-muted)" }}>{pos.job_description}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 2: Job Postings */}
          {talentActiveTab === "postings" && (
            <div>
              <h3>Open Positions Catalogue</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12.5px", marginBottom: "16px" }}>Public facing job postings mapped to position requisitions</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
                {talentPostings.length === 0 ? (
                  <div className="glass-card" style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No job postings published yet.
                  </div>
                ) : (
                  talentPostings.map((post) => (
                    <div key={post.id} className="glass-card" style={{ border: "1px solid var(--border-color)", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", background: "rgba(255,255,255,0.01)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ margin: 0, fontSize: "16px" }}>{post.title}</h4>
                        <span className="badge" style={{ background: post.is_active ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)", color: post.is_active ? "#10b981" : "var(--text-muted)", fontSize: "10px", fontWeight: 700 }}>{post.is_active ? "● RUNNING" : "○ DRAFT"}</span>
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--text-muted)", flexGrow: 1 }}>{post.description}</div>
                      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px", fontSize: "12.5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Budget salary: <strong>{post.salary_range}</strong></span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Code: {post.id.substring(0, 8)}</span>
                      </div>
                      <div style={{ marginTop: "10px" }}>
                        <button className="btn btn-secondary" style={{ width: "100%", fontSize: "12px", padding: "8px" }} onClick={() => { setMatchJobId(post.id); fetchJobMatches(post.id); setShowMatchModal(true); }}>🔍 Source Matches</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Subtab 3: Candidate Screening Pipeline */}
          {talentActiveTab === "candidates" && (
            <div>
              <h3>Candidate Screening Pipeline</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12.5px", marginBottom: "16px" }}>Active candidate profiles undergoing screening, selection, and review</p>
              
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Candidate Full Name & Contact</th>
                      <th>Applied Opening</th>
                      <th>Hiring Phase Status</th>
                      <th>Recruitment Process Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {talentCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)" }}>No candidate profiles logged in screening directory yet.</td>
                      </tr>
                    ) : (
                      talentCandidates.map((c) => {
                        const opening = talentPostings.find(p => p.position_id === c.position_id);
                        return (
                          <tr key={c.id}>
                            <td>
                              <strong style={{ fontSize: "15px" }}>{c.first_name} {c.last_name}</strong>
                              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                                📧 {c.email} | 📞 {c.phone}
                              </div>
                              {c.resume_url && (
                                <div style={{ fontSize: "12px", marginTop: "4px" }}>
                                  <a href={c.resume_url} target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>📄 View Resume</a>
                                </div>
                              )}
                              {c.reference_type && c.reference_type !== "none" && (
                                <div style={{ fontSize: "11px", color: "#0d9488", marginTop: "4px", fontWeight: 500 }}>
                                  Source: {c.reference_type.replace("_", " ")} {c.reference_detail ? `(${c.reference_detail})` : ""}
                                </div>
                              )}
                            </td>
                            <td>{opening ? opening.title : "Linked Active Opening"}</td>
                            <td>
                              <span className="badge" style={{
                                fontWeight: 700,
                                fontSize: "11px",
                                background: c.status === "selected" ? "rgba(16,185,129,0.1)" : c.status === "rejected" ? "rgba(239,68,68,0.1)" : c.status === "onboarded" ? "rgba(99,102,241,0.1)" : "rgba(0,194,212,0.1)",
                                color: c.status === "selected" ? "#10b981" : c.status === "rejected" ? "#ef4444" : c.status === "onboarded" ? "#6366f1" : "var(--primary)"
                              }}>
                                {c.status.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {["applied", "interview_scheduled"].includes(c.status) && (
                                  <button className="btn btn-secondary" style={{ padding: "5px 10px", fontSize: "11.5px" }} onClick={() => handleSendCallLetter(c.id)}>
                                    ✉️ Issue Call Letter
                                  </button>
                                )}
                                {["applied", "interview_scheduled"].includes(c.status) && (
                                  <button className="btn btn-secondary" style={{ padding: "5px 10px", fontSize: "11.5px" }} onClick={() => handleScheduleInterview(c.id)}>
                                    🕒 Arrange Panel Interview
                                  </button>
                                )}
                                {["applied", "interview_scheduled", "interviewed"].includes(c.status) && (
                                  <>
                                    <button className="btn btn-secondary" style={{ padding: "5px 10px", fontSize: "11.5px", background: "rgba(16,185,129,0.05)", color: "#10b981", border: "1px solid rgba(16,185,129,0.1)" }} onClick={() => handleSelectCandidate(c.id)}>
                                      ✓ Approve Selection
                                    </button>
                                    <button className="btn btn-secondary" style={{ padding: "5px 10px", fontSize: "11.5px", color: "var(--danger)" }} onClick={() => handleRejectCandidate(c.id)}>
                                      🗑️ Archive
                                    </button>
                                  </>
                                )}
                                {c.status === "selected" && (
                                  <button className="btn btn-primary" style={{ padding: "5px 10px", fontSize: "11.5px" }} onClick={() => {
                                    setSelectedCandIdForOffer(c.id);
                                    setOfferSalary("");
                                    setOfferGrade("L1");
                                    setOfferDeptId("");
                                    setOfferDesignationId("");
                                    setShowOfferModal(true);
                                  }}>
                                    📜 Draft Offer Letter
                                  </button>
                                )}
                                {c.status === "offered" && (
                                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>Offer extended... Check Offer tab</span>
                                )}
                                {c.status === "onboarded" && (
                                  <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>✓ Fully Integrated</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 4: Active Interview Panels */}
          {talentActiveTab === "interviews" && (
            <div>
              <h3>Panel Interview Feedback Boards</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12.5px", marginBottom: "16px" }}>Scheduled and evaluated interview slots locked for candidates</p>
              
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Candidate Info</th>
                      <th>Panel Focus</th>
                      <th>Locked Time</th>
                      <th>Score</th>
                      <th>Remarks & Action logs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {talentInterviews.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>No interview panels locked on active roster.</td>
                      </tr>
                    ) : (
                      talentInterviews.map((int) => {
                        const candidate = talentCandidates.find(c => c.id === int.candidate_id);
                        return (
                          <tr key={int.id}>
                            <td>
                              {candidate ? (
                                <>
                                  <strong style={{ fontSize: "14.5px" }}>{candidate.first_name} {candidate.last_name}</strong>
                                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{candidate.email}</div>
                                </>
                              ) : "Unknown Candidate"}
                            </td>
                            <td>
                              <span className="badge" style={{ background: "rgba(139,92,246,0.1)", color: "var(--accent)" }}>{int.interview_round?.toUpperCase() || ""}</span>
                            </td>
                            <td style={{ fontSize: "12px" }}>{new Date(int.scheduled_at).toLocaleString()}</td>
                            <td style={{ fontWeight: 700 }}>
                              {int.score != null ? `${int.score} / 10` : "—"}
                            </td>
                            <td>
                              {int.status === "scheduled" ? (
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11px", background: "rgba(16,185,129,0.05)", color: "#10b981" }} onClick={() => handleInterviewAction(int.id, "passed")}>
                                    ✓ Mark Pass
                                  </button>
                                  <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11px", color: "var(--danger)" }} onClick={() => handleInterviewAction(int.id, "failed")}>
                                    × Mark Fail
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <span className="badge" style={{ background: int.status === "passed" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: int.status === "passed" ? "#10b981" : "#ef4444", fontSize: "10.5px" }}>
                                    {int.status.toUpperCase()}
                                  </span>
                                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", maxWidth: "300px" }}>{int.feedback}</div>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 5: Offers & Selection */}
          {talentActiveTab === "offers" && (
            <div>
              <h3>Offer Letters</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12.5px", marginBottom: "16px" }}>Drafted offer packages extended to selected candidates, supporting promotions onboarding</p>
              
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Offered Salary package</th>
                      <th>Start Date & Grade</th>
                      <th>Status State</th>
                      <th>Integration Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {talentOffers.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>No offer letters extended yet.</td>
                      </tr>
                    ) : (
                      talentOffers.map((o) => {
                        const candidate = talentCandidates.find(c => c.id === o.candidate_id);
                        return (
                          <tr key={o.id}>
                            <td>
                              {candidate ? (
                                <>
                                  <strong style={{ fontSize: "14.5px" }}>{candidate.first_name} {candidate.last_name}</strong>
                                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{candidate.email}</div>
                                </>
                              ) : "Unknown Candidate"}
                            </td>
                            <td style={{ fontWeight: 700 }}>₹{Number(o.offered_salary).toLocaleString('en-IN')}/yr</td>
                            <td style={{ fontSize: "12.5px" }}>
                              <div>Start: {o.joining_date}</div>
                              <div style={{ color: "var(--text-muted)" }}>Grade Level: {o.grade}</div>
                            </td>
                            <td>
                              <span className="badge" style={{
                                fontWeight: 700,
                                fontSize: "11px",
                                background: o.offer_status === "accepted" ? "rgba(16,185,129,0.1)" : o.offer_status === "rejected" ? "rgba(239,68,68,0.1)" : o.offer_status === "onboarded" ? "rgba(99,102,241,0.1)" : "rgba(0,194,212,0.1)",
                                color: o.offer_status === "accepted" ? "#10b981" : o.offer_status === "rejected" ? "#ef4444" : o.offer_status === "onboarded" ? "#6366f1" : "var(--primary)"
                              }}>
                                {o.offer_status.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "6px" }}>
                                {o.offer_status === "sent" && (
                                  <>
                                    <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11.5px", background: "rgba(16,185,129,0.05)", color: "#10b981" }} onClick={() => handleOfferAction(o.id, "accepted")}>
                                      ✓ Accepted
                                    </button>
                                    <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11.5px", color: "var(--danger)" }} onClick={() => handleOfferAction(o.id, "rejected")}>
                                      × Refused
                                    </button>
                                  </>
                                )}
                                {o.offer_status === "accepted" && (
                                  <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px", textShadow: "none" }} onClick={() => handleOnboardCandidate(o.candidate_id)}>
                                    ⚡ Complete Onboarding Integration
                                  </button>
                                )}
                                {o.offer_status === "onboarded" && (
                                  <span className="badge" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>✓ Seeded as active Employee</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab: AI JD Matcher */}
          {talentActiveTab === "matcher" && (
            <div>
              <h3>AI Profile-to-JD Matching Engine</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12.5px", marginBottom: "16px" }}>Select a Career Opening to dynamically match and source profiles from the Talent Pool using NLP keyword intersection scoring.</p>
              
              <div style={{ marginBottom: "20px", display: "flex", gap: "12px", alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Select Target Job Posting</label>
                  <select className="form-control" value={matchJobId} onChange={(e) => setMatchJobId(e.target.value)}>
                    <option value="">-- Choose a Job Posting --</option>
                    {talentPostings.map((p) => {
                      const posName = talentPositions.find(pos => pos.id === p.position_id)?.title || 'Unknown Role';
                      return <option key={p.id} value={p.id}>{posName} (Req ID: {p.position_id.substring(0,8)})</option>
                    })}
                  </select>
                </div>
                <button className="btn btn-primary" disabled={!matchJobId} onClick={() => fetchJobMatches(matchJobId)} style={{ padding: "10px 20px" }}>
                  🧠 Run Match Algorithm
                </button>
              </div>

              {matchJobId && matchResults.length > 0 && (
                <div className="table-responsive mt-4">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Candidate Profile</th>
                        <th>Match Score</th>
                        <th>Matched Capability Signals</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchResults.filter(m => m.match_percentage >= 90).map((match, index) => (
                        <tr key={match.profile.id}>
                          <td><span className="badge" style={{ background: "rgba(0,194,212,0.1)", color: "var(--primary)" }}>#{index + 1}</span></td>
                          <td>
                            <strong style={{ cursor: "pointer", color: "var(--primary)", textDecoration: "underline" }} onClick={() => setViewResumeProfile(match.profile)}>
                              {match.profile.first_name} {match.profile.last_name}
                            </strong>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                              {match.profile.email} | {match.profile.phone}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "100px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${Math.round(match.match_percentage)}%`, background: "var(--primary)" }}></div>
                              </div>
                              <strong style={{ fontSize: "14px", color: "var(--primary)", whiteSpace: "nowrap" }}>
                                {Math.round(match.match_percentage)}% / 100%
                              </strong>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                              {match.matched_skills.map((skill: string, idx: number) => (
                                <span key={idx} className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", fontSize: "10px" }}>
                                  ✓ {skill}
                                </span>
                              ))}
                              {match.matched_skills.length === 0 && <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>No strong keyword signals</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {matchResults.filter(m => m.match_percentage < 90).length > 0 && (
                    <div style={{ marginTop: "16px", padding: "16px", background: "rgba(139,92,246,0.1)", borderLeft: "4px solid var(--accent)", borderRadius: "4px", fontSize: "13px", color: "var(--text-secondary)" }}>
                      <strong>🤖 AI Curation Summary:</strong> Analyzed all {matchResults.length} profiles in your Talent Pool. {matchResults.filter(m => m.match_percentage < 90).length} profiles scored below the 90% threshold and have been automatically filtered out.
                    </div>
                  )}
                </div>
              )}
              {matchJobId && matchResults.length === 0 && (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                  Run algorithm to fetch matched profiles from your global catalog...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resource Requisition Modal */}
        {showRequisitionModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" }}>
            <div className="glass-card animated" style={{ width: "100%", maxWidth: "560px", padding: "28px", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>New Resource Requisition</h3>
                <span style={{ cursor: "pointer", fontSize: "24px", fontWeight: 700, color: "var(--text-muted)", lineHeight: 1 }} onClick={() => setShowRequisitionModal(false)}>×</span>
              </div>
              <form onSubmit={handleCreateRequisition}>
                <div className="form-group">
                  <label className="form-label">Position Title *</label>
                  <input type="text" className="form-control" required placeholder="e.g. Senior Software Engineer" value={reqTitle} onChange={(e) => setReqTitle(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input type="text" className="form-control" placeholder="e.g. Engineering, Product, Design" value={reqDeptId} onChange={(e) => setReqDeptId(e.target.value)} />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>Department name (will be matched to existing department)</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Headcount *</label>
                    <input type="number" className="form-control" required min={1} value={reqNumPositions} onChange={(e) => setReqNumPositions(parseInt(e.target.value) || 1)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Employment Type</label>
                    <select className="form-control" value={reqEmploymentType} onChange={(e) => setReqEmploymentType(e.target.value)}>
                      <option value="permanent">Permanent</option>
                      <option value="probation">Probation</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Skills Required</label>
                  <input type="text" className="form-control" placeholder="e.g. React, Node.js, PostgreSQL" value={reqSkills} onChange={(e) => setReqSkills(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Budget Salary Range</label>
                  <input type="text" className="form-control" placeholder="e.g. ₹15L - ₹25L per annum" value={reqBudgetRange} onChange={(e) => setReqBudgetRange(e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Expected Joining Date</label>
                    <input type="date" className="form-control" value={reqJoiningDate} onChange={(e) => setReqJoiningDate(e.target.value)} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">Justification / Business Need</label>
                  <textarea className="form-control" required rows={4} placeholder="Explain why this role is needed, key responsibilities, and impact on business goals..." value={reqJustification} onChange={(e) => setReqJustification(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px" }} disabled={requisitionLoading}>
                  {requisitionLoading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <div className="loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff", boxShadow: "none" }}></div>
                      <span>Creating Requisition...</span>
                    </div>
                  ) : "Create Requisition"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Position Modal */}
        {showPositionModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" }}>
            <div className="glass-card animated" style={{ width: "100%", maxWidth: "500px", padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>Add Position Requirement Requisition</h3>
                <span style={{ cursor: "pointer", fontSize: "24px", fontWeight: 700, color: "var(--text-muted)", lineHeight: 1 }} onClick={() => setShowPositionModal(false)}>×</span>
              </div>
              <form onSubmit={handleCreatePosition}>
                <div className="form-group">
                  <label className="form-label">Position Designation Title</label>
                  <input type="text" className="form-control" required placeholder="e.g. Senior Principal Cloud Engineer" value={posTitle} onChange={(e) => setPosTitle(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Primary Technical / Functional Capability Skillsets</label>
                  <input type="text" className="form-control" required placeholder="e.g. AWS, Kubernetes, Go, Terraform" value={posSkills} onChange={(e) => setPosSkills(e.target.value)} />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>Provide comma-separated tags.</span>
                </div>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">Requisition Job Description & Scope</label>
                  <textarea className="form-control" required rows={5} placeholder="Provide details about standard responsibilities, team scale, reporting managers, and key deliverables..." value={posRequirements} onChange={(e) => setPosRequirements(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px" }} disabled={positionLoading}>
                  {positionLoading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <div className="loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff", boxShadow: "none" }}></div>
                      <span>Logging Requisition...</span>
                    </div>
                  ) : "Catalog Requisition"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Career Opening Posting Modal */}
        {showPostingModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" }}>
            <div className="glass-card animated" style={{ width: "100%", maxWidth: "500px", padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>Publish Career Opening</h3>
                <span style={{ cursor: "pointer", fontSize: "24px", fontWeight: 700, color: "var(--text-muted)", lineHeight: 1 }} onClick={() => setShowPostingModal(false)}>×</span>
              </div>
              <form onSubmit={handleCreatePosting}>
                <div className="form-group">
                  <label className="form-label">Linked Requisition Position</label>
                  <select className="form-control" value={selectedPositionId} onChange={(e) => setSelectedPositionId(e.target.value)}>
                    {talentPositions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Public Job Posting Title</label>
                  <input type="text" className="form-control" required placeholder="e.g. Career Opening: Senior Principal Cloud Architect" value={postingTitle} onChange={(e) => setPostingTitle(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Budget Salary Range / compensation</label>
                  <input type="text" className="form-control" required placeholder="e.g. ₹25L - ₹35L per annum" value={postingSalary} onChange={(e) => setPostingSalary(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">Public Role Description Details</label>
                  <textarea className="form-control" required rows={5} placeholder="State core details, benefits, workplace model (Hybrid, Remote) to present on public portal." value={postingDescription} onChange={(e) => setPostingDescription(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px" }} disabled={postingLoading}>
                  {postingLoading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <div className="loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff", boxShadow: "none" }}></div>
                      <span>Publishing Posting...</span>
                    </div>
                  ) : "Publish Posting Active"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Candidate Modal */}
        {showCandidateModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" }}>
            <div className="glass-card animated" style={{ width: "100%", maxWidth: "500px", padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>Catalog Applicant Screening</h3>
                <span style={{ cursor: "pointer", fontSize: "24px", fontWeight: 700, color: "var(--text-muted)", lineHeight: 1 }} onClick={() => setShowCandidateModal(false)}>×</span>
              </div>
              <form onSubmit={handleCreateCandidate}>
                <div className="form-group">
                  <label className="form-label">Linked Active Career Opening</label>
                  <select className="form-control" value={selectedPostingId} onChange={(e) => { setSelectedPostingId(e.target.value); setCandFormError(""); }}>
                    <option value="" disabled>Select an active opening</option>
                    {talentPostings.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                  {candFormError && (
                    <div style={{ color: "#dc2626", marginTop: "8px", fontSize: "13px" }}>
                      {candFormError}
                    </div>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="form-group">
                  <div>
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-control" required placeholder="e.g. Sreya" value={candFirst} onChange={(e) => setCandFirst(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input type="text" className="form-control" required placeholder="e.g. Sengupta" value={candLast} onChange={(e) => setCandLast(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" required placeholder="sreya@gmail.com" value={candEmail} onChange={(e) => setCandEmail(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">Phone Contact Number</label>
                  <input type="text" className="form-control" required placeholder="+91 98765 43210" value={candPhone} onChange={(e) => setCandPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Resume URL (Doc / PDF Link)</label>
                  <input type="url" className="form-control" placeholder="https://drive.google.com/..." value={candResumeUrl} onChange={(e) => setCandResumeUrl(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Skills / Keywords</label>
                  <input type="text" className="form-control" placeholder="Python, Java, SQL" value={candSkills} onChange={(e) => setCandSkills(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">Reference Source</label>
                  <select className="form-control" value={candRefType} onChange={(e) => setCandRefType(e.target.value)}>
                    <option value="none">No Reference / Direct Application</option>
                    <option value="advertisement">Advertisement</option>
                    <option value="social_media">Social Media / LinkedIn</option>
                    <option value="internal_reference">Internal Referral</option>
                  </select>
                </div>
                {candRefType !== "none" && (
                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label className="form-label">
                      {candRefType === "advertisement"
                        ? "Advertisement details *"
                        : candRefType === "social_media"
                        ? "Social Media / LinkedIn details *"
                        : "Referring Employee Name *"}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder={
                        candRefType === "advertisement"
                          ? "e.g. Job portal, newspaper"
                          : candRefType === "social_media"
                          ? "e.g. LinkedIn profile / handle"
                          : "e.g. Jane Smith (EMP-1002)"
                      }
                      value={candRefDetail}
                      onChange={(e) => setCandRefDetail(e.target.value)}
                    />
                  </div>
                )}
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px" }} disabled={candidateLoading || !selectedPostingId}>
                  {candidateLoading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <div className="loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff", boxShadow: "none" }}></div>
                      <span>Logging Candidate...</span>
                    </div>
                  ) : "Log Screening Candidate"}
                </button>
              </form>
            </div>
          </div>
        )}

        {showProfileUploadModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)", paddingTop: "5vh" }}>
            <div className="glass-card animated" style={{ width: "100%", maxWidth: "600px", padding: "16px 24px", maxHeight: "85vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "16px" }}>Ingest Candidate Profile</h3>
                <span style={{ cursor: "pointer", fontSize: "22px", fontWeight: 700, color: "var(--text-muted)", lineHeight: 1 }} onClick={() => setShowProfileUploadModal(false)}>×</span>
              </div>
              <form onSubmit={handleUploadProfile}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }} className="form-group">
                  <div>
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-control" required placeholder="e.g. Sreya" value={profFirst} onChange={(e) => setProfFirst(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input type="text" className="form-control" required placeholder="e.g. Sengupta" value={profLast} onChange={(e) => setProfLast(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }} className="form-group">
                  <div>
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" required placeholder="sreya@gmail.com" value={profEmail} onChange={(e) => setProfEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Phone Contact</label>
                    <input type="text" className="form-control" required placeholder="+91 98765 43210" value={profPhone} onChange={(e) => setProfPhone(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Resume URL</label>
                  <input type="url" className="form-control" placeholder="https://drive.google.com/..." value={profResumeUrl} onChange={(e) => setProfResumeUrl(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Skills (Comma-separated)</label>
                  <input type="text" className="form-control" placeholder="Python, Django, React, SQL" value={profSkills} onChange={(e) => setProfSkills(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience Summary</label>
                  <textarea className="form-control" rows={2} placeholder="Summarize professional history, roles, tenure..." value={profExpSummary} onChange={(e) => setProfExpSummary(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Raw Resume Text (Optional)</label>
                  <textarea className="form-control" rows={3} placeholder="Paste plain text of resume here for semantic keyword search..." value={profRawResumeText} onChange={(e) => setProfRawResumeText(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Reference Source</label>
                  <select className="form-control" value={profRefType} onChange={(e) => setProfRefType(e.target.value)}>
                    <option value="none">No Reference (Direct)</option>
                    <option value="advertisement">Advertisement / Ref</option>
                    <option value="social_media">Social Media</option>
                    <option value="internal_reference">Internal Reference</option>
                  </select>
                </div>
                {profRefType !== "none" && (
                  <div className="form-group">
                    <label className="form-label">
                      {profRefType === "advertisement"
                        ? "Advertisement details *"
                        : profRefType === "social_media"
                        ? "Social Media details (e.g. LinkedIn) *"
                        : "Referring Employee Name *"}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder={
                        profRefType === "advertisement"
                          ? "e.g. Newspaper name, job portal"
                          : profRefType === "social_media"
                          ? "e.g. LinkedIn platform / link / username"
                          : "e.g. Jane Smith (EMP-1002)"
                      }
                      value={profRefDetail}
                      onChange={(e) => setProfRefDetail(e.target.value)}
                    />
                  </div>
                )}
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "8px", marginTop: "4px" }} disabled={profileUploadLoading}>
                  {profileUploadLoading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <div className="loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff", boxShadow: "none" }}></div>
                      <span>Ingesting Profile...</span>
                    </div>
                  ) : "Ingest Profile to Database"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Offer Letter Drafting Modal */}
        {showOfferModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" }}>
            <div className="glass-card animated" style={{ width: "100%", maxWidth: "500px", padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>Draft Official Offer Package</h3>
                <span style={{ cursor: "pointer", fontSize: "24px", fontWeight: 700, color: "var(--text-muted)", lineHeight: 1 }} onClick={() => setShowOfferModal(false)}>×</span>
              </div>
              <form onSubmit={handleCreateOffer}>
                <div className="form-group">
                  <label className="form-label">Offered Base Salary / Year (CTC)</label>
                  <input type="number" className="form-control" required placeholder="e.g. 1800000" value={offerSalary} onChange={(e) => setOfferSalary(e.target.value)} />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>Enter annual integer value.</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Grade Band Placement</label>
                  <select className="form-control" value={offerGrade} onChange={(e) => setOfferGrade(e.target.value)}>
                    <option value="L1">L1 - Associate Professional</option>
                    <option value="L2">L2 - Senior Consultant</option>
                    <option value="L3">L3 - Principal Architect</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label className="form-label">Proposed Date of Joining</label>
                  <input type="date" className="form-control" required value={offerJoiningDate} onChange={(e) => setOfferJoiningDate(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: "24px" }}>
                  <label className="form-label">Offer Validity Expiry Date (End Date)</label>
                  <input type="date" className="form-control" required value={offerExpiryDate} onChange={(e) => setOfferExpiryDate(e.target.value)} />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>The candidate must accept the offer before this date.</span>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px" }} disabled={offerLoading}>
                  {offerLoading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <div className="loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff", boxShadow: "none" }}></div>
                      <span>Generating Offer...</span>
                    </div>
                  ) : "Generate and Extend Offer Letter"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper functions for proof uploads and PDF download
  const generateOfferPDF = (offer: any) => {
    const candidate = talentCandidates.find(c => c.id === offer.candidate_id);
    if (!candidate) {
      showToast.error("Candidate details not found.");
      return;
    }
    
    const doc = new jsPDF();
    
    // Header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241); // Indigo color
    doc.text("COGN-IHR SOLUTIONS", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("People Intelligence & Resource Management Portal", 20, 26);
    doc.line(20, 30, 190, 30);
    
    // Date and Reference
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`Date: ${new Date(offer.created_at).toLocaleDateString()}`, 20, 40);
    doc.text(`Ref: COGNIHR/OFFER/${offer.id.substring(0, 8).toUpperCase()}`, 20, 45);
    
    // Recipient details
    doc.setFont("Helvetica", "bold");
    doc.text("To,", 20, 55);
    doc.text(`${candidate.first_name} ${candidate.last_name}`, 20, 60);
    doc.setFont("Helvetica", "normal");
    doc.text(`Email: ${candidate.email}`, 20, 65);
    if (candidate.phone) {
      doc.text(`Phone: ${candidate.phone}`, 20, 70);
    }
    
    // Subject
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Subject: Offer of Employment", 20, 85);
    
    // Salutation & Body
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Dear ${candidate.first_name},`, 20, 95);
    
    const bodyText = `We are pleased to offer you employment with CogniHR Solutions in the role of ${offer.grade} level placement. We were highly impressed with your credentials and background during the interview process, and we believe you will be a valuable addition to our organization.`;
    
    const splitBody = doc.splitTextToSize(bodyText, 170);
    doc.text(splitBody, 20, 102);
    
    // Terms Table
    doc.setFont("Helvetica", "bold");
    doc.text("Terms of Offer:", 20, 125);
    
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 130, 170, 40, "F");
    doc.rect(20, 130, 170, 40, "S");
    
    doc.setFont("Helvetica", "bold");
    doc.text("Compensation (CTC):", 25, 138);
    doc.text("Grade Placement:", 25, 146);
    doc.text("Proposed Joining Date:", 25, 154);
    doc.text("Offer Validity Period:", 25, 162);
    
    doc.setFont("Helvetica", "normal");
    doc.text(`INR ${Number(offer.offered_salary).toLocaleString('en-IN')} Per Annum`, 80, 138);
    doc.text(`${offer.grade}`, 80, 146);
    doc.text(`${offer.joining_date}`, 80, 154);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(239, 68, 68); // Red for validity
    doc.text(`${offer.expiry_date || "N/A"}`, 80, 162);
    
    doc.setTextColor(51, 65, 85);
    doc.setFont("Helvetica", "normal");
    
    const instructionText = `Please sign and return the duplicate copy of this offer letter or reply to this offer email with your confirmation before the Offer Validity Period ends. Should you have any questions, please feel free to reach out.`;
    const splitInstruction = doc.splitTextToSize(instructionText, 170);
    doc.text(splitInstruction, 20, 182);
    
    // Signature
    doc.text("Sincerely,", 20, 210);
    doc.setFont("Helvetica", "bold");
    doc.text("Human Resources Department", 20, 225);
    doc.setFont("Helvetica", "normal");
    doc.text("CogniHR Solutions", 20, 230);
    
    // Footer
    doc.line(20, 270, 190, 270);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Confidential Offer Document - CogniHR Solutions", 20, 275);
    
    doc.save(`Offer_Letter_${candidate.first_name}_${candidate.last_name}.pdf`);
  };

  const handleViewProof = (offer: any) => {
    if (!offer.proof_attachment) return;
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(
        `<iframe src="${offer.proof_attachment}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      );
    } else {
      showToast.error("Popup blocked! Please allow popups for this site.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, offerId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const res = await fetch(`${API_BASE_URL}/talent/offers/${offerId}/upload-proof`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            proof_attachment: base64,
            proof_attachment_name: file.name
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to upload proof");
        setTalentOffers(prev => prev.map(o => o.id === offerId ? data : o));
        showToast.success("Candidate response email proof successfully attached!");
      } catch (err: any) {
        showToast.error(err.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const renderOfferManagement = () => {
    return (
      <div className="animated">
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span style={{ fontSize: "28px" }}>📜</span>
            <div>
              <h2 style={{ margin: 0 }}>Employment Offer Letter & Onboarding Hub</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>
                Manage candidate offer packages, track validity periods, attach candidate email response proofs, and trigger active employee onboarding promotions.
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate Details</th>
                  <th>Salary Package</th>
                  <th>Timeline & Grade</th>
                  <th>Validity Expiry</th>
                  <th>Offer Packet</th>
                  <th>Response Proof</th>
                  <th>Status State</th>
                  <th>Integration Actions</th>
                </tr>
              </thead>
              <tbody>
                {talentOffers.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                      No offer letters generated yet. Go to Recruitment Hub candidate pipeline to draft offers.
                    </td>
                  </tr>
                ) : (
                  talentOffers.map((o) => {
                    const candidate = talentCandidates.find(c => c.id === o.candidate_id);
                    const isExpired = o.expiry_date && new Date(o.expiry_date) < new Date();
                    return (
                      <tr key={o.id}>
                        <td>
                          {candidate ? (
                            <>
                              <strong style={{ fontSize: "14.5px" }}>{candidate.first_name} {candidate.last_name}</strong>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{candidate.email}</div>
                              {candidate.phone && <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{candidate.phone}</div>}
                            </>
                          ) : "Unknown Candidate"}
                        </td>
                        <td style={{ fontWeight: 700 }}>₹{Number(o.offered_salary).toLocaleString('en-IN')}/yr</td>
                        <td style={{ fontSize: "12.5px" }}>
                          <div>Start: {o.joining_date}</div>
                          <div style={{ color: "var(--text-muted)" }}>Grade: {o.grade}</div>
                        </td>
                        <td>
                          {o.expiry_date ? (
                            <span style={{ color: isExpired ? "var(--danger)" : "inherit", fontWeight: isExpired ? 700 : "normal" }}>
                              {o.expiry_date} {isExpired && " (Expired)"}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)" }}>N/A</span>
                          )}
                        </td>
                        <td>
                          <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }} onClick={() => generateOfferPDF(o)}>
                            📥 Download PDF
                          </button>
                        </td>
                        <td>
                          {o.proof_attachment ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11.5px", background: "rgba(99,102,241,0.05)", color: "var(--primary)" }} onClick={() => handleViewProof(o)}>
                                👁️ View Proof
                              </button>
                              <label style={{ fontSize: "11px", color: "var(--text-muted)", cursor: "pointer", textDecoration: "underline", textAlign: "center" }}>
                                Replace
                                <input type="file" style={{ display: "none" }} accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, o.id)} />
                              </label>
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                              <label className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11.5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                                📎 Attach Proof
                                <input type="file" style={{ display: "none" }} accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, o.id)} />
                              </label>
                              <span style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "3px" }}>Email confirmation proof</span>
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge" style={{
                            fontWeight: 700,
                            fontSize: "11px",
                            background: o.offer_status === "accepted" ? "rgba(16,185,129,0.1)" : o.offer_status === "rejected" ? "rgba(239,68,68,0.1)" : o.offer_status === "onboarded" ? "rgba(99,102,241,0.1)" : o.offer_status === "cancelled" ? "rgba(100,116,139,0.1)" : o.offer_status === "closed" ? "rgba(100,116,139,0.1)" : "rgba(0,194,212,0.1)",
                            color: o.offer_status === "accepted" ? "#10b981" : o.offer_status === "rejected" ? "#ef4444" : o.offer_status === "onboarded" ? "#6366f1" : o.offer_status === "cancelled" ? "#64748b" : o.offer_status === "closed" ? "#64748b" : "var(--primary)"
                          }}>
                            {o.offer_status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {o.offer_status === "sent" && (
                              <>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: "4px 8px", fontSize: "11.5px", background: "rgba(16,185,129,0.05)", color: "#10b981" }} 
                                  onClick={() => {
                                    if (!o.proof_attachment) {
                                      showToast.error("Please attach candidate's acceptance email response proof first!");
                                      return;
                                    }
                                    handleOfferAction(o.id, "accepted");
                                  }}
                                >
                                  ✓ Accepted
                                </button>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: "4px 8px", fontSize: "11.5px", color: "var(--danger)" }} 
                                  onClick={() => {
                                    if (!o.proof_attachment) {
                                      showToast.error("Please attach candidate's refusal email response proof first!");
                                      return;
                                    }
                                    handleOfferAction(o.id, "rejected");
                                  }}
                                >
                                  × Refused
                                </button>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: "4px 8px", fontSize: "11.5px", color: "var(--text-muted)" }} 
                                  onClick={() => handleOfferAction(o.id, "cancelled")}
                                >
                                  Cancel Offer
                                </button>
                              </>
                            )}
                            {o.offer_status === "accepted" && (
                              <>
                                <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px", textShadow: "none" }} onClick={() => handleOnboardCandidate(o.candidate_id)}>
                                  ⚡ Complete Onboarding Integration
                                </button>
                                <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => handleOfferAction(o.id, "closed")}>
                                  Close Offer
                                </button>
                              </>
                            )}
                            {o.offer_status === "onboarded" && (
                              <span className="badge" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>✓ Seeded as active Employee</span>
                            )}
                            {["rejected", "cancelled", "closed"].includes(o.offer_status) && (
                              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Offer concluded</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // RMG PORTAL & ASSET MANAGEMENT HANDLERS
  // =========================================================================

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: assetName,
        asset_type: assetType,
        serial_number: assetSerial || null,
        status: assetStatus,
        employee_id: assetEmployeeId || ""
      };
      
      const res = await fetch(`${API_BASE_URL}/onboarding/assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create asset");

      // If assigned to an employee, call the assign endpoint
      if (assetEmployeeId) {
        const assignRes = await fetch(`${API_BASE_URL}/onboarding/assets/${data.id}/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ employee_id: assetEmployeeId })
        });
        if (!assignRes.ok) {
          const assignData = await assignRes.json();
          throw new Error(assignData.detail || "Asset created, but assignment failed.");
        }
      }
      
      showToast.success("Asset registered successfully!");
      setShowAssetModal(false);
      setAssetName("");
      setAssetSerial("");
      setAssetEmployeeId("");
      fetchRmgAssets();
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  const handleUpdateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    try {
      const payload = {
        name: assetName,
        asset_type: assetType,
        serial_number: assetSerial || null,
        status: assetStatus,
        employee_id: assetEmployeeId || ""
      };
      
      const res = await fetch(`${API_BASE_URL}/onboarding/assets/${editingAsset.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update asset");
      
      showToast.success("Asset updated successfully!");
      setShowAssetModal(false);
      setEditingAsset(null);
      setAssetName("");
      setAssetSerial("");
      setAssetEmployeeId("");
      fetchRmgAssets();
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!(await showConfirm("Are you sure you want to delete this asset from inventory?"))) return;
    try {
      const res = await fetch(`${API_BASE_URL}/onboarding/assets/${assetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to delete asset");
      }
      showToast.success("Asset deleted successfully!");
      fetchRmgAssets();
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  const handleCreateInduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inductionEmployeeId) {
      showToast.error("Please select a target employee.");
      return;
    }
    try {
      const payload = {
        task_name: inductionTaskName,
        description: inductionDescription || null
      };
      
      const res = await fetch(`${API_BASE_URL}/onboarding/checklist/employee/${inductionEmployeeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to assign induction task");
      
      showToast.success("Induction task assigned successfully!");
      setShowInductionModal(false);
      setInductionTaskName("");
      setInductionDescription("");
      fetchRmgInductionTasks();
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  const handleToggleInductionStatus = async (taskId: string, currentStatus: string, isEmployeeView: boolean) => {
    try {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      const res = await fetch(`${API_BASE_URL}/onboarding/checklist/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update task status");
      
      if (isEmployeeView) {
        fetchMyAssetsAndInduction();
      } else {
        fetchRmgInductionTasks();
      }
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  const handleDeleteInduction = async (taskId: string) => {
    if (!(await showConfirm("Are you sure you want to delete this induction checklist task?"))) return;
    try {
      const res = await fetch(`${API_BASE_URL}/onboarding/checklist/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to delete task");
      }
      showToast.success("Induction task removed successfully!");
      fetchRmgInductionTasks();
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  const handleAutoAssignInduction = async (empId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/onboarding/checklist/employee/${empId}/auto-seed`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to auto-assign default tasks");
      
      showToast.success("Default onboarding induction checklist generated!");
      fetchRmgInductionTasks();
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  // =========================================================================
  // RMG PORTAL VIEW RENDERING
  // =========================================================================

  // =========================================================================
  // ONBOARDING CHECKLIST VIEW RENDERING
  // =========================================================================
  const renderOnboardingChecklist = () => {
    const filteredInductionTasks = selectedInductionEmployeeFilter
      ? rmgInductionTasks.filter(t => t.employee_id === selectedInductionEmployeeFilter)
      : rmgInductionTasks;

    return (
      <div className="animated">
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "28px" }}>📋</span>
              <div>
                <h2 style={{ margin: 0 }}>Onboarding Induction Checklist</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>
                  Manage candidate onboarding checklists, configure task steps, and verify compliance.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <select 
                className="form-control"
                style={{ width: "260px", padding: "6px" }}
                value={selectedInductionEmployeeFilter}
                onChange={(e) => setSelectedInductionEmployeeFilter(e.target.value)}
              >
                <option value="">Filter by Employee (Show All)</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                ))}
              </select>
              {selectedInductionEmployeeFilter && (
                <button 
                  className="btn btn-secondary"
                  style={{ padding: "6px 12px" }}
                  onClick={() => handleAutoAssignInduction(selectedInductionEmployeeFilter)}
                >
                  ⚡ Auto-Generate Default Tasks
                </button>
              )}
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setInductionTaskName("");
                  setInductionDescription("");
                  setInductionEmployeeId(selectedInductionEmployeeFilter);
                  setShowInductionModal(true);
                }}
              >
                ➕ Assign Induction Task
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Task Name</th>
                  <th>Task Description</th>
                  <th>Induction Status</th>
                  <th>Completed At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInductionTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                      No induction checklist tasks found. Use dropdown and Auto-Generate or Assign a task above.
                    </td>
                  </tr>
                ) : (
                  filteredInductionTasks.map(task => (
                    <tr key={task.id}>
                      <td><strong>👤 {task.employee_name || (task.employee ? `${task.employee.first_name} ${task.employee.last_name}` : "Unknown Employee")}</strong></td>
                      <td><strong>{task.task_name}</strong></td>
                      <td style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>{task.description || "—"}</td>
                      <td>
                        <span className="badge" style={{
                          fontWeight: 700,
                          fontSize: "11px",
                          background: task.status === "completed" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                          color: task.status === "completed" ? "#10b981" : "#f59e0b"
                        }}>
                          {task.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            style={{ 
                              background: task.status === "completed" ? "rgba(245,158,11,0.05)" : "rgba(16,185,129,0.05)",
                              color: task.status === "completed" ? "#f59e0b" : "#10b981"
                            }}
                            onClick={() => handleToggleInductionStatus(task.id, task.status, false)}
                          >
                            {task.status === "completed" ? "↺ Mark Pending" : "✓ Mark Complete"}
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteInduction(task.id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create Induction Task */}
        {showInductionModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" }}>
            <div className="glass-card animated" style={{ width: "100%", maxWidth: "500px", padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>Assign Induction Checklist Task</h3>
                <span style={{ cursor: "pointer", fontSize: "24px", fontWeight: 700, color: "var(--text-muted)", lineHeight: 1 }} onClick={() => setShowInductionModal(false)}>×</span>
              </div>
              <form onSubmit={handleCreateInduction}>
                <div className="form-group">
                  <label className="form-label">Onboarding Employee</label>
                  <select className="form-control" required value={inductionEmployeeId} onChange={(e) => setInductionEmployeeId(e.target.value)}>
                    <option value="">-- Select Employee --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Checklist Task Name</label>
                  <input type="text" className="form-control" required placeholder="e.g. Sign IT Compliance Acknowledgment" value={inductionTaskName} onChange={(e) => setInductionTaskName(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: "24px" }}>
                  <label className="form-label">Task Description Instructions</label>
                  <textarea className="form-control" rows={4} placeholder="Describe steps or instructions for the employee to complete." value={inductionDescription} onChange={(e) => setInductionDescription(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px" }}>
                  Assign Task
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // PROJECT ALLOCATIONS VIEW
  // =========================================================================
  const renderProjectAllocations = () => {
    const billingColor: Record<string, string> = {
      Billable: "#10b981", Shadow: "#6366f1", Bench: "#f59e0b", Internal: "#64748b"
    };
    const statusColor: Record<string, string> = {
      active: "#10b981", pipeline: "#6366f1", completed: "#94a3b8"
    };

    const filteredAllocs = allocProjectFilter
      ? rmgAllocations.filter((a: any) => a.project_id === allocProjectFilter)
      : rmgAllocations;

    const handleSaveAlloc = async (e: React.FormEvent) => {
      e.preventDefault();
      const payload: any = {
        employee_id: allocEmpId,
        project_id: rmgAllocProjectId,
        project_role: rmgAllocRole,
        allocation_percentage: allocPct,
        billing_status: rmgAllocBillingStatus,
        start_date: allocStartDate || null
      };
      const url = editingAlloc
        ? `${API_BASE_URL}/rmg/allocations/${editingAlloc.id}`
        : `${API_BASE_URL}/rmg/allocations`;
      const method = editingAlloc ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowAllocModal(false);
        fetchRmgAllocations();
        fetchRmgBench();
        fetchRmgProjects();
      }
    };

    const handleDeleteAlloc = async (id: string) => {
      if (!(await showConfirm("Remove this allocation?"))) return;
      await fetch(`${API_BASE_URL}/rmg/allocations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRmgAllocations();
      fetchRmgBench();
      fetchRmgProjects();
    };

    const handleSaveProject = async (e: React.FormEvent) => {
      e.preventDefault();
      const payload: any = {
        client_id: projClientId,
        name: projName,
        code: projCode,
        billing_type: projBillingType,
        start_date: projStartDate || null,
        end_date: projEndDate || null
      };
      const url = editingProject
        ? `${API_BASE_URL}/rmg/projects/${editingProject.id}`
        : `${API_BASE_URL}/rmg/projects`;
      const method = editingProject ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) { setShowProjectModal(false); fetchRmgProjects(); }
    };

    const selectedEmp = employees.find((e: any) => e.id === allocTenureEmpId);
    const empAllocations = allocTenureEmpId
      ? [...rmgAllocations].filter((a: any) => a.employee_id === allocTenureEmpId).sort((a: any, b: any) => ((a.start_date || "") > (b.start_date || "") ? 1 : -1))
      : [];
    const currentAlloc = empAllocations.find((a: any) => !a.end_date) || empAllocations[empAllocations.length - 1] || null;

    return (
      <div className="animated">
        {/* Employee tenure selector */}
        <div className="glass-card" style={{ marginBottom: "24px", background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.04) 0%, rgba(var(--accent-rgb),0.02) 100%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "28px" }}>👤</span>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label className="form-label" style={{ marginBottom: "4px", fontWeight: 600 }}>Select Employee to View Allocation History</label>
              <select className="form-control" value={allocTenureEmpId} onChange={(e) => setAllocTenureEmpId(e.target.value)}>
                <option value="">-- Choose Employee --</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Current assignment card */}
        {selectedEmp && (
          <div className="glass-card" style={{ marginBottom: "24px", borderLeft: "4px solid var(--primary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "var(--grad-brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                {(selectedEmp.first_name?.[0] || "") + (selectedEmp.last_name?.[0] || "")}
              </div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <h3 style={{ margin: 0, fontSize: "18px" }}>{selectedEmp.first_name} {selectedEmp.last_name}</h3>
                <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: "13px" }}>
                  {selectedEmp.employee_id} · {selectedEmp.designation_id || "—"} · {selectedEmp.department_id || "—"}
                  {selectedEmp.joining_date && ` · Joined ${selectedEmp.joining_date}`}
                </p>
              </div>
              {currentAlloc ? (
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ background: "rgba(16,185,129,0.08)", borderRadius: "10px", padding: "10px 18px", textAlign: "center", minWidth: "120px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#10b981" }}>{currentAlloc.project_name || "—"}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Current Project</div>
                  </div>
                  <div style={{ background: "rgba(99,102,241,0.08)", borderRadius: "10px", padding: "10px 18px", textAlign: "center", minWidth: "100px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#6366f1" }}>{currentAlloc.project_role || "—"}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Role</div>
                  </div>
                  <div style={{ background: "rgba(245,158,11,0.08)", borderRadius: "10px", padding: "10px 18px", textAlign: "center", minWidth: "80px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#f59e0b" }}>{currentAlloc.allocation_percentage || "—"}%</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Allocation</div>
                  </div>
                  <div style={{ background: "rgba(14,165,233,0.08)", borderRadius: "10px", padding: "10px 18px", textAlign: "center", minWidth: "90px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: billingColor[currentAlloc.billing_status] || "#64748b" }}>{currentAlloc.billing_status || "—"}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Billing</div>
                  </div>
                </div>
              ) : (
                <div style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "13px" }}>No current allocation record</div>
              )}
            </div>
          </div>
        )}

        {/* Tenure timeline */}
        {selectedEmp && empAllocations.length > 0 && (
          <div className="glass-card" style={{ marginBottom: "24px" }}>
            <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>📅</span> Tenure Allocation History
            </h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th><th>Period</th><th>Project</th><th>Client</th><th>Role</th><th>Alloc %</th><th>Billing</th><th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {empAllocations.map((alloc: any, idx: number) => {
                    const start = alloc.start_date || "—";
                    const end = alloc.end_date || "Present";
                    const duration = alloc.start_date
                      ? (() => {
                          const s = new Date(alloc.start_date);
                          const e = alloc.end_date ? new Date(alloc.end_date) : new Date();
                          const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
                          return months < 1 ? "< 1 mo" : `${Math.floor(months / 12)}y ${months % 12}m`;
                        })()
                      : "—";
                    const isActive = !alloc.end_date;
                    return (
                      <tr key={alloc.id || idx} style={isActive ? { background: "rgba(16,185,129,0.04)" } : {}}>
                        <td style={{ fontWeight: 700, color: isActive ? "#10b981" : "var(--text-muted)" }}>{idx + 1}</td>
                        <td style={{ fontSize: "12px", whiteSpace: "nowrap" }}>{start} → {end}</td>
                        <td style={{ fontWeight: 600 }}>{alloc.project_name} <span style={{ fontSize: "10px", fontFamily: "monospace", color: "var(--text-muted)" }}>{alloc.project_code}</span></td>
                        <td style={{ fontSize: "12px" }}>{alloc.client_name || "—"}</td>
                        <td>{alloc.project_role}</td>
                        <td style={{ textAlign: "center", fontWeight: 700 }}>{alloc.allocation_percentage}%</td>
                        <td>
                          <span style={{ fontWeight: 700, fontSize: "11px", color: billingColor[alloc.billing_status] || "#64748b", background: `${(billingColor[alloc.billing_status] || "#64748b")}18`, padding: "3px 9px", borderRadius: "12px" }}>
                            {alloc.billing_status}
                          </span>
                        </td>
                        <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{duration}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!selectedEmp && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px", opacity: 0.3 }}>👤</div>
            <p>Select an employee above to view their project allocation history from day one.</p>
          </div>
        )}

        {/* ---- MANAGEMENT TOOLS ---- */}
        <details style={{ marginTop: "32px" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: "15px", color: "var(--text-muted)", padding: "12px 0" }}>
            📁 Resource Management Tools (Projects / Allocations / Bench)
          </summary>

          {/* KPI summary chips */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
            {[
              { label: "Total Projects", val: rmgProjects.length, color: "#6366f1" },
              { label: "Active Projects", val: rmgProjects.filter((p: any) => p.status === "active").length, color: "#10b981" },
              { label: "Pipeline", val: rmgProjects.filter((p: any) => p.status === "pipeline").length, color: "#8b5cf6" },
              { label: "Total Allocations", val: rmgAllocations.length, color: "#0ea5e9" },
              { label: "On Bench", val: rmgBench.length, color: "#f59e0b" },
            ].map(k => (
              <div key={k.label} style={{ background: "rgba(99,102,241,0.07)", borderRadius: "10px", padding: "10px 18px", textAlign: "center", minWidth: "110px" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: k.color }}>{k.val}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Sub-tabs */}
          <div className="glass-card" style={{ marginBottom: "20px", padding: "6px" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              {[
                { id: "projects", icon: "📁", label: "Projects" },
                { id: "allocations", icon: "👥", label: "Allocations" },
                { id: "bench", icon: "🪑", label: `Bench (${rmgBench.length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`tab-btn ${allocActiveTab === tab.id ? "active" : ""}`}
                  onClick={() => setAllocActiveTab(tab.id)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ---- PROJECTS TAB ---- */}
          {allocActiveTab === "projects" && (
          <div className="glass-card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Projects</h3>
              <button className="btn btn-primary btn-sm" onClick={() => {
                setEditingProject(null); setProjName(""); setProjCode("");
                setProjClientId(rmgClients[0]?.id || "");
                setProjBillingType("Time & Material"); setProjStartDate(""); setProjEndDate("");
                setShowProjectModal(true);
              }}>➕ New Project</button>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead><tr>
                  <th>Project</th><th>Client</th><th>Billing Type</th>
                  <th>Start</th><th>End</th><th>Status</th><th>Allocated</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {rmgProjects.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>No projects found. Create one above.</td></tr>
                  ) : rmgProjects.map((proj: any) => (
                    <tr key={proj.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{proj.name}</div>
                        <div style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--text-muted)" }}>{proj.code}</div>
                      </td>
                      <td>{proj.client_name || "—"}</td>
                      <td><span style={{ fontSize: "12px", background: "rgba(99,102,241,0.08)", padding: "3px 8px", borderRadius: "4px" }}>{proj.billing_type}</span></td>
                      <td style={{ fontSize: "12px" }}>{proj.start_date || "—"}</td>
                      <td style={{ fontSize: "12px" }}>{proj.end_date || "—"}</td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: "11px", color: statusColor[proj.status] || "#94a3b8", background: `${statusColor[proj.status] || "#94a3b8"}18`, padding: "3px 9px", borderRadius: "12px" }}>
                          {(proj.status || "active").toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, textAlign: "center" }}>{proj.allocated_count}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => {
                            setEditingProject(proj);
                            setProjName(proj.name); setProjCode(proj.code);
                            setProjClientId(proj.client_id);
                            setProjBillingType(proj.billing_type || "Time & Material");
                            setProjStartDate(proj.start_date || ""); setProjEndDate(proj.end_date || "");
                            setShowProjectModal(true);
                          }}>✏️ Edit</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => {
                            setAllocProjectFilter(proj.id);
                            setAllocActiveTab("allocations");
                          }}>👥 Team</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---- ALLOCATIONS TAB ---- */}
        {allocActiveTab === "allocations" && (
          <div className="glass-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
              <h3 style={{ margin: 0 }}>Resource Allocations</h3>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <select className="form-control" style={{ width: "220px", padding: "6px" }}
                  value={allocProjectFilter}
                  onChange={(e) => { setAllocProjectFilter(e.target.value); fetchRmgAllocations(e.target.value || undefined); }}
                >
                  <option value="">All Projects</option>
                  {rmgProjects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button className="btn btn-primary btn-sm" onClick={() => {
                  setEditingAlloc(null); setAllocEmpId(""); setRmgAllocProjectId(allocProjectFilter || "");
                  setRmgAllocRole("Developer"); setAllocPct(100); setRmgAllocBillingStatus("Billable"); setAllocStartDate("");
                  setShowAllocModal(true);
                }}>➕ Assign Resource</button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead><tr>
                  <th>Employee</th><th>Department / Role</th><th>Project</th><th>Client</th>
                  <th>Role</th><th>Alloc %</th><th>Billing Status</th><th>Start</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {filteredAllocs.length === 0 ? (
                    <tr><td colSpan={9} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>No allocations found.</td></tr>
                  ) : filteredAllocs.map((alloc: any) => (
                    <tr key={alloc.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{alloc.employee_name}</div>
                        <div style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--text-muted)" }}>{alloc.employee_code}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: "12px" }}>{alloc.department_name || "—"}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{alloc.designation_title || "—"}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: "13px" }}>{alloc.project_name}</div>
                        <div style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--text-muted)" }}>{alloc.project_code}</div>
                      </td>
                      <td style={{ fontSize: "12px" }}>{alloc.client_name || "—"}</td>
                      <td style={{ fontSize: "12px" }}>{alloc.project_role}</td>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>{alloc.allocation_percentage}%</td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: "11px", color: billingColor[alloc.billing_status] || "#64748b", background: `${billingColor[alloc.billing_status] || "#64748b"}18`, padding: "3px 9px", borderRadius: "12px" }}>
                          {alloc.billing_status}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px" }}>{alloc.start_date || "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => {
                            setEditingAlloc(alloc);
                            setAllocEmpId(alloc.employee_id);
                            setRmgAllocProjectId(alloc.project_id);
                            setRmgAllocRole(alloc.project_role);
                            setAllocPct(alloc.allocation_percentage);
                            setRmgAllocBillingStatus(alloc.billing_status);
                            setAllocStartDate(alloc.start_date || "");
                            setShowAllocModal(true);
                          }}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAlloc(alloc.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---- BENCH TAB ---- */}
        {allocActiveTab === "bench" && (
          <div className="glass-card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>🪑 Bench Resources <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "14px" }}>({rmgBench.length} employees not on active projects)</span></h3>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead><tr><th>Employee</th><th>Department</th><th>Designation</th><th>On Bench Since</th><th>Skills</th><th>Action</th></tr></thead>
                <tbody>
                  {rmgBench.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#10b981" }}>🎉 All resources are allocated to active projects!</td></tr>
                  ) : rmgBench.map((emp: any) => (
                    <tr key={emp.employee_id}>
                      <td><div style={{ fontWeight: 600 }}>{emp.employee_name}</div><div style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--text-muted)" }}>{emp.employee_code}</div></td>
                      <td>{emp.department_name || "—"}</td>
                      <td>{emp.designation_title || "—"}</td>
                      <td style={{ fontSize: "12px" }}>{emp.bench_since || "—"}</td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {(emp.skills || []).slice(0, 4).map((s: string) => (
                            <span key={s} style={{ fontSize: "10px", background: "rgba(99,102,241,0.1)", color: "#6366f1", padding: "2px 6px", borderRadius: "8px" }}>{s}</span>
                          ))}
                          {(emp.skills || []).length > 4 && <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>+{(emp.skills || []).length - 4} more</span>}
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => {
                          setEditingAlloc(null);
                          setAllocEmpId(emp.employee_id);
                          setRmgAllocProjectId(""); setRmgAllocRole("Developer"); setAllocPct(100);
                          setRmgAllocBillingStatus("Billable"); setAllocStartDate("");
                          setShowAllocModal(true);
                          setAllocActiveTab("allocations");
                        }}>➕ Assign to Project</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Add/Edit Allocation */}
        {showAllocModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" }}>
            <div className="glass-card animated" style={{ width: "100%", maxWidth: "520px", padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>{editingAlloc ? "Update Allocation" : "Assign Resource to Project"}</h3>
                <span style={{ cursor: "pointer", fontSize: "24px", fontWeight: 700, color: "var(--text-muted)" }} onClick={() => setShowAllocModal(false)}>×</span>
              </div>
              <form onSubmit={handleSaveAlloc}>
                <div className="form-group">
                  <label className="form-label">Employee</label>
                  <select className="form-control" required value={allocEmpId} onChange={e => setAllocEmpId(e.target.value)} disabled={!!editingAlloc}>
                    <option value="">-- Select Employee --</option>
                    {employees.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Project</label>
                  <select className="form-control" required value={rmgAllocProjectId} onChange={e => setRmgAllocProjectId(e.target.value)}>
                    <option value="">-- Select Project --</option>
                    {rmgProjects.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.client_name})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Role on Project</label>
                  <input className="form-control" required value={rmgAllocRole} onChange={e => setRmgAllocRole(e.target.value)} placeholder="e.g. Tech Lead, QA Engineer" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Allocation %</label>
                    <input type="number" className="form-control" min={1} max={100} value={allocPct} onChange={e => setAllocPct(+e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Billing Status</label>
                    <select className="form-control" value={rmgAllocBillingStatus} onChange={e => setRmgAllocBillingStatus(e.target.value)}>
                      <option value="Billable">Billable</option>
                      <option value="Shadow">Shadow</option>
                      <option value="Bench">Bench</option>
                      <option value="Internal">Internal</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: "24px" }}>
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-control" value={allocStartDate} onChange={e => setAllocStartDate(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px" }}>
                  {editingAlloc ? "Save Changes" : "Assign Resource"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add/Edit Project */}
        {showProjectModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" }}>
            <div className="glass-card animated" style={{ width: "100%", maxWidth: "520px", padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>{editingProject ? "Update Project" : "Create New Project"}</h3>
                <span style={{ cursor: "pointer", fontSize: "24px", fontWeight: 700, color: "var(--text-muted)" }} onClick={() => setShowProjectModal(false)}>×</span>
              </div>
              <form onSubmit={handleSaveProject}>
                <div className="form-group">
                  <label className="form-label">Client</label>
                  <select className="form-control" required value={projClientId} onChange={e => setProjClientId(e.target.value)}>
                    <option value="">-- Select Client --</option>
                    {rmgClients.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.domain_industry})</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Project Name</label>
                    <input className="form-control" required value={projName} onChange={e => setProjName(e.target.value)} placeholder="e.g. Cloud Migration SOW" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Code</label>
                    <input className="form-control" required value={projCode} onChange={e => setProjCode(e.target.value)} placeholder="e.g. CLOUD_MIG" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Billing Type</label>
                  <select className="form-control" value={projBillingType} onChange={e => setProjBillingType(e.target.value)}>
                    <option>Time & Material</option>
                    <option>Fixed Price</option>
                    <option>Internal</option>
                    <option>Retainer</option>
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-control" value={projStartDate} onChange={e => setProjStartDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-control" value={projEndDate} onChange={e => setProjEndDate(e.target.value)} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px" }}>
                  {editingProject ? "Save Changes" : "Create Project"}
                </button>
              </form>
            </div>
          </div>
        )}
        </details>
      </div>
    );
  };

  // =========================================================================
  // ASSET REGISTRY VIEW RENDERING
  // =========================================================================
  const renderAssetRegistry = () => {
    return (
      <div className="animated">
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "28px" }}>💻</span>
              <div>
                <h2 style={{ margin: 0 }}>Asset Registry</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>
                  Manage corporate assets, hardware inventory, and employee computer/equipment allocation mapping.
                </p>
              </div>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setEditingAsset(null);
                setAssetName("");
                setAssetSerial("");
                setAssetType("Laptop");
                setAssetStatus("available");
                setAssetEmployeeId("");
                setShowAssetModal(true);
              }}
            >
              ➕ Register Master Asset
            </button>
          </div>
        </div>

        <div className="glass-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset Details</th>
                  <th>Type</th>
                  <th>Serial Number</th>
                  <th>Allocation Status</th>
                  <th>Assigned To</th>
                  <th>Assigned At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rmgAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                      No corporate assets registered in system inventory yet.
                    </td>
                  </tr>
                ) : (
                  rmgAssets.map(asset => (
                    <tr key={asset.id}>
                      <td><strong>{asset.name}</strong></td>
                      <td>
                        <span style={{ fontSize: "12.5px", background: "rgba(100,116,139,0.08)", padding: "4px 8px", borderRadius: "4px" }}>
                          {asset.asset_type}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace" }}>{asset.serial_number || "N/A"}</td>
                      <td>
                        <span className="badge" style={{
                          fontWeight: 700,
                          fontSize: "11px",
                          background: (asset.status === "available" || asset.status === "free") ? "rgba(16,185,129,0.1)" : (asset.status === "assigned" || asset.status === "allocated") ? "rgba(99,102,241,0.1)" : (asset.status === "maintenance" || asset.status === "under_repair") ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                          color: (asset.status === "available" || asset.status === "free") ? "#10b981" : (asset.status === "assigned" || asset.status === "allocated") ? "#6366f1" : (asset.status === "maintenance" || asset.status === "under_repair") ? "#f59e0b" : "#ef4444"
                        }}>
                          {(asset.status === "allocated" ? "assigned" : asset.status === "under_repair" ? "maintenance" : asset.status).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {asset.employee ? (
                          <span style={{ fontWeight: 600 }}>👤 {asset.employee.first_name} {asset.employee.last_name} ({asset.employee.employee_id})</span>
                        ) : asset.employee_name ? (
                          <span style={{ fontWeight: 600 }}>👤 {asset.employee_name}</span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                      <td>
                        {asset.assigned_at ? new Date(asset.assigned_at).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setEditingAsset(asset);
                              setAssetName(asset.name);
                              setAssetType(asset.asset_type);
                              setAssetSerial(asset.serial_number || "");
                              setAssetStatus(asset.status === "allocated" ? "assigned" : asset.status === "under_repair" ? "maintenance" : asset.status);
                              setAssetEmployeeId(asset.employee_id || "");
                              setShowAssetModal(true);
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteAsset(asset.id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add/Edit Asset */}
        {showAssetModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" }}>
            <div className="glass-card animated" style={{ width: "100%", maxWidth: "500px", padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>{editingAsset ? "Modify Corporate Asset" : "Register New Asset"}</h3>
                <span style={{ cursor: "pointer", fontSize: "24px", fontWeight: 700, color: "var(--text-muted)", lineHeight: 1 }} onClick={() => setShowAssetModal(false)}>×</span>
              </div>
              <form onSubmit={editingAsset ? handleUpdateAsset : handleCreateAsset}>
                <div className="form-group">
                  <label className="form-label">Asset Tag/Name</label>
                  <input type="text" className="form-control" required placeholder="e.g. MacBook Pro M3 16GB" value={assetName} onChange={(e) => setAssetName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Asset Classification Type</label>
                  <select className="form-control" value={assetType} onChange={(e) => setAssetType(e.target.value)}>
                    <option value="Laptop">Laptop / Macbook</option>
                    <option value="Desktop">Desktop PC</option>
                    <option value="Mobile">Mobile / Tablet</option>
                    <option value="Monitor">External Monitor</option>
                    <option value="Peripheral">Peripheral / Keyboard / Mouse</option>
                    <option value="License">Software License / Account</option>
                    <option value="Other">Other Asset</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Serial / License Number</label>
                  <input type="text" className="form-control" placeholder="e.g. C02F83HMD05D" value={assetSerial} onChange={(e) => setAssetSerial(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Inventory Status</label>
                  <select className="form-control" value={assetStatus} onChange={(e) => setAssetStatus(e.target.value)}>
                    <option value="available">Available in Stock</option>
                    <option value="assigned">Assigned to Employee</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="retired">Retired / Written Off</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: "24px" }}>
                  <label className="form-label">Assign to Employee</label>
                  <select className="form-control" value={assetEmployeeId} onChange={(e) => setAssetEmployeeId(e.target.value)}>
                    <option value="">-- Keep Unassigned (Bench) --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px" }}>
                  {editingAsset ? "Save Changes" : "Save Asset"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // EMPLOYEE SELF SERVICE: MY ASSETS & INDUCTION CHECKS
  // =========================================================================

  const renderMyAssetsInduction = () => {
    const completedCount = myInductionTasks.filter(t => t.status === "completed").length;
    const totalCount = myInductionTasks.length;
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
      <div className="animated">
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "32px" }}>🎒</span>
            <div>
              <h2 style={{ margin: 0 }}>My Assets & Onboarding Induction</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>
                View hardware/software assets checked out to you and track your mandatory onboarding checklist tasks.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
          
          {/* Card: Personal Assets */}
          <div className="glass-card">
            <h3 style={{ margin: "0 0 16px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
              🎒 My Assigned Assets ({myAssets.length})
            </h3>
            {myAssets.length === 0 ? (
              <div style={{ padding: "24px 0", fontStyle: "italic", color: "var(--text-muted)", textAlign: "center" }}>
                No corporate hardware, software accounts, or peripheral equipment are currently registered to you.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {myAssets.map(asset => (
                  <div key={asset.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(100,116,139,0.05)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "15px" }}>{asset.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Type: {asset.asset_type} | SN: <span style={{ fontFamily: "monospace" }}>{asset.serial_number || "N/A"}</span>
                      </div>
                    </div>
                    {asset.assigned_at && (
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        Issued: {new Date(asset.assigned_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Induction Checklist */}
          <div className="glass-card">
            <h3 style={{ margin: "0 0 16px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
              📋 My Onboarding Induction Checklist
            </h3>
            {totalCount > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px", fontWeight: 600 }}>
                  <span>Induction Progress</span>
                  <span>{completedCount} / {totalCount} Tasks Completed ({progressPct}%)</span>
                </div>
                <div style={{ height: "8px", background: "rgba(100,116,139,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${progressPct}%`, height: "100%", background: "var(--success)", transition: "width 0.3s ease" }}></div>
                </div>
              </div>
            )}

            {totalCount === 0 ? (
              <div style={{ padding: "24px 0", fontStyle: "italic", color: "var(--text-muted)", textAlign: "center" }}>
                No onboarding induction tasks are currently assigned to you.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {myInductionTasks.map(task => (
                  <div key={task.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", background: task.status === "completed" ? "rgba(16,185,129,0.03)" : "inherit" }}>
                    <input 
                      type="checkbox" 
                      style={{ cursor: "pointer", width: "18px", height: "18px", marginTop: "2px" }}
                      checked={task.status === "completed"}
                      onChange={() => handleToggleInductionStatus(task.id, task.status, true)}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "14.5px", textDecoration: task.status === "completed" ? "line-through" : "none", color: task.status === "completed" ? "var(--text-muted)" : "inherit" }}>
                        {task.task_name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                        {task.description || "No instructions provided."}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderModernDashboard = () => {
    const hr = dashboardMetrics?.hr ?? {};
    const talent = dashboardMetrics?.talent ?? {};
    const resource = dashboardMetrics?.resource ?? {};
    const administration = dashboardMetrics?.administration ?? {};

    const asNumber = (value: any) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    };

    const deptRows = Object.entries(hr.headcount_by_dept ?? {})
      .map(([name, count]) => ({
        name: String(name || "Unassigned"),
        count: asNumber(count)
      }))
      .filter(row => row.count > 0);

    const payrollRows = Array.isArray(hr.monthly_payroll)
      ? hr.monthly_payroll.map((row: any) => ({
          month: row?.month ? String(row.month).slice(0, 7) : "Month",
          total: asNumber(row?.total)
        })).filter((row: any) => row.total > 0)
      : [];

    const pipelineRows = Object.entries(talent.pipeline_statuses ?? {})
      .map(([stage, count]) => ({
        stage: String(stage || "unknown").replace(/_/g, " "),
        count: asNumber(count)
      }))
      .filter(row => row.count > 0);

    const totalEmployees = asNumber(hr.total_employees);
    const attritedEmployees = Math.round((asNumber(hr.attrition_rate) / 100) * totalEmployees);
    const workforceRows = totalEmployees > 0
      ? [
          { name: "Active", value: Math.max(totalEmployees - attritedEmployees, 0), fill: "#2A9D8F" },
          ...(attritedEmployees > 0 ? [{ name: "Attrited", value: attritedEmployees, fill: "#EF4444" }] : [])
        ]
      : [];

    const metrics = [
      { label: "Headcount", value: totalEmployees, tone: "var(--primary)", detail: "Active employees" },
      { label: "Attendance", value: `${asNumber(hr.daily_attendance_pct)}%`, tone: "#2A9D8F", detail: "Clock-in coverage today" },
      { label: "Leave Usage", value: `${asNumber(hr.leave_usage_pct)}%`, tone: "#FFC107", detail: "Approved leave today" },
      { label: "Open Positions", value: asNumber(talent.open_positions), tone: "var(--accent)", detail: "Hiring demand" },
      { label: "Payroll Cost", value: `₹${asNumber(hr.payroll_cost).toLocaleString("en-IN")}`, tone: "#0E243D", detail: "Processed pay total" },
      { label: "Support Tickets", value: asNumber(administration.active_support_tickets), tone: "#EF4444", detail: "Open or in progress" }
    ];

    const emptyState = (title: string) => (
      <div style={{ minHeight: "260px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "12px", background: "rgba(var(--primary-rgb),0.02)" }}>
        <span style={{ fontSize: "13px", fontWeight: 600 }}>{title}</span>
      </div>
    );

    const chartCard = (title: string, subtitle: string, content: React.ReactNode) => (
      <div className="glass-card" style={{ padding: "18px", borderRadius: "12px", minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start", marginBottom: "14px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>{title}</h3>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>{subtitle}</p>
          </div>
        </div>
        <div style={{ width: "100%", minWidth: 0, height: "280px" }}>
          {content}
        </div>
      </div>
    );

    if (metricsLoading) {
      return (
        <div className="animated">
          <div className="glass-card glow" style={{ padding: "56px", textAlign: "center" }}>
            <div className="loading-spinner" style={{ margin: "0 auto 18px" }} />
            <h2 style={{ margin: 0, fontSize: "20px" }}>Syncing Dashboard Metrics</h2>
            <p style={{ color: "var(--text-muted)", margin: "8px 0 0" }}>Retrieving live HRMS signals...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 0.8fr)", gap: "18px" }}>
          <div className="glass-card glow" style={{ padding: "24px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.08), rgba(var(--accent-rgb),0.06))" }}>
            <div style={{ maxWidth: "760px" }}>
              <p style={{ margin: "0 0 8px", color: "var(--accent)", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>People Operations Command Center</p>
              <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>Organisation Dashboard</h2>
              <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.6 }}>
                A live view of workforce health, hiring momentum, payroll movement, resource capacity, and service load.
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: "20px", borderRadius: "12px" }}>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)", fontWeight: 700 }}>Subscription</p>
            <div style={{ marginTop: "8px", fontSize: "22px", fontWeight: 800, color: "var(--primary)", textTransform: "capitalize" }}>
              {administration.subscription_plan || "Growth"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "16px" }}>
              <div>
                <div style={{ fontSize: "20px", fontWeight: 800 }}>{asNumber(resource.project_resources)}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Allocated</div>
              </div>
              <div>
                <div style={{ fontSize: "20px", fontWeight: 800 }}>{asNumber(resource.bench_resources)}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Bench</div>
              </div>
            </div>
          </div>
        </section>

        {showMetricsDashboard && (
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px" }}>
            {metrics.map(metric => (
              <div key={metric.label} className="glass-card" style={{ padding: "16px", borderRadius: "10px", minHeight: "118px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>{metric.label}</div>
                <div style={{ marginTop: "10px", color: metric.tone, fontSize: "26px", fontWeight: 800, lineHeight: 1 }}>{metric.value}</div>
                <div style={{ marginTop: "8px", color: "var(--text-muted)", fontSize: "12px" }}>{metric.detail}</div>
              </div>
            ))}
          </section>
        )}

        {showAttendanceTrendDashboard && (
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "18px" }}>
            {chartCard("Headcount by Department", `${deptRows.length} active departments`, deptRows.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptRows} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--primary-rgb),0.12)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px" }} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            ) : emptyState("No department headcount data available"))}

            {chartCard("Monthly Payroll Trend", "Last available processed payroll months", payrollRows.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payrollRows} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--primary-rgb),0.12)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: any) => `₹${asNumber(value).toLocaleString("en-IN")}`} contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: "var(--accent)" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : emptyState("No payroll trend data available"))}

            {chartCard("Recruitment Pipeline", `${asNumber(talent.total_candidates)} candidates in scope`, pipelineRows.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineRows} layout="vertical" margin={{ top: 8, right: 12, left: 18, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--primary-rgb),0.12)" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="stage" width={110} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px" }} />
                  <Bar dataKey="count" fill="var(--accent)" radius={[0, 6, 6, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : emptyState("No recruitment pipeline data available"))}

            {chartCard("Workforce Composition", "Active vs attrited workforce", workforceRows.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={workforceRows} cx="50%" cy="50%" innerRadius={66} outerRadius={96} paddingAngle={4} dataKey="value" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {workforceRows.map(row => <Cell key={row.name} fill={row.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : emptyState("No workforce composition data available"))}
          </section>
        )}

        {showAiInsightsDashboard && (
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            {[
              ["Assets Assigned", `${asNumber(resource.assigned_assets)} / ${asNumber(resource.total_assets)}`],
              ["Induction Progress", `${asNumber(resource.induction_progress_pct)}%`],
              ["Active Allocations", asNumber(resource.active_allocations)],
              ["Expecting Bench", asNumber(resource.expecting_to_bench)],
              ["Pipeline Projects", asNumber(resource.pipeline_projects)]
            ].map(([label, value]) => (
              <div key={label} className="glass-card" style={{ padding: "16px", borderRadius: "10px" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: 700 }}>{label}</div>
                <div style={{ marginTop: "8px", fontSize: "22px", fontWeight: 800, color: "var(--primary)" }}>{value}</div>
              </div>
            ))}
          </section>
        )}
      </div>
    );
  };

  // Dashboard / Portal View
  return (
    <div className="dashboard-container-topnav">
      <Toaster position="top-right" />
      {/* 1. Dark Admin Top Bar */}
      <div className="wp-admin-bar">
        <div className="wp-admin-bar-left">
          {/* Complete Logo */}
          <div style={{ display: "flex", alignItems: "center", cursor: "pointer", marginRight: "12px" }} onClick={() => { setActiveView("dashboard"); }} title="CogniHR Dashboard">
            <img 
              src="/logo.png" 
              alt="CogniHR" 
              style={{ height: "30px", width: "auto", objectFit: "contain" }} 
              onError={(e) => { 
                e.currentTarget.style.display = 'none'; 
                e.currentTarget.parentElement!.innerHTML = '<span style="color:#fff;font-weight:bold;font-size:18px;letter-spacing:-0.5px;">CogniHR</span>'; 
              }} 
            />
          </div>

          {/* Quick info indicators / widgets */}
          {currentUser?.role !== "super_admin" && (
            <>
              <div className="wp-admin-widget" title="Active Tickets Pending">
                <HeaderIcon name="tickets" size={15} style={{ marginRight: "4px" }} /> <span className="wp-admin-bubble">0</span>
              </div>
              <div className="wp-admin-widget" title="Notifications">
                <HeaderIcon name="notifications" size={15} style={{ marginRight: "4px" }} /> <span className="wp-admin-bubble alert">1</span>
              </div>
              <div className="wp-admin-widget" onClick={() => { setActiveView("dashboard"); }} title="Overview dashboard">
                <HeaderIcon name="dashboard" size={15} style={{ marginRight: "4px" }} /> Dashboard
              </div>
            </>
          )}

          {/* Workspace Switcher */}
          {currentUser?.role !== "super_admin" && (
            <div className="wp-admin-workspace-switcher">
              <button 
                className={`wp-workspace-btn ${activeManagementTab === "" ? "active" : ""}`}
                onClick={() => {
                  setActiveManagementTab("");
                  setActiveView("my-attendance");
                }}
              >
                <HeaderIcon name="profile" size={13} style={{ marginRight: "4px" }} /> Employee Self Service (ESS)
              </button>
              {showHr && (
                <button 
                  className={`wp-workspace-btn ${activeManagementTab === "hr_management" ? "active" : ""}`}
                  onClick={() => {
                    setActiveManagementTab("hr_management");
                    setActiveView("dashboard");
                  }}
                >
                  <HeaderIcon name="core_hr" size={13} style={{ marginRight: "4px" }} /> Core HR
                </button>
              )}
              {showRecruitment && (
                <button 
                  className={`wp-workspace-btn ${activeManagementTab === "recruitment" ? "active" : ""}`}
                  onClick={() => {
                    setActiveManagementTab("recruitment");
                    setActiveView("talent-mgmt");
                    setTalentActiveTab("positions");
                  }}
                >
                  <HeaderIcon name="talent" size={13} style={{ marginRight: "4px" }} /> Talent Hub
                </button>
              )}
              {showResource && (
                <button 
                  className={`wp-workspace-btn ${activeManagementTab === "resource_management" ? "active" : ""}`}
                  onClick={() => {
                    setActiveManagementTab("resource_management");
                    setActiveView("appraisals");
                  }}
                >
                  <HeaderIcon name="performance" size={13} style={{ marginRight: "4px" }} /> Performance Hub
                </button>
              )}
            </div>
          )}
        </div>

        <div className="wp-admin-bar-right">
          {orgName && (
            <span className="tenant-badge" style={{ marginRight: "4px" }}>
              {orgName}
            </span>
          )}
          <span className="wp-admin-welcome">
            Welcome, <span className="wp-admin-username">{currentUser?.email?.split('@')[0] || "admin"}</span>
          </span>
          <div className="wp-admin-avatar" title={currentUser?.email}>
            {currentUser?.email?.substring(0, 2).toUpperCase() || "AD"}
          </div>

          <button 
            className="wp-admin-theme-toggle" 
            onClick={() => setAppTheme(t => t === "light" ? "mixed" : t === "mixed" ? "enterprise" : t === "enterprise" ? "corporate" : "light")} 
            title="Toggle theme"
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "inherit", display: "flex", alignItems: "center" }}
          >
            {appTheme === "light" ? "✨" : appTheme === "mixed" ? "🌗" : appTheme === "enterprise" ? "🏢" : "💼"}
          </button>

          <span className="wp-admin-logout" onClick={handleLogout} title="Sign out of workspace">
            Logout
          </span>
        </div>
      </div>

      {/* 2. Teal Menu Bar (visible to normal users only) */}
      {currentUser?.role !== "super_admin" && (
        <div className="wp-teal-menu-bar">
          <div className="wp-menu-items-container">
            {activeManagementTab === "" && (
              <>
                <div className={`wp-menu-item ${activeView === "my-profile" ? "active" : ""}`} onClick={() => setActiveView("my-profile")}>
                  <span className="wp-menu-icon"><HeaderIcon name="profile" size={18} /></span>
                  <span className="wp-menu-label">Profile</span>
                </div>
                <div className={`wp-menu-item ${activeView === "my-attendance" ? "active" : ""}`} onClick={() => setActiveView("my-attendance")}>
                  <span className="wp-menu-icon"><HeaderIcon name="attendance" size={18} /></span>
                  <span className="wp-menu-label">Attendance</span>
                </div>
                <div className={`wp-menu-item ${activeView === "my-leave" ? "active" : ""}`} onClick={() => setActiveView("my-leave")}>
                  <span className="wp-menu-icon"><HeaderIcon name="leave" size={18} /></span>
                  <span className="wp-menu-label">Leave</span>
                </div>
                <div className={`wp-menu-item ${activeView === "my-expenses" ? "active" : ""}`} onClick={() => setActiveView("my-expenses")}>
                  <span className="wp-menu-icon"><HeaderIcon name="expenses" size={18} /></span>
                  <span className="wp-menu-label">Expense Claims</span>
                </div>
                <div className={`wp-menu-item ${activeView === "my-payslips" ? "active" : ""}`} onClick={() => setActiveView("my-payslips")}>
                  <span className="wp-menu-icon"><HeaderIcon name="payslips" size={18} /></span>
                  <span className="wp-menu-label">Payslips</span>
                </div>
                <div className={`wp-menu-item ${activeView === "my-payroll" ? "active" : ""}`} onClick={() => setActiveView("my-payroll")}>
                  <span className="wp-menu-icon"><HeaderIcon name="payroll" size={18} /></span>
                  <span className="wp-menu-label">Payroll</span>
                </div>
                <div className={`wp-menu-item ${activeView === "my-fbp-tax" ? "active" : ""}`} onClick={() => setActiveView("my-fbp-tax")}>
                  <span className="wp-menu-icon"><HeaderIcon name="tax" size={18} /></span>
                  <span className="wp-menu-label">Tax &amp; FBP</span>
                </div>
                <div className={`wp-menu-item ${activeView === "my-insurance" ? "active" : ""}`} onClick={() => setActiveView("my-insurance")}>
                  <span className="wp-menu-icon"><HeaderIcon name="insurance" size={18} /></span>
                  <span className="wp-menu-label">Insurance</span>
                </div>
                <div className={`wp-menu-item ${activeView === "my-assets-induction" ? "active" : ""}`} onClick={() => setActiveView("my-assets-induction")}>
                  <span className="wp-menu-icon"><HeaderIcon name="assets" size={18} /></span>
                  <span className="wp-menu-label">Assets</span>
                </div>
                <div className={`wp-menu-item ${activeView === "my-documents" ? "active" : ""}`} onClick={() => setActiveView("my-documents")}>
                  <span className="wp-menu-icon"><HeaderIcon name="documents" size={18} /></span>
                  <span className="wp-menu-label">Documents</span>
                </div>
                <div className={`wp-menu-item ${activeView === "ai-copilot" ? "active" : ""}`} onClick={() => setActiveView("ai-copilot")}>
                  <span className="wp-menu-icon"><HeaderIcon name="ai" size={18} /></span>
                  <span className="wp-menu-label">AI Copilot</span>
                </div>
                <div className={`wp-menu-item ${activeView === "support-desk" ? "active" : ""}`} onClick={() => setActiveView("support-desk")}>
                  <span className="wp-menu-icon"><HeaderIcon name="help" size={18} /></span>
                  <span className="wp-menu-label">Help Desk</span>
                </div>
              </>
            )}

            {activeManagementTab === "hr_management" && (
              <>
                <div className={`wp-menu-item ${activeView === "dashboard" ? "active" : ""}`} onClick={() => setActiveView("dashboard")}>
                  <span className="wp-menu-icon"><HeaderIcon name="dashboard" size={18} /></span>
                  <span className="wp-menu-label">Overview</span>
                </div>
                {currentUser?.role === "hr_admin" && (
                  <div className={`wp-menu-item ${activeView === "employees" ? "active" : ""}`} onClick={() => setActiveView("employees")}>
                    <span className="wp-menu-icon"><HeaderIcon name="performance" size={18} /></span>
                    <span className="wp-menu-label">Employees</span>
                  </div>
                )}
                <div className={`wp-menu-item ${activeView === "org-structure" ? "active" : ""}`} onClick={() => setActiveView("org-structure")}>
                  <span className="wp-menu-icon"><HeaderIcon name="core_hr" size={18} /></span>
                  <span className="wp-menu-label">Org Structure</span>
                </div>
                <div className={`wp-menu-item ${activeView === "org-attendance" ? "active" : ""}`} onClick={() => setActiveView("org-attendance")}>
                  <span className="wp-menu-icon"><HeaderIcon name="attendance" size={18} /></span>
                  <span className="wp-menu-label">Attendance</span>
                </div>
                <div className={`wp-menu-item ${activeView === "shift-management" ? "active" : ""}`} onClick={() => setActiveView("shift-management")}>
                  <span className="wp-menu-icon"><HeaderIcon name="attendance" size={18} /></span>
                  <span className="wp-menu-label">Shift Management</span>
                </div>
                <div className={`wp-menu-item ${activeView === "org-leave" ? "active" : ""}`} onClick={() => setActiveView("org-leave")}>
                  <span className="wp-menu-icon"><HeaderIcon name="leave" size={18} /></span>
                  <span className="wp-menu-label">Leave Planner</span>
                </div>
                <div className={`wp-menu-item ${activeView === "org-payroll" ? "active" : ""}`} onClick={() => setActiveView("org-payroll")}>
                  <span className="wp-menu-icon"><HeaderIcon name="payroll" size={18} /></span>
                  <span className="wp-menu-label">Payroll Fintech</span>
                </div>
                <div className={`wp-menu-item ${activeView === "org-fbp-tax" ? "active" : ""}`} onClick={() => setActiveView("org-fbp-tax")}>
                  <span className="wp-menu-icon"><HeaderIcon name="tax" size={18} /></span>
                  <span className="wp-menu-label">FBP &amp; Tax</span>
                </div>
                <div className="wp-menu-dropdown" ref={dropdownRef}>
                  <div
                    className={`wp-menu-dropdown-toggle ${(activeView === "org-insurance" || activeView === "org-car-lease") ? "active" : ""}`}
                    onClick={() => setBenefitsDropdownOpen(!benefitsDropdownOpen)}
                  >
                    <span className="wp-menu-icon"><HeaderIcon name="insurance" size={18} /></span>
                    <span className="wp-menu-label">Benefits</span>
                    <span className="wp-arrow">▾</span>
                  </div>
                  {benefitsDropdownOpen && (
                    <div className="wp-menu-dropdown-content">
                      <div
                        className={`wp-menu-dropdown-item ${activeView === "org-insurance" ? "active" : ""}`}
                        onClick={() => { setActiveView("org-insurance"); setBenefitsDropdownOpen(false); }}
                      >
                        <span className="wp-menu-icon"><HeaderIcon name="insurance" size={16} /></span>
                        <span className="wp-menu-label">Insurance</span>
                      </div>
                      <div
                        className={`wp-menu-dropdown-item ${activeView === "org-car-lease" ? "active" : ""}`}
                        onClick={() => { setActiveView("org-car-lease"); setBenefitsDropdownOpen(false); }}
                      >
                        <span className="wp-menu-icon"><HeaderIcon name="expenses" size={16} /></span>
                        <span className="wp-menu-label">Car Lease Program</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className={`wp-menu-item ${activeView === "policy-center" ? "active" : ""}`} onClick={() => setActiveView("policy-center")}>
                  <span className="wp-menu-icon"><HeaderIcon name="documents" size={18} /></span>
                  <span className="wp-menu-label">Policy Center</span>
                </div>
                <div className={`wp-menu-item ${activeView === "offboarding" ? "active" : ""}`} onClick={() => setActiveView("offboarding")}>
                  <span className="wp-menu-icon"><HeaderIcon name="profile" size={18} /></span>
                  <span className="wp-menu-label">Exit Center</span>
                </div>
                {(currentUser?.role === "hr_admin" || currentUser?.role === "hr_operations") && (
                  <div className={`wp-menu-item ${activeView === "project-allocations" ? "active" : ""}`} onClick={() => setActiveView("project-allocations")}>
                    <span className="wp-menu-icon"><HeaderIcon name="assets" size={18} /></span>
                    <span className="wp-menu-label">Allocations</span>
                  </div>
                )}
                {currentUser?.role === "hr_admin" && (
                  <div className={`wp-menu-item ${activeView === "rmg-checklist" ? "active" : ""}`} onClick={() => setActiveView("rmg-checklist")}>
                    <span className="wp-menu-icon"><HeaderIcon name="leave" size={18} /></span>
                    <span className="wp-menu-label">Checklist</span>
                  </div>
                )}
                {currentUser?.role === "hr_admin" && (
                  <>
                    <div className={`wp-menu-item ${activeView === "user-mgmt" ? "active" : ""}`} onClick={() => setActiveView("user-mgmt")}>
                      <span className="wp-menu-icon"><HeaderIcon name="profile" size={18} /></span>
                      <span className="wp-menu-label">User Management</span>
                    </div>
                    <div className={`wp-menu-item ${activeView === "reports" ? "active" : ""}`} onClick={() => setActiveView("reports")}>
                      <span className="wp-menu-icon"><HeaderIcon name="payslips" size={18} /></span>
                      <span className="wp-menu-label">Reports</span>
                    </div>
                    <div className={`wp-menu-item ${activeView === "erp-masters" ? "active" : ""}`} onClick={() => setActiveView("erp-masters")}>
                      <span className="wp-menu-icon"><HeaderIcon name="tax" size={18} /></span>
                      <span className="wp-menu-label">System Configuration</span>
                    </div>
                  </>
                )}
              </>
            )}

            {activeManagementTab === "recruitment" && (
              <>
                <div className={`wp-menu-item ${activeView === "talent-mgmt" && talentActiveTab === "requisitions" ? "active" : ""}`} onClick={() => { setActiveView("talent-mgmt"); setTalentActiveTab("requisitions"); }}>
                  <span className="wp-menu-icon"><HeaderIcon name="leave" size={18} /></span>
                  <span className="wp-menu-label">Workforce Planning</span>
                </div>
                <div className={`wp-menu-item ${activeView === "talent-mgmt" && talentActiveTab === "positions" ? "active" : ""}`} onClick={() => { setActiveView("talent-mgmt"); setTalentActiveTab("positions"); }}>
                  <span className="wp-menu-icon"><HeaderIcon name="profile" size={18} /></span>
                  <span className="wp-menu-label">Job Requisition</span>
                </div>
                <div className={`wp-menu-item ${activeView === "talent-mgmt" && talentActiveTab === "profiles" ? "active" : ""}`} onClick={() => { setActiveView("talent-mgmt"); setTalentActiveTab("profiles"); }}>
                  <span className="wp-menu-icon"><HeaderIcon name="documents" size={18} /></span>
                  <span className="wp-menu-label">Talent Pool</span>
                </div>
                <div className={`wp-menu-item ${activeView === "talent-mgmt" && talentActiveTab === "matcher" ? "active" : ""}`} onClick={() => { setActiveView("talent-mgmt"); setTalentActiveTab("matcher"); }}>
                  <span className="wp-menu-icon"><HeaderIcon name="ai" size={18} /></span>
                  <span className="wp-menu-label">AI Match</span>
                </div>
                <div className={`wp-menu-item ${activeView === "offer-mgmt" ? "active" : ""}`} onClick={() => setActiveView("offer-mgmt")}>
                  <span className="wp-menu-icon"><HeaderIcon name="payslips" size={18} /></span>
                  <span className="wp-menu-label">Offer</span>
                </div>
                <div className={`wp-menu-item ${activeView === "onboarding-checklist" ? "active" : ""}`} onClick={() => setActiveView("onboarding-checklist")}>
                  <span className="wp-menu-icon"><HeaderIcon name="assets" size={18} /></span>
                  <span className="wp-menu-label">Onboarding</span>
                </div>
              </>
            )}

            {activeManagementTab === "resource_management" && (
              <>
                <div className={`wp-menu-item ${activeView === "appraisals" ? "active" : ""}`} onClick={() => setActiveView("appraisals")}>
                  <span className="wp-menu-icon"><HeaderIcon name="dashboard" size={18} /></span>
                  <span className="wp-menu-label">Appraisals</span>
                </div>
                <div className={`wp-menu-item ${activeView === "achievements-awards" ? "active" : ""}`} onClick={() => setActiveView("achievements-awards")}>
                  <span className="wp-menu-icon"><HeaderIcon name="performance" size={18} /></span>
                  <span className="wp-menu-label">Achievements &amp; Awards</span>
                </div>
                {currentUser?.role === "hr_admin" && (
                  <div className={`wp-menu-item ${activeView === "ai-promotions" ? "active" : ""}`} onClick={() => setActiveView("ai-promotions")}>
                    <span className="wp-menu-icon"><HeaderIcon name="ai" size={18} /></span>
                    <span className="wp-menu-label">AI Promotions</span>
                  </div>
                )}
              </>
            )}

            {/* Render Super Admin options link if logged in as admin */}
            {currentUser?.role === "super_admin" && (
              <div className={`wp-menu-item ${activeView === "nexus-mgmt" ? "active" : ""}`} onClick={() => setActiveView("nexus-mgmt")}>
                <span className="wp-menu-icon"><HeaderIcon name="dashboard" size={18} /></span>
                <span className="wp-menu-label">Logical Control Plane</span>
              </div>
            )}
          </div>

          {/* Screen Options and Help Buttons */}
          <div className="wp-menu-right-options">
            <button 
              className={`wp-option-dropdown-btn ${showScreenOptions ? "active" : ""}`} 
              onClick={() => {
                setShowScreenOptions(!showScreenOptions);
                setShowHelpPanel(false);
              }}
            >
              Screen Options <span className="wp-arrow">▼</span>
            </button>
            <button 
              className={`wp-option-dropdown-btn ${showHelpPanel ? "active" : ""}`} 
              onClick={() => {
                setShowHelpPanel(!showHelpPanel);
                setShowScreenOptions(false);
              }}
            >
              Help <span className="wp-arrow">▼</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Sliding Panel Drawers */}
      {showScreenOptions && (
        <div className="wp-sliding-panel" style={{ animation: "viewFadeIn 0.3s ease-out forwards" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div>
              <h3 className="wp-sliding-panel-title" style={{ margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700 }}>
                ⚙️ Workspace Screen Controls
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "4px 0 0" }}>
                Personalize and configure your live dashboard display segments, visual density, and motion behaviors.
              </p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "32px", marginTop: "16px" }}>
            <div style={{ borderRight: "1px solid var(--border-color)", paddingRight: "32px" }}>
              <h4 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px", color: "var(--primary)" }}>
                📊 Visible Dashboard Modules
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <label className="wp-option-checkbox-label" style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
                  <input 
                    type="checkbox" 
                    style={{ marginTop: "3px" }}
                    checked={showMetricsDashboard} 
                    onChange={(e) => setShowMetricsDashboard(e.target.checked)} 
                  />
                  <div>
                    <strong>Analytics Counters</strong>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Active headcounts, leave metrics, and payroll status.</div>
                  </div>
                </label>
                <label className="wp-option-checkbox-label" style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
                  <input 
                    type="checkbox" 
                    style={{ marginTop: "3px" }}
                    checked={showAiInsightsDashboard} 
                    onChange={(e) => setShowAiInsightsDashboard(e.target.checked)} 
                  />
                  <div>
                    <strong>HR Ledger logs</strong>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Recent personnel activities log and onboarding status table.</div>
                  </div>
                </label>
                <label className="wp-option-checkbox-label" style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
                  <input 
                    type="checkbox" 
                    style={{ marginTop: "3px" }}
                    checked={showAttendanceTrendDashboard} 
                    onChange={(e) => setShowAttendanceTrendDashboard(e.target.checked)} 
                  />
                  <div>
                    <strong>Pipeline Charts</strong>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Interactive recruitment funnel and weekly attendance trends.</div>
                  </div>
                </label>
                <label className="wp-option-checkbox-label" style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
                  <input 
                    type="checkbox" 
                    style={{ marginTop: "3px" }}
                    checked={showUserProfileDashboard} 
                    onChange={(e) => setShowUserProfileDashboard(e.target.checked)} 
                  />
                  <div>
                    <strong>Profile Overview</strong>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Self-service summary card of current logged-in employee.</div>
                  </div>
                </label>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px", color: "var(--primary)" }}>
                ⚡ Interface Personalization
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Density Profile</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      type="button"
                      className="btn btn-secondary" 
                      style={{ padding: "6px 12px", fontSize: "11px", flexGrow: 1, borderColor: uiDensity === "comfort" ? "var(--primary)" : "var(--border-color)", background: uiDensity === "comfort" ? "rgba(var(--primary-rgb), 0.05)" : "transparent" }}
                      onClick={() => setUiDensity("comfort")}
                    >
                      🌈 Comfort Style
                    </button>
                    <button 
                      type="button"
                      className="btn btn-secondary" 
                      style={{ padding: "6px 12px", fontSize: "11px", flexGrow: 1, borderColor: uiDensity === "compact" ? "var(--primary)" : "var(--border-color)", background: uiDensity === "compact" ? "rgba(var(--primary-rgb), 0.05)" : "transparent" }}
                      onClick={() => setUiDensity("compact")}
                    >
                      ⚡ Compact Density
                    </button>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Visual Enhancements</span>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={enableAnimations} 
                      onChange={(e) => setEnableAnimations(e.target.checked)} 
                    />
                    Enable smooth micro-animations & transitions
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHelpPanel && (
        <div className="wp-sliding-panel" style={{ animation: "viewFadeIn 0.3s ease-out forwards" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div>
              <h3 className="wp-sliding-panel-title" style={{ margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700 }}>
                💡 Diagnostic Telemetry &amp; System Center
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "4px 0 0" }}>
                Learn quick navigational patterns, AI matches commands, and review system configuration settings.
              </p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px", marginTop: "16px" }}>
            <div style={{ borderRight: "1px solid var(--border-color)", paddingRight: "32px" }}>
              <h4 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px", color: "var(--primary)" }}>
                🚀 Navigational Shortcuts &amp; Best Practices
              </h4>
              <ul style={{ listStyleType: "none", paddingLeft: 0, display: "flex", flexDirection: "column", gap: "12px", fontSize: "12.5px", lineHeight: "1.5" }}>
                <li style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "14px" }}>🔑</span>
                  <div>
                    <strong>Workspace Routing:</strong> Switch between <strong>💬 Employee Self Service (ESS)</strong> (individual attendance, leaves, payslips) and <strong>🏢 Core HR</strong> (organization administration dashboard) at the left of top navbar.
                  </div>
                </li>
                <li style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "14px" }}>🤖</span>
                  <div>
                    <strong>AI Recruiting Matcher:</strong> Open the Recruitment tab in HR Operations, then click **AI Matcher** to score profiles against job requirements with detailed fits insights.
                  </div>
                </li>
                <li style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "14px" }}>📜</span>
                  <div>
                    <strong>Groq AI Copilot:</strong> Access the **AI Copilot** widget in your personal workspace workspace to query HR policy documentations or summarize active structure sheets.
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px", color: "var(--primary)" }}>
                📡 Live Gateway Diagnostics
              </h4>
              <table style={{ width: "100%", fontSize: "12.5px", borderCollapse: "collapse" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "8px 0", color: "var(--text-muted)" }}>REST Endpoint:</td>
                    <td style={{ padding: "8px 0", textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>{API_BASE_URL}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "8px 0", color: "var(--text-muted)" }}>Logical Organization:</td>
                    <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 600, color: "var(--accent)" }}>{orgName}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "8px 0", color: "var(--text-muted)" }}>Database Sharding:</td>
                    <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 600 }}>
                      <span style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>SCHEMA-ISOLATED</span>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "8px 0", color: "var(--text-muted)" }}>Connection Health:</td>
                    <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 600 }}>
                      <span style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>🟢 ONLINE</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0", color: "var(--text-muted)" }}>Current RBAC Role:</td>
                    <td style={{ padding: "8px 0", textAlign: "right", textTransform: "uppercase", fontWeight: 700, color: "var(--primary)" }}>{currentUser?.role.replace("_", " ")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Primary Content View Panel */}
      <main className="wp-content-panel-horizontal">
        {/* Horizontal Breadcrumb & Section Header */}
        <div className="wp-content-header">
          <div className="wp-header-breadcrumb-area">
            <h1>
              {{
                "dashboard": "Overview Dashboard",
                "user-mgmt": "User Management",
                "ai-copilot": "AI Copilot",
                "reports": "Reports & Analytics",
                "erp-masters": "System Configuration",
                "support-desk": "Help & Support",
                "my-attendance": "My Attendance",
                "my-leave": "My Leave",
                "my-payroll": "My Payslips",
                "my-profile": "My Profile",
                "my-expenses": "My Expense Claims",
                "my-payslips": "My Payslips",
                "my-documents": "My Documents",
                "my-fbp-tax": "My Tax & FBP",
                "employees": "Employee Directory",
                "org-attendance": "Attendance Management",
                "org-leave": "Leave Planner",
                "org-payroll": "Payroll Fintech",
                "org-fbp-tax": "FBP & Tax Portal",
                "org-insurance": "Benefits",
                "org-car-lease": "Car Lease Hub",
                "org-structure": "Org Structure",
                "shift-management": "Shift Management",
                "policy-center": "Policy Center",
                "talent-mgmt": "Recruitment Hub",
                "jd-matcher": "AI JD Matcher",
                "appraisals": "Appraisals",
                "ai-promotions": "AI Promotions",
                "exit-center": "Exit Center",
                "nexus-mgmt": "CogniHR Control Plane",
                "onboarding-checklist": "Onboarding Induction Checklist",
                "rmg-checklist": "Checklist",
                "asset-registry": "Asset Registry"
              }[activeView] || (activeView.charAt(0).toUpperCase() + activeView.slice(1).replace(/-/g, " "))}
            </h1>
            <p>
              Home / {{
                "dashboard": "Overview Dashboard",
                "user-mgmt": "User Management",
                "ai-copilot": "AI Copilot",
                "reports": "Reports & Analytics",
                "erp-masters": "System Configuration",
                "support-desk": "Help & Support",
                "my-attendance": "My Attendance",
                "my-leave": "My Leave",
                "my-payroll": "My Payslips",
                "my-profile": "My Profile",
                "my-expenses": "My Expense Claims",
                "my-payslips": "My Payslips",
                "my-documents": "My Documents",
                "my-fbp-tax": "My Tax & FBP",
                "employees": "Employee Directory",
                "org-attendance": "Attendance Management",
                "org-leave": "Leave Planner",
                "org-payroll": "Payroll Fintech",
                "org-fbp-tax": "FBP & Tax Portal",
                "org-insurance": "Benefits",
                "org-car-lease": "Car Lease Hub",
                "org-structure": "Org Structure",
                "shift-management": "Shift Management",
                "policy-center": "Policy Center",
                "talent-mgmt": "Recruitment Hub",
                "jd-matcher": "AI JD Matcher",
                "appraisals": "Appraisals",
                "ai-promotions": "AI Promotions",
                "exit-center": "Exit Center",
                "nexus-mgmt": "CogniHR Control Plane",
                "onboarding-checklist": "Onboarding Checklist",
                "rmg-checklist": "Checklist",
                "asset-registry": "Asset Registry"
              }[activeView] || (activeView.charAt(0).toUpperCase() + activeView.slice(1).replace(/-/g, " "))}
            </p>
          </div>
          
          <div className="wp-header-search-bar">
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "var(--text-muted)", pointerEvents: "none" }}>🔍</span>
            <input type="text" placeholder="Search resources..." className="wp-search-input" />
          </div>
        </div>

        {!isViewAllowed(activeView) ? (
          renderAccessDenied()
        ) : (
          <>
            {/* 1. OVERVIEW VIEW */}
            {activeView === "dashboard" && renderModernDashboard()}

        {/* 2. EMPLOYEES VIEW (HR Admin only) */}
        {activeView === "employees" && (
          <div className="animated">
            {activeView.startsWith("org-") && (
              <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
                <select 
                  className="form-control" 
                  style={{ maxWidth: "400px" }}
                  value={hrSelectedEmployeeId || ""}
                  onChange={(e) => setHrSelectedEmployeeId(e.target.value)}
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="glass-card" style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "32px" }}>👥</span>
                <div>
                  <h2 style={{ margin: 0 }}>Employee Master Directory</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Centralised repository of all active employee profiles — corporate designations, functional roles, project allocations, statutory identifiers (PAN, UAN, PF), and employment status across the organisation.</p>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", gap: "16px" }}>
              <div style={{ display: "flex", gap: "12px", flexGrow: 1 }}>
                <input type="text" className="form-control" style={{ maxWidth: "320px" }} placeholder="Search name or ID..." value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)} />
                <button className="btn btn-secondary" onClick={fetchEmployees}>Filter</button>
              </div>
              <button className="btn btn-primary" onClick={() => setShowOnboardModal(true)}>
                Onboard New Employee
              </button>
            </div>

            <div className="glass-card">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Corporate Designation</th>
                      <th>Functional Title</th>
                      <th>Active Project Role</th>
                      <th>Type & Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>No employee records found. Click Onboard to bootstrap.</td>
                      </tr>
                    ) : (
                      employees.map((emp) => {
                        const funcTitle = functionalTitles.find(t => t.id === emp.functional_title_id);
                        const funcTitleName = funcTitle ? funcTitle.name : (emp.functional_title_id || "Unassigned");
                        return (
                          <tr key={emp.id}>
                            <td>
                              <div style={{ fontWeight: 6 }}>{emp.first_name} {emp.last_name}</div>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{emp.employee_id} | {emp.email || "No email"}</div>
                            </td>
                            <td>
                              <span className="badge" style={{ background: "rgba(139, 92, 246, 0.1)", color: "var(--accent)" }}>{emp.grade || "L1"}</span>
                            </td>
                            <td>
                              <span style={{ fontSize: "13px" }}>{funcTitleName}</span>
                            </td>
                            <td>
                              {getActiveProjectRole(emp)}
                            </td>
                            <td>
                              <div style={{ fontSize: "12px", textTransform: "capitalize", marginBottom: "4px" }}>{emp.employment_type}</div>
                              <span className={`badge ${emp.employment_status === "active" ? "badge-success" : "badge-danger"}`}>
                                {emp.employment_status}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => handleEditProfile(emp)}>
                                View/Edit Profile
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Onboard Employee Modal */}
            {showOnboardModal && (
              <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                <div className="glass-card animated" style={{ width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h2>Onboard Employee Profile</h2>
                    <span style={{ cursor: "pointer", fontSize: "20px", fontWeight: 7 }} onClick={() => { setShowOnboardModal(false); setOnboardDuplicateWarning(false); }}>×</span>
                  </div>
                  
                  <form onSubmit={handleOnboardSubmit}>
                    {onboardDuplicateWarning && (
                      <div className="alert alert-warning" style={{ background: "rgba(245, 158, 11, 0.12)", border: "1px solid var(--warning)", padding: "12px", borderRadius: "8px", color: "var(--warning)", marginBottom: "16px", fontSize: "13px" }}>
                        ⚠️ An employee with the name <strong>{empFirst} {empLast}</strong> already exists. If this is a duplicate entry, please double-check. Click <strong>"Confirm & Onboard"</strong> to proceed anyway.
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">Employee ID</label>
                        <input type="text" className="form-control" required value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="EMP-1004" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Joining Date</label>
                        <input type="date" className="form-control" required value={empJoining} onChange={(e) => setEmpJoining(e.target.value)} />
                      </div>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">First Name</label>
                        <input type="text" className="form-control" required value={empFirst} onChange={(e) => { setEmpFirst(e.target.value); setOnboardDuplicateWarning(false); }} placeholder="Jane" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Last Name</label>
                        <input type="text" className="form-control" required value={empLast} onChange={(e) => { setEmpLast(e.target.value); setOnboardDuplicateWarning(false); }} placeholder="Smith" />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input type="text" className="form-control" value={empPhone} onChange={(e) => setEmpPhone(e.target.value)} placeholder="+1 234-567-890" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Employment Type</label>
                        <select className="form-control" value={empType} onChange={(e) => setEmpType(e.target.value)}>
                          <option value="full-time">Full Time</option>
                          <option value="part-time">Part Time</option>
                          <option value="contractor">Contractor</option>
                          <option value="intern">Intern</option>
                        </select>
                      </div>
                    </div>

                    <h4 style={{ margin: "20px 0 10px", color: "var(--primary)" }}>Optionally Setup Portal Credentials</h4>
                    
                    <div className="form-group">
                      <label className="form-label">Work Email</label>
                      <input type="email" className="form-control" value={empEmail} onChange={(e) => setEmpEmail(e.target.value)} placeholder="jane@company.com" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">Portal Password</label>
                        <input type="password" className="form-control" value={empPassword} onChange={(e) => setEmpPassword(e.target.value)} placeholder="Leave blank for auto-generate" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">System Access Role</label>
                        <select className="form-control" value={empRole} onChange={(e) => setEmpRole(e.target.value)}>
                          <option value="employee">👤 Employee (Self-Service)</option>
                          <option value="manager">👥 Manager (Team Reviewer)</option>
                          <option value="recruiter">🎯 HR (Talent Acquisition)</option>
                          <option value="hr_admin">⚙️ HR (System Administrator)</option>
                          <option value="Resource Mgmt Group">📊 HR (Resource Management)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                      <button type="button" className="btn btn-secondary" onClick={() => { setShowOnboardModal(false); setOnboardDuplicateWarning(false); }}>Cancel</button>
                      <button type="submit" className="btn btn-primary">{onboardDuplicateWarning ? "Confirm & Onboard" : "Save Profile"}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2.5 PROFILE VIEW */}
        {activeView === "my-profile" && (
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
        )}

        {/* 2.75 ORG STRUCTURE VIEW */}
        {activeView === "org-structure" && (
          <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="glass-card" style={{
              background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.06) 0%, rgba(var(--accent-rgb),0.03) 100%)",
              border: "1px solid rgba(var(--primary-rgb),0.15)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "32px" }}>🏗️</span>
                <div>
                  <h2 style={{ margin: 0 }}>Org Structure</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Organizational hierarchy by department — visualize teams and reporting lines.</p>
                </div>
              </div>
            </div>

            {(() => {
              const grouped: Record<string, typeof employees> = {};
              employees.forEach(emp => {
                const dept = emp.department_id || "Unassigned";
                if (!grouped[dept]) grouped[dept] = [];
                grouped[dept].push(emp);
              });
              const sortedDepts = Object.keys(grouped).sort();
              const totalEmployees = employees.length;
              return (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                    <div className="glass-card" style={{ textAlign: "center", padding: "20px" }}>
                      <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--primary)" }}>{sortedDepts.length}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Departments</div>
                    </div>
                    <div className="glass-card" style={{ textAlign: "center", padding: "20px" }}>
                      <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent)" }}>{totalEmployees}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Total Employees</div>
                    </div>
                    <div className="glass-card" style={{ textAlign: "center", padding: "20px" }}>
                      <div style={{ fontSize: "28px", fontWeight: 800, color: "#f59e0b" }}>{(totalEmployees / sortedDepts.length).toFixed(1)}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Avg / Dept</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {sortedDepts.map(dept => {
                      const deptEmployees = grouped[dept];
                      const teamLeads = deptEmployees.filter(e => e.employment_type === "Full-time" || true).slice(0, 1);
                      return (
                        <div key={dept} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                          <div style={{
                            padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px",
                            borderBottom: "1px solid var(--border-color)",
                            background: "rgba(var(--primary-rgb),0.03)"
                          }}
                            onClick={() => {
                              const key = "expand_" + dept;
                              setHrSelectedEmployeeId(hrSelectedEmployeeId === key ? "" : key);
                            }}
                          >
                            <div style={{
                              width: "40px", height: "40px", borderRadius: "10px",
                              background: "var(--grad-brand)", display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#fff", fontSize: "16px", fontWeight: 700, flexShrink: 0
                            }}>{dept.charAt(0).toUpperCase()}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: "15px" }}>{dept === "Unassigned" ? "Unassigned" : dept}</div>
                              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{deptEmployees.length} employee{deptEmployees.length !== 1 ? "s" : ""}</div>
                            </div>
                            <span style={{ color: "var(--text-muted)", fontSize: "18px", transition: "transform 0.2s", transform: hrSelectedEmployeeId === "expand_" + dept ? "rotate(180deg)" : "" }}>▾</span>
                          </div>
                          {hrSelectedEmployeeId === "expand_" + dept && (
                            <div style={{ padding: "16px 20px 20px" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px" }}>
                                {deptEmployees.map((emp, i) => {
                                  const initials = (emp.first_name?.[0] || "") + (emp.last_name?.[0] || "");
                                  const funcTitle = functionalTitles.find(t => t.id === emp.functional_title_id);
                                  const alloc = emp.project_allocations?.[0];
                                  return (
                                    <div key={emp.id || i} style={{
                                      display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px",
                                      borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)",
                                      background: "rgba(var(--primary-rgb),0.02)",
                                      cursor: "pointer", transition: "all 0.15s"
                                    }}
                                      onClick={() => { if (emp.id) { setHrSelectedEmployeeId(emp.id); setActiveView("attendance"); } }}
                                      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.background = "rgba(var(--primary-rgb),0.06)"; }}
                                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.background = "rgba(var(--primary-rgb),0.02)"; }}
                                    >
                                      <div style={{
                                        width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                                        background: "var(--grad-brand)", display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "13px", fontWeight: 700, color: "#fff"
                                      }}>{initials}</div>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: "13px" }}>{emp.first_name} {emp.last_name}</div>
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                          {funcTitle?.name || emp.designation_id || "—"}
                                        </div>
                                        {alloc && <div style={{ fontSize: "11px", color: "var(--primary)", fontWeight: 600 }}>{alloc.project_role} ({alloc.allocation_percentage}%)</div>}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* 3. ATTENDANCE VIEW */}
        {["attendance", "my-attendance", "org-attendance"].includes(activeView) && (
          <div className="animated">
            {activeView.startsWith("org-") && (
              <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
                <select 
                  className="form-control" 
                  style={{ maxWidth: "400px" }}
                  value={hrSelectedEmployeeId || ""}
                  onChange={(e) => setHrSelectedEmployeeId(e.target.value)}
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="glass-card" style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "32px" }}>🕒</span>
                <div>
                  <h2 style={{ margin: 0 }}>Attendance &amp; Shift Management</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Geo-verified clock-in/clock-out with automatic late arrival detection, overtime computation, and a full month-wise daily attendance log for each employee.</p>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "32px" }}>
            <div className="glass-card" style={{ height: "fit-content", textAlign: "center", padding: "40px 24px" }}>
              <div style={{ fontSize: "56px", marginBottom: "8px" }}>🕒</div>
              <h2 style={{ fontFamily: "var(--font-heading)" }}>Clock In / Clock Out</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "32px" }}>
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              
              {!isCheckedIn ? (
                <div>
                  <button className="btn btn-primary" style={{ padding: "20px 48px", borderRadius: "50px", fontSize: "18px" }} onClick={handleClockIn}>
                    Clock In Shift
                  </button>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "16px" }}>Shift standard limits start: 09:00 AM</p>
                </div>
              ) : (
                <div>
                  <button className="btn btn-danger" style={{ padding: "20px 48px", borderRadius: "50px", fontSize: "18px" }} onClick={handleClockOut}>
                    Clock Out Shift
                  </button>
                  <p style={{ fontSize: "12px", color: "var(--success)", fontWeight: 6, marginTop: "16px" }}>You are currently clocked in. Have a great shift!</p>
                </div>
              )}
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: "20px" }}>Clock History (This Month)</h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Duration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>No clock sessions logged for this month.</td>
                      </tr>
                    ) : (
                      myAttendance.map((att) => (
                        <tr key={att.id}>
                          <td>{att.date}</td>
                          <td>{att.check_in ? new Date(att.check_in).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : "—"}</td>
                          <td>{att.check_out ? new Date(att.check_out).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : "—"}</td>
                          <td>{att.work_minutes ? `${Math.floor(att.work_minutes / 60)}h ${att.work_minutes % 60}m` : "Active"}</td>
                          <td>
                            <span className={`badge ${att.status === "present" ? "badge-success" : att.status === "half_day" ? "badge-warning" : "badge-danger"}`}>
                              {att.status.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* 3.5 SHIFT MANAGEMENT VIEW */}
        {activeView === "shift-management" && (
          <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="glass-card" style={{
              background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.06) 0%, rgba(var(--accent-rgb),0.03) 100%)",
              border: "1px solid rgba(var(--primary-rgb),0.15)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "32px" }}>⏰</span>
                <div>
                  <h2 style={{ margin: 0 }}>Shift Management</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Configure and assign work shifts, rotas, and schedules across teams and departments.</p>
                </div>
              </div>
            </div>

            {/* Shift cards summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
              {[
                { name: "General", icon: "🔄", count: employees.filter(e => !e.current_shift || e.current_shift === "General").length, color: "var(--primary)" },
                { name: "Morning (6AM-2PM)", icon: "🌅", count: employees.filter(e => e.current_shift === "Morning").length, color: "#f59e0b" },
                { name: "Evening (2PM-10PM)", icon: "🌇", count: employees.filter(e => e.current_shift === "Evening").length, color: "#f97316" },
                { name: "Night (10PM-6AM)", icon: "🌙", count: employees.filter(e => e.current_shift === "Night").length, color: "#6366f1" },
              ].map((shift, i) => (
                <div key={i} className="glass-card" style={{
                  textAlign: "center", padding: "20px", cursor: "pointer", transition: "all 0.15s",
                  border: shiftActiveTab === shift.name ? `2px solid ${shift.color}` : "1px solid var(--border-color)"
                }}
                  onClick={() => setShiftActiveTab(shift.name)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = shift.color; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = shiftActiveTab === shift.name ? shift.color : "var(--border-color)"; }}
                >
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>{shift.icon}</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: shift.color }}>{shift.count}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{shift.name}</div>
                </div>
              ))}
            </div>

            {/* Selected shift detail */}
            <div className="glass-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "20px" }}>👥</span> Employees — {shiftActiveTab}
                </h3>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <select className="form-control" style={{ padding: "6px 10px", fontSize: "13px" }} value={shiftAssignEmpId} onChange={e => setShiftAssignEmpId(e.target.value)}>
                    <option value="">Assign employee...</option>
                    {employees.filter(e => !shiftRoster[shiftActiveTab]?.includes(e.id || "")).map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                    ))}
                  </select>
                  <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: "13px" }}
                    disabled={!shiftAssignEmpId}
                    onClick={() => {
                      if (!shiftAssignEmpId) return;
                      setShiftRoster(prev => ({
                        ...prev,
                        [shiftActiveTab]: [...(prev[shiftActiveTab] || []), shiftAssignEmpId]
                      }));
                      setShiftAssignEmpId("");
                    }}
                  >+ Assign</button>
                </div>
              </div>
              {(!shiftRoster[shiftActiveTab] || shiftRoster[shiftActiveTab].length === 0) ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px", opacity: 0.5 }}>👥</div>
                  <div>No employees assigned to this shift yet.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
                  {shiftRoster[shiftActiveTab].map(empId => {
                    const emp = employees.find(e => e.id === empId);
                    if (!emp) return null;
                    const initials = (emp.first_name?.[0] || "") + (emp.last_name?.[0] || "");
                    const funcTitle = functionalTitles.find(t => t.id === emp.functional_title_id);
                    return (
                      <div key={empId} style={{
                        display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px",
                        borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)",
                        background: "rgba(var(--primary-rgb),0.02)"
                      }}>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                          background: "var(--grad-brand)", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "13px", fontWeight: 700, color: "#fff"
                        }}>{initials}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: "13px" }}>{emp.first_name} {emp.last_name}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{funcTitle?.name || emp.designation_id || "—"}</div>
                        </div>
                        <button style={{
                          background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
                          padding: "4px", borderRadius: "50%", fontSize: "16px", lineHeight: 1
                        }}
                          onClick={() => setShiftRoster(prev => ({
                            ...prev,
                            [shiftActiveTab]: prev[shiftActiveTab].filter(id => id !== empId)
                          }))}
                          title="Remove from shift"
                        >✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Timeline schedule visualization */}
            <div className="glass-card">
              <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>📅</span> Weekly Schedule Overview
              </h3>
              <div style={{ display: "flex", gap: "4px", alignItems: "end", height: "120px", padding: "20px 0 0" }}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                  const assignedCount = Object.values(shiftRoster).flat().length;
                  const height = Math.max(20, assignedCount > 0 ? (assignedCount / 7) * 80 * (1 + Math.sin(i * 1.2) * 0.3) : 20);
                  return (
                    <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{Math.round(height / 10)}</div>
                      <div style={{
                        width: "100%", height: `${height}px`, borderRadius: "6px 6px 0 0",
                        background: `linear-gradient(180deg, var(--primary), rgba(var(--primary-rgb),0.4))`,
                        opacity: 0.4 + (i < 5 ? 0.6 : 0),
                        transition: "height 0.3s"
                      }} />
                      <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>{day}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. LEAVE VIEW */}
        {["leave", "my-leave", "org-leave"].includes(activeView) && (
          <div className="animated">
            {activeView.startsWith("org-") && (
              <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
                <select 
                  className="form-control" 
                  style={{ maxWidth: "400px" }}
                  value={hrSelectedEmployeeId || ""}
                  onChange={(e) => setHrSelectedEmployeeId(e.target.value)}
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="glass-card" style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "32px" }}>🌴</span>
                <div>
                  <h2 style={{ margin: 0 }}>Leave Planner &amp; Absence Management</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Apply for and track Casual, Sick, and Earned Leave requests. View live balance entitlements, monitor approval status, and review the organisation-wide leave calendar — all governed by grade-level accrual policies.</p>
                </div>
              </div>
            </div>
            {/* Balances widgets */}
            <div className="stats-grid" style={{ marginBottom: "32px" }}>
              {leaveBalances.map((bal) => (
                <div key={bal.id} className="glass-card stat-card" style={{ borderLeft: "4px solid var(--primary)" }}>
                  <div className="stat-title">{bal.leave_type.replace("_", " ")} Leave Balance</div>
                  <div className="stat-val">{bal.allocated - bal.used}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{bal.used} days requested and used</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "32px" }}>
              {/* Request form */}
              <div className="glass-card" style={{ height: "fit-content" }}>
                <h3 style={{ marginBottom: "20px" }}>Plan Time Off</h3>
                <form onSubmit={handleLeaveSubmit}>
                  <div className="form-group">
                    <label className="form-label">Leave Type</label>
                    <select className="form-control" value={reqLeaveType} onChange={(e) => setReqLeaveType(e.target.value)}>
                      <option value="casual">Casual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="earned">Earned Leave</option>
                    </select>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="form-group">
                      <label className="form-label">Start Date</label>
                      <input type="date" className="form-control" required value={reqStart} onChange={(e) => setReqStart(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End Date</label>
                      <input type="date" className="form-control" required value={reqEnd} onChange={(e) => setReqEnd(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: "24px" }}>
                    <label className="form-label">Reason</label>
                    <textarea className="form-control" style={{ height: "80px" }} required value={reqReason} onChange={(e) => setReqReason(e.target.value)} placeholder="Detail your vacation plans..." />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                    File Leave Application
                  </button>
                </form>
              </div>

              {/* History and team approvals */}
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {(currentUser?.role === "hr_admin" || currentUser?.role === "manager") && (
                  <div className="glass-card">
                    <h3 style={{ marginBottom: "20px" }}>Team Leave Requests (Awaiting Review)</h3>
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Employee</th>
                            <th>Type</th>
                            <th>Dates</th>
                            <th>Duration</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaveRequests.filter(r => r.status === "pending").length === 0 ? (
                            <tr>
                              <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>No pending leave approvals outstanding.</td>
                            </tr>
                          ) : (
                            leaveRequests.filter(r => r.status === "pending").map((req) => (
                              <tr key={req.id}>
                                <td style={{ fontWeight: 6 }}>{req.employee_name || "Employee"}</td>
                                <td style={{ textTransform: "capitalize" }}>{req.leave_type}</td>
                                <td>{req.start_date} to {req.end_date}</td>
                                <td>{req.total_days} days</td>
                                <td>
                                  <div style={{ display: "flex", gap: "8px" }}>
                                    <button className="btn btn-success" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => handleLeaveAction(req.id, "approved")}>
                                      Approve
                                    </button>
                                    <button className="btn btn-danger" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => handleLeaveAction(req.id, "rejected")}>
                                      Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="glass-card">
                  <h3 style={{ marginBottom: "20px" }}>Your Application Log</h3>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Dates</th>
                          <th>Duration</th>
                          <th>Reason</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveRequests.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>No vacation requests submitted yet.</td>
                          </tr>
                        ) : (
                          leaveRequests.map((req) => (
                            <tr key={req.id}>
                              <td style={{ textTransform: "capitalize", fontWeight: 6 }}>{req.leave_type}</td>
                              <td>{req.start_date} to {req.end_date}</td>
                              <td>{req.total_days} days</td>
                              <td>{req.reason}</td>
                              <td>
                                <span className={`badge ${req.status === "approved" ? "badge-success" : req.status === "pending" ? "badge-warning" : "badge-danger"}`}>
                                  {req.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4.5 EXPENSE CLAIMS VIEW */}
        {activeView === "my-expenses" && (
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

            {/* Summary cards */}
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

            {/* New expense form */}
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
                  setMyExpenses(prev => [{
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

            {/* Expense list */}
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
        )}

        {/* 4.6 PAYSLIPS VIEW */}
        {activeView === "my-payslips" && (
          <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="glass-card" style={{
              background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.06) 0%, rgba(var(--accent-rgb),0.03) 100%)",
              border: "1px solid rgba(var(--primary-rgb),0.15)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "32px" }}>📋</span>
                <div>
                  <h2 style={{ margin: 0 }}>My Payslips</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>View and download your monthly payslips, tax deductions, and salary breakdowns.</p>
                </div>
              </div>
            </div>

            {/* Latest payslip highlight */}
            {myPayslips.length > 0 && (() => {
              const latest = myPayslips[0];
              const netPay = latest.net_pay || latest.total_net || 0;
              const grossPay = latest.gross_pay || latest.total_earnings || 0;
              const deductions = latest.total_deductions || 0;
              const breakdown = latest.breakdown || latest.earnings || {};
              return (
                <div className="glass-card" style={{
                  background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.06), rgba(var(--accent-rgb),0.04))",
                  border: "1px solid rgba(var(--primary-rgb),0.12)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "20px" }}>{latest.pay_period || latest.month || "Current Month"}</h3>
                      <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>Generated {latest.generated_at || latest.created_at || "—"}</div>
                    </div>
                    <button className="btn btn-primary" style={{ padding: "8px 20px" }}
                      onClick={() => window.open(latest.pdf_url || `${API_BASE_URL}/payroll/payslips/${latest.id}/download`, "_blank")}
                    >📥 Download PDF</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                    <div style={{ textAlign: "center", padding: "16px", borderRadius: "var(--radius-sm)", background: "rgba(16,185,129,0.06)" }}>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Net Pay</div>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: "#10b981", marginTop: "4px" }}>₹{(netPay || 0).toLocaleString("en-IN")}</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "16px", borderRadius: "var(--radius-sm)", background: "rgba(var(--primary-rgb),0.06)" }}>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Gross Pay</div>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--primary)", marginTop: "4px" }}>₹{(grossPay || 0).toLocaleString("en-IN")}</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "16px", borderRadius: "var(--radius-sm)", background: "rgba(239,68,68,0.06)" }}>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Deductions</div>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: "#ef4444", marginTop: "4px" }}>₹{(deductions || 0).toLocaleString("en-IN")}</div>
                    </div>
                  </div>

                  {/* Earnings breakdown */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>📈 Earnings</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {(Object.entries(breakdown) as [string, number][]).filter(([, v]) => v > 0).map(([k, v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "4px 0", borderBottom: "1px solid rgba(var(--border-rgb),0.3)" }}>
                            <span style={{ color: "var(--text-muted)" }}>{k.replace(/_/g, " ")}</span>
                            <span style={{ fontWeight: 600 }}>₹{(v || 0).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "#ef4444", display: "flex", alignItems: "center", gap: "6px" }}>📉 Deductions</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {(Object.entries(latest.deductions_breakdown || latest.deductions || {}) as [string, number][]).filter(([, v]) => v > 0).map(([k, v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "4px 0", borderBottom: "1px solid rgba(var(--border-rgb),0.3)" }}>
                            <span style={{ color: "var(--text-muted)" }}>{k.replace(/_/g, " ")}</span>
                            <span style={{ fontWeight: 600 }}>₹{(v || 0).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* All payslips */}
            <div className="glass-card">
              <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>📚</span> All Payslips
                <span style={{ fontSize: "13px", fontWeight: 400, color: "var(--text-muted)", marginLeft: "4px" }}>({myPayslips.length})</span>
              </h3>
              {myPayslips.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px", opacity: 0.5 }}>📋</div>
                  <div>No payslips available yet. Payslips are generated after each payroll run.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                  {myPayslips.map((ps, i) => {
                    const np = ps.net_pay || ps.total_net || 0;
                    const gp = ps.gross_pay || ps.total_earnings || 0;
                    return (
                      <div key={ps.id || i} style={{
                        padding: "16px", borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-color)", background: "rgba(var(--primary-rgb),0.02)",
                        display: "flex", flexDirection: "column", gap: "8px"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 700, fontSize: "15px" }}>{ps.pay_period || ps.month || `Period #${i + 1}`}</span>
                          <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: "11px" }}
                            onClick={() => window.open(ps.pdf_url || `${API_BASE_URL}/payroll/payslips/${ps.id}/download`, "_blank")}
                          >📥 PDF</button>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                          <span style={{ color: "var(--text-muted)" }}>Net Pay</span>
                          <span style={{ fontWeight: 700, color: "#10b981" }}>₹{(np || 0).toLocaleString("en-IN")}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                          <span style={{ color: "var(--text-muted)" }}>Gross</span>
                          <span style={{ fontWeight: 600 }}>₹{(gp || 0).toLocaleString("en-IN")}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                          <span style={{ color: "var(--text-muted)" }}>Status</span>
                          <span className="badge" style={{
                            fontSize: "10px", fontWeight: 700,
                            background: ps.status === "paid" || ps.status === "generated" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                            color: ps.status === "paid" || ps.status === "generated" ? "#10b981" : "#f59e0b"
                          }}>{ps.status || "Generated"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. PAYROLL VIEW */}
        {["payroll", "my-payroll", "org-payroll"].includes(activeView) && (
          <div className="animated">
            {activeView.startsWith("org-") && (
              <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
                <select 
                  className="form-control" 
                  style={{ maxWidth: "400px" }}
                  value={hrSelectedEmployeeId || ""}
                  onChange={(e) => setHrSelectedEmployeeId(e.target.value)}
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="glass-card" style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "32px" }}>💸</span>
                <div>
                  <h2 style={{ margin: 0 }}>Payroll Processing &amp; Compensation Fintech</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Run monthly payroll batches with full statutory deduction computation (EPF 12%, Professional Tax slabs, TDS). Configure individual salary structures with Basic, HRA, and Allowances, and download itemised payslips for every employee.</p>
                </div>
              </div>
            </div>
            {currentUser?.role === "hr_admin" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: "32px" }}>
                {/* Admin Payroll Processing */}
                <div style={{ display: "flex", alignSelf: "flex-start", flexDirection: "column", gap: "32px" }}>
                  <div className="glass-card">
                    <h3 style={{ marginBottom: "20px" }}>Trigger Monthly Payroll Batch</h3>
                    <form onSubmit={handleProcessPayroll}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="form-group">
                          <label className="form-label">Month</label>
                          <select className="form-control" value={runMonth} onChange={(e) => setRunMonth(Number(e.target.value))}>
                            {Array.from({ length: 12 }, (_, i) => (
                              <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString(undefined, { month: 'long' })}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Year</label>
                          <input type="number" className="form-control" required value={runYear} onChange={(e) => setRunYear(Number(e.target.value))} />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }}>
                        Run Payroll Computations
                      </button>
                    </form>
                  </div>

                  <div className="glass-card">
                    <h3 style={{ marginBottom: "20px" }}>Configure Employee Salary Structure</h3>
                    <form onSubmit={handleSalarySetup}>
                      <div className="form-group">
                        <label className="form-label">Select Employee Profile</label>
                        <select className="form-control" value={ssEmployeeId} onChange={(e) => setSsEmployeeId(e.target.value)}>
                          <option value="">-- Select --</option>
                          {employees.map((e) => (
                            <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_id})</option>
                          ))}
                        </select>
                      </div>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="form-group">
                          <label className="form-label">Basic Salary ($)</label>
                          <input type="number" className="form-control" value={ssBasic} onChange={(e) => setSsBasic(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">HRA Allowance ($)</label>
                          <input type="number" className="form-control" value={ssHra} onChange={(e) => setSsHra(e.target.value)} />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="form-group">
                          <label className="form-label">Other Allowances ($)</label>
                          <input type="number" className="form-control" value={ssAllowances} onChange={(e) => setSsAllowances(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">PF Deduction ($)</label>
                          <input type="number" className="form-control" value={ssPf} onChange={(e) => setSsPf(e.target.value)} />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="form-group">
                          <label className="form-label">Professional Tax Deduction ($)</label>
                          <input type="number" className="form-control" value={ssTax} onChange={(e) => setSsTax(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">NPS Deduction ($)</label>
                          <input type="number" className="form-control" value={ssNps} onChange={(e) => setSsNps(e.target.value)} />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Custom Deductions (Format: Name:Amount, Name2:Amount2)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Gym:500, Meal Card:1000"
                          value={ssCustomDeductionsText}
                          onChange={(e) => setSsCustomDeductionsText(e.target.value)}
                        />
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                          Separate multiple custom items with commas. Example: Gym:500, Meal Card:1200
                        </span>
                      </div>

                      <button type="submit" className="btn btn-secondary" style={{ width: "100%", marginTop: "8px" }}>
                        Save Salary Structure
                      </button>
                    </form>
                  </div>
                </div>

                <div className="glass-card">
                  <h3 style={{ marginBottom: "20px" }}>Processed Payroll Runs</h3>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Batch Period</th>
                          <th>Status</th>
                          <th>Processed Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrollRuns.length === 0 ? (
                          <tr>
                            <td colSpan={3} style={{ textAlign: "center", color: "var(--text-muted)" }}>No payroll runs processed yet. Use the run tool to calculate.</td>
                          </tr>
                        ) : (
                          payrollRuns.map((run) => (
                            <tr key={run.id}>
                              <td style={{ fontWeight: 6 }}>{run.month}/{run.year}</td>
                              <td><span className="badge badge-success">{run.status}</span></td>
                              <td>{new Date(run.processed_at).toLocaleString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              // Employee self-service payslip history
              <div className="glass-card animated">
                <h3 style={{ marginBottom: "20px" }}>Your Historical Payslips</h3>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Basic</th>
                        <th>HRA</th>
                        <th>Allowances</th>
                        <th>PF</th>
                        <th>NPS</th>
                        <th>PT</th>
                        <th>TDS</th>
                        <th>Other Ded</th>
                        <th>Net Salary</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myPayslips.length === 0 ? (
                        <tr>
                          <td colSpan={10} style={{ textAlign: "center", color: "var(--text-muted)" }}>No payslips generated for your profile yet.</td>
                        </tr>
                      ) : (
                        myPayslips.map((p) => {
                          const customDeductionsSum = p.custom_deductions
                            ? Object.values(p.custom_deductions).reduce((sum: number, val: any) => sum + Number(val || 0), 0)
                            : 0;
                          const customTooltip = p.custom_deductions
                            ? Object.entries(p.custom_deductions)
                                .map(([k, v]) => `${k}: $${v}`)
                                .join(", ")
                            : "";
                          return (
                            <tr key={p.id}>
                              <td>${p.basic}</td>
                              <td>${p.hra}</td>
                              <td>${p.allowances}</td>
                              <td>${p.pf}</td>
                              <td>${p.nps || 0}</td>
                              <td>${p.professional_tax || 0}</td>
                              <td>${p.tax}</td>
                              <td title={customTooltip} style={{ cursor: customTooltip ? "help" : "default" }}>
                                ${customDeductionsSum} {customTooltip && "ℹ️"}
                              </td>
                              <td style={{ fontWeight: 7, color: "var(--primary)" }}>${p.net_salary}</td>
                              <td><span className="badge badge-success">{p.status}</span></td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. FBP & TAX PORTAL */}
        {["fbp-tax", "my-fbp-tax", "org-fbp-tax"].includes(activeView) && (
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
              {/* Form Tax declaration */}
              <div className="glass-card">
                <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  🏛️ Annual Income Tax Declaration
                </h3>
                <form onSubmit={handleTaxSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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

              {/* FBP restructured and Caps */}
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
                  <form onSubmit={handleFbpSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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

            {/* Admin Verification list */}
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
                      {allTaxDeclarations.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: "center", color: "var(--text-muted)" }}>No declarations submitted for approval yet.</td>
                        </tr>
                      ) : (
                        allTaxDeclarations.map((decl: any) => (
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
                                  <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => handleTaxAction(decl.id, "approved")}>
                                    Approve
                                  </button>
                                  <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11px", backgroundColor: "var(--danger)" }} onClick={() => handleTaxAction(decl.id, "rejected")}>
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

        {/* 7. CORPORATE INSURANCE HUB */}
        {["insurance", "my-insurance", "org-insurance"].includes(activeView) && (
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
              <form onSubmit={handleInsuranceEnroll} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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

            {/* Neon Health Card Mockup */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="glass-card" style={{ padding: "0px", overflow: "hidden", borderRadius: "24px", border: "1px solid rgba(var(--primary-rgb), 0.3)", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)" }}>
                <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)", padding: "28px", minHeight: "220px", position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#ffffff" }}>
                  {/* Neon Glow spots */}
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
                    <div style={{ width: "40px", height: "30px", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", borderRadius: "6px", opacity: 0.8, marginBottom: "8px" }} /> {/* Chip */}
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
                
                {/* Details under card */}
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

        {/* 7.5 POLICY CENTER VIEW */}
        {activeView === "policy-center" && (
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

            {(() => {
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
                <>
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
                </>
              );
            })()}
          </div>
        )}

        {/* 8. VEHICLE LEASE HUB */}
        {["car-lease", "my-car-lease", "org-car-lease"].includes(activeView) && (
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
        )}

        {/* 9. APPRAISALS & BELL CURVE */}
        {activeView === "appraisals" && (
          <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* Header */}
            <div className="glass-card">
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "32px" }}>📈</span>
                <div>
                  <h2 style={{ margin: 0 }}>Performance Appraisal &amp; Review Cycles</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Bi-annual performance reviews (H1 / H2) with self-assessment, manager evaluation, bell curve normalization, and historical tracking across years of record.</p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button className={`tab-btn${appraisalTab === "self" ? " active" : ""}`} onClick={() => setAppraisalTab("self")}>
                📝 Self Appraisal
              </button>
              {(currentUser?.role === "hr_admin" || currentUser?.role === "manager") && (
                <button className={`tab-btn${appraisalTab === "manager" ? " active" : ""}`} onClick={() => setAppraisalTab("manager")}>
                  🛡️ Manager Console
                </button>
              )}
              <button className={`tab-btn${appraisalTab === "history" ? " active" : ""}`} onClick={() => setAppraisalTab("history")}>
                📜 Review History
              </button>
              {(currentUser?.role === "hr_admin" || currentUser?.role === "manager") && (
                <button className={`tab-btn${appraisalTab === "email-flows" ? " active" : ""}`} onClick={() => setAppraisalTab("email-flows")}>
                  📧 Cycle Initiation &amp; Communications
                </button>
              )}
            </div>

            {/* ─── TAB: SELF APPRAISAL ─── */}
            {appraisalTab === "self" && (
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px" }}>
                {/* KRAs */}
                <div className="glass-card">
                  <h3 style={{ marginBottom: "20px" }}>🎯 Key Result Areas (KRA) & Goals</h3>
                  {(() => {
                    const krasWeightSum = kras.reduce((sum, k) => sum + Number(k.weightage), 0);
                    return (
                      <div style={{ marginBottom: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px" }}>
                          <span>KRA Weightage Allocation:</span>
                          <strong style={{ color: krasWeightSum === 100 ? "var(--success)" : "var(--warning)" }}>{krasWeightSum}% / 100%</strong>
                        </div>
                        <div style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ width: `${krasWeightSum}%`, height: "100%", background: krasWeightSum === 100 ? "var(--success)" : "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)", borderRadius: "4px", transition: "width 0.3s" }} />
                        </div>
                      </div>
                    );
                  })()}

                  <form onSubmit={handleKraSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px", borderBottom: "1px solid var(--border-color)", paddingBottom: "24px" }}>
                    <div className="form-group">
                      <label className="form-label">KRA Title</label>
                      <input type="text" className="form-control" placeholder="e.g. Core Engineering Deliverables" value={newKraTitle} onChange={(e) => setNewKraTitle(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Detailed Description</label>
                      <textarea className="form-control" rows={2} placeholder="What quantitative goals determine success?" value={newKraDesc} onChange={(e) => setNewKraDesc(e.target.value)} required />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">Weightage (%)</label>
                        <input type="number" min="5" max="100" className="form-control" value={newKraWeight} onChange={(e) => setNewKraWeight(Number(e.target.value))} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Target Date</label>
                        <input type="date" className="form-control" value={newKraTarget} onChange={(e) => setNewKraTarget(e.target.value)} />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                      Create KRA Goal
                    </button>
                  </form>

                  <h4 style={{ fontSize: "14px", marginBottom: "12px", color: "var(--secondary)" }}>Your Active KRAs</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {kras.length === 0 ? (
                      <div style={{ color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "16px" }}>No KRAs defined yet. Set them using the form above.</div>
                    ) : (
                      kras.map((k: any) => (
                        <div key={k.id} style={{ background: "rgba(255,255,255,0.02)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <strong style={{ fontSize: "14px" }}>{k.title}</strong>
                            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{k.description}</p>
                            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Target Date: {k.target_date || "Continuous"}</span>
                          </div>
                          <span className="badge badge-success" style={{ fontSize: "12px" }}>{k.weightage}% weight</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Self review + Bell Curve */}
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                  <div className="glass-card">
                    <h3 style={{ marginBottom: "20px" }}>📝 Self Appraisal Review</h3>
                    <form onSubmit={handleSelfReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">Appraisal Period Cycle</label>
                        <select className="form-control" value={selectedReviewCycle} onChange={(e) => setSelectedReviewCycle(e.target.value)}>
                          {[2024, 2025, 2026, 2027].flatMap(y => ["H1", "H2"].map(h => `${h}-${y}`)).map(cycle => (
                            <option key={cycle} value={cycle}>{cycle} Appraisal Cycle</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Self Rating Score (1 to 5)</label>
                        <select className="form-control" value={appraisalSelfRating} onChange={(e) => setAppraisalSelfRating(Number(e.target.value))}>
                          <option value="1">1 - Unsatisfactory Performer</option>
                          <option value="2">2 - Needs Improvement</option>
                          <option value="3">3 - Core Meets Expectations</option>
                          <option value="4">4 - Highly Valued Contributor</option>
                          <option value="5">5 - Outstanding Top Performer</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Self Review Commentary &amp; Justification</label>
                        <textarea className="form-control" rows={3} placeholder="Highlight your top wins, achievements, and impact." value={appraisalSelfFeedback} onChange={(e) => setAppraisalSelfFeedback(e.target.value)} required />
                      </div>

                      <button type="submit" className="btn btn-secondary" style={{ width: "100%" }}>
                        Submit Self Appraisal Rating
                      </button>
                    </form>
                  </div>

                  {/* Bell Curve */}
                  <div className="glass-card">
                    <h3 style={{ marginBottom: "16px" }}>📈 Normalization Bell Curve Distribution</h3>
                    {bellCurveData ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)" }}>
                          <span>Target: Top (10-20%), Core (60-70%), Low (10-20%)</span>
                        </div>
                        <div style={{ position: "relative", height: "140px", marginTop: "12px" }}>
                          <svg viewBox="0 0 300 120" width="100%" height="120" style={{ overflow: "visible" }}>
                            <defs>
                              <linearGradient id="bell-low" x1="0" y1="1" x2="0" y2="0">
                                <stop offset="0%" stopColor="var(--danger)" stopOpacity="0.1"/>
                                <stop offset="100%" stopColor="var(--danger)" stopOpacity="0.45"/>
                              </linearGradient>
                              <linearGradient id="bell-core" x1="0" y1="1" x2="0" y2="0">
                                <stop offset="0%" stopColor="var(--success)" stopOpacity="0.1"/>
                                <stop offset="100%" stopColor="var(--success)" stopOpacity="0.45"/>
                              </linearGradient>
                              <linearGradient id="bell-top" x1="0" y1="1" x2="0" y2="0">
                                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1"/>
                                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.45"/>
                              </linearGradient>
                            </defs>
                            <path d="M 10 110 C 60 110, 80 100, 100 70 C 120 40, 135 15, 150 15 C 165 15, 180 40, 200 70 C 220 100, 240 110, 290 110" fill="none" stroke="var(--border-color)" strokeWidth="2.5" strokeDasharray="4,4" opacity={0.5} />
                            <path d="M 10 110 C 60 110, 80 100, 100 70 L 100 110 Z" fill="url(#bell-low)" stroke="var(--danger)" strokeWidth="2" />
                            <path d="M 100 70 C 120 40, 135 15, 150 15 C 165 15, 180 40, 200 70 L 200 110 L 100 110 Z" fill="url(#bell-core)" stroke="var(--success)" strokeWidth="2" />
                            <path d="M 200 70 C 220 100, 240 110, 290 110 L 290 110 L 200 110 Z" fill="url(#bell-top)" stroke="var(--primary)" strokeWidth="2" />
                            <g transform="translate(60, 85)"><circle cx="0" cy="0" r="13" fill="var(--danger)" /><text y="3" textAnchor="middle" fill="#fff" style={{ fontSize: "10px", fontWeight: 800 }}>{bellCurveData.Low}</text></g>
                            <g transform="translate(150, 45)"><circle cx="0" cy="0" r="16" fill="var(--success)" /><text y="3.5" textAnchor="middle" fill="#fff" style={{ fontSize: "11px", fontWeight: 800 }}>{bellCurveData.Core}</text></g>
                            <g transform="translate(240, 85)"><circle cx="0" cy="0" r="13" fill="var(--primary)" /><text y="3" textAnchor="middle" fill="#fff" style={{ fontSize: "10px", fontWeight: 800 }}>{bellCurveData.Top}</text></g>
                          </svg>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "11px", fontWeight: 6, color: "var(--text-secondary)" }}>
                            <span style={{ flex: 1, textAlign: "center", color: "var(--danger)" }}>Low Performer</span>
                            <span style={{ flex: 1, textAlign: "center", color: "var(--success)" }}>Core Contributor</span>
                            <span style={{ flex: 1, textAlign: "center", color: "var(--primary)" }}>Top Performer</span>
                          </div>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "8px" }}>
                          Active headcount analyzed in normalization bucket: <strong>{bellCurveData.Total} Employees</strong>
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: "var(--text-muted)", fontStyle: "italic", textAlign: "center" }}>No active review metadata mapped for Bell Curve modeling.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB: MANAGER CONSOLE ─── */}
            {appraisalTab === "manager" && (currentUser?.role === "hr_admin" || currentUser?.role === "manager") && (
              <div className="glass-card">
                <h3 style={{ marginBottom: "20px" }}>🛡️ Manager Appraisal Review Dashboard</h3>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Cycle</th>
                        <th>Self Rating</th>
                        <th>Self Comments</th>
                        <th>Manager Rating</th>
                        <th>Manager Feedback</th>
                        <th>Normalized Category</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allReviews.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: "center", color: "var(--text-muted)" }}>No peer ratings submitted for evaluation yet.</td>
                        </tr>
                      ) : (
                        allReviews.map((rev: any) => (
                          <tr key={rev.id}>
                            <td style={{ fontWeight: 6 }}>{rev.employee?.first_name} {rev.employee?.last_name}</td>
                            <td>{rev.review_cycle}</td>
                            <td>
                              <span className="badge badge-success" style={{ backgroundColor: "var(--primary-bg)", color: "var(--primary)" }}>
                                {rev.self_rating || "N/A"}
                              </span>
                            </td>
                            <td style={{ fontSize: "12px", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis" }}>{rev.self_feedback || "None"}</td>
                            <td>
                              <select className="form-control" style={{ padding: "4px 8px", minWidth: "80px" }} defaultValue={rev.manager_rating || 3} onChange={(e) => setAppraisalMgrRating(Number(e.target.value))}>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                              </select>
                            </td>
                            <td>
                              <input type="text" className="form-control" style={{ padding: "4px 8px", minWidth: "120px" }} placeholder="Evaluation feedback" defaultValue={rev.manager_feedback || ""} onChange={(e) => setAppraisalMgrFeedback(e.target.value)} />
                            </td>
                            <td>
                              <span className={`badge badge-${rev.normalized_category === "Top" ? "success" : rev.normalized_category === "Low" ? "danger" : "warning"}`} style={{ textTransform: "uppercase" }}>
                                {rev.normalized_category || "Unassigned"}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "11px" }} onClick={() => handleManagerReviewSubmit(rev.id)}>
                                Normalize &amp; Save
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── TAB: REVIEW HISTORY ─── */}
            {appraisalTab === "history" && (
              <div className="glass-card">
                <h3 style={{ marginBottom: "20px" }}>📜 Appraisal History &amp; Years of Record</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>
                  Complete record of your bi-annual performance reviews across all appraisal cycles.
                </p>
                {myReviews.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "32px" }}>
                    No appraisal records found yet. Submit your first self-review to start building your history.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Cycle</th>
                          <th>Year</th>
                          <th>Self Rating</th>
                          <th>Self Feedback</th>
                          <th>Manager Rating</th>
                          <th>Manager Feedback</th>
                          <th>Normalized Category</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...myReviews]
                          .sort((a, b) => b.review_cycle?.localeCompare(a.review_cycle))
                          .map((rev: any) => {
                            const cycleYear = rev.review_cycle?.includes("-") ? rev.review_cycle.split("-")[1] : "—";
                            return (
                              <tr key={rev.id}>
                                <td><span className="badge badge-info">{rev.review_cycle}</span></td>
                                <td>{cycleYear}</td>
                                <td>
                                  <span className="badge badge-success" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "var(--success)" }}>
                                    {rev.self_rating || "N/A"} / 5
                                  </span>
                                </td>
                                <td style={{ fontSize: "12px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis" }}>{rev.self_feedback || "—"}</td>
                                <td>
                                  {rev.manager_rating ? (
                                    <span className="badge badge-primary">{rev.manager_rating} / 5</span>
                                  ) : (
                                    <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Pending</span>
                                  )}
                                </td>
                                <td style={{ fontSize: "12px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis" }}>{rev.manager_feedback || "—"}</td>
                                <td>
                                  {rev.normalized_category ? (
                                    <span className={`badge badge-${rev.normalized_category === "Top" ? "success" : rev.normalized_category === "Low" ? "danger" : "warning"}`} style={{ textTransform: "uppercase" }}>
                                      {rev.normalized_category}
                                    </span>
                                  ) : (
                                    <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Not yet</span>
                                  )}
                                </td>
                                <td>
                                  {rev.manager_rating ? (
                                    <span className="badge badge-success" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "var(--success)" }}>Completed</span>
                                  ) : rev.self_rating ? (
                                    <span className="badge badge-warning" style={{ backgroundColor: "rgba(245,158,11,0.1)", color: "var(--warning)" }}>Awaiting Manager</span>
                                  ) : (
                                    <span className="badge badge-info" style={{ backgroundColor: "rgba(99,102,241,0.1)", color: "var(--primary)" }}>Draft</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB: CYCLE & EMAIL COMMUNICATIONS (HR & MANAGER FLOWS) ─── */}
            {appraisalTab === "email-flows" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* 1. HR Operations Initiation */}
                {currentUser?.role === "hr_admin" && (
                  <div className="glass-card" style={{ border: "1px solid rgba(37, 99, 235, 0.3)" }}>
                    <h3 style={{ marginBottom: "12px", color: "#2563eb", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>🚀</span> 1. HR Operations: Initiate 6-Month KRA Cycle
                    </h3>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                      Sends an official organization-wide email broadcast from CogniHRMS to all employees instructing them to define and submit their 6-month Goal/KRA objectives.
                    </p>
                    <form onSubmit={handleInitiateCycle} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div className="form-group">
                        <label className="form-label">Review Period Cycle Name</label>
                        <input type="text" className="form-control" value={initCycleName} onChange={e => setInitCycleName(e.target.value)} placeholder="e.g. FY26-H1 (Apr - Sep)" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Target Completion Date</label>
                        <input type="date" className="form-control" value={initCycleTargetDate} onChange={e => setInitCycleTargetDate(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Official HR Instructions Note</label>
                        <textarea className="form-control" rows={3} value={initCycleMessage} onChange={e => setInitCycleMessage(e.target.value)} />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", width: "100%", padding: "12px", fontWeight: 700 }}>
                        🚀 Broadcast 6-Month Initiation Email to All Employees
                      </button>
                    </form>
                  </div>
                )}

                {/* 2. Manager Initiation */}
                <div className="glass-card" style={{ border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                  <h3 style={{ marginBottom: "12px", color: "#10b981", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>📋</span> 2. Manager: Team KRA Setting Alignment
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                    Sends a formal email communication from CogniHRMS to your direct reportees reminding them to finalize and share their Goal &amp; KRA settings for review.
                  </p>
                  <form onSubmit={handleInitiateTeamReminders} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div className="form-group">
                      <label className="form-label">Review Period Cycle Name</label>
                      <input type="text" className="form-control" value={teamRemindCycleName} onChange={e => setTeamRemindCycleName(e.target.value)} placeholder="e.g. FY26-H1" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Team Target Date</label>
                      <input type="date" className="form-control" value={teamRemindTargetDate} onChange={e => setTeamRemindTargetDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Manager Guidance Note</label>
                      <textarea className="form-control" rows={3} value={teamRemindMessage} onChange={e => setTeamRemindMessage(e.target.value)} />
                    </div>
                    <button type="submit" className="btn" style={{ background: "linear-gradient(135deg, #059669, #10b981)", color: "#fff", width: "100%", padding: "12px", fontWeight: 700 }}>
                      📋 Send Formal KRA Communication to Team
                    </button>
                  </form>
                </div>

                {/* 5. HR Publish Ratings */}
                {currentUser?.role === "hr_admin" && (
                  <div className="glass-card" style={{ gridColumn: "span 2", border: "1px solid rgba(245, 158, 11, 0.3)", background: "rgba(245, 158, 11, 0.03)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                      <div>
                        <h3 style={{ margin: 0, color: "#d97706", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>🏆</span> 5. Final Rating Publish (HR to All Employees)
                        </h3>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0" }}>
                          Finalizes bell-curve normalized ratings for all manager-reviewed appraisals and sends final performance result emails to employees.
                        </p>
                      </div>
                      <button className="btn" style={{ background: "#d97706", color: "#fff", padding: "12px 24px", fontWeight: 700 }} onClick={() => handlePublishFinalRatings(selectedReviewCycle)}>
                        🏆 Publish Final Ratings for {selectedReviewCycle}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 10. AI PROMOTIONS */}
        {activeView === "ai-promotions" && currentUser?.role === "hr_admin" && (
          <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div className="glass-card">
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "32px" }}>🤖</span>
                <div>
                  <h2 style={{ margin: 0 }}>AI-Powered Promotion Recommendation Engine</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Leverage the Llama 3 70B large language model to analyse an employee's KRA performance scores, tenure, current grade, and appraisal history — generating a data-driven promotion readiness score, grade recommendation, compensation adjustment percentage, and risk flags for informed HR decisions.</p>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "32px" }}>
              {/* Left selector and gauge */}
              <div className="glass-card">
                <h3 style={{ marginBottom: "20px" }}>🤖 AI Grade Promotion Analyser</h3>
                <form onSubmit={handleAnalyzePromotion} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Select Employee Profile</label>
                    <select className="form-control" value={selectedPromoEmployee} onChange={(e) => setSelectedPromoEmployee(e.target.value)}>
                      <option value="">-- Select --</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_id} - Grade: {e.grade || "L3"})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Level Grade Shift</label>
                    <select className="form-control" value={promoTargetGrade} onChange={(e) => setPromoTargetGrade(e.target.value)}>
                      <option value="">Auto-Suggest Level</option>
                      <option value="L1">Level 1 - Senior Leadership (L1)</option>
                      <option value="L2">Level 2 - Mid-Senior Management (L2)</option>
                      <option value="L3">Level 3 - Associate Professional (L3)</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }} disabled={promoLoading}>
                    {promoLoading ? "Consulting Llama 3 LLM..." : "Generate AI Recommendation"}
                  </button>
                </form>

                {promotionAnalysis && (
                  <div className="animated" style={{ marginTop: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "24px" }}>
                    <div style={{ position: "relative", width: "130px", height: "130px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <div style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", background: `conic-gradient(var(--primary) ${promotionAnalysis.ai_score}%, rgba(255,255,255,0.05) 0deg)`, transform: "rotate(-90deg)" }} />
                      <div style={{ position: "absolute", width: "110px", height: "110px", borderRadius: "50%", background: "var(--bg-card)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 2 }}>
                        <span style={{ fontSize: "28px", fontWeight: 7, color: "var(--primary)" }}>{Math.round(promotionAnalysis.ai_score)}</span>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Readiness %</span>
                      </div>
                    </div>

                    <div style={{ textAlign: "center", width: "100%" }}>
                      <span className="badge badge-success" style={{ display: "inline-block", fontSize: "12px", textTransform: "uppercase" }}>
                        Grade Shift: {promotionAnalysis.current_grade} ➔ {promotionAnalysis.target_grade}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right analysis results */}
              <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ marginBottom: "20px" }}>📊 Groq Qualitative Promotion Insights</h3>
                  
                  {promotionAnalysis ? (
                    <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div>
                        <strong style={{ fontSize: "13px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>AI Justification Summary:</strong>
                        <p style={{ fontSize: "12px", lineHeight: "1.5", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                          {promotionAnalysis.ai_summary}
                        </p>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div style={{ background: "rgba(239, 68, 68, 0.05)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                          <strong style={{ fontSize: "12px", color: "var(--danger)", display: "block", marginBottom: "4px" }}>Risk & Alert Flags:</strong>
                          <span style={{ fontSize: "11px", fontWeight: 6 }}>{promotionAnalysis.risk_flags || "Zero Risk Flags Found"}</span>
                        </div>
                        <div style={{ background: "rgba(16, 185, 129, 0.05)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                          <strong style={{ fontSize: "12px", color: "var(--success)", display: "block", marginBottom: "4px" }}>Suggested Comp Adjustment:</strong>
                          <span style={{ fontSize: "16px", fontWeight: 7, color: "var(--success)", display: "block", marginTop: "2px" }}>+{promotionAnalysis.suggested_comp_adjustment_percentage}%</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexGrow: 1, height: "100%", justifyContent: "center", alignItems: "center", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "40px" }}>
                      Select an employee profile above and trigger the promotion analysis to parse their live ratings, attendance, and continuous tenure with our Groq AI Engine.
                    </div>
                  )}
                </div>

                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "24px" }}>
                  ℹ️ Recommendations are generated using deep learning models that evaluate Self & Manager reviews, LOP attendance deductions, continuous tenure months, and remaining leave balances.
                </div>
              </div>
            </div>

            {/* Recommendations table */}
            <div className="glass-card">
              <h3 style={{ marginBottom: "20px" }}>📜 History of Promotion Evaluations</h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Level Shift</th>
                      <th>AI Readiness Score</th>
                      <th>AI Summary Details</th>
                      <th>Comp Adjust</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotionRecommendations.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)" }}>No recommendations processed yet.</td>
                      </tr>
                    ) : (
                      promotionRecommendations.map((rec: any) => (
                        <tr key={rec.id}>
                          <td style={{ fontWeight: 6 }}>{rec.employee?.first_name} {rec.employee?.last_name}</td>
                          <td>
                            <span className="badge badge-success" style={{ fontSize: "10px" }}>
                              {rec.current_grade} ➔ {rec.target_grade}
                            </span>
                          </td>
                          <td style={{ fontWeight: 7, color: "var(--primary)" }}>{Math.round(rec.ai_score)}%</td>
                          <td style={{ fontSize: "12px", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={rec.ai_summary}>{rec.ai_summary}</td>
                          <td style={{ fontWeight: 6, color: "var(--success)" }}>+{rec.suggested_comp_adjustment_percentage}%</td>
                          <td>
                            <span className={`badge badge-${rec.status === "approved" ? "success" : rec.status === "rejected" ? "danger" : "warning"}`}>
                              {rec.status}
                            </span>
                          </td>
                          <td>
                            {rec.status === "pending" && (
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => handlePromotionAction(rec.id, "approved")}>
                                  Approve
                                </button>
                                <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11px", backgroundColor: "var(--danger)" }} onClick={() => handlePromotionAction(rec.id, "rejected")}>
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
          </div>
        )}

        {/* 10.5 ACHIEVEMENTS & AWARDS */}
        {activeView === "achievements-awards" && (
          <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div className="glass-card" style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.03) 100%)", border: "1px solid rgba(245, 158, 11, 0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ fontSize: "38px" }}>🏆</span>
                <div>
                  <h2 style={{ margin: 0 }}>Corporate Wall of Fame &amp; Recognition</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Celebrate top performers, spot excellence awards, milestone honors, and reward points distribution across your organization.</p>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "32px" }}>
              {/* Grant Recognition Form */}
              {(currentUser?.role === "hr_admin" || currentUser?.role === "manager" || currentUser?.role === "super_admin") ? (
                <div className="glass-card">
                  <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>⭐</span> Issue Spot Award / Recognition
                  </h3>
                  <form onSubmit={handleCreateAward} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div className="form-group">
                      <label className="form-label">Award Title</label>
                      <input type="text" className="form-control" value={newAwardTitle} onChange={e => setNewAwardTitle(e.target.value)} placeholder="e.g. Innovation Star / Customer Hero" required />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
                      <div className="form-group">
                        <label className="form-label">Category Tier</label>
                        <select className="form-control" value={newAwardCategory} onChange={e => setNewAwardCategory(e.target.value)}>
                          <option value="Spot Award">Spot Award</option>
                          <option value="Employee of the Month">Employee of the Month</option>
                          <option value="Innovation Champion">Innovation Champion</option>
                          <option value="Customer Obsession">Customer Obsession</option>
                          <option value="Milestone Honor">Milestone Honor</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Reward Points</label>
                        <input type="number" step="500" className="form-control" value={newAwardPoints} onChange={e => setNewAwardPoints(Number(e.target.value))} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Citation &amp; Impact Description</label>
                      <textarea className="form-control" rows={3} value={newAwardDesc} onChange={e => setNewAwardDesc(e.target.value)} placeholder="Highlight specific contributions or achievements..." required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", border: "none", width: "100%", padding: "12px", fontWeight: 700 }}>
                      🏆 Grant Recognition &amp; Reward Points
                    </button>
                  </form>
                </div>
              ) : (
                <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "32px" }}>
                  <span style={{ fontSize: "48px", marginBottom: "12px" }}>🌟</span>
                  <h3 style={{ margin: "0 0 8px" }}>Your Recognition Wallet</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Earn spot awards and points from your reporting manager or HR during project appraisals and milestones!</p>
                  <div style={{ marginTop: "16px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid #f59e0b", padding: "12px 24px", borderRadius: "24px" }}>
                    <span style={{ fontSize: "12px", color: "#d97706", fontWeight: 700 }}>TOTAL EARNED POINTS: </span>
                    <strong style={{ fontSize: "18px", color: "#b45309" }}>{awardsList.reduce((sum, a) => sum + Number(a.points || 0), 0).toLocaleString()} PTS</strong>
                  </div>
                </div>
              )}

              {/* Wall of Fame List */}
              <div className="glass-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ margin: 0 }}>🌟 Recent Organizational Honors</h3>
                  <span className="badge badge-warning" style={{ background: "#fef3c7", color: "#b45309" }}>{awardsList.length} Honors Recognized</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {awardsList.map((award) => (
                    <div key={award.id} style={{ display: "flex", gap: "16px", padding: "16px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", transition: "transform 0.15s", alignItems: "flex-start" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>
                        🏆
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <strong style={{ fontSize: "15px", color: "var(--text-main)" }}>{award.title}</strong>
                            <div style={{ fontSize: "11px", color: "#d97706", fontWeight: 700, textTransform: "uppercase", marginTop: "2px" }}>{award.category}</div>
                          </div>
                          <span className="badge badge-success" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", fontWeight: 700 }}>
                            +{award.points?.toLocaleString()} PTS
                          </span>
                        </div>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "8px 0" }}>"{award.description}"</p>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", borderTop: "1px dashed var(--border-color)", paddingTop: "8px" }}>
                          <span>Awarded to: <strong style={{ color: "var(--text-main)" }}>{award.recipient}</strong></span>
                          <span>Issued by: {award.issuer} • {award.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 11. EXIT CENTER */}
        {["offboarding", "my-offboarding", "org-offboarding"].includes(activeView) && (
          <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div className="glass-card">
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "32px" }}>🚪</span>
                <div>
                  <h2 style={{ margin: 0 }}>Employee Exit &amp; Full &amp; Final Settlement</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>Initiate a formal resignation notice, track multi-department clearance status (IT / HR / Finance), and compute the Full &amp; Final Settlement — covering gratuity (Payment of Gratuity Act), earned leave encashment, notice period buyout charges, and unpaid salary components.</p>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "32px" }}>
              {/* Exit application form */}
              <div className="glass-card">
                <h3 style={{ marginBottom: "20px" }}>🚪 Submit Resignation &amp; Exit Notice</h3>
                
                {myResignation ? (
                  <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ background: "rgba(var(--primary-rgb), 0.05)", padding: "16px", borderRadius: "12px", border: "1px solid var(--primary)" }}>
                      <h4 style={{ fontSize: "14px", color: "var(--primary)", marginBottom: "8px" }}>Active Resignation Request</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Resignation Filed On:</span>
                          <strong>{myResignation.resignation_date}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Requested Relieving:</span>
                          <strong>{myResignation.requested_relieving_date || "Not Specified"}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Notice Status:</span>
                          <span className="badge badge-warning" style={{ textTransform: "capitalize" }}>{myResignation.status}</span>
                        </div>
                        {myResignation.approved_relieving_date && (
                          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--success)" }}>
                            <span>Approved Exit Date:</span>
                            <strong>{myResignation.approved_relieving_date}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: "13px", marginBottom: "8px", color: "var(--text-secondary)" }}>Clearance Tracker</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                        <div style={{ border: "1px solid var(--border-color)", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
                          <span style={{ fontSize: "10px", display: "block" }}>💻 IT Clearance</span>
                          <span className={`badge badge-${myResignation.it_clearance_status === "completed" ? "success" : "warning"}`} style={{ fontSize: "9px" }}>{myResignation.it_clearance_status}</span>
                        </div>
                        <div style={{ border: "1px solid var(--border-color)", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
                          <span style={{ fontSize: "10px", display: "block" }}>🏢 HR Clearance</span>
                          <span className={`badge badge-${myResignation.hr_clearance_status === "completed" ? "success" : "warning"}`} style={{ fontSize: "9px" }}>{myResignation.hr_clearance_status}</span>
                        </div>
                        <div style={{ border: "1px solid var(--border-color)", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
                          <span style={{ fontSize: "10px", display: "block" }}>💸 Finance Clear</span>
                          <span className={`badge badge-${myResignation.finance_clearance_status === "completed" ? "success" : "warning"}`} style={{ fontSize: "9px" }}>{myResignation.finance_clearance_status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleResignSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="form-group">
                      <label className="form-label">Resignation Notice Date</label>
                      <input type="date" className="form-control" value={resignationDate} onChange={(e) => setResignationDate(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Requested Relieving Date</label>
                      <input type="date" className="form-control" value={requestedRelievingDate} onChange={(e) => setRequestedRelievingDate(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Reason for Resignation</label>
                      <textarea className="form-control" rows={3} placeholder="Please describe reasons for departure." value={resignationReason} onChange={(e) => setResignationReason(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                      File Notice (90-Days Mandatory Standard Notice)
                    </button>
                  </form>
                )}
              </div>

              {/* F&F Settlement view */}
              <div className="glass-card">
                <h3 style={{ marginBottom: "20px" }}>💸 Full & Final (F&F) Exit Settlement Console</h3>
                
                {activeFFSettlement ? (
                  <div className="animated" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Continuous Service Tenure:</span>
                        <strong style={{ color: activeFFSettlement.service_years >= 5 ? "var(--success)" : "var(--warning)" }}>
                          {activeFFSettlement.service_years.toFixed(2)} Years {activeFFSettlement.service_years >= 5 ? "(Gratuity Eligible)" : "(Under 5.0 yr limit)"}
                        </strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Notice Period Shortfall Days:</span>
                        <strong>{activeFFSettlement.notice_shortfall_days} Days</strong>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Unpaid Salary Adjustments (₹):</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>₹</span>
                          <input type="number" className="form-control" style={{ width: "100px", padding: "4px 8px" }} value={activeFFSettlement.unpaid_salary} onChange={(e) => setActiveFFSettlement({ ...activeFFSettlement, unpaid_salary: Number(e.target.value), final_net_payout: Number(e.target.value) + Number(activeFFSettlement.leave_encashment) + Number(activeFFSettlement.gratuity_payout) - Number(activeFFSettlement.notice_buyout_charge) })} />
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Leave Encashment (₹):</span>
                        <strong>₹{activeFFSettlement.leave_encashment.toFixed(2)}</strong>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Gratuity Payout (₹):</span>
                        <strong>₹{activeFFSettlement.gratuity_payout.toFixed(2)}</strong>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--danger)" }}>
                        <span>Notice Shortfall Buyout Charge (₹):</span>
                        <strong>- ₹{activeFFSettlement.notice_buyout_charge.toFixed(2)}</strong>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border-color)", paddingTop: "12px", fontSize: "16px", fontWeight: 7 }}>
                        <span>Final Net Exit Payout:</span>
                        <strong style={{ color: "var(--primary)" }}>₹{activeFFSettlement.final_net_payout.toFixed(2)}</strong>
                      </div>
                    </div>

                    {(currentUser?.role === "hr_admin" || currentUser?.role === "finance_admin") && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
                        <button className="btn btn-primary" onClick={() => handleSaveSettlement(activeFFSettlement.offboarding_id)}>
                          Approve & Finalize F&F
                        </button>
                        <button className="btn btn-secondary" style={{ background: "var(--success)" }} onClick={() => handlePaySettlement(activeFFSettlement.offboarding_id)}>
                          Mark Payout Disbursed
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "40px", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center" }}>
                    Select an active exit notice below to view or trigger continuous tenure gratuity splits and calculate full exit statements.
                  </div>
                )}
              </div>
            </div>

            {/* Admin clearance & resignations portal */}
            {(currentUser?.role === "hr_admin" || currentUser?.role === "finance_admin") && (
              <div className="glass-card">
                <h3 style={{ marginBottom: "20px" }}>🛡️ Admin Exit & Clearance Approvals Board</h3>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Notice Date</th>
                        <th>Relieving Requested</th>
                        <th>Status</th>
                        <th>IT Clearance</th>
                        <th>HR Clearance</th>
                        <th>Finance Clearance</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allResignations.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: "center", color: "var(--text-muted)" }}>No employee exits active.</td>
                        </tr>
                      ) : (
                        allResignations.map((req: any) => (
                          <tr key={req.id}>
                            <td style={{ fontWeight: 6 }}>{req.employee?.first_name} {req.employee?.last_name}</td>
                            <td>{req.resignation_date}</td>
                            <td>{req.requested_relieving_date || "Standard 90d"}</td>
                            <td>
                              <span className={`badge badge-${req.status === "approved" ? "success" : req.status === "rejected" ? "danger" : "warning"}`}>
                                {req.status}
                              </span>
                            </td>
                            <td>
                              <select className="form-control" style={{ padding: "4px 8px" }} defaultValue={req.it_clearance_status} onChange={(e) => handleClearanceAction(req.id, "it", e.target.value)}>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>
                            <td>
                              <select className="form-control" style={{ padding: "4px 8px" }} defaultValue={req.hr_clearance_status} onChange={(e) => handleClearanceAction(req.id, "hr", e.target.value)}>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>
                            <td>
                              <select className="form-control" style={{ padding: "4px 8px" }} defaultValue={req.finance_clearance_status} onChange={(e) => handleClearanceAction(req.id, "finance", e.target.value)}>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {req.status === "pending" && (
                                  <div style={{ display: "flex", gap: "4px" }}>
                                    <input type="number" className="form-control" style={{ width: "50px", padding: "4px 8px" }} placeholder="Buyout" onChange={(e) => setFfNoticeBuyoutDays(Number(e.target.value))} />
                                    <input type="date" className="form-control" style={{ width: "110px", padding: "4px 8px" }} onChange={(e) => setFfApprovedRelievingDate(e.target.value)} />
                                    <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "10px" }} onClick={() => handleResignAction(req.id, true)}>Approve</button>
                                  </div>
                                )}
                                <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "11px" }} onClick={() => handleCalculateSettlement(req.id)}>
                                  F&F Statement
                                </button>
                              </div>
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

        {/* 12. AI COPILOT VIEW (Groq real-time Llama 3 API) */}
        {activeView === "ai-copilot" && (
          <div className="glass-card chat-container animated">
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px", marginBottom: "16px" }}>
              <div>
                <h3>CogniHR AI policy Companion</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" }}>Powered by Groq Sub-Second Inference LPUs</p>
              </div>
              <button className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "12px" }} onClick={handleOcrMockUpload}>
                📎 OCR Resume Parser
              </button>
            </div>

            <div className="chat-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-bubble ${msg.sender}`}>
                  <div style={{ whiteSpace: "pre-line" }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="chat-bubble assistant" style={{ fontStyle: "italic", color: "var(--text-muted)" }}>
                  💬 CogniHR AI is thinking in sub-seconds...
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleSendAiQuery} className="chat-input-area">
              <input type="text" className="form-control" style={{ flexGrow: 1 }} placeholder="Ask policy questions e.g. How is casual leave calculated?" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} disabled={isAiLoading} />
              <button type="submit" className="btn btn-primary" disabled={isAiLoading}>
                Consult AI
              </button>
            </form>
          </div>
        )}

        {/* 13. HR REPORTS DASHBOARD */}
        {activeView === 'reports' && (
          <div className="animated">
            {activeView.startsWith("org-") && (
              <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
                <select 
                  className="form-control" 
                  style={{ maxWidth: "400px" }}
                  value={hrSelectedEmployeeId || ""}
                  onChange={(e) => setHrSelectedEmployeeId(e.target.value)}
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="glass-card" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ fontSize: '28px' }}>📋</div>
                <div>
                  <h2 style={{ margin: 0 }}>HR Analytics & Reports</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Comprehensive workforce intelligence — HR Admin only</p>
                </div>
              </div>

              {/* Tab header */}
              <div className="tabs-header" style={{ flexWrap: 'wrap', gap: '6px' }}>
                {([
                  ['headcount','📊 Workforce'],
                  ['payroll','💸 Payroll Cost'],
                  ['leave','🌴 Leave'],
                  ['insurance','🛡️ Insurance'],
                  ['car-lease','🚗 Car Lease'],
                  ['performance','📈 Performance'],
                  ['promotions','🚀 Promotions'],
                  ['exit','🚪 Exit'],
                  ['statutory','📑 Statutory'],
                ] as [string,string][]).map(([key, label]) => (
                  <button
                    key={key}
                    className={`tab-btn${activeReport === key ? ' active' : ''}`}
                    onClick={() => handleReportTabChange(key)}
                    style={{ fontSize: '12px', padding: '8px 14px' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading spinner */}
            {reportLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '20px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  border: '4px solid transparent',
                  borderTop: '4px solid var(--primary)',
                  borderRight: '4px solid var(--accent)',
                  animation: 'spin 0.9s linear infinite'
                }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Fetching report data…</p>
              </div>
            )}

            {/* Empty / initial state */}
            {!reportLoading && !reportData && (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
                <p style={{ fontSize: '16px' }}>Click a report tab to generate live HR analytics</p>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                 HEADCOUNT REPORT
            ═══════════════════════════════════════════════════════════ */}
            {!reportLoading && reportData && activeReport === 'headcount' && (() => {
              const d = reportData;
              const summary = d.summary || {};
              const deptBreakdown: any[] = d.department_breakdown || [];
              const gradeBreakdown: any[] = d.grade_breakdown || [];
              const monthlyTrend: any[] = d.monthly_joiner_trend || [];
              const maxCount = monthlyTrend.length ? Math.max(...monthlyTrend.map((m: any) => m.count || 0), 1) : 1;
              return (
                <div className="animated">
            {activeView.startsWith("org-") && (
              <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
                <select 
                  className="form-control" 
                  style={{ maxWidth: "400px" }}
                  value={hrSelectedEmployeeId || ""}
                  onChange={(e) => setHrSelectedEmployeeId(e.target.value)}
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            )}
                  {/* Summary stats */}
                  <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', marginBottom: '24px' }}>
                    {([
                      ['Total Headcount', summary.total ?? '--', 'var(--primary)'],
                      ['Active', summary.active ?? '--', 'var(--success)'],
                      ['Inactive', summary.inactive ?? '--', 'var(--text-muted)'],
                      ['New Joiners YTD', summary.new_joiners_ytd ?? '--', 'var(--accent)'],
                      ['Exits YTD', summary.exits_ytd ?? '--', 'var(--warning)'],
                      ['Attrition %', summary.attrition_pct != null ? `${summary.attrition_pct}%` : '--', 'var(--danger)'],
                    ] as [string, any, string][]).map(([label, val, color]) => (
                      <div key={label} className="glass-card stat-card" style={{ padding: '18px' }}>
                        <div className="stat-title">{label}</div>
                        <div className="stat-val" style={{ color, fontSize: '26px' }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Dept + Grade side by side */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div className="glass-card">
                      <h3 style={{ marginBottom: '16px' }}>Department Breakdown</h3>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead><tr><th>Department</th><th>Active</th><th>Inactive</th><th>Total</th></tr></thead>
                          <tbody>
                            {deptBreakdown.length === 0 ? (
                              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data</td></tr>
                            ) : deptBreakdown.map((row: any, i: number) => (
                              <tr key={i}>
                                <td style={{ fontWeight: 600 }}>{row.department || row.dept || '—'}</td>
                                <td><span style={{ color: 'var(--success)' }}>{row.active ?? row.count ?? '—'}</span></td>
                                <td>{row.inactive ?? '—'}</td>
                                <td>{row.total ?? row.count ?? '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="glass-card">
                      <h3 style={{ marginBottom: '16px' }}>Grade & Gender</h3>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead><tr><th>Grade</th><th>Male</th><th>Female</th><th>Total</th></tr></thead>
                          <tbody>
                            {gradeBreakdown.length === 0 ? (
                              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data</td></tr>
                            ) : gradeBreakdown.map((row: any, i: number) => (
                              <tr key={i}>
                                <td style={{ fontWeight: 600 }}>{row.grade ?? '—'}</td>
                                <td>{row.male ?? '—'}</td>
                                <td>{row.female ?? '—'}</td>
                                <td>{row.total ?? '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Monthly joiner trend bar chart */}
                  {monthlyTrend.length > 0 && (
                    <div className="glass-card">
                      <h3 style={{ marginBottom: '20px' }}>Monthly New Joiner Trend</h3>
                      <div style={{ width: '100%', overflow: 'visible' }}>
                        <svg viewBox="0 0 500 160" width="100%" height="160" style={{ overflow: "visible" }}>
                          <defs>
                            <linearGradient id="joinerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                              <stop offset="0%" stopColor="var(--primary)" />
                              <stop offset="100%" stopColor="var(--accent)" />
                            </linearGradient>
                            <filter id="joinerGlow" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="3.5" result="blur" />
                              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.1"/>
                              <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>

                          {/* Grid Guidelines */}
                          {[0, 0.5, 1].map((ratio, idx) => {
                            const y = 120 - ratio * 90;
                            return (
                              <line
                                key={idx}
                                x1="20"
                                y1={y}
                                x2="480"
                                y2={y}
                                stroke="var(--border-color)"
                                strokeDasharray="4,4"
                                opacity={0.12}
                              />
                            );
                          })}
                          
                          <line x1="20" y1="120" x2="480" y2="120" stroke="var(--border-color)" strokeWidth="1" opacity={0.3} />

                          {monthlyTrend.map((m: any, i: number) => {
                            const colWidth = (460) / Math.max(monthlyTrend.length, 1);
                            const x = 30 + i * colWidth + (colWidth - 18) / 2;
                            const barHeight = Math.max(((m.count || 0) / (maxCount || 1)) * 90, 4);
                            const y = 120 - barHeight;

                            return (
                              <g key={i} style={{ cursor: 'pointer' }}>
                                {/* Gradient rounded bar */}
                                <rect
                                  x={x}
                                  y={y}
                                  width="18"
                                  height={barHeight}
                                  rx="4"
                                  fill="url(#joinerGrad)"
                                  filter="url(#joinerGlow)"
                                  style={{ transition: 'all 0.3s ease' }}
                                />
                                {/* Gloss overlay */}
                                <rect
                                  x={x + 1}
                                  y={y + 1}
                                  width="16"
                                  height="4"
                                  rx="2"
                                  fill="rgba(255, 255, 255, 0.12)"
                                  style={{ pointerEvents: 'none' }}
                                />
                                {/* Text Count above bar */}
                                <text
                                  x={x + 9}
                                  y={y - 6}
                                  textAnchor="middle"
                                  fill="var(--text-primary)"
                                  style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-sans)' }}
                                >
                                  {m.count ?? 0}
                                </text>
                                {/* Period label below bar */}
                                <text
                                  x={x + 9}
                                  y="136"
                                  textAnchor="middle"
                                  fill="var(--text-muted)"
                                  style={{ fontSize: '9px', fontWeight: 7, fontFamily: 'var(--font-sans)' }}
                                >
                                  {m.month ?? m.period ?? `M${i+1}`}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ═══════════════════════════════════════════════════════════
                 PAYROLL COST REPORT
            ═══════════════════════════════════════════════════════════ */}
            {!reportLoading && reportData && activeReport === 'payroll' && (() => {
              const d = reportData;
              const summary = d.summary || {};
              const monthly: any[] = d.monthly_breakdown || [];
              const deptCost: any[] = (d.department_cost || []).sort((a: any, b: any) => (b.total_cost ?? 0) - (a.total_cost ?? 0));
              return (
                <div className="animated">
            {activeView.startsWith("org-") && (
              <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
                <select 
                  className="form-control" 
                  style={{ maxWidth: "400px" }}
                  value={hrSelectedEmployeeId || ""}
                  onChange={(e) => setHrSelectedEmployeeId(e.target.value)}
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            )}
                  <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', marginBottom: '24px' }}>
                    {([
                      ['Total Gross', summary.total_gross, 'var(--primary)'],
                      ['Total PF', summary.total_pf, 'var(--accent)'],
                      ['Total TDS', summary.total_tds, 'var(--warning)'],
                      ['Net Payout', summary.net_payout, 'var(--success)'],
                    ] as [string, any, string][]).map(([label, val, color]) => (
                      <div key={label} className="glass-card stat-card" style={{ padding: '18px' }}>
                        <div className="stat-title">{label}</div>
                        <div className="stat-val" style={{ color, fontSize: '22px' }}>
                          {val != null ? `₹${Number(val).toLocaleString('en-IN')}` : '--'}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="glass-card">
                      <h3 style={{ marginBottom: '16px' }}>Monthly Payroll Breakdown</h3>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead><tr><th>Month</th><th>Gross</th><th>PF</th><th>TDS</th><th>Net</th></tr></thead>
                          <tbody>
                            {monthly.length === 0 ? (
                              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data</td></tr>
                            ) : monthly.map((row: any, i: number) => (
                              <tr key={i}>
                                <td>{row.month}</td>
                                <td>₹{Number(row.gross ?? 0).toLocaleString('en-IN')}</td>
                                <td>₹{Number(row.pf ?? 0).toLocaleString('en-IN')}</td>
                                <td>₹{Number(row.tds ?? 0).toLocaleString('en-IN')}</td>
                                <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{Number(row.net ?? 0).toLocaleString('en-IN')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="glass-card">
                      <h3 style={{ marginBottom: '16px' }}>Department Cost (Descending)</h3>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead><tr><th>Department</th><th>Employees</th><th>Total Cost</th></tr></thead>
                          <tbody>
                            {deptCost.length === 0 ? (
                              <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data</td></tr>
                            ) : deptCost.map((row: any, i: number) => (
                              <tr key={i}>
                                <td style={{ fontWeight: 600 }}>{row.department}</td>
                                <td>{row.employee_count ?? '—'}</td>
                                <td style={{ color: 'var(--primary)' }}>₹{Number(row.total_cost ?? 0).toLocaleString('en-IN')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ═══════════════════════════════════════════════════════════
                 LEAVE UTILIZATION REPORT
            ═══════════════════════════════════════════════════════════ */}
            {!reportLoading && reportData && activeReport === 'leave' && (() => {
              const d = reportData;
              const summary = d.summary || {};
              const leaveTypes: any[] = d.leave_type_breakdown || [];
              const empUtil: any[] = d.employee_utilization || [];
              const utilColor = (pct: number) =>
                pct < 50 ? 'var(--success)' : pct < 80 ? 'var(--warning)' : 'var(--danger)';
              return (
                <div className="animated">
            {activeView.startsWith("org-") && (
              <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
                <select 
                  className="form-control" 
                  style={{ maxWidth: "400px" }}
                  value={hrSelectedEmployeeId || ""}
                  onChange={(e) => setHrSelectedEmployeeId(e.target.value)}
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            )}
                  <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', marginBottom: '24px' }}>
                    {([
                      ['Total Allocated', summary.total_allocated, 'var(--primary)'],
                      ['Total Used', summary.total_used, 'var(--accent)'],
                      ['Utilization %', summary.overall_utilization_pct != null ? `${summary.overall_utilization_pct}%` : '--', utilColor(summary.overall_utilization_pct ?? 0)],
                      ['Pending Requests', summary.pending_requests, 'var(--warning)'],
                    ] as [string, any, string][]).map(([label, val, color]) => (
                      <div key={label} className="glass-card stat-card" style={{ padding: '18px' }}>
                        <div className="stat-title">{label}</div>
                        <div className="stat-val" style={{ color, fontSize: '26px' }}>{val ?? '--'}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div className="glass-card">
                      <h3 style={{ marginBottom: '16px' }}>Leave Type Usage</h3>
                      {leaveTypes.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No data available</p>
                      ) : leaveTypes.map((lt: any, i: number) => {
                        const pct = lt.allocated ? Math.min(Math.round((lt.used / lt.allocated) * 100), 100) : 0;
                        return (
                          <div key={i} style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontWeight: 600, fontSize: '13px' }}>{lt.leave_type}</span>
                              <span style={{ fontSize: '12px', color: utilColor(pct) }}>{lt.used ?? 0} / {lt.allocated ?? 0} days ({pct}%)</span>
                            </div>
                            <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--grad-brand)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="glass-card">
                      <h3 style={{ marginBottom: '16px' }}>Employee Utilization</h3>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead><tr><th>Employee</th><th>Used</th><th>Allocated</th><th>Utilization</th></tr></thead>
                          <tbody>
                            {empUtil.length === 0 ? (
                              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data</td></tr>
                            ) : empUtil.map((row: any, i: number) => {
                              const pct = row.allocated ? Math.round((row.used / row.allocated) * 100) : 0;
                              return (
                                <tr key={i}>
                                  <td style={{ fontWeight: 600 }}>{row.employee_name ?? row.name ?? '—'}</td>
                                  <td>{row.used ?? 0}</td>
                                  <td>{row.allocated ?? 0}</td>
                                  <td><span className="badge" style={{ background: utilColor(pct), color: '#fff', padding: '3px 8px', borderRadius: '10px', fontSize: '11px' }}>{pct}%</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ═══════════════════════════════════════════════════════════
                 INSURANCE COVERAGE REPORT
            ═══════════════════════════════════════════════════════════ */}
            {!reportLoading && reportData && activeReport === 'insurance' && (() => {
              const d = reportData;
              const summary = d.summary || {};
              const tiers: any[] = d.tier_distribution || [];
              const details: any[] = d.enrollment_details || [];
              const enrollPct = summary.total_employees ? Math.round((summary.enrolled / summary.total_employees) * 100) : 0;
              const conicStop = `${enrollPct * 3.6}deg`;
              return (
                <div className="animated">
            {activeView.startsWith("org-") && (
              <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
                <select 
                  className="form-control" 
                  style={{ maxWidth: "400px" }}
                  value={hrSelectedEmployeeId || ""}
                  onChange={(e) => setHrSelectedEmployeeId(e.target.value)}
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            )}
                  <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', marginBottom: '24px' }}>
                    {([
                      ['Total Employees', summary.total_employees, 'var(--primary)'],
                      ['Enrolled', summary.enrolled, 'var(--success)'],
                      ['Unenrolled', summary.unenrolled, 'var(--danger)'],
                      ['Total Dependents', summary.total_dependents, 'var(--accent)'],
                      ['Top-up Adopters', summary.top_up_adopters, 'var(--warning)'],
                      ['Annual Premium', summary.annual_premium != null ? `₹${Number(summary.annual_premium).toLocaleString('en-IN')}` : '--', 'var(--primary)'],
                    ] as [string, any, string][]).map(([label, val, color]) => (
                      <div key={label} className="glass-card stat-card" style={{ padding: '16px' }}>
                        <div className="stat-title" style={{ fontSize: '11px' }}>{label}</div>
                        <div className="stat-val" style={{ color, fontSize: '20px' }}>{val ?? '--'}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px', marginBottom: '24px' }}>
                    {/* Donut enrollment ring */}
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                      <div style={{
                        width: '120px', height: '120px', borderRadius: '50%',
                        background: `conic-gradient(var(--primary) 0deg ${conicStop}, var(--border-color) ${conicStop} 360deg)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative'
                      }}>
                        <div style={{
                          width: '80px', height: '80px', borderRadius: '50%',
                          background: 'var(--bg-card)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', flexDirection: 'column'
                        }}>
                          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>{enrollPct}%</div>
                          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Enrolled</div>
                        </div>
                      </div>
                      <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Enrollment Rate</p>
                    </div>

                    <div className="glass-card">
                      <h3 style={{ marginBottom: '16px' }}>Tier Distribution</h3>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead><tr><th>Tier</th><th>Employees</th><th>Sum Insured</th><th>Monthly Premium</th></tr></thead>
                          <tbody>
                            {tiers.length === 0 ? (
                              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data</td></tr>
                            ) : tiers.map((row: any, i: number) => (
                              <tr key={i}>
                                <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{row.tier}</td>
                                <td>{row.employee_count ?? '—'}</td>
                                <td>₹{Number(row.sum_insured ?? 0).toLocaleString('en-IN')}</td>
                                <td>₹{Number(row.monthly_premium ?? 0).toLocaleString('en-IN')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card">
                    <h3 style={{ marginBottom: '16px' }}>Employee Enrollment Details</h3>
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead><tr><th>Employee</th><th>Tier</th><th>Spouse</th><th>Parents</th><th>Children</th><th>Top-up</th><th>Annual Premium</th></tr></thead>
                        <tbody>
                          {details.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No enrollment records</td></tr>
                          ) : details.map((row: any, i: number) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 600 }}>{row.employee_name ?? '—'}</td>
                              <td><span className="badge" style={{ background: 'rgba(0,194,212,0.15)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '8px', fontSize: '11px' }}>{row.tier}</span></td>
                              <td>{row.has_spouse ? '✅' : '—'}</td>
                              <td>{row.has_parents ? '✅' : '—'}</td>
                              <td>{row.children_count ?? 0}</td>
                              <td>{row.top_up_sum_insured ? `₹${Number(row.top_up_sum_insured).toLocaleString('en-IN')}` : '—'}</td>
                              <td style={{ color: 'var(--primary)' }}>₹{Number(row.annual_premium ?? 0).toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ═══════════════════════════════════════════════════════════
                 CAR LEASE PORTFOLIO REPORT
            ═══════════════════════════════════════════════════════════ */}
            {!reportLoading && reportData && activeReport === 'car-lease' && (() => {
              const d = reportData;
              const summary = d.summary || {};
              const leases: any[] = d.lease_details || [];
              const expiring: any[] = d.expiring_soon || [];
              const today = new Date();
              const daysUntil = (dateStr: string) => {
                const diff = new Date(dateStr).getTime() - today.getTime();
                return Math.ceil(diff / (1000 * 60 * 60 * 24));
              };
              return (
                <div className="animated">
            {activeView.startsWith("org-") && (
              <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
                <select 
                  className="form-control" 
                  style={{ maxWidth: "400px" }}
                  value={hrSelectedEmployeeId || ""}
                  onChange={(e) => setHrSelectedEmployeeId(e.target.value)}
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            )}
                  <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', marginBottom: '24px' }}>
                    {([
                      ['Active Leases', summary.active_leases, 'var(--primary)'],
                      ['Adoption Rate', summary.adoption_rate != null ? `${summary.adoption_rate}%` : '--', 'var(--accent)'],
                      ['Monthly EMI Total', summary.total_monthly_emi != null ? `₹${Number(summary.total_monthly_emi).toLocaleString('en-IN')}` : '--', 'var(--warning)'],
                      ['Annual Perquisite', summary.annual_perquisite_value != null ? `₹${Number(summary.annual_perquisite_value).toLocaleString('en-IN')}` : '--', 'var(--success)'],
                    ] as [string, any, string][]).map(([label, val, color]) => (
                      <div key={label} className="glass-card stat-card" style={{ padding: '18px' }}>
                        <div className="stat-title">{label}</div>
                        <div className="stat-val" style={{ color, fontSize: '22px' }}>{val ?? '--'}</div>
                      </div>
                    ))}
                  </div>

                  {expiring.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ marginBottom: '12px' }}>⚠️ Expiring Soon</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {expiring.map((e: any, i: number) => {
                          const days = daysUntil(e.end_date);
                          const borderColor = days < 30 ? 'var(--danger)' : 'var(--warning)';
                          return (
                            <div key={i} className="glass-card" style={{ padding: '16px', borderLeft: `3px solid ${borderColor}`, minWidth: '220px' }}>
                              <div style={{ fontWeight: 700, marginBottom: '4px' }}>{e.employee_name ?? '—'}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{e.car_model}</div>
                              <div style={{ fontSize: '12px', marginTop: '6px', color: borderColor, fontWeight: 600 }}>
                                Expires: {e.end_date} ({days}d remaining)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="glass-card">
                    <h3 style={{ marginBottom: '16px' }}>Lease Portfolio Details</h3>
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead><tr><th>Employee</th><th>Car Model</th><th>Type</th><th>Tenure</th><th>Monthly EMI</th><th>Start</th><th>End</th></tr></thead>
                        <tbody>
                          {leases.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No active leases</td></tr>
                          ) : leases.map((row: any, i: number) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 600 }}>{row.employee_name ?? '—'}</td>
                              <td>{row.car_model}</td>
                              <td><span className="badge" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent)', padding: '3px 8px', borderRadius: '8px', fontSize: '11px', textTransform: 'uppercase' }}>{row.lease_type}</span></td>
                              <td>{row.lease_tenure_months}m</td>
                              <td style={{ color: 'var(--primary)' }}>₹{Number(row.monthly_emi ?? 0).toLocaleString('en-IN')}</td>
                              <td>{row.start_date ?? '—'}</td>
                              <td>{row.end_date ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ═══════════════════════════════════════════════════════════
                 PERFORMANCE APPRAISAL REPORT
            ═══════════════════════════════════════════════════════════ */}
            {!reportLoading && reportData && activeReport === 'performance' && (() => {
              const d = reportData;
              const summary = d.summary || {};
              const distribution: any[] = d.rating_distribution || [];
              const maxDistPct = distribution.length ? Math.max(...distribution.map((r: any) => r.percentage ?? 0), 1) : 1;
              const topPerformers: any[] = d.top_performers || [];
              const bottomPerformers: any[] = d.bottom_performers || [];
              const gapAnalysis: any[] = d.rating_gap_analysis || [];
              return (
                <div className="animated">
            {activeView.startsWith("org-") && (
              <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
                <select 
                  className="form-control" 
                  style={{ maxWidth: "400px" }}
                  value={hrSelectedEmployeeId || ""}
                  onChange={(e) => setHrSelectedEmployeeId(e.target.value)}
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            )}
                  <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', marginBottom: '24px' }}>
                    {([
                      ['Completion Rate', summary.completion_rate != null ? `${summary.completion_rate}%` : '--', 'var(--primary)'],
                      ['Avg Self Rating', summary.avg_self_rating != null ? Number(summary.avg_self_rating).toFixed(2) : '--', 'var(--accent)'],
                      ['Avg Mgr Rating', summary.avg_manager_rating != null ? Number(summary.avg_manager_rating).toFixed(2) : '--', 'var(--success)'],
                      ['Rating Inflation', summary.rating_inflation != null ? `${summary.rating_inflation > 0 ? '+' : ''}${summary.rating_inflation}` : '--', summary.rating_inflation > 0 ? 'var(--warning)' : 'var(--success)'],
                    ] as [string, any, string][]).map(([label, val, color]) => (
                      <div key={label} className="glass-card stat-card" style={{ padding: '18px' }}>
                        <div className="stat-title">{label}</div>
                        <div className="stat-val" style={{ color, fontSize: '26px' }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Bell Curve distribution horizontal bar chart */}
                  {distribution.length > 0 && (
                    <div className="glass-card" style={{ marginBottom: '20px' }}>
                      <h3 style={{ marginBottom: '16px' }}>Rating Distribution (Bell Curve)</h3>
                      {distribution.map((row: any, i: number) => {
                        const barWidth = Math.round(((row.percentage ?? 0) / maxDistPct) * 100);
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                            <div style={{ width: '80px', textAlign: 'right', fontSize: '13px', color: 'var(--text-secondary)', flexShrink: 0 }}>Rating {row.rating ?? row.label}</div>
                             <div style={{ flex: 1, height: '18px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '9px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center' }}>
                              <div style={{ height: '100%', width: `${barWidth}%`, background: 'linear-gradient(90deg, var(--accent) 0%, var(--primary) 100%)', borderRadius: '9px', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', alignItems: 'center', paddingLeft: '12px', position: 'relative', boxShadow: 'inset 0 0 8px rgba(255,255,255,0.2), 0 0 12px rgba(15, 82, 186, 0.3)' }}>
                                <span style={{ fontSize: '10px', color: '#fff', fontWeight: 800, whiteSpace: 'nowrap', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>{row.count ?? 0} ({row.percentage ?? 0}%)</span>
                                {barWidth > 0 && (
                                  <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '4px', background: '#ffffff', filter: 'blur(1px)', opacity: 0.8 }} />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div className="glass-card">
                      <h3 style={{ marginBottom: '12px', color: 'var(--success)' }}>🏆 Top Performers</h3>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead><tr><th>Employee</th><th>Self</th><th>Manager</th><th>Final</th></tr></thead>
                          <tbody>
                            {topPerformers.length === 0 ? (
                              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data</td></tr>
                            ) : topPerformers.map((row: any, i: number) => (
                              <tr key={i}>
                                <td style={{ fontWeight: 600 }}>{row.employee_name ?? '—'}</td>
                                <td>{row.self_rating ?? '—'}</td>
                                <td>{row.manager_rating ?? '—'}</td>
                                <td><span style={{ color: 'var(--success)', fontWeight: 700 }}>{row.final_rating ?? '—'}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="glass-card">
                      <h3 style={{ marginBottom: '12px', color: 'var(--danger)' }}>📉 Needs Improvement</h3>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead><tr><th>Employee</th><th>Self</th><th>Manager</th><th>Final</th></tr></thead>
                          <tbody>
                            {bottomPerformers.length === 0 ? (
                              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data</td></tr>
                            ) : bottomPerformers.map((row: any, i: number) => (
                              <tr key={i}>
                                <td style={{ fontWeight: 600 }}>{row.employee_name ?? '—'}</td>
                                <td>{row.self_rating ?? '—'}</td>
                                <td>{row.manager_rating ?? '—'}</td>
                                <td><span style={{ color: 'var(--danger)', fontWeight: 700 }}>{row.final_rating ?? '—'}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {gapAnalysis.length > 0 && (
                    <div className="glass-card">
                      <h3 style={{ marginBottom: '16px' }}>Rating Gap Analysis</h3>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead><tr><th>Employee</th><th>Self Rating</th><th>Mgr Rating</th><th>Gap</th><th>Assessment</th></tr></thead>
                          <tbody>
                            {gapAnalysis.map((row: any, i: number) => {
                              const gap = (row.manager_rating ?? 0) - (row.self_rating ?? 0);
                              return (
                                <tr key={i}>
                                  <td style={{ fontWeight: 600 }}>{row.employee_name ?? '—'}</td>
                                  <td>{row.self_rating}</td>
                                  <td>{row.manager_rating}</td>
                                  <td style={{ color: gap > 0 ? 'var(--success)' : gap < 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 700 }}>
                                    {gap > 0 ? `+${gap}` : gap}
                                  </td>
                                  <td>{row.assessment ?? (gap > 0 ? 'Under-rated' : gap < 0 ? 'Over-rated' : 'Aligned')}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ═══════════════════════════════════════════════════════════
                 PROMOTIONS PIPELINE REPORT
            ═══════════════════════════════════════════════════════════ */}
            {!reportLoading && reportData && activeReport === 'promotions' && (() => {
              const d = reportData;
              const summary = d.summary || {};
              const gradePipeline: any[] = d.grade_pipeline || [];
              const highReadiness: any[] = d.high_readiness_candidates || [];
              return (
                <div className="animated">
            {activeView.startsWith("org-") && (
              <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
                <select 
                  className="form-control" 
                  style={{ maxWidth: "400px" }}
                  value={hrSelectedEmployeeId || ""}
                  onChange={(e) => setHrSelectedEmployeeId(e.target.value)}
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            )}
                  <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', marginBottom: '24px' }}>
                    {([
                      ['Employees Analyzed', summary.total_analyzed, 'var(--primary)'],
                      ['Promotion Ready', summary.promotion_ready, 'var(--success)'],
                      ['Avg Readiness Score', summary.avg_readiness_score != null ? `${Number(summary.avg_readiness_score).toFixed(1)}%` : '--', 'var(--accent)'],
                    ] as [string, any, string][]).map(([label, val, color]) => (
                      <div key={label} className="glass-card stat-card" style={{ padding: '18px' }}>
                        <div className="stat-title">{label}</div>
                        <div className="stat-val" style={{ color, fontSize: '26px' }}>{val ?? '--'}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div className="glass-card">
                      <h3 style={{ marginBottom: '16px' }}>Grade Pipeline</h3>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead><tr><th>Grade</th><th>Count</th><th>Avg Readiness</th><th>Readiness Bar</th></tr></thead>
                          <tbody>
                            {gradePipeline.length === 0 ? (
                              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data</td></tr>
                            ) : gradePipeline.map((row: any, i: number) => {
                              const pct = Math.min(Math.round(row.avg_readiness ?? 0), 100);
                              return (
                                <tr key={i}>
                                  <td style={{ fontWeight: 600 }}>{row.grade ?? '—'}</td>
                                  <td>{row.count ?? '—'}</td>
                                  <td>{pct}%</td>
                                  <td>
                                    <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', width: '100px' }}>
                                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--grad-brand)', borderRadius: '4px' }} />
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="glass-card">
                      <h3 style={{ marginBottom: '16px', color: 'var(--success)' }}>🌟 High Readiness Candidates</h3>
                      {highReadiness.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No high-readiness candidates found</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {highReadiness.map((cand: any, i: number) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,194,212,0.06)', borderRadius: '8px', border: '1px solid rgba(0,194,212,0.15)' }}>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '13px' }}>{cand.employee_name ?? '—'}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cand.current_grade} → {cand.recommended_grade ?? 'Next Grade'}</div>
                              </div>
                              <div style={{ background: 'var(--grad-brand)', color: '#fff', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: 700 }}>
                                {Number(cand.readiness_score ?? 0).toFixed(0)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ═══════════════════════════════════════════════════════════
                 EXIT / ATTRITION REPORT
            ═══════════════════════════════════════════════════════════ */}
            {!reportLoading && reportData && activeReport === 'exit' && (() => {
              const d = reportData;
              const summary = d.summary || {};
              const clearance = d.clearance_bottleneck || {};
              const exits: any[] = d.exit_details || [];
              return (
                <div className="animated">
            {activeView.startsWith("org-") && (
              <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
                <select 
                  className="form-control" 
                  style={{ maxWidth: "400px" }}
                  value={hrSelectedEmployeeId || ""}
                  onChange={(e) => setHrSelectedEmployeeId(e.target.value)}
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            )}
                  <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', marginBottom: '24px' }}>
                    {([
                      ['Total Exits', summary.total_exits, 'var(--primary)'],
                      ['Exits This Year', summary.exits_this_year, 'var(--warning)'],
                      ['Avg Tenure (yrs)', summary.avg_tenure_years != null ? Number(summary.avg_tenure_years).toFixed(1) : '--', 'var(--accent)'],
                      ['F&F Liability', summary.total_ff_liability != null ? `₹${Number(summary.total_ff_liability).toLocaleString('en-IN')}` : '--', 'var(--danger)'],
                      ['Gratuity Paid', summary.gratuity_paid != null ? `₹${Number(summary.gratuity_paid).toLocaleString('en-IN')}` : '--', 'var(--success)'],
                    ] as [string, any, string][]).map(([label, val, color]) => (
                      <div key={label} className="glass-card stat-card" style={{ padding: '18px' }}>
                        <div className="stat-title">{label}</div>
                        <div className="stat-val" style={{ color, fontSize: '22px' }}>{val ?? '--'}</div>
                      </div>
                    ))}
                  </div>

                  {/* Clearance bottleneck */}
                  <div className="glass-card" style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '14px' }}>🚦 Clearance Bottlenecks (Pending)</h3>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {[['IT', clearance.it_pending, 'var(--warning)'], ['HR', clearance.hr_pending, 'var(--accent)'], ['Finance', clearance.finance_pending, 'var(--danger)']]
                        .map(([dept, count, color]) => (
                          <div key={dept as string} style={{ padding: '14px 24px', background: `${color}18`, border: `1px solid ${color}40`, borderRadius: '10px', textAlign: 'center', minWidth: '100px' }}>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: color as string }}>{count ?? 0}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{dept} Pending</div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="glass-card">
                    <h3 style={{ marginBottom: '16px' }}>Exit Records</h3>
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead><tr><th>Employee</th><th>Resigned</th><th>Relieving</th><th>Status</th><th>F&F Amount</th><th>Reason</th></tr></thead>
                        <tbody>
                          {exits.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No exit records</td></tr>
                          ) : exits.map((row: any, i: number) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 600 }}>{row.employee_name ?? '—'}</td>
                              <td>{row.resignation_date ?? '—'}</td>
                              <td>{row.relieving_date ?? '—'}</td>
                              <td>
                                <span className={`badge badge-${row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'danger' : 'warning'}`}>
                                  {row.status ?? 'pending'}
                                </span>
                              </td>
                              <td style={{ color: 'var(--primary)' }}>{row.ff_amount != null ? `₹${Number(row.ff_amount).toLocaleString('en-IN')}` : '—'}</td>
                              <td style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '200px' }}>{row.reason ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ═══════════════════════════════════════════════════════════
                 STATUTORY COMPLIANCE REPORT
            ═══════════════════════════════════════════════════════════ */}
            {!reportLoading && reportData && activeReport === 'statutory' && (() => {
              const d = reportData;
              const summary = d.summary || {};
              const epf: any[] = d.epf_challan || [];
              const pt: any[] = d.pt_register || [];
              const tds: any[] = d.tds_register || [];
              const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
              return (
                <div className="animated">
            {activeView.startsWith("org-") && (
              <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
                <select 
                  className="form-control" 
                  style={{ maxWidth: "400px" }}
                  value={hrSelectedEmployeeId || ""}
                  onChange={(e) => setHrSelectedEmployeeId(e.target.value)}
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            )}
                  {/* Month/Year selector */}
                  <div className="glass-card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Filing Period:</label>
                    <select className="form-control" style={{ width: '120px' }} value={statutoryMonth} onChange={(e) => setStatutoryMonth(Number(e.target.value))}>
                      {monthNames.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                    </select>
                    <select className="form-control" style={{ width: '100px' }} value={statutoryYear} onChange={(e) => setStatutoryYear(Number(e.target.value))}>
                      {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => fetchReport('statutory')}>
                      Fetch Report
                    </button>
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>✅ Data ready for EPFO/PT/TDS filing</span>
                  </div>

                  {/* Summary tiles */}
                  <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', marginBottom: '24px' }}>
                    {([
                      ['EPF Employee', summary.epf_employee_total, 'var(--primary)'],
                      ['EPF Employer', summary.epf_employer_total, 'var(--accent)'],
                      ['PT Total', summary.pt_total, 'var(--warning)'],
                      ['TDS Total', summary.tds_total, 'var(--danger)'],
                      ['Total Statutory Liability', summary.total_liability, 'var(--success)'],
                    ] as [string, any, string][]).map(([label, val, color]) => (
                      <div key={label} className="glass-card stat-card" style={{ padding: '16px' }}>
                        <div className="stat-title" style={{ fontSize: '11px' }}>{label}</div>
                        <div className="stat-val" style={{ color, fontSize: '20px' }}>
                          {val != null ? `₹${Number(val).toLocaleString('en-IN')}` : '--'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Collapsible sections */}
                  {([
                    { key: 'epf', label: '📋 EPF Challan', data: epf, cols: ['Employee', 'UAN', 'EPF Employee', 'EPF Employer', 'EPS', 'Total'], fields: ['employee_name', 'uan', 'epf_employee', 'epf_employer', 'eps', 'total'] },
                    { key: 'pt', label: '🏛️ PT Register', data: pt, cols: ['Employee', 'State', 'Gross Salary', 'PT Amount'], fields: ['employee_name', 'state', 'gross_salary', 'pt_amount'] },
                    { key: 'tds', label: '💼 TDS Register', data: tds, cols: ['Employee', 'PAN', 'Gross Income', 'Deductions', 'Taxable Income', 'TDS'], fields: ['employee_name', 'pan', 'gross_income', 'deductions', 'taxable_income', 'tds_amount'] },
                  ] as { key: string; label: string; data: any[]; cols: string[]; fields: string[] }[]).map(({ key, label, data, cols, fields }) => (
                    <div key={key} className="glass-card" style={{ marginBottom: '16px' }}>
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: expandedSection === key ? '16px' : 0 }}
                        onClick={() => setExpandedSection(expandedSection === key ? '' : key)}
                      >
                        <h3 style={{ margin: 0 }}>{label} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({data.length} records)</span></h3>
                        <span style={{ color: 'var(--primary)', fontSize: '20px' }}>{expandedSection === key ? '▲' : '▼'}</span>
                      </div>
                      {expandedSection === key && (
                        <div className="table-responsive">
                          <table className="data-table">
                            <thead><tr>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
                            <tbody>
                              {data.length === 0 ? (
                                <tr><td colSpan={cols.length} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data for this period</td></tr>
                              ) : data.map((row: any, i: number) => (
                                <tr key={i}>
                                  {fields.map(f => (
                                    <td key={f}>
                                      {['epf_employee','epf_employer','eps','total','gross_salary','pt_amount','gross_income','deductions','taxable_income','tds_amount'].includes(f)
                                        ? (row[f] != null ? `₹${Number(row[f]).toLocaleString('en-IN')}` : '—')
                                        : row[f] ?? '—'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* 14. 🏛️ ERP MASTERS CONSOLE */}
        {activeView === "erp-masters" && (
          <div className="animated">
            {activeView.startsWith("org-") && (
              <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
                <select 
                  className="form-control" 
                  style={{ maxWidth: "400px" }}
                  value={hrSelectedEmployeeId || ""}
                  onChange={(e) => setHrSelectedEmployeeId(e.target.value)}
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="glass-card" style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <span style={{ fontSize: "28px" }}>🏛️</span>
                <div>
                  <h2 style={{ margin: 0 }}>Enterprise System Configuration Control Panel</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>Decoupled Salary Bands, Client Portfolios, Project Staffing Capacity & Skill Frameworks</p>
                </div>
              </div>

              {/* Sub-tab navigation */}
              <div className="tabs-header" style={{ flexWrap: "wrap", gap: "6px" }}>
                {([
                  ["clients", "💼 Client Portfolios"],
                  ["projects", "🚀 Projects Catalog"],
                  ["allocations", "📌 Staffing Allocations"],
                  ["bands-titles", "🏷️ Salary Bands & Titles"],
                ] as [string, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    className={`tab-btn${erpActiveTab === key ? " active" : ""}`}
                    onClick={() => setErpActiveTab(key)}
                    style={{ fontSize: "12.5px", padding: "8px 16px" }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {erpLoading && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: "20px" }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "50%",
                  border: "4px solid transparent",
                  borderTop: "4px solid var(--primary)",
                  borderRight: "4px solid var(--accent)",
                  animation: "spin 0.9s linear infinite"
                }} />
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Fetching Enterprise ERP registers...</p>
              </div>
            )}

            {!erpLoading && (
              <div className="animated">
            {activeView.startsWith("org-") && (
              <div className="glass-card" style={{ marginBottom: "24px", background: "rgba(139, 92, 246, 0.05)", borderLeft: "4px solid var(--accent)" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>HR Admin: Select Employee to View Details</h3>
                <select 
                  className="form-control" 
                  style={{ maxWidth: "400px" }}
                  value={hrSelectedEmployeeId || ""}
                  onChange={(e) => setHrSelectedEmployeeId(e.target.value)}
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
            )}
                {/* TABS 1: CLIENTS */}
                {erpActiveTab === "clients" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
                    <div className="glass-card">
                      <h3 style={{ marginBottom: "16px" }}>Registered Clients Portfolio</h3>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Code</th>
                              <th>Name</th>
                              <th>Domain / Industry</th>
                              <th>Country</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clients.length === 0 ? (
                              <tr>
                                <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>No clients configured. Use the form to add one.</td>
                              </tr>
                            ) : (
                              clients.map((c) => (
                                <tr key={c.id}>
                                  <td style={{ fontWeight: 700, color: "var(--primary)" }}>{c.code}</td>
                                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                                  <td>{c.domain_industry || "General / Diverse"}</td>
                                  <td>{c.country}</td>
                                  <td>
                                    <button
                                      className="btn btn-secondary"
                                      style={{ padding: "4px 8px", fontSize: "11px" }}
                                      onClick={() => {
                                        setEditingClientId(c.id);
                                        setClientName(c.name);
                                        setClientCode(c.code);
                                        setClientIndustry(c.domain_industry || "");
                                        setClientCountry(c.country);
                                      }}
                                    >
                                      Edit
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="glass-card">
                      <h3>{editingClientId ? "📝 Modify Client Record" : "➕ Onboard Client Account"}</h3>
                      <form onSubmit={saveClient} style={{ marginTop: "16px" }}>
                        <div className="form-group">
                          <label className="form-label">Client Code (Short)</label>
                          <input type="text" className="form-control" required placeholder="e.g. MSFT" value={clientCode} onChange={(e) => setClientCode(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Client Full Name</label>
                          <input type="text" className="form-control" required placeholder="e.g. Microsoft Corporation" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Domain / Sector</label>
                          <input type="text" className="form-control" placeholder="e.g. Technology & Cloud" value={clientIndustry} onChange={(e) => setClientIndustry(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ marginBottom: "20px" }}>
                          <label className="form-label">Country Jurisdiction</label>
                          <input type="text" className="form-control" required placeholder="e.g. United States" value={clientCountry} onChange={(e) => setClientCountry(e.target.value)} />
                        </div>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                          {editingClientId && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: "8px 16px" }}
                              onClick={() => {
                                setEditingClientId(null);
                                setClientName("");
                                setClientCode("");
                                setClientIndustry("");
                                setClientCountry("India");
                              }}
                            >
                              Cancel
                            </button>
                          )}
                          <button type="submit" className="btn btn-primary" style={{ padding: "8px 20px" }}>
                            {editingClientId ? "Update Details" : "Register Client"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* TABS 2: PROJECTS */}
                {erpActiveTab === "projects" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
                    <div className="glass-card">
                      <h3 style={{ marginBottom: "16px" }}>Corporate Projects Catalog</h3>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Code</th>
                              <th>Project Title</th>
                              <th>Account Client</th>
                              <th>Billing Type</th>
                              <th>SOW Timeline</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projects.length === 0 ? (
                              <tr>
                                <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>No active projects recorded.</td>
                              </tr>
                            ) : (
                              projects.map((p) => {
                                const cli = clients.find(c => c.id === p.client_id);
                                return (
                                  <tr key={p.id}>
                                    <td style={{ fontWeight: 700, color: "var(--accent)" }}>{p.code}</td>
                                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                                    <td>{cli ? `${cli.name} (${cli.code})` : "Direct Account"}</td>
                                    <td><span className="badge" style={{ background: "rgba(0,194,212,0.1)", color: "var(--primary)" }}>{p.billing_type}</span></td>
                                    <td style={{ fontSize: "12px" }}>{p.start_date || "Continuous"} to {p.end_date || "Continuous"}</td>
                                    <td>
                                      <button
                                        className="btn btn-secondary"
                                        style={{ padding: "4px 8px", fontSize: "11px" }}
                                        onClick={() => {
                                          setEditingProjectId(p.id);
                                          setProjectClientId(p.client_id);
                                          setProjectName(p.name);
                                          setProjectCode(p.code);
                                          setProjectBillingType(p.billing_type);
                                          setProjectStart(p.start_date || "");
                                          setProjectEnd(p.end_date || "");
                                        }}
                                      >
                                        Edit
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="glass-card">
                      <h3>{editingProjectId ? "📝 Modify Project Blueprint" : "🚀 Spawn Project Engagement"}</h3>
                      <form onSubmit={saveProject} style={{ marginTop: "16px" }}>
                        <div className="form-group">
                          <label className="form-label">Project Code (Short)</label>
                          <input type="text" className="form-control" required placeholder="e.g. AZURE-OPS" value={projectCode} onChange={(e) => setProjectCode(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Project Name</label>
                          <input type="text" className="form-control" required placeholder="e.g. Azure Migration Phase II" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Client Portfolio Linkage</label>
                          <select className="form-control" required value={projectClientId} onChange={(e) => setProjectClientId(e.target.value)}>
                            <option value="">Select Account Client...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Commercial Billing Agreement</label>
                          <select className="form-control" value={projectBillingType} onChange={(e) => setProjectBillingType(e.target.value)}>
                            <option value="Time & Material">Time & Material (T&M)</option>
                            <option value="Fixed Price">Fixed Bid / Milestone Price</option>
                            <option value="Internal R&D">Non-Billable Internal R&D</option>
                            <option value="Retainer">Retainer Service</option>
                          </select>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="form-group">
                          <div>
                            <label className="form-label">Start Date</label>
                            <input type="date" className="form-control" value={projectStart} onChange={(e) => setProjectStart(e.target.value)} />
                          </div>
                          <div>
                            <label className="form-label">End Date</label>
                            <input type="date" className="form-control" value={projectEnd} onChange={(e) => setProjectEnd(e.target.value)} />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
                          {editingProjectId && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: "8px 16px" }}
                              onClick={() => {
                                setEditingProjectId(null);
                                setProjectClientId("");
                                setProjectName("");
                                setProjectCode("");
                                setProjectBillingType("Time & Material");
                                setProjectStart("");
                                setProjectEnd("");
                              }}
                            >
                              Cancel
                            </button>
                          )}
                          <button type="submit" className="btn btn-primary" style={{ padding: "8px 20px" }}>
                            {editingProjectId ? "Update Details" : "Launch Project"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* TABS 3: STAFFING ALLOCATIONS */}
                {erpActiveTab === "allocations" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
                    <div className="glass-card">
                      <h3 style={{ marginBottom: "16px" }}>Staffing Allocation & Billing dashboard</h3>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Staff Member</th>
                              <th>Assigned Engagement</th>
                              <th>Alloc Role</th>
                              <th>FTE Capacity %</th>
                              <th>Rate (Hr)</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectAllocations.length === 0 ? (
                              <tr>
                                <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>No employee project staffing allocations defined. Assign staff via the form.</td>
                              </tr>
                            ) : (
                              projectAllocations.map((alloc) => {
                                const emp = employees.find(e => e.id === alloc.employee_id);
                                const proj = projects.find(p => p.id === alloc.project_id);
                                const client = proj ? clients.find(c => c.id === proj.client_id) : null;
                                return (
                                  <tr key={alloc.id}>
                                    <td>
                                      <div style={{ fontWeight: 6 }}>{emp ? `${emp.first_name} ${emp.last_name}` : "Unknown Staff"}</div>
                                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{emp ? emp.employee_id : "—"}</div>
                                    </td>
                                    <td>
                                      <div style={{ fontWeight: 6, color: "var(--primary)" }}>{proj ? proj.name : "Unknown Engagement"}</div>
                                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{client ? `at ${client.name}` : "—"}</div>
                                    </td>
                                    <td style={{ fontWeight: 6 }}>{alloc.project_role}</td>
                                    <td>
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div style={{ width: "80px", height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
                                          <div style={{ height: "100%", width: `${alloc.allocation_percentage}%`, background: "var(--grad-brand)", borderRadius: "4px" }} />
                                        </div>
                                        <span style={{ fontSize: "12px", fontWeight: 700 }}>{alloc.allocation_percentage}%</span>
                                      </div>
                                    </td>
                                    <td style={{ fontWeight: 600, color: "var(--success)" }}>
                                      {alloc.billing_hourly_rate ? `₹${alloc.billing_hourly_rate.toLocaleString('en-IN')}` : "FSO / Bench"}
                                    </td>
                                    <td>
                                      <button
                                        className="btn btn-secondary"
                                        style={{ padding: "4px 8px", fontSize: "11px", marginRight: "6px" }}
                                        onClick={() => {
                                          setEditingAllocationId(alloc.id);
                                          setAllocEmployeeId(alloc.employee_id);
                                          setAllocProjectId(alloc.project_id);
                                          setAllocRole(alloc.project_role);
                                          setAllocPercentage(alloc.allocation_percentage);
                                          setAllocBillingStatus(alloc.billing_status);
                                          setAllocHourlyRate(alloc.billing_hourly_rate || 0);
                                          setAllocStart(alloc.start_date || "");
                                        }}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="btn btn-secondary"
                                        style={{ padding: "4px 8px", fontSize: "11px", color: "var(--danger)" }}
                                        onClick={() => deleteAllocation(alloc.id)}
                                      >
                                        Deallocate
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="glass-card">
                      <h3>{editingAllocationId ? "📝 Reconfigure Allocation" : "📌 Assign Staff to Engagement"}</h3>
                      <form onSubmit={saveAllocation} style={{ marginTop: "16px" }}>
                        <div className="form-group">
                          <label className="form-label">Employee</label>
                          <select className="form-control" required value={allocEmployeeId} onChange={(e) => setAllocEmployeeId(e.target.value)}>
                            <option value="">Choose Employee...</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_id})</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Project / Engagement</label>
                          <select className="form-control" required value={allocProjectId} onChange={(e) => setAllocProjectId(e.target.value)}>
                            <option value="">Select Project Account...</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Staff Allocation Role</label>
                          <input type="text" className="form-control" required placeholder="e.g. Lead Technical Architect" value={allocRole} onChange={(e) => setAllocRole(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">FTE Capacity Allocation % (0-100)</label>
                          <input type="number" className="form-control" min={1} max={100} required value={allocPercentage} onChange={(e) => setAllocPercentage(Number(e.target.value))} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="form-group">
                          <div>
                            <label className="form-label">Billing Class</label>
                            <select className="form-control" value={allocBillingStatus} onChange={(e) => setAllocBillingStatus(e.target.value)}>
                              <option value="Billable">Billable</option>
                              <option value="Non-Billable">Non-Billable / Bench</option>
                              <option value="Internal Ops">Internal Ops</option>
                            </select>
                          </div>
                          <div>
                            <label className="form-label">Hourly Billing Rate (₹)</label>
                            <input type="number" className="form-control" placeholder="e.g. 1500" value={allocHourlyRate} onChange={(e) => setAllocHourlyRate(Number(e.target.value))} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Start Date of Allocation</label>
                          <input type="date" className="form-control" value={allocStart} onChange={(e) => setAllocStart(e.target.value)} />
                        </div>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
                          {editingAllocationId && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: "8px 16px" }}
                              onClick={() => {
                                setEditingAllocationId(null);
                                setAllocEmployeeId("");
                                setAllocProjectId("");
                                setAllocRole("");
                                setAllocPercentage(100);
                                setAllocBillingStatus("Billable");
                                setAllocHourlyRate(0);
                                setAllocStart("");
                              }}
                            >
                              Cancel
                            </button>
                          )}
                          <button type="submit" className="btn btn-primary" style={{ padding: "8px 20px" }}>
                            {editingAllocationId ? "Update Staffing" : "Allocate Staff"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* TABS 4: BANDS & TITLES */}
                {erpActiveTab === "bands-titles" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                    {/* Salary Bands */}
                    <div className="glass-card">
                      <h3>💼 Corporate Salary Band Matrix</h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "16px" }}>Bands mapped directly to corporate compensation structures</p>
                      
                      <div className="table-responsive" style={{ maxHeight: "240px", overflowY: "auto", marginBottom: "20px" }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Band Code</th>
                              <th>Min Pay (Annual)</th>
                              <th>Mid Pay (Annual)</th>
                              <th>Max Pay (Annual)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {salaryBands.length === 0 ? (
                              <tr>
                                <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)" }}>No salary bands configured.</td>
                              </tr>
                            ) : (
                              salaryBands.map((band) => (
                                <tr key={band.id}>
                                  <td style={{ fontWeight: 700, color: "var(--accent)" }}>{band.band_name}</td>
                                  <td>₹{band.min_base_annual.toLocaleString('en-IN')}</td>
                                  <td>₹{band.mid_base_annual.toLocaleString('en-IN')}</td>
                                  <td>₹{band.max_base_annual.toLocaleString('en-IN')}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <h4 style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px", marginBottom: "12px" }}>➕ Define Compensation Band</h4>
                      <form onSubmit={saveSalaryBand}>
                        <div className="form-group">
                          <label className="form-label">Band / Designation Name</label>
                          <input type="text" className="form-control" required placeholder="e.g. L5 - Principal Engineer" value={newBandName} onChange={(e) => setNewBandName(e.target.value)} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }} className="form-group">
                          <div>
                            <label className="form-label">Min Pay (₹)</label>
                            <input type="number" className="form-control" required placeholder="1800000" value={newBandMin} onChange={(e) => setNewBandMin(Number(e.target.value))} />
                          </div>
                          <div>
                            <label className="form-label">Mid Pay (₹)</label>
                            <input type="number" className="form-control" required placeholder="2400000" value={newBandMid} onChange={(e) => setNewBandMid(Number(e.target.value))} />
                          </div>
                          <div>
                            <label className="form-label">Max Pay (₹)</label>
                            <input type="number" className="form-control" required placeholder="3200000" value={newBandMax} onChange={(e) => setNewBandMax(Number(e.target.value))} />
                          </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ padding: "8px 16px", width: "100%", marginTop: "10px" }}>
                          Save Salary Band Configuration
                        </button>
                      </form>
                    </div>

                    {/* Functional Titles */}
                    <div className="glass-card">
                      <h3>🏷️ Functional Capability Titles Catalog</h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "16px" }}>Technical titles and horizontal capability maps</p>

                      <div className="table-responsive" style={{ maxHeight: "240px", overflowY: "auto", marginBottom: "20px" }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Title Name</th>
                              <th>Skill / Capability Category</th>
                            </tr>
                          </thead>
                          <tbody>
                            {functionalTitles.length === 0 ? (
                              <tr>
                                <td colSpan={2} style={{ textAlign: "center", color: "var(--text-muted)" }}>No functional titles registered yet.</td>
                              </tr>
                            ) : (
                              functionalTitles.map((ft) => (
                                <tr key={ft.id}>
                                  <td style={{ fontWeight: 600 }}>{ft.name}</td>
                                  <td>
                                    <span className="badge" style={{ background: "rgba(139,92,246,0.1)", color: "var(--accent)" }}>
                                      {ft.skill_category || "Generalist"}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <h4 style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px", marginBottom: "12px" }}>➕ Catalog New Technical Title</h4>
                      <form onSubmit={saveFunctionalTitle}>
                        <div className="form-group">
                          <label className="form-label">Title Name</label>
                          <input type="text" className="form-control" required placeholder="e.g. Lead DevSecOps Engineer" value={newTitleName} onChange={(e) => setNewTitleName(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Skill / Capability Category</label>
                          <input type="text" className="form-control" placeholder="e.g. Cloud Security & Infrastructure" value={newTitleCategory} onChange={(e) => setNewTitleCategory(e.target.value)} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ padding: "8px 16px", width: "100%", marginTop: "10px" }}>
                          Add to Catalog
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 15. DEEP EMPLOYEE PROFILE EDITOR MODAL */}
        {showProfileModal && selectedProfileEmployee && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
            <div className="glass-card animated" style={{ width: "100%", maxWidth: "800px", maxHeight: "90vh", overflowY: "auto", padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "22px" }}>📂 Deep Profile Editor: {selectedProfileEmployee.first_name} {selectedProfileEmployee.last_name}</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "2px 0 0" }}>Employee Code: {selectedProfileEmployee.employee_id} • System Role: {selectedProfileEmployee.user?.role.toUpperCase() || "EMPLOYEE"}</p>
                </div>
                <span style={{ cursor: "pointer", fontSize: "28px", fontWeight: 700, color: "var(--text-muted)", lineHeight: 1 }} onClick={() => setShowProfileModal(false)}>×</span>
              </div>

              {/* Tabs for Profile Edit Sections */}
              <div className="tabs-header" style={{ marginBottom: "24px" }}>
                <button className={`tab-btn${profileActiveTab === "basic" ? " active" : ""}`} onClick={() => setProfileActiveTab("basic")}>🛡️ Statutory & Personal</button>
                <button className={`tab-btn${profileActiveTab === "skills-exp" ? " active" : ""}`} onClick={() => setProfileActiveTab("skills-exp")}>🧠 Skills & Historic Work</button>
                <button className={`tab-btn${profileActiveTab === "academia" ? " active" : ""}`} onClick={() => setProfileActiveTab("academia")}>🎓 Academic Credentials</button>
              </div>

              {/* Tab 1: Basic & Statutory Identifiers */}
              {profileActiveTab === "basic" && (
                <form onSubmit={saveProfileGeneral}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="form-group">
                      <label className="form-label">Corporate Grade / Band</label>
                      <select className="form-control" value={profileGrade} onChange={(e) => setProfileGrade(e.target.value)}>
                        <option value="L1">L1 - Associate</option>
                        <option value="L2">L2 - Consultant</option>
                        <option value="L3">L3 - Senior Consultant</option>
                        <option value="L4">L4 - Technical Lead</option>
                        <option value="L5">L5 - Principal Consultant</option>
                        <option value="L6">L6 - Director</option>
                        {salaryBands.map(b => <option key={b.id} value={b.band_name}>{b.band_name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Functional Technical Title Linkage</label>
                      <select className="form-control" value={profileFuncTitleId} onChange={(e) => setProfileFuncTitleId(e.target.value)}>
                        <option value="">Unassigned Functional Capability...</option>
                        {functionalTitles.map(t => <option key={t.id} value={t.id}>{t.name} ({t.skill_category || "General"})</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }} className="form-group">
                    <div>
                      <label className="form-label">PAN Number</label>
                      <input type="text" className="form-control" placeholder="ABCDE1234F" value={profilePan} onChange={(e) => setProfilePan(e.target.value.toUpperCase())} />
                    </div>
                    <div>
                      <label className="form-label">Aadhaar Card Number</label>
                      <input type="text" className="form-control" placeholder="1234 5678 9012" value={profileAadhaar} onChange={(e) => setProfileAadhaar(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">EPF UAN Number</label>
                      <input type="text" className="form-control" placeholder="100987654321" value={profileUan} onChange={(e) => setProfileUan(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }} className="form-group">
                    <div>
                      <label className="form-label">Phone Contact Number</label>
                      <input type="text" className="form-control" placeholder="+91 98765 43210" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">PF Account Number</label>
                      <input type="text" className="form-control" placeholder="MH/BAN/12345/678" value={profilePf} onChange={(e) => setProfilePf(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">ESIC Insurance Number</label>
                      <input type="text" className="form-control" placeholder="31123456780010101" value={profileEsic} onChange={(e) => setProfileEsic(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-group">
                    <div>
                      <label className="form-label">Shift Roster Schedule</label>
                      <select className="form-control" value={profileShift} onChange={(e) => setProfileShift(e.target.value)}>
                        <option value="General Shift">General Shift (09:15 AM - 06:15 PM)</option>
                        <option value="Morning Shift">Morning Shift (06:00 AM - 02:00 PM)</option>
                        <option value="Night Shift">Night Shift (10:00 PM - 06:00 AM)</option>
                        <option value="APAC Roster">APAC Roster (07:30 AM - 04:30 PM)</option>
                        <option value="EMEA Roster">EMEA Roster (01:30 PM - 10:30 PM)</option>
                        <option value="US Support">US East / West Support Shift</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Deputation / Client Site Roster Details</label>
                      <input type="text" className="form-control" placeholder="e.g. Deputed to MSFT Campus Redmond" value={profileDeputation} onChange={(e) => setProfileDeputation(e.target.value)} />
                    </div>
                  </div>

                  <h4 style={{ color: "var(--accent)", margin: "24px 0 12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>Emergency Medical & Passport Details</h4>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-group">
                    <div>
                      <label className="form-label">Marital Status</label>
                      <select className="form-control" value={profileMarital} onChange={(e) => setProfileMarital(e.target.value)}>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Blood Group</label>
                      <input type="text" className="form-control" placeholder="O+ve, A-ve..." value={profileBlood} onChange={(e) => setProfileBlood(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }} className="form-group">
                    <div>
                      <label className="form-label">Emergency Contact Name</label>
                      <input type="text" className="form-control" required placeholder="Full Name" value={profileEmergName} onChange={(e) => setProfileEmergName(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Emergency Contact Relation</label>
                      <input type="text" className="form-control" required placeholder="Relation: Spouse, Father" value={profileEmergRel} onChange={(e) => setProfileEmergRel(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Emergency Phone</label>
                      <input type="text" className="form-control" required placeholder="Phone Number" value={profileEmergPhone} onChange={(e) => setProfileEmergPhone(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-group">
                    <div>
                      <label className="form-label">Passport Identification Number</label>
                      <input type="text" className="form-control" placeholder="A1234567" value={profilePassport} onChange={(e) => setProfilePassport(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Visa / International Travel Permits</label>
                      <input type="text" className="form-control" placeholder="US H1B Approved, B1/B2 Valid" value={profileVisa} onChange={(e) => setProfileVisa(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ marginTop: "28px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowProfileModal(false)}>Close Editor</button>
                    <button type="submit" className="btn btn-primary" style={{ padding: "10px 24px" }}>Save Personal & Statutory Details</button>
                  </div>
                </form>
              )}

              {/* Tab 2: Skills Cloud & Past Work Experiences */}
              {profileActiveTab === "skills-exp" && (
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px" }}>
                  <div>
                    <h3 style={{ marginBottom: "16px" }}>Company Experience Timeline</h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto", marginBottom: "20px" }}>
                      {!selectedProfileEmployee.work_experiences || selectedProfileEmployee.work_experiences.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "13px", fontStyle: "italic" }}>No prior experiences logged for this employee.</p>
                      ) : (
                        selectedProfileEmployee.work_experiences.map((exp: any) => (
                          <div key={exp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", padding: "10px 14px", borderRadius: "8px" }}>
                            <div>
                              <div style={{ fontWeight: 700 }}>{exp.designation} at {exp.company_name}</div>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                Timeline: {exp.start_date || "N/A"} to {exp.end_date || "Present"} ({exp.tenure_months} months)
                              </div>
                            </div>
                            <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11px", color: "var(--danger)" }} onClick={() => deleteProfileExperience(exp.id)}>
                              Remove
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <h4 style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px", marginBottom: "12px" }}>➕ Log Historic Experience</h4>
                    <form onSubmit={addProfileExperience}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="form-group">
                        <div>
                          <label className="form-label">Company Name</label>
                          <input type="text" className="form-control" required placeholder="Acme Technologies" value={newExpCompany} onChange={(e) => setNewExpCompany(e.target.value)} />
                        </div>
                        <div>
                          <label className="form-label">Designation Held</label>
                          <input type="text" className="form-control" required placeholder="Senior Engineer" value={newExpDesig} onChange={(e) => setNewExpDesig(e.target.value)} />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }} className="form-group">
                        <div>
                          <label className="form-label">Tenure (Months)</label>
                          <input type="number" className="form-control" min={1} required value={newExpTenure} onChange={(e) => setNewExpTenure(Number(e.target.value))} />
                        </div>
                        <div>
                          <label className="form-label">Start Date</label>
                          <input type="date" className="form-control" value={newExpStart} onChange={(e) => setNewExpStart(e.target.value)} />
                        </div>
                        <div>
                          <label className="form-label">End Date</label>
                          <input type="date" className="form-control" value={newExpEnd} onChange={(e) => setNewExpEnd(e.target.value)} />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "8px 16px" }}>Append Past Employer</button>
                    </form>
                  </div>

                  <div>
                    <h3 style={{ marginBottom: "16px" }}>Capability & Skill Set</h3>
                    
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "200px", overflowY: "auto", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.01)", marginBottom: "20px" }}>
                      {!selectedProfileEmployee.skillsets || selectedProfileEmployee.skillsets.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "13px", fontStyle: "italic", margin: 0 }}>No skills linked to this profile.</p>
                      ) : (
                        selectedProfileEmployee.skillsets.map((skill: any) => (
                          <div key={skill.id} className="badge" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--grad-brand)", color: "#fff", padding: "6px 12px", borderRadius: "14px", fontSize: "11px", fontWeight: 600 }}>
                            <span>{skill.skill_name} ({skill.proficiency})</span>
                            <span style={{ cursor: "pointer", fontWeight: "bold", fontSize: "13px" }} onClick={() => deleteProfileSkill(skill.id)}>×</span>
                          </div>
                        ))
                      )}
                    </div>

                    <h4 style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px", marginBottom: "12px" }}>➕ Link Technical Skill</h4>
                    <form onSubmit={addProfileSkill}>
                      <div className="form-group">
                        <label className="form-label">Skill / Technology Name</label>
                        <input type="text" className="form-control" required placeholder="e.g. Docker, TypeScript, PyTorch" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} />
                      </div>
                      <div className="form-group" style={{ marginBottom: "16px" }}>
                        <label className="form-label">Proficiency Standard</label>
                        <select className="form-control" value={newSkillProf} onChange={(e) => setNewSkillProf(e.target.value)}>
                          <option value="Beginner">Beginner (Basic Syntax / Concepts)</option>
                          <option value="Intermediate">Intermediate (Independent Execution)</option>
                          <option value="Advanced">Advanced (Complex Architectures)</option>
                          <option value="Expert">Expert (Subject Matter Leader)</option>
                        </select>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "8px 16px" }}>Add Skill to Profile</button>
                    </form>
                  </div>
                </div>
              )}

              {/* Tab 3: Academic Qualifications */}
              {profileActiveTab === "academia" && (
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px" }}>
                  <div>
                    <h3 style={{ marginBottom: "16px" }}>Academic Qualification History</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "360px", overflowY: "auto" }}>
                      {!selectedProfileEmployee.academic_qualifications || selectedProfileEmployee.academic_qualifications.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "13px", fontStyle: "italic" }}>No educational qualifications declared.</p>
                      ) : (
                        selectedProfileEmployee.academic_qualifications.map((acad: any) => (
                          <div key={acad.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "8px" }}>
                            <div>
                              <div style={{ fontWeight: 700 }}>{acad.degree}</div>
                              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{acad.institution} • Passed {acad.passing_year}</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <span className="badge" style={{ background: "rgba(0,194,212,0.1)", color: "var(--primary)" }}>{acad.cgpa_percentage} CGPA / %</span>
                              <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11px", color: "var(--danger)" }} onClick={() => deleteProfileAcademic(acad.id)}>Remove</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ marginBottom: "16px" }}>➕ Add Academic Milestone</h3>
                    <form onSubmit={addProfileAcademic}>
                      <div className="form-group">
                        <label className="form-label">Degree Name / Field</label>
                        <input type="text" className="form-control" required placeholder="e.g. B.Tech Computer Science" value={newAcadDegree} onChange={(e) => setNewAcadDegree(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">University / Institution</label>
                        <input type="text" className="form-control" required placeholder="e.g. IIT Bombay" value={newAcadInst} onChange={(e) => setNewAcadInst(e.target.value)} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="form-group">
                        <div>
                          <label className="form-label">Passing Year</label>
                          <input type="number" className="form-control" min={1950} max={2035} required value={newAcadYear} onChange={(e) => setNewAcadYear(Number(e.target.value))} />
                        </div>
                        <div>
                          <label className="form-label">CGPA / Percentage</label>
                          <input type="number" step="0.01" min={0} max={100} className="form-control" required placeholder="8.75" value={newAcadCgpa} onChange={(e) => setNewAcadCgpa(Number(e.target.value))} />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "8px 16px", marginTop: "10px" }}>Save Educational Record</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

            {/* 22. 📄 DOCUMENTS VIEW */}
            {activeView === "my-documents" && (
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
            )}

            {/* 15. 🌐 HRMS-ENGINE CENTRAL CONTROL PLANE */}
            {activeView === "nexus-mgmt" && renderNexusManagement()}

            {/* 16. 🛠️ TENANT SUPPORT DESK */}
            {activeView === "support-desk" && renderSupportDesk()}

            {/* 17. 🔑 PORTAL USER MANAGEMENT */}
            {activeView === "user-mgmt" && renderUserManagement()}

            {/* 18. 🎯 RECRUITMENT TALENT SUITE */}
            {activeView === "talent-mgmt" && renderTalentSuite()}

            {/* 19. 📜 OFFER LETTERS MANAGEMENT */}
            {activeView === "offer-mgmt" && renderOfferManagement()}

            {/* 20. 📋 ONBOARDING CHECKLIST */}
            {activeView === "onboarding-checklist" && renderOnboardingChecklist()}
            {activeView === "rmg-checklist" && renderOnboardingChecklist()}

            {/* 20.5 🗂️ PROJECT ALLOCATIONS */}
            {activeView === "project-allocations" && renderProjectAllocations()}

            {/* 20.6 💻 ASSET REGISTRY */}
            {activeView === "asset-registry" && renderAssetRegistry()}

            {/* 21. 🎒 MY ASSETS & INDUCTION */}
            {activeView === "my-assets-induction" && renderMyAssetsInduction()}
          </>
        )}
      </main>

      {/* ---------------- TALENT MATCH MODAL ---------------- */}
      {showMatchModal && (
        <div className="modal-backdrop" onClick={() => setShowMatchModal(false)}>
          <div className="modal-content" style={{ maxWidth: "800px" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>NLP Profile Match Results</h2>
              <button className="btn-close" onClick={() => setShowMatchModal(false)}>×</button>
            </div>
            
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>Matching profiles against JD keywords using text intersection scoring.</p>
            
            {matchResults.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                No matching profiles found in the Talent Pool.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Candidate</th>
                      <th>Match %</th>
                      <th>Matched Skills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchResults.map((match, index) => (
                      <tr key={match.profile.id}>
                        <td><strong>#{index + 1}</strong></td>
                        <td>
                          <strong>{match.profile.first_name} {match.profile.last_name}</strong>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{match.profile.email}</div>
                        </td>
                        <td>
                          <span className="badge" style={{ background: match.match_percentage > 50 ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: match.match_percentage > 50 ? "#10b981" : "#f59e0b", fontSize: "14px" }}>
                            {match.match_percentage}%
                          </span>
                        </td>
                        <td style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {match.matched_skills.join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- CANDIDATE ATS RESUME MODAL ---------------- */}
      {viewResumeProfile && (
        <div className="modal-backdrop" onClick={() => setViewResumeProfile(null)}>
          <div className="modal-content" style={{ maxWidth: "700px", padding: "0" }} onClick={e => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg, rgba(0,194,212,0.1), rgba(138,43,226,0.1))", padding: "30px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ margin: "0 0 8px 0", fontSize: "28px" }}>{viewResumeProfile.first_name} {viewResumeProfile.last_name}</h2>
                  <div style={{ display: "flex", gap: "16px", color: "var(--text-muted)", fontSize: "14px" }}>
                    <span>✉️ {viewResumeProfile.email}</span>
                    {viewResumeProfile.phone && <span>📞 {viewResumeProfile.phone}</span>}
                  </div>
                </div>
                <button className="btn-close" onClick={() => setViewResumeProfile(null)}>×</button>
              </div>
            </div>
            
            <div style={{ padding: "30px" }}>
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ color: "var(--primary)", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", marginBottom: "12px" }}>Professional Summary</h4>
                <p style={{ lineHeight: "1.6", color: "var(--text-light)" }}>
                  {viewResumeProfile.experience_summary || "No summary provided by the candidate."}
                </p>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ color: "var(--primary)", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", marginBottom: "12px" }}>Core Competencies & Skills</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {viewResumeProfile.skills ? viewResumeProfile.skills.split(',').map((skill: string, i: number) => (
                    <span key={i} className="badge" style={{ background: "rgba(255,255,255,0.05)", padding: "6px 12px" }}>{skill.trim()}</span>
                  )) : <span style={{ color: "var(--text-muted)" }}>No skills explicitly listed.</span>}
                </div>
              </div>

              {viewResumeProfile.raw_resume_text && (
                <div>
                  <h4 style={{ color: "var(--primary)", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", marginBottom: "12px" }}>ATS Extracted Raw Resume</h4>
                  <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "8px", maxHeight: "200px", overflowY: "auto", fontSize: "13px", color: "var(--text-muted)", whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                    {viewResumeProfile.raw_resume_text}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmState && (
        <ConfirmModal
          message={confirmState.message}
          title={confirmState.title}
          confirmLabel={confirmState.confirmLabel}
          cancelLabel={confirmState.cancelLabel}
          onConfirm={() => {
            const r = confirmState.resolve;
            setConfirmState(null);
            r(true);
          }}
          onCancel={() => {
            const r = confirmState.resolve;
            setConfirmState(null);
            r(false);
          }}
        />
      )}
      {promptState && (
        <PromptModal
          message={promptState.message}
          defaultValue={promptState.defaultValue}
          title={promptState.title}
          placeholder={promptState.placeholder}
          onConfirm={(val) => {
            const r = promptState.resolve;
            setPromptState(null);
            r(val);
          }}
          onCancel={() => {
            const r = promptState.resolve;
            setPromptState(null);
            r(null);
          }}
        />
      )}
    </div>
  );
}
