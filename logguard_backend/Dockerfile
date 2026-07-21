FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

# ✅ workers=1 set गरियो (memory बचाउन)
CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn logguard_backend.wsgi:application --bind 0.0.0.0:8000 --workers=1"]