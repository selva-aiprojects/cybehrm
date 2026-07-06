# CybeHRM — System Architecture & Design

---

## 1. PRODUCT OVERVIEW

**CybeHRM** is a multi-tenant SaaS HRMS platform purpose-built for Indian SMEs. It covers the full employee lifecycle — from requisition to exit — as a single connected system of record.

### Four Workspaces

| Workspace | Tagline | Primary Roles |
|-----------|---------|---------------|
| **Employee Self Service (ESS)** | My workspace | All employees |
| **Core HR** | HR Administration | HR Admin |
| **Talent Hub** | Recruitment | Talent Team, Recruiter |
| **Performance Hub** | Reviews & Exits | HR Admin, Manager, HR Operations |

---

## 2. BUSINESS ROLE MODEL

### 2.1 Role Definitions

| Role | Scope | Backend Role Value |
|------|-------|-------------------|
| **Talent Management** | Recruitment only (positions, job postings, candidates, interviews, offers) | `recruiter`, `Talent Team` |
| **HR Administration** | Full lifecycle: Onboarding → Assignment → Bench → Exit + Attendance, Leave, Payroll, Employees, User Management, Org Structure, Policy, Reports | `hr_admin` |
| **HR Operations** | Engagement monitoring during assignment: project-allocations, appraisals, release back to HR Admin | `hr_operations` |
| **Employee** | Self-service only (attendance, leave, payslips, expenses, insurance, car lease, documents, AI copilot) | `employee` |
| **Manager** | Employee access + team leave approvals, KRA scoring, manager console | `manager` |
| **Payroll Admin** | Payroll processing, FBP/Tax review | `payroll_admin` |
| **Super Admin** | Platform owner — manages tenants, shards, feature flags | `super_admin` |

### 2.2 Feature Flags (per-tenant subscription)

| Flag | Controls | Backend Field |
|------|----------|---------------|
| `feature_hr_team` | Core HR workspace (attendance, leave, payroll, tax, insurance, car lease, org structure, shift mgmt, policy) | `Organization.feature_hr_team` |
| `feature_talent_mgmt` | Talent Hub workspace (positions, candidates, interviews, offers, AI match) | `Organization.feature_talent_mgmt` |
| `feature_resource_mgmt` | Performance Hub workspace (appraisals, promotions, offboarding, project-allocations, checklists, assets) | `Organization.feature_resource_mgmt` |

### 2.3 Module-to-Role Permission Matrix

| Module | hr_admin | hr_operations | manager | employee | recruiter | Talent Team | Resource Mgmt Group | payroll_admin |
|--------|----------|---------------|---------|----------|-----------|-------------|---------------------|---------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Attendance | ✅ | — | — | self | — | — | — | — |
| Leave | ✅ | — | ✅ approve | self | — | — | — | — |
| Payroll | ✅ | — | — | self | — | — | — | ✅ |
| FBP & Tax | ✅ | — | — | self | — | — | — | ✅ |
| Insurance | ✅ | — | — | self | — | — | — | — |
| Car Lease | ✅ | — | — | self | — | — | — | — |
| Appraisals | ✅ | ✅ | ✅ | self | — | — | ✅ | — |
| AI Promotions | ✅ | — | — | — | — | — | — | — |
| Offboarding | ✅ | — | — | self | — | — | — | — |
| Talent Mgmt | ✅ | — | — | — | ✅ | ✅ | — | — |
| AI Copilot | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Employees | ✅ | — | — | — | — | — | — | — |
| User Management | ✅ | — | — | — | — | — | — | — |
| Org Structure | ✅ | — | — | — | — | — | — | — |
| Shift Management | ✅ | — | — | — | — | — | — | — |
| Policy Center | ✅ | — | — | — | — | — | — | — |
| Project Allocations | ✅ | ✅ | ✅ | — | — | — | ✅ | — |
| RMG Checklist | ✅ | — | — | — | — | — | — | — |
| Onboarding Checklist | ✅ | — | — | — | — | — | — | — |
| Asset Registry | ✅ | — | — | self | — | — | — | — |
| Reports | ✅ | — | — | — | — | — | — | — |
| Support Desk | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 3. FUNCTIONAL FLOWS

