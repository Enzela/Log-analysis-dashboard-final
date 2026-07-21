from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes   # ✅ Import both
from rest_framework.permissions import AllowAny                     # ✅ Import this
from rest_framework.response import Response                        # ✅ For the view itself
from .views import LogFileViewSet, AlertViewSet, RegisterViewSet
from .reports import export_pdf, export_csv, export_logs_pdf
from .services import send_scan_report_email                        # If you need it in the view

# If you have the send_report_email view defined here, move it to views.py.
# Better to define it in views.py and import it.
# But for quick fix, define the view here with proper imports.

# Example definition if not already in views.py:
@api_view(['POST'])
@permission_classes([AllowAny])
def send_report_email(request):
    try:
        email = request.data.get('email')
        anomalies = request.data.get('anomalies', [])
        total_entries = request.data.get('total_entries', 0)
        if not email:
            return Response({'error': 'Email is required'}, status=400)
        success, result = send_scan_report_email(email, anomalies, total_entries)
        if success:
            return Response({'message': 'Email sent successfully', 'id': result})
        else:
            return Response({'error': f'Email sending failed: {result}'}, status=500)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

router = DefaultRouter()
router.register(r'logs', LogFileViewSet, basename='logs')
router.register(r'alerts', AlertViewSet, basename='alerts')
router.register(r'register', RegisterViewSet, basename='register')

urlpatterns = [
    path('', include(router.urls)),
    path('reports/pdf/', export_pdf, name='export_pdf'),
    path('reports/csv/', export_csv, name='export_csv'),
    path('reports/logs-pdf/', export_logs_pdf, name='export_logs_pdf'),
    path('logs/send_report/', send_report_email, name='send_report'),
]