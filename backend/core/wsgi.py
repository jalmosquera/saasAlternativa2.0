import os
import sys
import traceback

print("[WSGI] Starting WSGI application load...", file=sys.stderr, flush=True)

# Only load dotenv in development (when RAILWAY_ENVIRONMENT is not set)
if not os.environ.get('RAILWAY_ENVIRONMENT'):
    from dotenv import load_dotenv
    # Cargar el .env desde la raíz del proyecto o donde esté ubicado
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# Force production settings for Railway
if os.environ.get('RAILWAY_ENVIRONMENT'):
    os.environ['DJANGO_SETTINGS_MODULE'] = 'core.production'
    print("[WSGI] Using core.production settings", file=sys.stderr, flush=True)
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    print(f"[WSGI] Using {os.environ.get('DJANGO_SETTINGS_MODULE')} settings", file=sys.stderr, flush=True)

try:
    from django.core.wsgi import get_wsgi_application
    print("[WSGI] Django WSGI module imported successfully", file=sys.stderr, flush=True)

    application = get_wsgi_application()
    print("[WSGI] ✓ Application loaded successfully!", file=sys.stderr, flush=True)

except Exception as e:
    print(f"[WSGI] ✗ FATAL ERROR loading Django application:", file=sys.stderr, flush=True)
    print(f"[WSGI] Error: {e}", file=sys.stderr, flush=True)
    print(f"[WSGI] Traceback:", file=sys.stderr, flush=True)
    traceback.print_exc(file=sys.stderr)

    # Create a dummy application that returns 503
    def application(environ, start_response):
        status = '503 Service Unavailable'
        response_headers = [('Content-type', 'text/plain')]
        start_response(status, response_headers)
        return [f'Django failed to load: {e}'.encode()]