### 3.1 Authentication & Onboarding

```
User visits app → Landing page → "Sign In"
  ├─ New tenant? → Register (org name, subdomain, admin email, password)
  │   └─ Backend: Create Organization → Provision tenant schema → Seed Dept/LeavePolicies/GradeAllowances
  │       → Create hr_admin user + employee profile → Leave Balances → RolePermissions
  │       → Return JWT → Frontend stores token → fetchUserProfile → redirect to ESS
  └─ Existing tenant? → Select org → Enter email/password
      └─ Backend: Reset search_path → Fetch user → Verify password → Check is_active
          → Verify org_id → Update last_login → Create JWT (user_id, org_id, email, role)
          → Frontend stores token → fetchUserProfile → determine role → show workspace tabs
```

### 3.2 Employee Lifecycle

```
Talent Management                    HR Admin                     HR Operations
─────────────────                    ────────                     ─────────────
Requisition (draft)
  → Manager approval
    → HR approval
      → Position live ──┐
                        │
Job posting ────────────┤
                        │
Candidates apply ───────┤
  → Interview scheduled  │
    → Interviewed        │
      → Selected         │
        → Offer ────────┘
          → Accepted
            → Onboard ──────────────────┐
                                        │
                              Onboarding Checklist ──┐
                              Asset Assignment       │
                              Induction Tasks        │
                                        │
                              Assignment (Project) ──┤
                                        │             │
                                        │    Monitor engagement
                                        │    Track progress via appraisals
                                        │    Complete project
                                        │    Release back ──┘
                                        │
                              Bench Management
                                        │
                              Offboarding / Exit ──┐
                              Clearances (IT, HR, Finance)
                              Final Settlement
                              Deactivate user
```

### 3.3 Leave Flow

```
Employee                            Manager / HR Admin
────────                            ───────────────────
Submit leave request
  ├─ Validate date range
  ├─ Check leave balance
  └─ status=pending ──────────────────→ Review pending requests
                                            ├─ Approve → Decrement balance → status=approved
                                            └─ Reject → Store reason → status=rejected
                                        ↓
Employee sees updated status
```

### 3.4 Attendance Flow

```
Employee                                HR Admin
────────                                ────────
Clock In (9:00 AM shift)
  ├─ Check not already clocked in
  ├─ Calculate late minutes (>9:15 = late)
  └─ status=present

Clock Out (5:00 PM or later)
  ├─ Fetch today's check-in
  ├─ Calculate work minutes
  ├─ <240 min → status=absent
  ├─ <480 min → status=half_day
  └─ Save check_out, work_minutes

View my attendance ───────────────────── View org attendance
  ├─ Monthly heatmap                       ├─ Filter by dept/date
  ├─ Hours worked (weekly)                 ├─ Reports
  └─ Geo locations                         └─ Analytics
```

### 3.5 Payroll Flow

```
HR Admin / Payroll Admin
─────────────────────────
Trigger monthly payroll
  ├─ Check no duplicate run for month/year
  ├─ Create PayrollRun
  ├─ For each active employee:
  │   ├─ Calculate Late Arrival LOP
  │   ├─ EPF/FPF split (12% / 8.33%)
  │   ├─ Professional Tax slab
  │   ├─ FBP & Perks exemption (with GradeAllowance caps)
  │   ├─ Vehicle Lease EMI deduction + Car Perquisite (Rule 3)
  │   ├─ TDS (Old vs New regime):
  │   │   ├─ Old: Std deduction 50k, HRA exemption, 80C (1.5L), 80D (25k)
  │   │   │       Slabs: 2.5L@0% | 5L@5% | 10L@20% | >10L@30% + 4% cess
  │   │   └─ New: Std deduction 75k, rebate up to 7L
  │   │           Slabs: 3L@0% | 6L@5% | 9L@10% | 12L@15% | 15L@20% | >15L@30% + 4% cess
  │   ├─ Insurance surcharge (post-tax)
  │   └─ gross - deductions = net_salary
  ├─ Create Payslip per employee (status=unpaid)
  └─ Commit

Employee views payslip in ESS
```

