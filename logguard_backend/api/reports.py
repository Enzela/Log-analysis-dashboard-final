from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
import csv
from datetime import datetime
from .models import Alert, LogFile

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_pdf(request):
    try:
        severity = request.query_params.get('severity')
        alerts = Alert.objects.all().order_by('-created_at')
        if severity and severity != 'ALL':
            alerts = alerts.filter(severity=severity.upper())
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="alerts_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf"'
        
        doc = SimpleDocTemplate(response, pagesize=landscape(letter))
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#f59e0b'),
            alignment=TA_CENTER,
            spaceAfter=20
        )
        elements.append(Paragraph("LogGuard AI — Alert Report", title_style))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Table data
        data = [['#', 'Timestamp', 'Severity', 'Message', 'Status']]
        for idx, alert in enumerate(alerts[:500], 1):
            status = 'Resolved' if alert.is_resolved else 'Open'
            data.append([
                str(idx),
                alert.created_at.strftime('%Y-%m-%d %H:%M') if alert.created_at else 'N/A',
                alert.severity,
                alert.message[:60] + '...' if len(alert.message) > 60 else alert.message,
                status
            ])
        
        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f59e0b')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(table)
        
        # Footer
        elements.append(Spacer(1, 20))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_CENTER
        )
        elements.append(Paragraph(f"Total Alerts: {len(alerts)} | LogGuard AI © 2026", footer_style))
        
        doc.build(elements)
        return response
    except Exception as e:
        return HttpResponse(f"Error generating PDF: {str(e)}", status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_csv(request):
    try:
        severity = request.query_params.get('severity')
        alerts = Alert.objects.all().order_by('-created_at')
        if severity and severity != 'ALL':
            alerts = alerts.filter(severity=severity.upper())
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="alerts_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Timestamp', 'Severity', 'Message', 'Status'])
        
        for alert in alerts[:500]:
            status = 'Resolved' if alert.is_resolved else 'Open'
            writer.writerow([
                alert.id,
                alert.created_at.strftime('%Y-%m-%d %H:%M:%S') if alert.created_at else '',
                alert.severity,
                alert.message,
                status
            ])
        
        return response
    except Exception as e:
        return HttpResponse(f"Error generating CSV: {str(e)}", status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_logs_pdf(request):
    try:
        logs = LogFile.objects.all().order_by('-uploaded_at')
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="logs_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf"'
        
        doc = SimpleDocTemplate(response, pagesize=landscape(letter))
        elements = []
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#f59e0b'),
            alignment=TA_CENTER,
            spaceAfter=20
        )
        elements.append(Paragraph("LogGuard AI — Log History Report", title_style))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        data = [['#', 'Filename', 'Uploaded At', 'Status', 'Entries', 'Anomalies']]
        for idx, log in enumerate(logs[:500], 1):
            entries_count = log.entries.count()
            anomalies_count = log.entries.filter(is_anomaly=True).count()
            data.append([
                str(idx),
                log.filename,
                log.uploaded_at.strftime('%Y-%m-%d %H:%M') if log.uploaded_at else 'N/A',
                log.status or 'pending',
                str(entries_count),
                str(anomalies_count)
            ])
        
        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f59e0b')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(table)
        
        elements.append(Spacer(1, 20))
        footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=TA_CENTER)
        elements.append(Paragraph(f"Total Logs: {len(logs)} | LogGuard AI © 2026", footer_style))
        
        doc.build(elements)
        return response
    except Exception as e:
        return HttpResponse(f"Error generating PDF: {str(e)}", status=500)