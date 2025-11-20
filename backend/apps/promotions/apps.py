"""Promotions app configuration."""

from django.apps import AppConfig


class PromotionsConfig(AppConfig):
    """Configuration for the Promotions app."""

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.promotions'
    verbose_name = 'Promotions'
