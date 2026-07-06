import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

def generate_threat_summary(anomalies):
    if not GROQ_API_KEY:
        return "Groq API key not configured. Please set GROQ_API_KEY in .env"
    
    client = Groq(api_key=GROQ_API_KEY)
    
    if not anomalies:
        return "No threats detected."
    
    prompt = "Summarize these cybersecurity threats in simple plain English for a security analyst:\n\n"
    for a in anomalies[:10]:
        prompt += f"- {a.get('event')} from {a.get('ip')} at {a.get('timestamp')} (severity: {a.get('severity')})\n"
    prompt += "\nWrite a short, clear summary (max 3 sentences)."
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error generating summary: {e}"