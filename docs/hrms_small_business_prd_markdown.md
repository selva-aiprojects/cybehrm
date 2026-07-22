# SynthalystHRM – Product Requirement Document (PRD)

## 1. Overview

### Product Name
SynthalystHRM

### Vision
Build a comprehensive, AI-powered HRMS platform for small and medium businesses (SMEs) with simplified HR operations, advanced automated payroll with Indian statutory tax compliance, performance reviews, offboarding, employee benefits/perks, insurance plans, car lease structures, and AI-assisted analytics.

### Target Customers
- Startups & Small Businesses (SMEs)
- IT services firms, clinics, agencies, and manufacturing units.

### Core Objectives
- **Centralized Profiles:** Simplify employee profile, hierarchy, and role management.
- **Payroll-Ready Attendance:** Automate attendance logs (check-in/out timestamps) with geolocations, overtime computations, and Loss of Pay (LOP) calculations for late marks.
- **Indian Statutory Compliance:** Automate EPF contributions, EPS/FPF splits, NPS options, slab-based Professional Tax (PT), and Income Tax TDS slabs.
- **Self-Service Tax Declaration:** Provide a portal for employees to select tax regimes (Old vs. New) and upload Section 80C/80D/HRA rent proofs.
- **Grade-Wise Perks & FBP:** Support grade-specific flexible benefits (Fuel, LTA travel logs, phone/internet caps) to optimize tax structures.
- **Group Medical Insurance:** Provide comprehensive coverage for Employee, Spouse, up to 2 Kids, and up to 2 Parents, with dynamic surcharges for additional dependents.
- **Vehicle Adoption Plans:** Facilitate Own Your Transport (OYT) fuel caps and Corporate Car Leases with pre-tax EMI deductions and IT Rule 3 taxable perquisite calculations.
- **Performance & Bell Curve:** Implement weightage-based KRAs, quarterly ratings (self vs. manager), and a Manager Bell Curve normalization grid.
- **AI Promotion Recommendations:** Integrate an LLM reasoning engine to analyze performance appraisal trends, attendance patterns, and experience to recommend promotions.
- Exit & Offboarding: Streamline checklist workflows, Payment of Gratuity Act calculations, and Full & Final (F&F) settlements.

---

## 1.5 Technical Architecture & Deployment
- **Database:** Supabase (PostgreSQL) is used uniformly for both development and production environments.
- **Web Frontend:** Deployed on Render for web users to access and validate.
- **Mobile Client:** Shared as an APK version for mobile users.

---

## 2. User Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Super Admin** | Platform Owner | Tenant provisioning, global system settings, subscription billing |
| **HR Admin** | HR Operations manager | Profile editing, payroll setup, appraisal cycles, exit checklists, insurance configs |
| **Manager** | People Manager | Attendance review, leave approval, KRA score entry, Bell Curve normalization, promotion approval |
| **Employee** | Self-Service User | Profile view, check-in/out, leave requests, FBP declaration, tax proofs upload, KRA self-rating |
| **Payroll Admin** | Financial Officer | Payroll batch processing, statutory deposits, final settlement releases |

---

## 3. Core Modules & Detailed Requirements

### 3.1 Advanced Leave Management
- **Eligibility Matrix:** Dynamically allocate leave types (Casual, Sick, Privilege Leaves - PL) based on the employee's work experience (tenure in months) and grade (L1, L2, L3).
- **Privilege Leaves (PL):** Implement rules for carry-forward limits (e.g., maximum 30 days) and year-end encashment options.
- **Accrual Engine:** Automatically accrue leave balances monthly on a pro-rata basis based on the employee's joining date.

### 3.2 Advanced Attendance & Late Arrivals Logic
- **Geolocated Logs:** Capture check-in/out timestamps, IP addresses, and latitude/longitude geolocations.
- **Overtime Engine:** Calculate overtime minutes for working beyond regular shift schedules (e.g., 9-hour workdays).
- **Late Arrivals & Penalty Rules:** 
  - Track late check-ins beyond a grace period (e.g., 15 minutes past shift start).
  - Implement penalty thresholds: e.g., 3 late check-ins in a month triggers 0.5 days of LOP; 5 or more late check-ins triggers 1.0 day of LOP.
