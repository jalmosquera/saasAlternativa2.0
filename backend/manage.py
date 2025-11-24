#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from dotenv import load_dotenv

# Force Autobahn to use pure Python UTF-8 validator (fixes macOS ARM issues)
# This MUST be set before Django/Channels/Autobahn imports
os.environ["AUTOBAHN_USE_NVX"] = "0"

def main():
    """Run administrative tasks."""
    # Cargar variables de entorno desde archivo .env
    load_dotenv()

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
