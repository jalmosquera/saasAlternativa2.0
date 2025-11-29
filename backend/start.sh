#!/bin/bash
# Start script for Railway deployment
# This script runs migrations and collects static files before starting the server

set -e  # Exit on error

echo "Waiting for PostgreSQL to be ready..."
# Wait for PostgreSQL to be available
max_retries=30
retry_interval=2
retries=0

while [ $retries -lt $max_retries ]; do
    if python manage.py check --database default >/dev/null 2>&1; then
        echo "PostgreSQL is ready!"
        break
    fi
    retries=$((retries + 1))
    echo "Waiting for PostgreSQL... (attempt $retries/$max_retries)"
    sleep $retry_interval
done

if [ $retries -eq $max_retries ]; then
    echo "ERROR: PostgreSQL is not available after $max_retries attempts"
    echo "Please check that:"
    echo "  1. PostgreSQL service is running in Railway"
    echo "  2. DATABASE_URL environment variable is set correctly"
    echo "  3. The services are in the same Railway project"
    exit 1
fi

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Starting Gunicorn..."
# Use PORT environment variable from Railway (defaults to 8000 if not set)
PORT=${PORT:-8000}
echo "Binding Gunicorn to 0.0.0.0:$PORT"
echo "DJANGO_SETTINGS_MODULE=core.production"
echo "ALLOWED_HOSTS from env: $ALLOWED_HOSTS"
echo "DEBUG from env: $DEBUG"

# Add current directory to PYTHONPATH
export PYTHONPATH=/app:$PYTHONPATH
echo "PYTHONPATH: $PYTHONPATH"
echo "Current directory: $(pwd)"
echo "Python path check:"
python -c "import sys; print('\\n'.join(sys.path))"

# Test if core.wsgi can be imported before starting Gunicorn
echo "Testing if core.wsgi can be imported..."
python -c "import core.wsgi; print('✓ core.wsgi imported successfully')" || {
    echo "✗ FAILED to import core.wsgi"
    echo "Trying to import core..."
    python -c "import core; print('Core module found at:', core.__file__)" || echo "✗ Core module not found"
    exit 1
}

# Start Gunicorn with single worker to avoid fork deadlock
echo "Starting Gunicorn with single worker and preload..."
exec gunicorn core.wsgi:application \
  --bind 0.0.0.0:$PORT \
  --workers 1 \
  --worker-class sync \
  --timeout 120 \
  --preload-app \
  --access-logfile - \
  --error-logfile - \
  --log-level info \
  --pythonpath /app \
  --env DJANGO_SETTINGS_MODULE=core.production