### 3.6 Talent / Recruitment Flow

```
Recruiter / Talent Team
───────────────────────
Create Position ──→ Create Job Posting
                        │
                  Candidates apply ──→ Talent Profile created
                        │
                  Issue Call Letter ──→ Interview scheduled
                        │
                  Interview graded
                        │
                  Select candidate ──→ Create Offer Letter
                        │                          │
                  Candidate accepts          Candidate rejects
                        │
                  Onboard to Employee ──→ Create User + Employee + Leave Balances
                        │                    + Induction Tasks + Close Position
                  Done
```

### 3.7 AI Job Matching Flow

```
1. Extract required skills from JD (regex vs known skills dictionary)
2. For each talent profile:
   a. Technical Skills Match (60% weight)
      - Skills intersection / union
      - <50% match → penalty (halve this factor)
   b. Experience Context Alignment (20% weight)
      - Jaccard similarity on non-stop-word tokens
   c. General Keyword Density (20% weight)
      - Overall vocabulary overlap
3. Filter: minimum threshold (default 20%)
4. Sort by match_percentage descending
5. Return top matches with matched_skills, missing_skills, confidence_level
```

---

## 4. TECH STACK

### 4.1 Backend

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | FastAPI | >=0.100.0 |
| Runtime | Python | 3.14 |
| Server | Uvicorn | >=0.22.0 |
| ORM | SQLAlchemy | >=2.0.0 (async) |
| DB Driver | asyncpg | >=0.28.0 |
| Validation | Pydantic v2 | >=2.0.0 |
| Auth | PyJWT (HS256) + passlib[bcrypt] | >=2.8.0 / >=1.7.4 |
| AI | Groq (llama3-70b-8192) / OpenAI SDK | >=0.5.0 / >=1.12.0 |
| Email | Resend | — |

### 4.2 Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.2.6 |
| Language | TypeScript | 6.0.2 |
| Build | Vite | 8.0.12 |
| Charts | Recharts | 3.8.1 |
| PDF | jsPDF | 4.2.1 |
| Toasts | react-hot-toast | 2.6.0 |
| Styling | Tailwind CSS (custom tokens) | — |

### 4.3 Mobile

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Flutter | — |
| Language | Dart | ^3.11.5 |
| State Mgmt | Provider | ^6.1.5 |
| Routing | go_router | ^17.2.3 |
| HTTP | http | ^1.6.0 |
| GPS | geolocator | ^14.0.2 |

### 4.4 Database

| Layer | Technology | Details |
|-------|-----------|---------|
| Engine | PostgreSQL (Supabase) | Hosted on AWS ap-northeast-1 |
| Pooling | Supabase Transaction Pooler | `?prepared_statement_cache_size=0` |
| Connection | asyncpg | 30s statement timeout |
| Tables | 46 | 5 central + 41 per-tenant |

### 4.5 Infrastructure

| Component | Provider | Notes |
|-----------|----------|-------|
| Backend hosting | Render | Uvicorn process |
| Frontend hosting | Render | React SPA |
| Database | Supabase | Managed PostgreSQL |
| Mobile distribution | APK | Direct download |

---

## 5. ARCHITECTURE

