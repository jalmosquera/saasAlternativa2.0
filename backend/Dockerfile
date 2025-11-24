FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=core.production

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . /app/

# Run migrations, collectstatic, and start Daphne (ASGI server)
# Daphne is required for Django Channels WebSocket support
# Using --verbosity 2 for detailed logging in production
CMD ["sh", "-c", "echo 'Starting deployment...' && python manage.py migrate && echo 'Migrations complete. Running collectstatic...' && python manage.py collectstatic --noinput && echo 'Collectstatic complete. Starting Daphne (ASGI)...' && daphne -b 0.0.0.0 -p 8000 --verbosity 2 --access-log - core.asgi:application"]
