import requests
from django.conf import settings

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
        "from": "onboarding@resend.dev",   # test को लागि; production मा आफ्नो domain प्रयोग गर्नुस्
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


def send_alert_email(severity, message, ip, event):
    """
    Critical alerts को लागि email पठाउने (view बाट call हुन्छ)।
    Resend प्रयोग गर्छ।
    """
    subject = f"🚨 Critical Alert: {severity}"
    html = f"""
    <h2>Log Guard AI - Critical Alert</h2>
    <p><strong>Severity:</strong> {severity}</p>
    <p><strong>Event:</strong> {event}</p>
    <p><strong>IP:</strong> {ip}</p>
    <p><strong>Message:</strong> {message}</p>
    """
    admin_email = getattr(settings, 'ADMIN_EMAIL', 'admin@example.com')
    return send_email_via_resend(admin_email, subject, html)