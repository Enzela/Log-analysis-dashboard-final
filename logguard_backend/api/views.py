from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import LogFile, LogEntry, Alert, Severity
from .serializers import LogFileSerializer, LogEntrySerializer, AlertSerializer
from .services import send_alert_email
import json
import re

User = get_user_model()


class LogFileViewSet(viewsets.ModelViewSet):
    queryset = LogFile.objects.all()
    serializer_class = LogFileSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[AllowAny],
        authentication_classes=[]
    )
    def upload(self, request):
        """Public upload endpoint with email alert on CRITICAL"""
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=400)

        content = file.read()
        if file.name.endswith('.json'):
            try:
                data = json.loads(content)
                entries = data if isinstance(data, list) else [data]
            except json.JSONDecodeError:
                return Response({'error': 'Invalid JSON'}, status=400)
        else:
            lines = content.decode('utf-8').splitlines()
            entries = [{'raw': line} for line in lines if line.strip()]

        uploaded_by = request.user if request.user.is_authenticated else None
        log_file = LogFile.objects.create(
            filename=file.name,
            file_path=f"/uploads/{file.name}",
            uploaded_by=uploaded_by,
            status='processing'
        )

        anomalies = []
        for entry in entries:
            text = str(entry.get('event', '')) + ' ' + str(entry.get('message', '')) + ' ' + str(entry.get('raw', ''))
            text_lower = text.lower()
            is_anomaly = False
            severity = Severity.LOW

            if any(w in text_lower for w in ['brute', 'forced']):
                is_anomaly = True
                severity = Severity.CRITICAL
            elif any(w in text_lower for w in ['unauthorized', 'access denied']):
                is_anomaly = True
                severity = Severity.HIGH
            elif any(w in text_lower for w in ['failed', 'invalid', 'attempt']):
                is_anomaly = True
                severity = Severity.MEDIUM
            elif any(w in text_lower for w in ['scan', 'probe']):
                is_anomaly = True
                severity = Severity.MEDIUM

            try:
                timestamp = entry.get('timestamp')
                if timestamp:
                    from datetime import datetime
                    timestamp = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
                else:
                    timestamp = timezone.now()
            except:
                timestamp = timezone.now()

            log_entry = LogEntry.objects.create(
                log_file=log_file,
                timestamp=timestamp,
                ip=entry.get('ip', ''),
                event=entry.get('event', entry.get('raw', 'unknown')),
                message=entry.get('message', ''),
                severity=severity,
                is_anomaly=is_anomaly
            )

            if is_anomaly:
                anomalies.append(entry)
                Alert.objects.create(
                    log_entry=log_entry,
                    severity=severity,
                    message=f"Anomaly detected: {entry.get('event', '')} from {entry.get('ip', 'unknown')}"
                )

                # ✅ Send email for CRITICAL severity — with IP/Event extraction
                if severity == Severity.CRITICAL:
                    # Extract IP safely
                    ip = entry.get('ip', 'unknown')
                    if not ip or ip == '':
                        # Try to find IP in raw or message
                        import re
                        raw_text = str(entry.get('raw', '')) + ' ' + str(entry.get('message', ''))
                        ip_match = re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', raw_text)
                        if ip_match:
                            ip = ip_match.group()
                    
                    # Extract event safely
                    event = entry.get('event', '')
                    if not event or event == '':
                        event = entry.get('raw', entry.get('message', 'unknown'))[:50]

                    send_alert_email(
                        severity=severity,
                        message=f"Critical anomaly detected: {event} from {ip}",
                        ip=ip,
                        event=event
                    )

        log_file.status = 'processed'
        log_file.save()

        return Response({
            'success': True,
            'detected': len(entries),
            'anomalies': len(anomalies),
            'entries': entries[:10],
            'anomaly_list': anomalies[:5]
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response({
            'total_logs': LogFile.objects.count(),
            'total_entries': LogEntry.objects.count(),
            'total_alerts': Alert.objects.count(),
            'critical_alerts': Alert.objects.filter(severity=Severity.CRITICAL).count()
        })

    @action(detail=False, methods=['get'])
    def entries(self, request):
        severity = request.query_params.get('severity')
        qs = LogEntry.objects.all().order_by('-timestamp')
        if severity and severity in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']:
            qs = qs.filter(severity=severity)
        serializer = LogEntrySerializer(qs[:100], many=True)
        return Response({'entries': serializer.data})


class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        severity = self.request.query_params.get('severity')
        if severity:
            qs = qs.filter(severity=severity)
        return qs.order_by('-created_at')


class RegisterViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        name = request.data.get('name', username)

        if not username or not email or not password:
            return Response({'error': 'Username, email and password required'}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken'}, status=400)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered'}, status=400)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name,
            role='analyst'
        )
        return Response({
            'success': True,
            'message': 'User registered successfully',
            'user_id': user.id
        })