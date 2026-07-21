from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LogFileViewSet, AlertViewSet, RegisterViewSet, send_report_email
from .reports import export_pdf, export_csv, export_logs_pdf

router = DefaultRouter()
router.register(r'logs', LogFileViewSet, basename='logs')
router.register(r'alerts', AlertViewSet, basename='alerts')
router.register(r'register', RegisterViewSet, basename='register')

urlpatterns = [
    path('', include(router.urls)),
    path('reports/pdf/', export_pdf, name='export_pdf'),
    path('reports/csv/', export_csv, name='export_csv'),
    path('reports/logs-pdf/', export_logs_pdf, name='export_logs_pdf'),
    # नयाँ endpoint
    path('logs/send_report/', send_report_email, name='send_report'),
]