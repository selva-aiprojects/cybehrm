import urllib.request
import json
import logging
from app.config import settings

logger = logging.getLogger(__name__)

def send_offer_email(candidate_email: str, candidate_name: str, job_title: str, salary: float, joining_date: str, expiry_date: str) -> bool:
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY is not configured. Email not sent.")
        return False
    
    subject = f"Official Employment Offer Letter - {job_title} - CogniHR"
    
    # Render a premium, styled email template
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                color: #1e293b;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f8fafc;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            }}
            .header {{
                background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
                color: #ffffff;
                padding: 32px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: -0.025em;
            }}
            .header p {{
                margin: 8px 0 0 0;
                font-size: 14px;
                color: #e0e7ff;
            }}
            .content {{
                padding: 32px;
            }}
            .salutation {{
                font-size: 18px;
                font-weight: 600;
                margin-top: 0;
                margin-bottom: 16px;
            }}
            .details-table {{
                width: 100%;
                border-collapse: collapse;
                margin: 24px 0;
                font-size: 14px;
            }}
            .details-table th {{
                text-align: left;
                padding: 12px;
                background-color: #f1f5f9;
                border: 1px solid #e2e8f0;
                font-weight: 600;
                color: #475569;
                width: 40%;
            }}
            .details-table td {{
                padding: 12px;
                border: 1px solid #e2e8f0;
                color: #0f172a;
            }}
            .validity-alert {{
                color: #dc2626;
                font-weight: 700;
            }}
            .footer {{
                background-color: #f8fafc;
                padding: 24px 32px;
                border-top: 1px solid #e2e8f0;
                font-size: 12px;
                color: #64748b;
            }}
            .signature {{
                margin-top: 24px;
                border-top: 1px solid #f1f5f9;
                padding-top: 16px;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>CogniHR Solutions</h1>
                <p>Official Offer of Employment</p>
            </div>
            <div class="content">
                <p class="salutation">Dear {candidate_name},</p>
                <p>Congratulations! We are absolutely thrilled to extend you this official offer of employment with our organization. Our interviewing panel was highly impressed by your experience, skills, and technical qualifications.</p>
                <p>We are offering you the position of <strong>{job_title}</strong> with the following terms:</p>
                
                <table class="details-table">
                    <tr>
                        <th>Job Title</th>
                        <td>{job_title}</td>
                    </tr>
                    <tr>
                        <th>Compensation (Annual CTC)</th>
                        <td style="font-weight: 700;">₹{salary:,.2f}</td>
                    </tr>
                    <tr>
                        <th>Expected Date of Joining</th>
                        <td>{joining_date}</td>
                    </tr>
                    <tr>
                        <th>Offer Validity Expiry</th>
                        <td class="validity-alert">{expiry_date}</td>
                    </tr>
                </table>
                
                <p>Please review this offer package. To accept, please reply directly to this email confirming your acceptance, or contact our HR team. Make sure to attach your signed offer copy or reply before the validity date listed above.</p>
                
                <div class="signature">
                    <strong>Human Resources Division</strong><br>
                    CogniHR Solutions<br>
                    <span style="font-size: 12px; color: #94a3b8;">Email: onboarding@cognivectra.com</span>
                </div>
            </div>
            <div class="footer">
                This is a confidential employment offer document generated via CogniHR Solutions portal. The information contained in this communication is confidential and privileged.
            </div>
        </div>
    </body>
    </html>
    """
    
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "from": settings.RESEND_FROM,
        "to": [candidate_email],
        "subject": subject,
        "html": html_content
    }
    
    try:
        req = urllib.request.Request(
            url, 
            data=json.dumps(data).encode('utf-8'), 
            headers=headers,
            method='POST'
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            logger.info(f"Resend email dispatched successfully: {res_body}")
            return True
    except Exception as e:
        logger.error(f"Failed to send email via Resend API: {e}")
        return False


def _dispatch_email(to_email: str, subject: str, html_content: str) -> bool:
    if not settings.RESEND_API_KEY:
        logger.info(f"[EMAIL SIMULATION] RESEND_API_KEY not set. Simulated Email to: {to_email} | Subject: {subject}")
        return True
    
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "from": settings.RESEND_FROM,
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }
    try:
        req = urllib.request.Request(
            url, 
            data=json.dumps(data).encode('utf-8'), 
            headers=headers,
            method='POST'
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            logger.info(f"Resend email dispatched successfully: {res_body}")
            return True
    except Exception as e:
        logger.error(f"Failed to send email via Resend API: {e}")
        return False


# =========================================================================
# PERFORMANCE MODULE EMAIL FLOWS
# =========================================================================

def send_kra_cycle_initiation_email(to_email: str, employee_name: str, cycle_name: str, target_date: str, custom_message: str = None) -> bool:
    """
    1. HR Operations initiates Goal/KRA settings for 6 months period. Email goes to all employees.
    """
    subject = f"🚀 Official Announcement: KRA & Goal Setting Period ({cycle_name}) Initiated"
    custom_msg_html = f'<div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0; border-radius: 4px; color: #1e3a8a;"><strong>HR Note:</strong> {custom_message}</div>' if custom_message else ""
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }}
            .container {{ max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
            .header {{ background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff; padding: 32px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 22px; font-weight: 700; }}
            .header p {{ margin: 8px 0 0 0; font-size: 14px; color: #e0e7ff; }}
            .content {{ padding: 32px; }}
            .details-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }}
            .details-table th {{ text-align: left; padding: 12px; background-color: #f1f5f9; border: 1px solid #e2e8f0; color: #475569; width: 40%; }}
            .details-table td {{ padding: 12px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: 600; }}
            .footer {{ background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>CogniHR Performance Management</h1>
                <p>6-Month Goal & KRA Setting Cycle</p>
            </div>
            <div class="content">
                <p style="font-size: 18px; font-weight: 600; margin-top: 0;">Dear {employee_name},</p>
                <p>Human Resources Operations has officially initiated the Goal & Key Result Areas (KRA) setting period for our upcoming 6-month appraisal cycle.</p>
                {custom_msg_html}
                <table class="details-table">
                    <tr><th>Review Cycle</th><td>{cycle_name}</td></tr>
                    <tr><th>Target Completion Date</th><td style="color: #dc2626;">{target_date}</td></tr>
                    <tr><th>Status</th><td><span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 9999px; font-size: 12px;">Initiated & Open</span></td></tr>
                </table>
                <p>Please log in to the <strong>CogniHR Portal</strong>, navigate to your Dashboard or Performance section, and define your Key Result Areas ensuring your total weightage allocates exactly to 100%.</p>
                <div style="margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                    <strong>Human Resources Division</strong><br>CogniHR Solutions
                </div>
            </div>
            <div class="footer">Confidential performance notification generated via CogniHR portal.</div>
        </div>
    </body>
    </html>
    """
    return _dispatch_email(to_email, subject, html_content)


def send_manager_kra_reminder_email(to_email: str, employee_name: str, manager_name: str, cycle_name: str, target_date: str, custom_message: str = None) -> bool:
    """
    2. Manager initiates KRA settings for their team. Formal communication to complete goal settings.
    """
    subject = f"📋 Action Required: Complete Your Goal & KRA Setting ({cycle_name})"
    custom_msg_html = f'<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; border-radius: 4px; color: #78350f;"><strong>Message from {manager_name}:</strong> {custom_message}</div>' if custom_message else ""
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }}
            .container {{ max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
            .header {{ background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; padding: 32px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 22px; font-weight: 700; }}
            .header p {{ margin: 8px 0 0 0; font-size: 14px; color: #d1fae5; }}
            .content {{ padding: 32px; }}
            .details-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }}
            .details-table th {{ text-align: left; padding: 12px; background-color: #f1f5f9; border: 1px solid #e2e8f0; color: #475569; width: 40%; }}
            .details-table td {{ padding: 12px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: 600; }}
            .footer {{ background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Team Goal Setting Communication</h1>
                <p>Manager Initiation & Alignment</p>
            </div>
            <div class="content">
                <p style="font-size: 18px; font-weight: 600; margin-top: 0;">Dear {employee_name},</p>
                <p>Your reporting manager, <strong>{manager_name}</strong>, has initiated the KRA and goal setting alignment for your team for the <strong>{cycle_name}</strong> period.</p>
                {custom_msg_html}
                <table class="details-table">
                    <tr><th>Reporting Manager</th><td>{manager_name}</td></tr>
                    <tr><th>Review Cycle</th><td>{cycle_name}</td></tr>
                    <tr><th>Target Completion Date</th><td style="color: #dc2626;">{target_date}</td></tr>
                </table>
                <p>Please log in to your CogniHR Dashboard, submit your Key Result Areas with clear metrics and target dates, and ensure they are ready for formal alignment with your manager.</p>
                <div style="margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                    <strong>{manager_name}</strong><br>CogniHR Performance Management
                </div>
            </div>
            <div class="footer">Confidential performance notification generated via CogniHR portal.</div>
        </div>
    </body>
    </html>
    """
    return _dispatch_email(to_email, subject, html_content)


def send_self_review_submitted_email(to_email: str, recipient_name: str, employee_name: str, review_cycle: str, is_to_manager: bool) -> bool:
    """
    3. Self Rating against KRA completed - Mail goes from CogniHRMS to both employee and manager.
    """
    if is_to_manager:
        subject = f"🔔 Manager Alert: {employee_name} Completed Self-Rating ({review_cycle})"
        salutation = f"Dear {recipient_name},"
        body = f"Your team member, <strong>{employee_name}</strong>, has successfully submitted their self-ratings and qualitative feedback against their Key Result Areas for the <strong>{review_cycle}</strong> review period.<br><br>The appraisal record is now complete and ready for your formal Manager Review and scoring."
    else:
        subject = f"✅ Confirmation: Self-Rating Submitted ({review_cycle})"
        salutation = f"Dear {recipient_name},"
        body = f"We have successfully recorded your self-rating and qualitative feedback for the <strong>{review_cycle}</strong> review period.<br><br>Your submission has been forwarded to your reporting manager for review and evaluation."

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; background: #f8fafc; margin:0; padding:0; }}
        .container {{ max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }}
        .header {{ background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #fff; padding: 24px; text-align: center; }}
        .content {{ padding: 32px; line-height: 1.6; }}
        .footer {{ background: #f8fafc; padding: 20px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
    </style></head>
    <body>
        <div class="container">
            <div class="header"><h2 style="margin:0;">CogniHRMS Appraisal Update</h2></div>
            <div class="content">
                <p style="font-size: 16px; font-weight: 600;">{salutation}</p>
                <p>{body}</p>
                <div style="margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;"><strong>CogniHRMS Automated Notification System</strong></div>
            </div>
            <div class="footer">Confidential system generated email.</div>
        </div>
    </body></html>
    """
    return _dispatch_email(to_email, subject, html_content)


def send_manager_review_completed_email(to_email: str, employee_name: str, manager_name: str, review_cycle: str) -> bool:
    """
    4. After manager review, notification email goes to the employee on Manager review completion.
    """
    subject = f"🌟 Appraisal Update: Manager Review Completed ({review_cycle})"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; background: #f8fafc; margin:0; padding:0; }}
        .container {{ max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }}
        .header {{ background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #fff; padding: 24px; text-align: center; }}
        .content {{ padding: 32px; line-height: 1.6; }}
        .footer {{ background: #f8fafc; padding: 20px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
    </style></head>
    <body>
        <div class="container">
            <div class="header"><h2 style="margin:0;">Manager Review Completed</h2></div>
            <div class="content">
                <p style="font-size: 16px; font-weight: 600;">Dear {employee_name},</p>
                <p>We are pleased to inform you that your reporting manager, <strong>{manager_name}</strong>, has completed the managerial evaluation and scoring for your <strong>{review_cycle}</strong> performance appraisal.</p>
                <p>Your appraisal is now undergoing HR review and final bell-curve calibration before final scores and ratings are published across the organization.</p>
                <div style="margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;"><strong>CogniHR Performance Management</strong></div>
            </div>
            <div class="footer">Confidential system generated email.</div>
        </div>
    </body></html>
    """
    return _dispatch_email(to_email, subject, html_content)


def send_final_ratings_published_email(to_email: str, employee_name: str, review_cycle: str, normalized_category: str) -> bool:
    """
    5. Final rating published from HR to all employees.
    """
    cat_color = "#16a34a" if normalized_category == "Top" else ("#2563eb" if normalized_category == "Core" else "#d97706")
    subject = f"🏆 Performance Appraisal Results Published ({review_cycle})"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; background: #f8fafc; margin:0; padding:0; }}
        .container {{ max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }}
        .header {{ background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color: #fff; padding: 28px; text-align: center; }}
        .content {{ padding: 32px; line-height: 1.6; }}
        .badge {{ display: inline-block; padding: 8px 16px; font-size: 16px; font-weight: 700; color: #fff; background: {cat_color}; border-radius: 6px; margin: 12px 0; }}
        .footer {{ background: #f8fafc; padding: 20px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
    </style></head>
    <body>
        <div class="container">
            <div class="header"><h2 style="margin:0;">Final Appraisal Results Published</h2></div>
            <div class="content">
                <p style="font-size: 16px; font-weight: 600;">Dear {employee_name},</p>
                <p>Human Resources has officially finalized and published the organizational performance ratings and normalization categories for the <strong>{review_cycle}</strong> period.</p>
                <div style="text-align: center; margin: 24px 0; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <span style="font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Your Calibrated Rating Tier</span><br>
                    <div class="badge">{normalized_category} Performer</div>
                </div>
                <p>Log into your CogniHR portal to view your comprehensive feedback and rating summary.</p>
                <div style="margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;"><strong>Human Resources Operations</strong><br>CogniHR Solutions</div>
            </div>
            <div class="footer">Confidential appraisal record.</div>
        </div>
    </body></html>
    """
    return _dispatch_email(to_email, subject, html_content)

