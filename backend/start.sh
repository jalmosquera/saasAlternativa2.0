#!/bin/bash
# Start script for Railway deployment
# This script runs migrations and collects static files before starting the server

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Starting Gunicorn..."
exec gunicorn core.wsgi --log-file - --env DJANGO_SETTINGS_MODULE=core.production
