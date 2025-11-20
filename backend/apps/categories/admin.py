"""Django admin configuration for the categories application.

This module configures the Django admin interface for Category models,
providing a user-friendly interface for managing category data with
multi-language support through django-parler.

Classes:
    CategoryAdmin: Admin interface configuration for Category model.

Notes:
    - Uses TranslatableAdmin to support multi-language translations.
    - Displays key fields in the admin list view for easy management.
    - All translatable fields (name, description) can be edited in
      different languages through the admin interface.

See Also:
    - apps.categories.models.Category for model definition
    - django-parler documentation for translation features
"""

from django.contrib import admin
from parler.admin import TranslatableAdmin

from .models import Category


@admin.register(Category)
class CategoryAdmin(TranslatableAdmin):
    """Admin configuration for Category model with translation support.

    This admin class provides a customized interface for managing Category
    instances in the Django admin panel. It extends TranslatableAdmin to
    enable multi-language support for translatable fields.

    Attributes:
        list_display: Tuple of field names to display in the admin list view.

    Examples:
        Access the admin interface::

            # Navigate to /admin/categories/category/
            # View list of categories with name, description, and timestamps
            # Click on a category to edit its translatable content

    Notes:
        - Automatically registered with Django admin via @admin.register.
        - TranslatableAdmin provides language tabs for editing translations.
        - List view shows: name, description, created_at, updated_at.
        - Fields can be edited in multiple languages as configured in settings.
    """

    list_display = ('name', 'description', 'created_at', 'updated_at')
    