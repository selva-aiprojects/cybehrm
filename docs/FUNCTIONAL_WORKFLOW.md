# CybeHRM — Functional Workflow Document

> **Application:** CybeHRM Multi-Tenant HRMS  
> **Frontend:** React SPA (`App.tsx`, 13k+ lines)  
> **Backend:** FastAPI Python  
> **Last Updated:** June 2026

---

## Table of Contents

1. [Authentication Flow](#1-authentication-flow)
2. [Workspace Switching](#2-workspace-switching)
3. [Employee Self-Service (ESS) Workspace](#3-employee-self-service-ess-workspace)
4. [Core HR Workspace](#4-core-hr-workspace)
5. [Talent Hub Workspace](#5-talent-hub-workspace)
6. [Performance Hub Workspace](#6-performance-hub-workspace)
7. [Super Admin / Nexus Control Plane](#7-super-admin--nexus-control-plane)
8. [User Roles & Permissions Matrix](#8-user-roles--permissions-matrix)
9. [Routing & View System](#9-routing--view-system)
10. [Data Fetching Pattern](#10-data-fetching-pattern)
11. [API Endpoint Catalog](#11-api-endpoint-catalog)

---

## 1. Authentication Flow

### 1.1 Login Screen

When the user first loads the app, they see an **unauthenticated state** with a split layout:

| Panel | Content |
|---|---|
| **Left (Brand Side)** | "CybeHRM" branding, AI-powered taglines, glass badges (AI-Powered NLP Matching, Enterprise Multi-Tenant, Statutory Compliance) |
| **Right (Form Side)** | Login form (default) or Registration form (toggle) |

**Login Fields:**
1. **Organization** — Dropdown populated from `GET /auth/organizations` listing all available tenants
2. **Email** — User's email address
3. **Password** — User's password

**Special Organization:** The "Nexus" org (UUID `00000000-0000-0000-0000-000000000000`) routes login to the super_admin portal.

### 1.2 Login Flow

```
User enters credentials
        ↓
handleLoginSubmit() → POST /auth/login
        ↓
Success → access_token returned
        ↓
setToken(access_token) + localStorage.setItem("hrms-engine_token", token)
        ↓
useEffect [token] fires → fetchUserProfile()
        ↓
GET /auth/me (with Bearer token)
        ↓
currentUser set (id, organization_id, email, role, is_active, feature flags)
        ↓
GET /employees → finds employee record matching user_id → currentEmployee set
        ↓
Redirect to default view (my-attendance for ESS, dashboard for HR)
```

### 1.3 Registration Flow

```
Click "Create Account" → toggle isRegisterMode = true
        ↓
handleRegisterSubmit() → POST /auth/register
  Body: { org_name, subdomain, admin_email, admin_password }
        ↓
Success → auto-fills login form with new admin credentials → user clicks Login
```

### 1.4 Session Management

| Mechanism | Implementation |
|---|---|
| **Token Storage** | React state `token` + `localStorage("hrms-engine_token")` |
| **Auth Header** | `Authorization: Bearer ${token}` on every API call |
| **Session Expiry** | Global `window.fetch` override intercepts 401 responses, auto-logouts with toast "Your session has expired..." |
| **Logout** | Clears token from state and localStorage, resets to login screen |

---

## 2. Workspace Switching

### 2.1 Workspace Tabs

The top admin bar contains workspace toggle buttons. Availability is **feature-flag gated**:

| Button | Icon | Workspace ID | Default View | Required Feature |
|---|---|---|---|---|
| Employee Self Service | 💬 | `""` (empty) | `my-attendance` | Always visible to all tenant users |
| Core HR | 🏢 | `hr_management` | `dashboard` | `feature_hr_team` OR role `hr_admin`/`HR Team` |
| Talent Hub | 🎯 | `recruitment` | `talent-mgmt` (positions tab) | `feature_talent_mgmt` OR role `hr_admin`/`recruiter`/`Talent Team` |
| Performance Hub | 👥 | `resource_management` | `appraisals` | `feature_resource_mgmt` OR role `hr_admin`/`Resource Mgmt Group`/`manager` |

### 2.2 Teal Menu Bar

Each workspace renders its own horizontal menu bar with clickable items. Each item sets `activeView` to trigger the appropriate view rendering.

---

## 3. Employee Self-Service (ESS) Workspace

**activeManagementTab: `""` (empty string)**

### Menu Items

| # | View | Feature | Description |
|---|---|---|---|
| 1 | `my-profile` | **Profile** | View/edit personal details, skillsets, work experience, academic qualifications, bank details, documents |
| 2 | `my-attendance` | **Attendance** | Clock in/out, view attendance calendar, activity log, analytics |
| 3 | `my-leave` | **Leave** | View leave balances, submit leave requests, track request status, cancel requests |
| 4 | `my-expenses` | **Expense Claims** | Submit travel and other expense claims with receipts |
| 5 | `my-payslips` | **Payslips** | View and download monthly payslips |
| 6 | `my-payroll` | **Payroll** | View salary structure breakdown |
| 7 | `my-fbp-tax` | **Tax & FBP** | Submit tax declarations (80C, 80D, HRA), FBP declarations (fuel, LTA, phone, food), view grade allowances |
| 8 | `my-insurance` | **Insurance** | Enroll in corporate health insurance — select tier, add spouse/parents/children, opt for critical illness top-up |
| 9 | `my-assets-induction` | **Assets** | View assigned company assets and induction/onboarding checklist items |
| 10 | `my-documents` | **Documents** | Upload and view HR documents |
| 11 | `ai-copilot` | **AI Copilot** | Chat with Groq AI assistant for HR queries |
| 12 | `support-desk` | **Help Desk** | Submit support tickets to the central SaaS support team |

---

## 4. Core HR Workspace

**activeManagementTab: `"hr_management"`**

This is the main HR administration workspace for HR admins and HR team members.

### Menu Items

| # | View | Feature | Role Restriction | Description |
|---|---|---|---|---|
| 1 | `dashboard` | **Overview** | — | Metrics dashboard with attendance analytics, recruitment pipeline, appraisal perspectives, charts |
| 2 | `employees` | **Employees** | `hr_admin` only | Employee master directory — search, filter, onboard new, edit deep profiles |
| 3 | `org-structure` | **Org Structure** | — | Departmental hierarchy visualization |
| 4 | `org-attendance` | **Attendance** | — | HR view of attendance — employee selector, clock in/out for any employee, analytics |
| 5 | `shift-management` | **Shift Management** | — | Create/assign shift rosters (General, Morning, Evening, Night) |
| 6 | `org-leave` | **Leave Planner** | — | HR view of leave — manage requests, approve/reject, view balances |
| 7 | `org-payroll` | **Payroll Fintech** | `payroll_admin` or `hr_admin` | Monthly payroll batch processing, salary structure setup, payslip generation |
| 8 | `org-fbp-tax` | **FBP & Tax** | — | HR view of tax/FBP declarations, grade allowance management |
| 9 | **Benefits** | *(dropdown parent)* | — | | |
| | ↳ `org-insurance` | **Insurance** | — | HR view of insurance enrollment — manage employee enrollments, tiers, dependents |
| | ↳ `org-car-lease` | **Car Lease Program** | — | HR view of vehicle lease — manage employee lease applications, car models, pricing |
| 10 | `policy-center` | **Policy Center** | — | Searchable corporate policy documents repository |
| 11 | `user-mgmt` | **User Management** | `hr_admin` only | User directory (CRUD users) + RBAC Matrix (toggle feature permissions per role) |
| 12 | `reports` | **Reports** | `hr_admin` only | Analytics reports — headcount, payroll cost, leave utilization, insurance coverage, car lease portfolio, performance appraisal, promotions pipeline, exit/attrition, statutory compliance |
| 13 | `erp-masters` | **System Configuration** | `hr_admin` only | ERP Masters — manage client portfolios, projects catalog, staffing allocations, salary bands & functional titles |

### Benefits Dropdown Structure

```
Benefits (🛡️)
├── Insurance (🛡️) → org-insurance view
└── Car Lease Program (🚗) → org-car-lease view
```

The parent "Benefits" menu item shows an active state when either child view is active. A click-outside handler closes the dropdown.

---

## 5. Talent Hub Workspace

**activeManagementTab: `"recruitment"`**

End-to-end talent acquisition and recruitment management.

### Menu Items

| # | View | Feature | Description |
|---|---|---|---|
| 1 | `talent-mgmt` (requisitions tab) | **Workforce Planning** | Hiring requests with approval workflow: Draft → Submit → Manager Approve → HR Approve → Convert to Position |
| 2 | `talent-mgmt` (positions tab) | **Job Requisition** | Position catalog with skill requirements, publishing |
| 3 | `talent-mgmt` (profiles tab) | **Talent Pool** | Resume/profile database, search by skills |
| 4 | `talent-mgmt` (matcher tab) | **AI Match** | NLP-powered profile-to-JD matching engine with percentage scores |
| 5 | `offer-mgmt` | **Offer** | Offer letter management — draft, send, accept/reject tracking |
| 6 | `onboarding-checklist` | **Onboarding** | Candidate-to-employee conversion, induction checklist |

### Candidate Pipeline Flow

```
Applied → Call Letter Issued → Interview Scheduled → Interviewed
                                                         ↓
                                              ┌─────────────────┐
                                              │   Selected?      │
                                              └────────┬────────┘
                                                       ↓ (Yes)
                                              Offer Letter Drafted
                                                       ↓
                                              Offer Sent → Accepted/Rejected
                                                       ↓ (Accepted)
                                              Onboarded → Full Employee
```

### AI Match Engine

- **Endpoint:** `POST /talent/jobs/{id}/match` (45-second timeout)
- **Output:** Matched profiles with percentage scores and matched skills
- **Threshold:** Filters to 90%+ matches by default

---

## 6. Performance Hub Workspace

**activeManagementTab: `"resource_management"`**

Performance management, appraisals, promotions, offboarding, and resource management.

### Menu Items

| # | View | Feature | Role Restriction | Description |
|---|---|---|---|---|
| 1 | `appraisals` | **Appraisals** | — | KRA management, self-review, manager review, bell curve distribution |
| 2 | `ai-promotions` | **AI Promotions** | `hr_admin` only | AI-powered promotion recommendations and analysis |
| 3 | `offboarding` | **Exit Center** | — | Resignation submission, approval workflow, department clearances, F&F settlement |
| 4 | `project-allocations` | **Allocations** | `hr_admin` / `Resource Mgmt Group` | Project/client/bench management, billing rates |
| 5 | `rmg-checklist` | **Checklist** | `hr_admin` / `Resource Mgmt Group` | Onboarding/induction checklist management |
| 6 | `asset-registry` | **Assets** | `hr_admin` / `Resource Mgmt Group` | Asset management (laptops, monitors, phones), assign/return |

### Appraisal Workflow

```
KRAs Created (template with weightage)
        ↓
Self Review (rate 1-5 + feedback)
        ↓
Manager Review (rate 1-5 + feedback)
        ↓
Bell Curve Distribution (statistical normalization)
        ↓
Promotion Readiness Analysis
```

### Offboarding Workflow

```
Employee submits resignation (notice period, relieving date)
        ↓
HR/Admin reviews → Approve or Reject
        ↓ (Approved)
Department Clearances:
  ├── IT Clearance
  ├── HR Clearance
  └── Finance Clearance
        ↓ (All cleared)
F&F Settlement Calculation
        ↓
Settlement Saved → Trigger Payout
```

---

## 7. Super Admin / Nexus Control Plane

**Role: `super_admin`**

Super admins see a separate interface with no teal menu bar. The only accessible view is `nexus-mgmt`.

### Features

| Feature | Description |
|---|---|
| **Organization Management** | View all tenant organizations across shards |
| **Shard Administration** | CRUD database shards, monitor infra status |
| **User Provisioning** | Manage tenant admin accounts |
| **Support Tickets** | View and resolve tenant support tickets (from ESS Help Desk) |
| **Nexus Login** | Login via the special Nexus org UUID |

---

## 8. User Roles & Permissions Matrix

### Available Roles

| Role | Type | Scope |
|---|---|---|
| `employee` | Base | Self-service only |
| `manager` | Base | Self-service + team review |
| `recruiter` | Talent | Talent acquisition |
| `hr_admin` | Admin | Full system administration |
| `HR Team` | HR | HR operations (non-admin) |
| `Talent Team` | Talent | Talent acquisition team |
| `Resource Mgmt Group` | Resource | Resource management |
| `payroll_admin` | Finance | Payroll processing |
| `super_admin` | SaaS | Central platform administration |

### Default Feature Permissions by Role

| Feature | employee | manager | recruiter | hr_admin | HR Team | Resource Mgmt | payroll_admin |
|---|---|---|---|---|---|---|---|
| attendance | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| leave | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| fbp-tax | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| insurance | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| car-lease | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| appraisals | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| offboarding | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| ai-copilot | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| talent-mgmt | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| org-structure | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| shift-management | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| policy-center | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| ai-promotions | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| project-allocations | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| payroll | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| employees | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| user-mgmt | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| reports | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| erp-masters | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

> Permissions are configurable at runtime via the RBAC Matrix in User Management.

---

## 9. Routing & View System

The application uses **state-driven routing** instead of a traditional router library.

### State Variables

| Variable | Type | Purpose |
|---|---|---|
| `activeView` | `string` | Determines which page/view to render |
| `activeManagementTab` | `string` | Determines which workspace tab is active |
| `talentActiveTab` | `string` | Sub-tab within Talent Hub |
| `userMgmtTab` | `"users" \| "rbac"` | Sub-tab within User Management |

### Rendering Dispatch

```
App.tsx render()
  ↓
  Check isViewAllowed(activeView)
    ↓ denied → renderAccessDenied()
    ↓ allowed
    ↓
  Switch on activeView:
    "my-attendance"           → <AttendanceViewPage mode="self" />
    "org-attendance"          → <AttendanceViewPage mode="admin" />
    "dashboard"               → renderModernDashboard()
    "employees"               → inline employee directory
    "talent-mgmt"             → renderTalentSuite(talentActiveTab)
    "nexus-mgmt"              → renderNexusManagement()
    "reports"                 → fetchReport() + render
    ... (40+ view values)
```

### View Permission Check

`isViewAllowed(view)` function:
1. Super admin → only `nexus-mgmt` allowed
2. Normal user → `nexus-mgmt` denied
3. `support-desk` → always allowed
4. Feature flag guard for workspace-gated views
5. `hr_admin` → bypasses most checks
6. Specific views restricted to `hr_admin` only: `user-mgmt`, `employees`

---

## 10. Data Fetching Pattern

### View-Driven Data Loading

A centralized `useEffect` watches `currentUser` and `activeView` and triggers the appropriate fetch:

```
activeView changes
        ↓
useEffect [currentUser, activeView, hrSelectedEmployeeId]
        ↓
  if (activeView === "dashboard")          fetchOverviewData()
  if (activeView === "employees")          fetchEmployees()
  if (activeView === "org-attendance")     fetchAttendance()
  if (activeView === "org-leave")          fetchLeaveRequests()
  if (activeView === "org-insurance")      fetchInsuranceData()
  if (activeView === "org-car-lease")      fetchCarLeaseData()
  ...etc
```

### API Integration

- **HTTP Client:** Native `window.fetch` (no axios)
- **Base URL:** `import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"`
- **Auth Header:** `Authorization: Bearer ${token}`
- **Content-Type:** `application/json`
- **CRUD Pattern:** Standard REST (GET/POST/PUT/DELETE)

### Global Error Handling

- **401 Interceptor:** Overrides `window.fetch` globally — auto-logout on 401
- **Toast Notifications:** Using `react-hot-toast` for success/error messages

---

## 11. API Endpoint Catalog

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/organizations` | List available tenant orgs |
| POST | `/auth/login` | Authenticate user |
| POST | `/auth/register` | Register new tenant |
| GET | `/auth/me` | Get current user profile |

### Core HR

| Method | Endpoint(s) | Description |
|---|---|---|
| GET/POST | `/employees` | List/create employees |
| PUT/DELETE | `/employees/{id}` | Update/delete employee |
| GET/POST/PUT | `/employees/{id}/skillsets` | Employee skills |
| GET/POST/PUT | `/employees/{id}/work-experiences` | Work history |
| GET/POST/PUT | `/employees/{id}/academic-qualifications` | Education |
| GET | `/attendance/me?year=&month=` | My attendance |
| POST | `/attendance/checkin` / `/checkout` | Clock in/out |
| GET | `/attendance/analytics` | Attendance analytics |
| GET/POST | `/leave/balance` / `/requests` | Leave management |
| PUT | `/leave/requests/{id}/action` | Approve/reject leave |
| GET/POST | `/payroll/payslips/me` | Employee payslips |
| POST | `/payroll/process` | Run payroll |
| POST | `/payroll/salary-structure` | Set salary |
| GET/POST | `/tax-declarations` | Tax declarations |
| GET/POST | `/fbp-declarations` | FBP declarations |
| GET/POST/DELETE | `/grade-allowances` | Grade allowance config |
| GET/POST | `/insurance` / `/vehicle-lease` | Insurance & car lease |
| GET | `/reports/*` | Various analytics reports |
| GET/POST | `/erp/clients` / `/projects` / `/project-allocations` / `/salary-bands` / `/functional-titles` | ERP masters |

### Talent Hub

| Method | Endpoint(s) | Description |
|---|---|---|
| GET/POST | `/talent/profiles` | Resume/profile database |
| GET/POST | `/talent/positions` | Position catalog |
| GET/POST | `/talent/candidates` | Candidate pipeline |
| GET/POST | `/talent/interviews` | Interview scheduling |
| GET/POST | `/talent/offers` | Offer management |
| POST | `/talent/jobs/{id}/match` | AI profile-JD matching |
| GET/POST | `/requisitions` | Hiring requests |
| POST | `/requisitions/{id}/submit\|/approve-manager\|/approve-hr\|/reject\|/convert-to-position` | Requisition workflow |

### Performance Hub

| Method | Endpoint(s) | Description |
|---|---|---|
| GET/POST | `/performance/kras` | KRA templates |
| GET/POST | `/performance/reviews` | Performance reviews |
| PUT | `/performance/reviews/{id}/manager-review` | Manager rating |
| GET | `/performance/bell-curve` | Bell curve data |
| GET | `/ai/promotion-recommendations` | AI promotion list |
| POST | `/ai/analyze-promotion` | AI promotion analysis |
| PUT | `/ai/promotion-recommendations/{id}/action` | Approve/reject promotion |
| GET/POST | `/offboarding/me` / `/requests` | Offboarding |
| PUT | `/offboarding/requests/{id}/action` | Approve/reject exit |
| GET/POST | `/rmg/assets` / `/clients` / `/projects` / `/allocations` | Resource management |

### User Management

| Method | Endpoint(s) | Description |
|---|---|---|
| GET/POST | `/usermgmt/users` | User CRUD |
| PUT/DELETE | `/usermgmt/users/{id}` | Update/delete user |
| GET/PUT | `/usermgmt/permissions` | Role permissions matrix |

### AI

| Method | Endpoint(s) | Description |
|---|---|---|
| POST | `/ai/query` | Groq AI chat (copilot) |

### Super Admin / Nexus

| Method | Endpoint(s) | Description |
|---|---|---|
| GET/POST | `/nexus/shards` | Shard management |
| PUT/DELETE | `/nexus/shards/{id}` | Update/delete shard |
| GET | `/nexus/infra-status` | Infrastructure health |
| GET/POST | `/nexus/tickets` / `/tickets/tenant` | Support tickets |

### Dashboard & Utilities

| Method | Endpoint(s) | Description |
|---|---|---|
| GET | `/dashboard/metrics` | Overview metrics |
| GET | `/audit/logs` | Audit trail |

---

## Document History

| Date | Author | Description |
|---|---|---|
| June 2026 | — | Initial comprehensive workflow documentation covering Login through all workspaces (ESS, Core HR, Talent Hub, Performance Hub, Nexus) |
