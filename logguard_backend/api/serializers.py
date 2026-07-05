from rest_framework import serializers
from .models import User, LogFile, LogEntry, Alert

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'created_at']

class LogFileSerializer(serializers.ModelSerializer):
    entries_count = serializers.IntegerField(read_only=True)
    anomalies_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = LogFile
        fields = ['id', 'filename', 'file_path', 'uploaded_by', 'uploaded_at', 'status', 'entries_count', 'anomalies_count']

class LogEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LogEntry
        fields = '__all__'

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = '__all__'