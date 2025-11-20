# core/settings/base.py

from pathlib import Path
import os
BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = 'tu-secreto-aqui'  # Idealmente leerlo de variable de entorno

INSTALLED_APPS = [
    # apps Django
    'django.contrib.admin',
    'django.contrib.auth',
    # ...
    # apps propias
    'apps.users',
    'apps.products',
    'apps.categories',
    'apps.ingredients',
    'apps.company',
    # librerías externas
    'rest_framework',
    'drf_spectacular',
    # etc...
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    'django.middleware.security.SecurityMiddleware',
    # ...
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    # ...
]

WSGI_APPLICATION = 'core.wsgi.application'

# Aquí puedes poner configuración por defecto de base de datos, si quieres:
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Rest Framework, Internacionalización, Static/Media, etc

# Por ejemplo:
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# Static files
STATIC_URL = '/static/'
MEDIA_URL = '/media/'

# Y otras configuraciones comunes...
# =============================================================================
# EMAIL CONFIGURATION
# =============================================================================
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_USE_SSL = os.environ.get('EMAIL_USE_SSL', 'False') == 'True'
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)
EMAIL_TIMEOUT = int(os.environ.get('EMAIL_TIMEOUT', 10))

