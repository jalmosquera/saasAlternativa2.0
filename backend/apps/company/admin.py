"""Django admin configuration for the company application.

This module configures the Django admin interface for Company models,
providing an administrative interface for managing company information
with multi-language support through django-parler.

Classes:
    CompanyAdmin: Admin interface configuration for Company model.

Notes:
    - Uses TranslatableAdmin to support multi-language translations.
    - Displays essential company contact information in the list view.
    - Typically, there should be only one Company instance representing
      the business using this application.
    - All translatable fields can be edited in different languages.

See Also:
    - apps.company.models.Company for model definition
    - django-parler documentation for translation features
"""

from django.contrib import admin
from parler.admin import TranslatableAdmin

from .models import Company


@admin.register(Company)
class CompanyAdmin(TranslatableAdmin):
    """Admin configuration for Company model with translation support.

    This admin class provides a customized interface for managing Company
    instances in the Django admin panel. It extends TranslatableAdmin to
    enable multi-language support for translatable fields like company name
    and other descriptive content.

    Attributes:
        list_display: Tuple of field names to display in the admin list view,
            showing name, email, and phone for quick reference.

    Examples:
        Access the admin interface::

            # Navigate to /admin/company/company/
            # View company details with name, email, and phone
            # Click to edit company information in multiple languages

        Typical usage scenario::

            # Usually one company instance exists
            # Update contact information: email, phone
            # Update translatable content in different languages

    Notes:
        - Automatically registered with Django admin via @admin.register.
        - TranslatableAdmin provides language tabs for editing translations.
        - List view shows: name, email, phone for easy identification.
        - Commonly used for single-company applications.
        - Fields can be edited in multiple languages as configured in settings.
    """

    list_display = ('name', 'email', 'phone')