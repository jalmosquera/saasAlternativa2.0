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
exec gunicorn core.wsgi \
  --bind 0.0.0.0:$PORT \
  --workers 2 \
  --threads 4 \
  --worker-class sync \
  --timeout 120 \
  --access-logfile - \
  --error-logfile - \
  --log-level info \
  --env DJANGO_SETTINGS_MODULE=core.production
