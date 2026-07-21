from .services import send_scan_report_email  # new import

@api_view(['POST'])
@permission_classes([AllowAny])
def send_report_email(request):
    """
    Frontend बाट scan result को report email मा पठाउने endpoint
    """
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