# core/development.py
"""
Development settings for local environment.
To use: Set environment variable DJANGO_SETTINGS_MODULE=core.development
"""

from .settings import *
from datetime import timedelta

# Enable debug mode for development
DEBUG = True

# Allow access from localhost
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '*']

# Use SQLite for local development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Send emails to console instead of SMTP server
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# JWT Configuration for development
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Disable SSL redirect for local development
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
