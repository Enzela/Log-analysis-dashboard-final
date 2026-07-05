from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count, Q
from .models import LogFile, LogEntry, Alert, Severity
from .serializers import LogFileSerializer, LogEntrySerializer, AlertSerializer
from .services import send_alert_email
from .ml_service import predict_anomaly  # ✅ ML model
import json
import re
import PyPDF2
from io import BytesIO

User = get_user_model()

def parse_raw_line(line):
    """Parse a raw log line into structured fields (timestamp, ip, event, message)."""
    if not line:
        return {'raw': line}
    # Try CSV format: timestamp, ip, event, message
    if ',' in line:
        parts = [p.strip() for p in line.split(',')]
        if len(parts) >= 3:
            return {
                'timestamp': parts[0],
                'ip': parts[1] if len(parts) > 1 else '',
                'event': parts[2] if len(parts) > 2 else '',
                'message': ' '.join(parts[3:]) if len(parts) > 3 else ''
            }
    # Try space-separated: timestamp ip event message
    parts = line.split()
    if len(parts) >= 3:
        # Check if first part looks like timestamp
        if re.match(r'\d{4}-\d{2}-\d{2}', parts[0]) or re.match(r'\d{2}/\d{2}/\d{4}', parts[0]):
            return {
                'timestamp': parts[0],
                'ip': parts[1] if len(parts) > 1 else '',
                'event': parts[2] if len(parts) > 2 else '',
                'message': ' '.join(parts[3:]) if len(parts) > 3 else ''
            }
    # Fallback: raw only
    return {'raw': line}


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
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=400)

        content = file.read()

        # ---------- PDF SUPPORT ----------
        if file.name.lower().endswith('.pdf'):
            try:
                pdf_reader = PyPDF2.PdfReader(BytesIO(content))
                text = ""
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                if not text.strip():
                    return Response({'error': 'No text found in PDF'}, status=400)
                lines = text.splitlines()
                entries = []
                for line in lines:
                    if line.strip():
                        entries.append(parse_raw_line(line.strip()))
            except Exception as e:
                return Response({'error': f'Failed to parse PDF: {str(e)}'}, status=400)

        # ---------- JSON SUPPORT ----------
        elif file.name.lower().endswith('.json'):
            try:
                data = json.loads(content)
                entries = data if isinstance(data, list) else [data]
            except json.JSONDecodeError:
                return Response({'error': 'Invalid JSON'}, status=400)

        # ---------- TXT SUPPORT ----------
        elif file.name.lower().endswith('.txt'):
            lines = content.decode('utf-8').splitlines()
            entries = []
            for line in lines:
                if line.strip():
                    entries.append(parse_raw_line(line.strip()))
        else:
            return Response({'error': 'Only .pdf, .json, or .txt files allowed'}, status=400)

        uploaded_by = request.user if request.user.is_authenticated else None
        log_file = LogFile.objects.create(
            filename=file.name,
            file_path=f"/uploads/{file.name}",
            uploaded_by=uploaded_by,
            status='processing'
        )

        anomalies = []
        for entry in entries:
            # ✅ ML model prediction (with fallback to keyword-based)
            try:
                is_anomaly, ml_score = predict_anomaly(entry)
            except Exception as e:
                # If ML model fails, fallback to keyword-based detection
                print(f"ML error, falling back to keyword: {e}")
                text = str(entry.get('event', '')) + ' ' + str(entry.get('message', '')) + ' ' + str(entry.get('raw', ''))
                text_lower = text.lower()
                is_anomaly = False
                ml_score = 0.0
                if any(w in text_lower for w in ['brute', 'forced']):
                    is_anomaly = True
                    ml_score = -0.6
                elif any(w in text_lower for w in ['unauthorized', 'access denied']):
                    is_anomaly = True
                    ml_score = -0.4
                elif any(w in text_lower for w in ['failed', 'invalid', 'attempt']):
                    is_anomaly = True
                    ml_score = -0.2
                elif any(w in text_lower for w in ['scan', 'probe']):
                    is_anomaly = True
                    ml_score = -0.2

            # Map ML score to severity
            if is_anomaly:
                if ml_score < -0.5:
                    severity = Severity.CRITICAL
                elif ml_score < -0.3:
                    severity = Severity.HIGH
                elif ml_score < -0.1:
                    severity = Severity.MEDIUM
                else:
                    severity = Severity.LOW
            else:
                severity = Severity.LOW

            # Parse timestamp
            try:
                timestamp = entry.get('timestamp')
                if timestamp:
                    from datetime import datetime
                    for fmt in ['%Y-%m-%d %H:%M:%S', '%Y-%m-%d %H:%M', '%d/%m/%Y %H:%M:%S', '%d/%m/%Y %H:%M']:
                        try:
                            timestamp = datetime.strptime(timestamp, fmt)
                            break
                        except:
                            continue
                    else:
                        timestamp = timezone.now()
                else:
                    timestamp = timezone.now()
            except:
                timestamp = timezone.now()

            # Extract IP
            ip = entry.get('ip', '')
            if not ip:
                text = str(entry.get('raw', '')) + ' ' + str(entry.get('message', ''))
                ip_match = re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', text)
                if ip_match:
                    ip = ip_match.group()

            event = entry.get('event', entry.get('raw', 'unknown'))
            message = entry.get('message', '')

            # Create LogEntry
            log_entry = LogEntry.objects.create(
                log_file=log_file,
                timestamp=timestamp,
                ip=ip,
                event=event[:100],
                message=message[:500],
                severity=severity,
                is_anomaly=1 if is_anomaly else 0,
                score=ml_score if is_anomaly else None
            )

            # Create Alert if anomaly
            if is_anomaly:
                anomalies.append(entry)
                Alert.objects.create(
                    log_entry=log_entry,
                    severity=severity,
                    message=f"Anomaly detected: {event[:100]} from {ip}"
                )

                # Send email for CRITICAL
                if severity == Severity.CRITICAL:
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

    def list(self, request):
        queryset = LogFile.objects.annotate(
            entries_count=Count('entries'),
            anomalies_count=Count('entries', filter=Q(entries__is_anomaly=True))
        )
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(filename__icontains=search)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

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
        search = self.request.query_params.get('search')
        if severity:
            qs = qs.filter(severity=severity)
        if search:
            qs = qs.filter(Q(message__icontains=search) | Q(log_entry__ip__icontains=search))
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