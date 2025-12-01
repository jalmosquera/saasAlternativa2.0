import os
from django.core.wsgi import get_wsgi_application

# Only load dotenv in development
if not os.environ.get('RAILWAY_ENVIRONMENT'):
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# Force production settings for Railway
if os.environ.get('RAILWAY_ENVIRONMENT'):
    os.environ['DJANGO_SETTINGS_MODULE'] = 'core.production'
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()
