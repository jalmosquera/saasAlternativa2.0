"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
import sys

# Force Autobahn to use pure Python UTF-8 validator (fixes macOS ARM issues)
os.environ["AUTOBAHN_USE_NVX"] = "0"

from django.core.asgi import get_asgi_application

# Force production settings in Railway
if os.environ.get('RAILWAY_ENVIRONMENT'):
    os.environ['DJANGO_SETTINGS_MODULE'] = 'core.production'
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

print(f"[ASGI] Starting ASGI application setup...", file=sys.stderr, flush=True)
print(f"[ASGI] Settings module: {os.environ.get('DJANGO_SETTINGS_MODULE')}", file=sys.stderr, flush=True)

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()
print(f"[ASGI] ✓ Django ASGI app initialized", file=sys.stderr, flush=True)

# Try to import WebSocket routing, fallback to HTTP-only if it fails
try:
    from channels.routing import ProtocolTypeRouter, URLRouter
    from channels.security.websocket import AllowedHostsOriginValidator
    from apps.orders.routing import websocket_urlpatterns

    application = ProtocolTypeRouter({
        "http": django_asgi_app,
        "websocket": AllowedHostsOriginValidator(
            URLRouter(websocket_urlpatterns)
        ),
    })
    print(f"[ASGI] ✓ WebSocket routing configured", file=sys.stderr, flush=True)
except Exception as e:
    print(f"[ASGI] ⚠ WebSocket setup failed: {e}", file=sys.stderr, flush=True)
    print(f"[ASGI] Falling back to HTTP-only mode", file=sys.stderr, flush=True)
    # Fallback to HTTP-only
    application = django_asgi_app

print(f"[ASGI] ✓ ASGI application ready!", file=sys.stderr, flush=True)
