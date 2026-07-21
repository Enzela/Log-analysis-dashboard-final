class ForceCorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        print("✅ ForceCorsMiddleware loaded!")  # Deploy logs मा देखिन्छ

    def __call__(self, request):
        # Preflight OPTIONS request handle
        if request.method == 'OPTIONS':
            response = self.get_response(request)
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Accept, Authorization, Content-Type, X-CSRFToken'
            return response

        response = self.get_response(request)
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Accept, Authorization, Content-Type, X-CSRFToken'
        return response