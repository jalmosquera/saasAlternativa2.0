# core/development.py
# Development settings for local environment

from .settings import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Configuración para base de datos local, si quieres distinta
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Otros settings específicos para desarrollo, ej:
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'


from datetime import timedelta

# Agregar después de REST_FRAMEWORK o al final del archivo
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
}