import React from "react";

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

export { FunnelChart, AttendanceTrendChart, AllocationDonutChart, TicketsBarChart };
