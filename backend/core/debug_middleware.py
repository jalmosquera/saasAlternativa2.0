import sys

class RequestLoggingMiddleware:
    """
    Middleware to log all incoming requests for debugging 502 errors
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log request details
        print(f"[REQUEST] {request.method} {request.path}", file=sys.stderr)
        print(f"[REQUEST] Host: {request.get_host()}", file=sys.stderr)
        print(f"[REQUEST] Headers: {dict(request.headers)}", file=sys.stderr)

        try:
            response = self.get_response(request)
            print(f"[RESPONSE] Status: {response.status_code}", file=sys.stderr)
            return response
        except Exception as e:
            print(f"[ERROR] Exception in request processing: {e}", file=sys.stderr)
            raise
