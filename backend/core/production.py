# core/production.py
"""
Production settings for Railway deployment.
To use: Set environment variable DJANGO_SETTINGS_MODULE=core.production
"""

from .settings import *
import dj_database_url
import os
import sys


# Override DEBUG for production
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Get SECRET_KEY from environment with validation
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY or SECRET_KEY == 'django-insecure-CHANGE-THIS-IN-PRODUCTION':
    raise ValueError(
        "SECRET_KEY environment variable must be set in production. "
        "Generate a secure key with: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'"
    )

# TEMPORARY DEBUG: Force wildcard to diagnose 502 errors
# Ignore environment variable temporarily
ALLOWED_HOSTS = ['*']

# Log ALLOWED_HOSTS for debugging
print(f"[PRODUCTION CONFIG] FORCED ALLOWED_HOSTS: {ALLOWED_HOSTS}", file=sys.stderr)
print(f"[PRODUCTION CONFIG] Environment ALLOWED_HOSTS was: {os.environ.get('ALLOWED_HOSTS', 'NOT SET')}", file=sys.stderr)

# Database configuration with Railway PostgreSQL
database_url = os.environ.get('DATABASE_URL')
if database_url:
    DATABASES = {
        'default': dj_database_url.config(
            default=database_url,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }

# Static files configuration for production
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Remove STATICFILES_DIRS in production (it conflicts with STATIC_ROOT)
STATICFILES_DIRS = []

# Override STORAGES to use WhiteNoise with compression and manifest
STORAGES = {
    'default': {
        'BACKEND': 'cloudinary_storage.storage.MediaCloudinaryStorage' if CLOUDINARY_CLOUD_NAME else 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage',
    },
}

# Media files
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Security settings
# Trust Railway's proxy SSL header
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
# Disable SSL redirect as Railway's proxy handles SSL
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# Language code from environment
LANGUAGE_CODE = os.environ.get('LANGUAGE_CODE', 'es')

# CORS configuration from environment
cors_origins = os.environ.get('CORS_ALLOWED_ORIGINS', '')
if cors_origins:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins.split(',') if origin.strip()]
else:
    # Fallback to default allowed origins if not set in environment
    CORS_ALLOWED_ORIGINS = [
        "https://equuspub.vercel.app",
        "http://localhost:5173",
    ]

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

# CSRF Trusted Origins
csrf_origins = os.environ.get('CSRF_TRUSTED_ORIGINS', '')
if csrf_origins:
    CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in csrf_origins.split(',') if origin.strip()]
else:
    # Fallback to default trusted origins if not set in environment
    CSRF_TRUSTED_ORIGINS = [
        "https://equuspub.vercel.app",
        "https://*.railway.app",
    ]

# =============================================================================
# WSGI vs ASGI Configuration
# =============================================================================
# In production with Gunicorn (WSGI), we need to remove Daphne and Channels
# which are ASGI-only and can conflict with WSGI operation

# Remove Daphne from INSTALLED_APPS (it conflicts with Gunicorn WSGI)
INSTALLED_APPS = [app for app in INSTALLED_APPS if app not in ['daphne', 'channels']]

# Disable ASGI application (we're using WSGI with Gunicorn)
ASGI_APPLICATION = None

# Remove Channel Layers configuration (not needed for WSGI)
CHANNEL_LAYERS = None

# =============================================================================
# DEBUG MIDDLEWARE - Add request logging to diagnose 502 errors
# =============================================================================
# Insert at the beginning of MIDDLEWARE for maximum visibility
MIDDLEWARE.insert(0, 'core.debug_middleware.RequestLoggingMiddleware')
print(f"[PRODUCTION CONFIG] Middleware: {MIDDLEWARE}", file=sys.stderr)