- **LOP Integration:** Feed attendance-related anomalies and unauthorized absences directly into the monthly payroll preparation calculations.

### 3.3 Statutory Benefits & Tax Management
- **Statutory Contributions (Indian Rules):**
  - **EPF (Employee Provident Fund):** 12% of basic salary from both employee and employer.
  - **FPF (EPS Split):** Employer's 12% share is split: 8.33% up to a basic salary ceiling of ₹15,000 (maximum ₹1,250/month) goes to EPS/FPF; the remaining amount goes into the EPF fund.
  - **NPS (National Pension System):** Optional pre-tax employee/employer contributions under Section 80CCD(1B) / 80CCD(2).
- **Professional Tax (PT):** Automatically apply state-specific slab deductions based on monthly gross salary (e.g., slab-based up to ₹200/₹250 per month).
- **Income Tax TDS slabs:** 
  - **Old Regime:** Apply slab rates (5%, 20%, 30%) and deduct HRA exemptions, Section 80C (up to ₹1.5L), Section 80D (up to ₹25k/₹50k), and a standard deduction of ₹50,000.
  - **New Regime:** Apply simplified tax slabs (5%, 10%, 15%, 20%, 30%) with a standard deduction of ₹75,000 (no HRA or Section 80C/80D deductions).
  - **Cess Surcharge:** Automatically compute and add a 4% Health & Education Cess on top of the calculated income tax TDS.
- **Tax Declaration Portal:** Self-service portal for employees to select their preferred tax regime, declare annual investments under 80C/80D, and declare HRA rent.
  - *HRA Compliance:* Require Landlord Name and Landlord PAN format validation if annual declared rent exceeds **₹1,00,000**.
  - *Proof Uploads:* Accept attachment file uploads and support HR review/approval states.

### 3.4 Grade-Wise Allowances, Perks & Flexible Benefit Plans (FBP)
- **Grade-wise Structure:** Configurable allowances and market-standard perks associated with Employee Grades (L1, L2, L3):
  - **L1 (Junior):** Fuel = ₹2,000/month, LTA = ₹20,000/year, Telephone = ₹1,000/month, Food Coupons = ₹2,200/month. Core Insurance = ₹3L cover.
  - **L2 (Mid):** Fuel = ₹5,000/month, LTA = ₹40,000/year, Telephone = ₹2,000/month, Food Coupons = ₹3,000/month. Core Insurance = ₹5L cover.
  - **L3 (Senior):** Fuel = ₹10,000/month, LTA = ₹80,000/year, Telephone = ₹3,500/month, Food Coupons = ₹4,000/month. Core Insurance = ₹7L cover.
- **FBP Restructuring Portal:** Employees can dynamically structure their tax-saving FBP allowance components within their grade-wise threshold limits, reducing net taxable income.
- **LTA Block-Year Compliance:** Exemption claims are strictly capped at maximum 2 claims within a block of 4 calendar years (2026-2029).

### 3.5 Group Health & Family Insurance Module
- **Standard Corporate Cover:** Core insurance plans (sum insured) defined by grade: L1 = ₹3L, L2 = ₹5L, L3 = ₹7L.
- **Dependents Covered:** Core coverage automatically extends to Employee, Spouse, up to 2 Kids, and up to 2 Parents at ₹0 cost.
- **Top-up Tiers & Surcharges:** 
  - Allow employees to add extra dependents (e.g., 3rd child, parents-in-law) or opt for higher coverage sums.
  - Apply standard monthly premium surcharges: e.g., ₹500/month per additional child, ₹1,200/month per additional parent/parent-in-law.
- **Payroll Deduction Integration:** The calculated additional premium surcharges are automatically deducted as a post-tax item from the monthly payslip.
- **Interactive Health Cards:** Support a self-service panel to download dependent enrollment summaries and printable mock corporate health insurance cards.

### 3.6 Vehicle Adoption & Car Lease Plans
- **Adoption Modes:**
  - **Own Your Transport (OYT):** The employee uses their personal vehicle. They can claim standard tax exemptions on fuel, driver salary, and maintenance up to their grade-wise allowance limits.
  - **Corporate Lease Car Plan:** The company leases the vehicle for the employee. The monthly lease EMI is processed as a pre-tax deduction from the gross salary, reducing the employee's net taxable income.
