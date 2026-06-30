from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class Severity(models.TextChoices):
    LOW = 'LOW', 'Low'
    MEDIUM = 'MEDIUM', 'Medium'
    HIGH = 'HIGH', 'High'
    CRITICAL = 'CRITICAL', 'Critical'

class User(AbstractUser):
    role = models.CharField(max_length=50, default='analyst')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username

class LogFile(models.Model):
    filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500, blank=True, null=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default='pending')

    def __str__(self):
        return self.filename

class LogEntry(models.Model):
    log_file = models.ForeignKey(LogFile, on_delete=models.CASCADE, related_name='entries')
    timestamp = models.DateTimeField()
    ip = models.GenericIPAddressField(blank=True, null=True)
    event = models.CharField(max_length=100, blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.LOW)
    is_anomaly = models.BooleanField(default=False)
    score = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.event} - {self.ip}"

class Alert(models.Model):
    log_entry = models.ForeignKey(LogEntry, on_delete=models.CASCADE, related_name='alerts')
    severity = models.CharField(max_length=20, choices=Severity.choices)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.severity} - {self.message[:50]}"