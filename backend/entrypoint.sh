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

echo "Starting Daphne (ASGI server with WebSocket support)..."
PORT=${PORT:-8000}
echo "PORT configured as: $PORT"
echo "About to execute: daphne -b 0.0.0.0 -p $PORT --verbosity 2 --access-log - --proxy-headers core.asgi:application"

# Test if core.asgi:application can be imported
echo "Testing if core.asgi:application exists..."
python -c "from core.asgi import application; print(f'✓ Application object: {application}')" || {
    echo "✗ FAILED to import core.asgi:application"
    exit 1
}

exec daphne \
  -b 0.0.0.0 \
  -p $PORT \
  --verbosity 2 \
  --access-log - \
  --proxy-headers \
  core.asgi:application
