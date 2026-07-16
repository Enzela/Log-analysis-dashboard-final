FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# ✅ कोई build-time migration छैन (किनभने DB URL छैन)
RUN python manage.py collectstatic --noinput

# ✅ start.sh copy र executable बनाऊ
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8000

# ✅ start.sh चलाऊ (जसले migrate + gunicorn गर्छ)
CMD ["/start.sh"]