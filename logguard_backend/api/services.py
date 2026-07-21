import requests
from django.conf import settings
from datetime import datetime

def send_email_via_resend(to_email, subject, html_content):
    """
    Resend API मार्फत email पठाउँछ।
    Returns: (success: bool, message: str)
    """
    api_key = settings.RESEND_API_KEY
    if not api_key:
        return False, "RESEND_API_KEY not configured"

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    data = {
        "from": "LogGuard AI <onboarding@resend.dev>",  # test को लागि
        "to": [to_email],
        "subject": subject,
        "html": html_content,
    }

    try:
        response = requests.post(url, json=data, headers=headers, timeout=10)
        if response.status_code == 200:
            return True, response.json().get('id', 'Sent')
        else:
            return False, response.text
    except Exception as e:
        return False, str(e)


def get_alert_email_html(severity, message, ip, event):
    """CRITICAL Alert को लागि HTML email template"""
    severity_colors = {
        'CRITICAL': '#dc2626',
        'HIGH': '#f97316',
        'MEDIUM': '#eab308',
        'LOW': '#22c55e'
    }
    color = severity_colors.get(severity.upper(), '#f59e0b')
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background: #0a0a0a; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 16px; padding: 30px; border: 1px solid #2a2a2a; }}
            .header {{ text-align: center; padding-bottom: 20px; border-bottom: 1px solid #2a2a2a; }}
            .logo {{ font-size: 28px; font-weight: bold; color: #f59e0b; letter-spacing: 2px; }}
            .badge {{ display: inline-block; background: {color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }}
            .severity-box {{ background: {color}20; border-left: 4px solid {color}; padding: 15px; border-radius: 8px; margin: 20px 0; }}
            .field {{ margin: 12px 0; }}
            .label {{ color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }}
            .value {{ color: #f3f4f6; font-size: 16px; font-weight: 500; }}
            .footer {{ text-align: center; padding-top: 20px; border-top: 1px solid #2a2a2a; color: #6b7280; font-size: 12px; }}
            .btn {{ display: inline-block; background: #f59e0b; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🛡️ LogGuard AI</div>
                <p style="color: #9ca3af; font-size: 14px;">Real-Time Threat Detection</p>
            </div>

            <div style="text-align: center; margin: 20px 0;">
                <span class="badge">🚨 {severity.upper()}</span>
                <span style="color: #6b7280; font-size: 14px; margin-left: 10px;">{timestamp}</span>
            </div>

            <div class="severity-box">
                <div class="field">
                    <div class="label">🔴 Severity</div>
                    <div class="value">{severity.upper()}</div>
                </div>
                <div class="field">
                    <div class="label">🌐 IP Address</div>
                    <div class="value">{ip}</div>
                </div>
                <div class="field">
                    <div class="label">⚡ Event</div>
                    <div class="value">{event}</div>
                </div>
                <div class="field">
                    <div class="label">📝 Message</div>
                    <div class="value">{message}</div>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="https://logguard-frontend.onrender.com" class="btn">📊 View Dashboard</a>
            </div>

            <div class="footer">
                <p>LogGuard AI — AI-Powered Log Analysis &amp; Threat Detection</p>
                <p style="color: #4b5563;">This is an automated alert. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """


def get_report_email_html(anomalies, total_entries):
    """Scan Report को लागि HTML email template"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    anomaly_count = len(anomalies)

    # Build anomaly list
    anomaly_items = ""
    for a in anomalies[:10]:  # max 10 anomalies in email
        timestamp_str = a.get('timestamp', 'N/A')
        event = a.get('event', 'Unknown')
        anomaly_items += f"""
            <tr>
                <td style="padding: 8px 12px; border-bottom: 1px solid #2a2a2a; color: #d1d5db;">{timestamp_str}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #2a2a2a; color: #f87171;">{event}</td>
            </tr>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background: #0a0a0a; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 16px; padding: 30px; border: 1px solid #2a2a2a; }}
            .header {{ text-align: center; padding-bottom: 20px; border-bottom: 1px solid #2a2a2a; }}
            .logo {{ font-size: 28px; font-weight: bold; color: #f59e0b; letter-spacing: 2px; }}
            .stats {{ display: flex; justify-content: center; gap: 40px; margin: 20px 0; }}
            .stat-box {{ text-align: center; }}
            .stat-number {{ font-size: 32px; font-weight: bold; }}
            .stat-label {{ color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }}
            .table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            .table th {{ text-align: left; padding: 10px 12px; background: #0a0a0a; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }}
            .footer {{ text-align: center; padding-top: 20px; border-top: 1px solid #2a2a2a; color: #6b7280; font-size: 12px; }}
            .btn {{ display: inline-block; background: #f59e0b; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }}
            .success {{ color: #22c55e; }}
            .danger {{ color: #ef4444; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">📊 LogGuard AI</div>
                <p style="color: #9ca3af; font-size: 14px;">Scan Report — {timestamp}</p>
            </div>

            <div class="stats">
                <div class="stat-box">
                    <div class="stat-number" style="color: #f3f4f6;">{total_entries}</div>
                    <div class="stat-label">Total Entries</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number" style="color: #ef4444;">{anomaly_count}</div>
                    <div class="stat-label">⚠️ Anomalies</div>
                </div>
            </div>

            {f'''
            <h3 style="color: #f59e0b; margin-top: 20px;">🔍 Detected Anomalies</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Event</th>
                    </tr>
                </thead>
                <tbody>
                    {anomaly_items}
                </tbody>
            </table>
            ''' if anomaly_count > 0 else ''}

            <div style="text-align: center;">
                <a href="https://logguard-frontend.onrender.com" class="btn">📊 View Full Report</a>
            </div>

            <div class="footer">
                <p>LogGuard AI — AI-Powered Log Analysis &amp; Threat Detection</p>
                <p style="color: #4b5563;">This is an automated report. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """


def send_alert_email(severity, message, ip, event):
    """
    CRITICAL alert को लागि HTML email पठाउँछ।
    """
    subject = f"🚨 {severity.upper()} Alert: {event}"
    html_content = get_alert_email_html(severity, message, ip, event)

    # Admin email (जहाँ alert पठाउने)
    admin_email = getattr(settings, 'ADMIN_EMAIL', 'neupaneenzela@gmail.com')
    return send_email_via_resend(admin_email, subject, html_content)


def send_scan_report_email(to_email, anomalies, total_entries):
    """
    Scan Report पठाउँछ (LandingPage को "Send Report" बाट)।
    """
    subject = f"📊 LogGuard AI — Scan Report ({total_entries} entries, {len(anomalies)} anomalies)"
    html_content = get_report_email_html(anomalies, total_entries)
    return send_email_via_resend(to_email, subject, html_content)