### 5.1 Multi-Tenant Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPABASE (PostgreSQL)                        │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    public schema                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │   │
│  │  │ organizations │  │    users     │  │  role_permissions  │  │   │
│  │  └──────────────┘  └──────────────┘  └───────────────────┘  │   │
│  │  ┌──────────────┐  ┌──────────────┐                         │   │
│  │  │ support_tickets│ │  email_logs  │                         │   │
│  │  └──────────────┘  └──────────────┘                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                orient-ts schema (tenant)                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │   │
│  │  │employees │ │departments│ │leave_reqs│ │attendance     │  │   │
│  │  ├──────────┤ ├──────────┤ ├──────────┤ ├───────────────┤  │   │
│  │  │payroll   │ │payslips  │ │projects  │ │project_mapping│  │   │
│  │  ├──────────┤ ├──────────┤ ├──────────┤ ├───────────────┤  │   │
│  │  │talent    │ │candidates│ │offers    │ │... (41 tables)│  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  (Additional tenant schemas created dynamically on registration)     │
└─────────────────────────────────────────────────────────────────────┘
```

**Tenant isolation strategy:**
- **Central tables** (organizations, users, role_permissions, support_tickets, email_logs) live in `public` schema
- **Per-tenant tables** (employees, attendance, leave, payroll, talent, etc.) live in a dedicated schema named after the tenant's subdomain (e.g., `orient-ts`)
- `search_path` is set per-request: `SET search_path TO "{subdomain}", public`
- Connection pool uses `pool_pre_ping=True` with explicit `search_path` reset in auth

### 5.2 Request Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Browser │────▶│  Render  │────▶│  FastAPI │────▶│Supabase  │
│ (React)  │     │ (CDN)   │     │ (Uvicorn)│     │(Postgres)│
│ :5173    │     │ :80/443 │     │ :8000    │     │ :5432    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
       │                                              │
       │  ┌──────────────────────────────────────────┐│
       │  │ Auth Chain:                              ││
       │  │ 1. JWT decode → get_current_user_claims  ││
       │  │ 2. Set search_path → "{subdomain}",public ││
       │  │ 3. Fetch User row → get_current_user     ││
       │  │ 4. Fetch Employee → get_current_employee ││
       │  │ 5. RoleChecker / require_feature_permission│
       │  └──────────────────────────────────────────┘│
       │                                              │
       └──────────────────────────────────────────────┘
```

### 5.3 Frontend Architecture (SPA)

```
App.tsx (single-file SPA, ~13k lines)
├── State: token, currentUser, currentEmployee, activeView, activeManagementTab
├── LandingPage component (pre-auth)
├── Login / Register forms
├── fetchUserProfile (on token set)
├── Workspace Switcher (ESS / Core HR / Talent Hub / Performance Hub)
├── Menu Bar (role-gated menu items per workspace)
├── View Renderer (switches on activeView)
│   ├── Self-Space: profile, attendance, leave, expenses, payslips, payroll, tax, insurance, assets, documents, AI copilot, help desk
│   ├── Core HR: dashboard, employees, org-structure, attendance, shift-mgmt, leave, payroll, fbp-tax, benefits, policy, user-mgmt, reports, erp-masters
│   ├── Talent Hub: requisitions, positions, profiles, AI match, offers, onboarding
│   └── Performance Hub: appraisals, manager console, AI promotions, offboarding, allocations, checklist
├── Role-based access control via isViewAllowed()
└── RBAC matrix editor (in User Management)
```