- **Fringe Benefit Tax / Perquisites Engine (Income Tax Rule 3):**
  - Compute taxable perquisite value for corporate cars based on engine capacity and driver presence:
    - **Engine <= 1.6 Litres:** ₹1,800/month taxable perquisite (+ ₹900/month if company-provided driver is checked).
    - **Engine > 1.6 Litres:** ₹2,400/month taxable perquisite (+ ₹900/month if company-provided driver is checked).
  - Inject the calculated perquisite value directly into the employee's projected taxable income for monthly TDS.

### 3.7 AI-Powered Promotion Recommendations
- **AI Recommendation Engine:** Integrate the LLM reasoning engine to assist HR Admins and Managers during appraisal cycles.
- **Input Data Points:** Feed the following historical metrics of an employee to the AI reasoning engine:
  - Historical quarterly performance review ratings (KRA weightage scores, self-ratings, manager ratings).
  - Attendance logs (punctuality, late arrival trends, total LOP penalties).
  - Experience details (total months of service, total tenure in current grade level).
  - Leave balances and utilization.
- **AI Output and Justifications:** The LLM generates:
  - **Readiness Score:** An explicit recommendation state: *Highly Recommended, Recommended, Maintain Current Grade, or Requires Monitoring*.
  - **Suggested Grade & Comp Adjustment:** Proposed promotion target (e.g., L1 -> L2) with projected grade-wise allowance upgrades.
  - **Qualitative Justification:** A structured explanation detailing why the employee is ready, highlighting key performance indicators (KPIs) and operational consistency.
  - **Risk Flags:** Notes on absenteeism, recent late arrival spikes, or score volatility.
- **Interactive UI Panel:** Provide an "AI Promotion Insights" panel in the manager's appraisal dashboard, with single-click trigger buttons to initiate promotion requests.

### 3.8 Performance Appraisals Flow
- **KRA (Key Result Areas) Settings:** Managers or HR Admins assign customizable KRAs and weightages (totaling 100%) to employees at the start of the appraisal cycle.
- **Quarterly Review Ratings:** Structured appraisal flow with Employee self-ratings (1.0 to 5.0 scale) followed by Manager ratings and feedback.
- **Bell Curve Normalization:** People Managers can view their team's rating distribution on a visual bell curve and normalize ratings (categorizing as *Top, Core, or Low* performers) to fit target allocation guidelines.

### 3.9 Exit Formalities & Offboarding
- **Offboarding Checklist:** Task lists assigned to IT, HR, and Finance for assets return, account deletions, and audit sign-off.
- **Gratuity Calculations:** Automatically apply the Payment of Gratuity Act formula: `(15 * Basic Salary * Years of Service) / 26`.
  - Enforce a strict continuous service filter of **5 years (60 months)**. If the service duration is less than 5 years, the gratuity payout is automatically set to ₹0.
- **Full & Final (F&F) Settlement Report:** Consolidate final month's salary, LOP deductions, gratuity, notice period buyouts, and leave encashment into a final settlement report.

---

## 4. Suggested Database Additions

We will introduce several new tables and modify existing schemas to support operational, compliance, appraisal, and promotion recommendation scopes:

- `leave_policies`: Grade/Tenure criteria and carry-forward/encashment settings.
- `tax_declarations`: Employee investment proofs under 80C, 80D, HRA rent, landlord PAN, and HR approval status.
- `grade_allowances`: Perks limits, LTA, and FBP configurations by Grade (L1, L2, L3).
- `fbp_declarations`: Employee-structured flexible benefits selections.
- `insurance_enrollments`: Enrolled family members (Spouse, Kids, Parents, Extras) and additional monthly payroll deductions.
- `vehicle_leases`: Car adoption logs, EMI values, OYT fuel caps, and calculated taxable perquisite values.
- `performance_kras`: Key Result Areas per employee with weightage.
- `performance_reviews`: Quarterly scores, self-evaluations, manager ratings, and status.
- `promotion_recommendations`: AI-generated promotion suggestions, readiness state, qualitative justification, and approval logs.
- `offboarding_requests`: Exit request date, notice period, offboarding checklists status.
- `final_settlements`: Gratuity, leave encashment, notice period buyout adjustments, and F&F approval status.
