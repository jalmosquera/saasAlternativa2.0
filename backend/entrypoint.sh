#!/bin/bash
set -e

echo "=== RUNTIME ENTRYPOINT (ASGI with WebSockets) ==="

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
max_retries=30
retries=0
while [ $retries -lt $max_retries ]; do
    if python manage.py check --database default >/dev/null 2>&1; then
        echo "✓ PostgreSQL ready"
        break
    fi
    retries=$((retries + 1))
    echo "Waiting... ($retries/$max_retries)"
    sleep 2
done

if [ $retries -eq $max_retries ]; then
    echo "ERROR: PostgreSQL unavailable"
    exit 1
fi

# Wait for Redis
echo "Waiting for Redis..."
retries=0
while [ $retries -lt $max_retries ]; do
    if python -c "import redis; r = redis.from_url('$REDIS_URL'); r.ping()" >/dev/null 2>&1; then
        echo "✓ Redis ready"
        break
    fi
    retries=$((retries + 1))
    echo "Waiting for Redis... ($retries/$max_retries)"
    sleep 2
done

if [ $retries -eq $max_retries ]; then
    echo "ERROR: Redis unavailable (required for WebSockets)"
    exit 1
fi

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "TEMPORARY TEST: Starting Gunicorn (WSGI) instead of Daphne to diagnose networking issue"
PORT=${PORT:-8000}
echo "PORT configured as: $PORT"

# Test if core.wsgi:application can be imported
echo "Testing if core.wsgi:application exists..."
python -c "from core.wsgi import application; print(f'✓ WSGI Application object: {application}')" || {
    echo "✗ FAILED to import core.wsgi:application"
    exit 1
}

echo "Starting Gunicorn on 0.0.0.0:$PORT..."
exec gunicorn core.wsgi:application \
  --bind 0.0.0.0:$PORT \
  --workers 2 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile - \
  --log-level info