### 5.4 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                      │
├─────────────────────────────────────────────────────────┤
│ 1. JWT Authentication (HS256, 60min expiry)              │
│    └─ Claims: user_id, organization_id, email, role      │
│                                                           │
│ 2. Password Hashing (bcrypt via passlib)                  │
│                                                           │
│ 3. Tenant Isolation via PostgreSQL schemas + search_path  │
│                                                           │
│ 4. Role-Based Access Control (RBAC):                      │
│    ├─ RoleChecker(["hr_admin","manager"]) at endpoint     │
│    ├─ require_feature_permission("leave") at router      │
│    ├─ require_subscription("hr_team") at router          │
│    └─ hr_admin bypasses all role checks                   │
│                                                           │
│ 5. Dynamic RolePermission table (overridable per tenant)  │
│                                                           │
│ 6. Audit logging on all critical actions                  │
│                                                           │
│ 7. Organization_id scoping on all queries                 │
└─────────────────────────────────────────────────────────┘
```

### 5.5 Backend Router Map

```
Mount Point          Router File         Prefix         Global Deps
───────────          ───────────         ──────         ──────────
/auth                auth.py             /auth          none
/employees           employees.py        /employees     none
/attendance          attendance.py       /attendance    sub("hr_team"), perm("attendance")
/leave               leave.py            /leave         sub("hr_team"), perm("leave")
/payroll             payroll.py          /payroll       sub("hr_team")
/                    tax_fbp_insurance.  (none)         sub("hr_team")
/performance         performance_reviews /performance   sub("resource_mgmt"), perm("appraisals")
/offboarding         offboarding.py      /offboarding   sub("resource_mgmt"), perm("offboarding")
/reports             reports.py          /reports       none
/erp                 erp_masters.py      /erp           none
/usermgmt            usermgmt.py         /usermgmt      RoleChecker(["hr_admin","super_admin"])
/talent              talent.py           /talent        sub("talent_mgmt"), perm("talent-mgmt")
/nexus               nexus.py            /nexus         RoleChecker(["super_admin"])
/requisitions        requisition.py      /requisitions  none
/rmg                 rmg.py              /rmg           none
/onboarding          onboarding.py       /onboarding    none
/audit               audit.py            /audit         none
/dashboard           dashboard.py        /dashboard     none
/ai                  ai.py               /ai            perm("ai-copilot")
```

### 5.6 Database Model Relationships (Core)

```
Organization 1──N User 1──1 Employee
Organization 1──N Department 1──N Employee
Organization 1──N Designation N──1 SalaryBand
Employee N──1 Employee (self-ref: manager_id)
Employee 1──N LeaveRequest / LeaveBalance / Attendance / Payslip
Employee 1──N ProjectMapping N──1 Project N──1 Client
Employee 1──N PerformanceKRA / PerformanceReview
Employee 1──N OffboardingRequest 1──1 FinalSettlement
Employee 1──N InductionTask / Asset
RecruitmentPosition 1──N JobPosting / TalentCandidate
TalentCandidate 1──1 TalentProfile / OfferLetter / CallLetter / TalentInterview
Organization 1──N RolePermission (dynamic RBAC)
```

---

## 6. API ENDPOINT SUMMARY

| Module | Endpoints | Primary Auth |
|--------|-----------|-------------|
| Auth | 4 | None (login), JWT (me) |
| Employees | 6 | JWT + role |
| Attendance | 7 | sub + perm + JWT |
| Leave | 5 | sub + perm + JWT |
| Payroll | 5 | sub + JWT + role |
| Tax/FBP/Ins/Car | 10 | sub + JWT |
| Performance | 6 | sub + perm + JWT |
| Offboarding | 5 | sub + perm + JWT |
| Reports | 4 | JWT + role |
| ERP Masters | 20+ | JWT |
| User Management | 6 | RoleChecker |
| Talent | 20+ | sub + perm + role |
| Nexus | 5 | RoleChecker |
| Requisition | 3 | JWT |
| RMG | 7 | JWT |
| Onboarding | 5 | JWT |
| Audit | 2 | JWT |
| Dashboard | 2 | JWT |
| AI Copilot | 3 | perm + JWT |

**Total: ~120+ endpoints**

---

## 7. KEY DESIGN PATTERNS

| Pattern | Implementation |
|---------|---------------|
| Multi-tenancy | PostgreSQL schemas per tenant + search_path |
| Auth | JWT (HS256) with stateless claims |
| RBAC | RoleChecker middleware + RolePermission table + fallback defaults |
| Feature flags | per-Organization boolean columns |
| Audit trail | AuditService.log_action() on all mutations |
| Async SQL | SQLAlchemy 2.x async + asyncpg |
| Single-file SPA | All views in App.tsx, switched by activeView state |
| Payroll engine | Monthly batch, per-employee calc with Indian statutory rules |
| AI copilot | Groq llama3-70b-8192 for chat/summarize/analyze |
| AI matching | Skill-based scoring (60/20/20 weights) for JD-candidate matching |
| Tenant provisioning | Dynamic schema creation + seed on registration |
