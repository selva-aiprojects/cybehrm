# app/services/ai_service.py
import os
import json
from openai import OpenAI
from app.config import settings
from decimal import Decimal

class AIService:
    def __init__(self):
        """
        Initialize the AI Service using Groq's OpenAI-compatible SDK endpoint.
        Falls back to dummy responses if the API key is not configured to allow safe testing.
        """
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.AI_MODEL
        
        # Configure client if key is set
        if self.api_key and "placeholder" not in self.api_key:
            self.client = OpenAI(
                base_url="https://api.groq.com/openai/v1",
                api_key=self.api_key
            )
        else:
            self.client = None

    async def query_hr_assistant(self, query: str, employee_name: str, org_name: str) -> str:
        """
        Send a query to the Groq-powered AI Assistant with structured HR system prompts.
        Supports fallback mock messages if Groq API keys are not provided.
        """
        # HR system prompt to model conversational behavior
        system_prompt = (
            f"You are HRMS-Engine, an advanced AI Human Resource Assistant built by Google DeepMind. "
            f"You are currently assisting {employee_name}, an employee at {org_name}. "
            f"Provide professional, empathetic, accurate, and concise answers to their HR policy, "
            f"leave calculations, payroll components, and workplace queries. "
            f"If answering a policy Q&A, format the details cleanly with bullet points where appropriate."
        )

        if not self.client:
            # Safe mock fallback for testing environment
            return (
                f"👋 Hello {employee_name}! I am HRMS-Engine, your AI Assistant. "
                f"Currently, the active Groq AI Services are running in Offline/Sandbox mode "
                f"because a custom GROQ_API_KEY environment variable is not configured. "
                f"\n\nHere is a simulated response to your query: '{query}' "
                f"\n\nTo enable sub-second LPU Llama 3 answers, please configure a valid key "
                f"in your backend `.env` file under GROQ_API_KEY."
            )

        try:
            # Non-blocking synchronous call or thread pool execute
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                temperature=0.7,
                max_tokens=800
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"⚠️ Error processing request via Groq LPU Services: {str(e)}"

    async def get_promotion_recommendation(self, emp_data: dict) -> dict:
        """
        Evaluate employee metrics for promotion readiness using Llama 3 via Groq.
        If Groq is offline or fails, falls back to a smart, mathematically sound local logic.
        """
        # A. Local Rule-Based Calculation (used as fallback or base math)
        base_score = 50.0
        risk_flags = []
        
        # 1. Manager Rating Math
        mgr_rating = emp_data.get("latest_manager_rating", 0.0)
        if mgr_rating > 0.0:
            base_score = float(mgr_rating) * 20.0  # e.g., 4.0 manager rating -> 80
            if mgr_rating >= 4.5:
                base_score += 10.0
            elif mgr_rating < 3.0:
                base_score -= 20.0
                risk_flags.append("Low manager appraisal rating")
        else:
            risk_flags.append("No active manager appraisal rating on record")

        # 2. Tenure Math
        tenure_months = emp_data.get("tenure_months", 0.0)
        if tenure_months < 12.0:
            base_score -= 15.0
            risk_flags.append("Short tenure in current grade (< 12 months)")
        elif tenure_months >= 24.0:
            base_score += 5.0

        # 3. Self-appraisal alignment
        self_rating = emp_data.get("latest_self_rating", 0.0)
        if self_rating > 0.0 and mgr_rating > 0.0:
            if abs(self_rating - mgr_rating) >= 1.5:
                risk_flags.append("High discrepancy between self and manager rating")

        # 4. Attendance LOP impact
        lop_days = float(emp_data.get("attendance_lop_days", 0.0))
        if lop_days > 2.0:
            base_score -= 10.0
            risk_flags.append("Excessive late arrivals/attendance LOP occurrences")

        # Bound score between 0 and 100
        ai_score = max(0.0, min(100.0, base_score))

        # Suggested increment calculation
        current_grade = emp_data.get("current_grade", "L1")
        target_grade = emp_data.get("target_grade", "L2")
        
        comp_adjustment = 10.0
        if ai_score >= 75.0:
            if current_grade == "L1":
                comp_adjustment = 20.0
            elif current_grade == "L2":
                comp_adjustment = 15.0
        elif ai_score < 60.0:
            comp_adjustment = 0.0

        # Build qualitative fallback text
        name = emp_data.get("name", "Employee")
        summary_text = (
            f"AI evaluation indicates that {name} shows a readiness score of {ai_score:.1f}% for promotion from {current_grade} to {target_grade}. "
            f"Key factors: Tenure of {tenure_months:.1f} months in grade, latest manager rating of {mgr_rating:.1f}/5.0. "
            f"Suggested compensation adjustment: {comp_adjustment:.2f}%."
        )

        # If LLM client is available, query Groq for high-quality qualitative summary
        if self.client:
            prompt = (
                f"Analyze this employee's metrics for promotion readiness from {current_grade} to {target_grade} "
                f"and return a JSON object with keys 'score' (float 0-100), 'summary' (str - 3 sentences qualitative justification), "
                f"'risk_flags' (array of strings), and 'comp_adjustment_pct' (float).\n\n"
                f"Employee Name: {name}\n"
                f"Tenure Months: {tenure_months}\n"
                f"Latest Manager Rating: {mgr_rating}\n"
                f"Latest Self Rating: {self_rating}\n"
                f"Attendance LOP Days: {lop_days}\n"
                f"Local Score Estimate: {ai_score}\n"
                f"Local Risk Flags: {risk_flags}\n"
                f"Local Comp Adjustment Estimate: {comp_adjustment}\n\n"
                f"Ensure the JSON output is strictly valid and return ONLY the JSON block."
            )
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a professional HR promotion analytics assistant. You always output strictly valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    response_format={"type": "json_object"}
                )
                res_content = response.choices[0].message.content
                data = json.loads(res_content)
                
                # Enforce safe parsing and validation
                parsed_score = float(data.get("score", ai_score))
                parsed_summary = str(data.get("summary", summary_text))
                parsed_flags = list(data.get("risk_flags", risk_flags))
                parsed_comp = float(data.get("comp_adjustment_pct", comp_adjustment))
                
                return {
                    "score": parsed_score,
                    "summary": parsed_summary,
                    "risk_flags": parsed_flags,
                    "comp_adjustment_pct": parsed_comp
                }
            except Exception:
                # Silent fallback to local rule estimation
                pass

        return {
            "score": ai_score,
            "summary": summary_text,
            "risk_flags": risk_flags,
            "comp_adjustment_pct": comp_adjustment
        }
