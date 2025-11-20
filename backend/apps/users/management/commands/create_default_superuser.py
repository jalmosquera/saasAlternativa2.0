from django.core.management.base import BaseCommand
from apps.users.models import User
import os


class Command(BaseCommand):
    help = 'Create a default superuser if it does not exist'

    def handle(self, *args, **options):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@digitalletter.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123')
        name = os.environ.get('DJANGO_SUPERUSER_NAME', 'Administrator')

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                name=name
            )
            self.stdout.write(self.style.SUCCESS(f'✅ Superuser "{username}" created successfully'))
        else:
            self.stdout.write(self.style.WARNING(f'⚠️  Superuser "{username}" already exists'))
