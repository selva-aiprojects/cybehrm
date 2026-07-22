import React, { useEffect } from 'react';
import './LandingPage.css';

function LandingIcon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    profile: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
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
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      {svgContent}
    </svg>
  );
}

interface LandingPageProps {
  onLoginClick: () => void;
}

export default function LandingPage({ onLoginClick }: LandingPageProps) {
  useEffect(() => {
    const items = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { 
        if (e.isIntersecting) {
          e.target.classList.add('in'); 
        }
      });
    }, { threshold: 0.12 });
    
    items.forEach(i => obs.observe(i));
    
    return () => {
      items.forEach(i => obs.unobserve(i));
    };
  }, []);

  return (
    <div className="landing-page">
      <header>
        <div className="topbar">
          <div className="brand">
            {/* The image can fallback to text if missing */}
            <img 
              src="/logo.png" 
              alt="SynthalystHRM — Intelligent Human Capital Management" 
              onError={(e) => { 
                e.currentTarget.style.display = 'none'; 
                e.currentTarget.parentElement!.innerHTML = '<span style="color:var(--primary);font-weight:bold;font-size:20px;letter-spacing:-0.5px;">SynthalystHRM</span>'; 
              }} 
            />
          </div>
          <nav>
            <div className="nav-links">
              <a className="navlink" href="#workspaces">Workspaces</a>
              <a className="navlink" href="#compliance">Compliance</a>
              <a className="navlink" href="#workflows">Workflows</a>
              <a className="navlink" href="#roles">Roles</a>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={onLoginClick} className="btn-login">Sign In</button>
              <button onClick={onLoginClick} className="nav-cta">Request a walkthrough</button>
            </div>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="eyebrow">A Cybelinx Product · Built for Indian SMEs</div>
            <h1 className="display">Run HR like one connected <span className="grad">system of record.</span></h1>
            <p className="lead">SynthalystHRM runs attendance, payroll, statutory tax, benefits, hiring, and exits in a single platform — so nothing gets approved twice and nothing slips through unrecorded.</p>
            <div className="hero-ctas">
              <button onClick={onLoginClick} className="btn-primary">Request a walkthrough →</button>
              <a href="#workspaces" className="btn-ghost">See the four workspaces</a>
            </div>
            <div className="stat-row">
              <div><strong>4</strong><span>Workspaces, one login</span></div>
              <div><strong>EPF · PT · TDS</strong><span>Statutory engine</span></div>
              <div><strong>L1–L3</strong><span>Grade-wise benefits</span></div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="glass-card stack-1">
              <div className="card-row"><span className="card-tag">Attendance</span><span className="card-badge">On time</span></div>
              <h4>Today's check-in</h4>
              <p className="sub">09:02 AM · Office — Geo-verified</p>
            </div>
            <div className="glass-card stack-2">
              <div className="card-row"><span className="card-tag">AI Match</span><span className="card-badge">94%</span></div>
              <h4>Senior Backend Engineer</h4>
              <p className="sub">12 profiles matched to JD</p>
              <div className="bar-track"><div className="bar-fill" style={{ width: '94%' }}></div></div>
            </div>
            <div className="glass-card stack-3">
              <div className="card-row"><span className="card-tag">Appraisal</span><span className="card-badge">Q2 cycle</span></div>
              <h4>Bell curve normalized</h4>
              <p className="sub">Top 18% · Core 64% · Low 18%</p>
            </div>
          </div>
        </div>
      </section>

      <section id="workspaces">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">Four workspaces, gated by role</div>
            <h2>One login. The view changes with the work.</h2>
            <p>People only see the workspace that's theirs to run — self-service for employees, full administration for HR, pipeline tools for recruiters, review cycles for managers.</p>
          </div>

          <div className="ws-grid">
            <div className="ws-card reveal">
              <div className="ws-icon"><LandingIcon name="profile" /></div>
              <div className="tagline">ESS</div>
              <h4>Self Service</h4>
              <ul>
                <li>Attendance & leave</li>
                <li>Payslips & payroll view</li>
                <li>Tax & FBP declarations</li>
                <li>Insurance enrollment</li>
                <li>AI copilot & help desk</li>
              </ul>
            </div>
            <div className="ws-card reveal">
              <div className="ws-icon"><LandingIcon name="core_hr" /></div>
              <div className="tagline">Core HR</div>
              <h4>Administration</h4>
              <ul>
                <li>Employee master directory</li>
                <li>Org structure & shifts</li>
                <li>Payroll batch processing</li>
                <li>RBAC permission matrix</li>
                <li>Headcount & compliance reports</li>
              </ul>
            </div>
            <div className="ws-card reveal">
              <div className="ws-icon"><LandingIcon name="talent" /></div>
              <div className="tagline">Talent Hub</div>
              <h4>Recruitment</h4>
              <ul>
                <li>Hiring requisitions</li>
                <li>Position catalog</li>
                <li>Talent pool & AI match</li>
                <li>Offer management</li>
                <li>Onboarding checklist</li>
              </ul>
            </div>
            <div className="ws-card reveal">
              <div className="ws-icon"><LandingIcon name="performance" /></div>
              <div className="tagline">Performance Hub</div>
              <h4>Reviews & Exits</h4>
              <ul>
                <li>KRAs & appraisals</li>
                <li>Bell curve normalization</li>
                <li>AI promotion insights</li>
                <li>Exit center & clearances</li>
                <li>Project allocations & assets</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="compliance" className="compliance">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">Statutory math, run automatically</div>
            <h2>The compliance work nobody wants to do by hand.</h2>
            <p>Built around Indian payroll law from the ground up — not bolted on afterward.</p>
          </div>
          <div className="stat-cards">
            <div className="stat-card reveal">
              <div className="tag">EPF / EPS split</div>
              <div className="figure">12% · 8.33%</div>
              <p>Employer's EPS share splits at the ₹15,000 basic ceiling automatically.</p>
            </div>
            <div className="stat-card reveal">
              <div className="tag">TDS regimes</div>
              <div className="figure">Old vs New</div>
              <p>Slab rates, HRA exemption, 80C/80D, and standard deduction applied per employee.</p>
            </div>
            <div className="stat-card reveal">
              <div className="tag">Car perquisite</div>
              <div className="figure">Rule 3 engine</div>
              <p>₹1,800–₹2,400/month taxable value by engine capacity, plus driver surcharge.</p>
            </div>
            <div className="stat-card reveal">
              <div className="tag">Gratuity</div>
              <div className="figure">15·B·Y / 26</div>
              <p>Payment of Gratuity Act formula, with the 5-year service rule enforced.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="workflows">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">Where the approvals actually happen</div>
            <h2>A requisition becomes a hire. A resignation becomes a settlement.</h2>
            <p>Two of the longer workflows in SynthalystHRM, end to end — every step owned by a named role.</p>
          </div>

          <div className="flow-title reveal">Hiring requisition</div>
          <div className="flow-row reveal" style={{ marginBottom: '40px' }}>
            <div className="flow-step"><div className="fnum">1</div><h4>Draft</h4><p>Manager opens a hiring request against an open headcount.</p></div>
            <div className="flow-step"><div className="fnum">2</div><h4>Manager approval</h4><p>Routed up the reporting line for sign-off.</p></div>
            <div className="flow-step"><div className="fnum">3</div><h4>HR approval</h4><p>HR Admin confirms budget and grade.</p></div>
            <div className="flow-step"><div className="fnum">4</div><h4>Position live</h4><p>Converted to a published position with skill requirements.</p></div>
            <div className="flow-step"><div className="fnum">5</div><h4>Offer & onboard</h4><p>Accepted offer triggers the induction checklist.</p></div>
          </div>

          <div className="flow-title reveal">Exit & offboarding</div>
          <div className="flow-row reveal">
            <div className="flow-step"><div className="fnum">1</div><h4>Resignation filed</h4><p>Notice period and relieving date submitted by the employee.</p></div>
            <div className="flow-step"><div className="fnum">2</div><h4>HR review</h4><p>Approved or rejected against policy.</p></div>
            <div className="flow-step"><div className="fnum">3</div><h4>Clearances</h4><p>IT, HR, and Finance each sign off independently.</p></div>
            <div className="flow-step"><div className="fnum">4</div><h4>F&F settlement</h4><p>Gratuity, LOP, notice buyout, and leave encashment consolidated.</p></div>
            <div className="flow-step"><div className="fnum">5</div><h4>Payout</h4><p>Settlement saved and released for payment.</p></div>
          </div>
        </div>
      </section>

      <section id="roles">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">Permissions, not promises</div>
            <h2>Access is set per role — and re-set without a developer.</h2>
            <p>The RBAC matrix lives in Core HR, so an HR Admin can change who sees payroll or who approves leave without filing a ticket.</p>
          </div>
          <div className="roles-grid">
            <div className="role-card reveal">
              <span className="role-pill">Employee</span>
              <h4>Self-Service</h4>
              <p>Attendance, leave, tax declarations, insurance enrollment, and the AI copilot — nothing beyond their own record.</p>
            </div>
            <div className="role-card reveal">
              <span className="role-pill">Manager</span>
              <h4>Team Lead</h4>
              <p>Everything an employee has, plus team leave approvals, KRA scoring, and bell-curve normalization for direct reports.</p>
            </div>
            <div className="role-card reveal">
              <span className="role-pill">HR Admin</span>
              <h4>Full Administration</h4>
              <p>Employee master, payroll batches, user management, the RBAC matrix itself, and every report.</p>
            </div>
            <div className="role-card reveal">
              <span className="role-pill">Recruiter</span>
              <h4>Talent Team</h4>
              <p>Talent pool, AI matching, and offer management — scoped to hiring, not payroll or statutory data.</p>
            </div>
            <div className="role-card reveal">
              <span className="role-pill">Payroll Admin</span>
              <h4>Financial Officer</h4>
              <p>Payroll processing and FBP/tax review, without visibility into the employee directory or recruitment.</p>
            </div>
            <div className="role-card reveal">
              <span className="role-pill">Super Admin</span>
              <h4>Platform Owner</h4>
              <p>Sits outside any single tenant — provisions organizations, manages shards, and resolves support tickets.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="cta">
        <div className="wrap">
          <div className="cta reveal">
            <div className="cta-inner">
              <div className="eyebrow" style={{ justifyContent: 'center', background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>Ready when you are</div>
              <h2>Bring your HR operations into one system that checks its own math.</h2>
              <p>A 30-minute walkthrough, scoped to your org's grades, statutory state, and approval chain.</p>
              <div className="hero-ctas">
                <button onClick={onLoginClick} className="btn-primary">Request a walkthrough →</button>
                <button onClick={onLoginClick} className="btn-ghost">Talk to sales</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src="/logo.png" 
            alt="SynthalystHRM" 
            className="footer-logo" 
            onError={(e) => { 
              e.currentTarget.style.display = 'none'; 
              e.currentTarget.parentElement!.innerHTML = '<span style="color:var(--primary);font-weight:bold;font-size:14px;letter-spacing:-0.5px;">SynthalystHRM</span>'; 
            }} 
          />
        </div>
        <div className="fmeta" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>© 2026 SynthalystHRM · MULTI-TENANT HRMS · SUPABASE · RENDER</span>
          <span style={{ paddingLeft: '16px', borderLeft: '1px solid var(--border-color)', color: 'var(--primary)' }}>A Cybelinx Product</span>
        </div>
      </footer>
    </div>
  );
}
