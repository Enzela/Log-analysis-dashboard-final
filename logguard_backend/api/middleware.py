from django.utils.deprecation import MiddlewareMixin

class ForceCorsMiddleware(MiddlewareMixin):
    """
    कुनै पनि response मा CORS headers force गर्ने middleware
    (OPTIONS, 403, 500 सबैमा headers थप्छ)
    """
    def process_response(self, request, response):
        response['Access-Control-Allow-Origin'] = 'https://logguard-frontend.onrender.com'
        response['Access-Control-Allow-Headers'] = '*'
        response['Access-Control-Allow-Methods'] = '*'
        response['Access-Control-Allow-Credentials'] = 'true'
        return response