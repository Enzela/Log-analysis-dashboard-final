import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
ALERT_RECIPIENT = os.getenv('ALERT_RECIPIENT', 'enzela@test.com')

def send_alert_email(severity, message, ip, event):
    """Send email alert for critical threats"""
    if not SMTP_USER or not SMTP_PASSWORD:
        print("⚠️ SMTP credentials not set. Email not sent.")
        return False

    subject = f"🚨 CRITICAL Alert: {event} from {ip}"
    body = f"""
Severity: {severity}
IP: {ip}
Event: {event}
Message: {message}

Please check the dashboard immediately.
"""

    msg = MIMEMultipart()
    msg['From'] = SMTP_USER
    msg['To'] = ALERT_RECIPIENT
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"✅ Alert email sent to {ALERT_RECIPIENT}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False