export interface UserProfile {
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

export interface Employee {
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

export interface Attendance {
  id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: string;
  late_minutes: number;
  overtime_minutes: number;
  work_minutes: number;
}

export interface LeaveBalance {
  id: string;
  leave_type: string;
  allocated: number;
  used: number;
  remaining: number;
}

export interface LeaveRequest {
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

export interface Payslip {
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

export interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
}

export interface Organization {
  id: string;
  name: string;
}
