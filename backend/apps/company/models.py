"""Company model module for business information management.

This module defines the Company model with multi-language support for managing
restaurant or business information displayed in the digital menu system.
"""

from django.db import models
from parler.models import TranslatableModel, TranslatedFields


class Company(TranslatableModel):
    """Company model for storing restaurant/business information with multi-language support.

    Represents the company or restaurant information including contact details,
    branding, and location. Supports translatable name and address fields for
    multi-language display in the digital menu system.

    Attributes:
        translations (TranslatedFields): Translatable fields (name, address).
        image (ImageField): Optional company logo uploaded to 'logos/' directory.
        email (str): Company contact email address (max 100 chars).
        phone (int): Company contact phone number.

    Translatable Fields:
        name (str): Company name in multiple languages (max 100 chars).
        address (str): Company address in multiple languages (max 200 chars).

    Example:
        >>> # Create company with English and Spanish translations
        >>> company = Company.objects.create(
        ...     email='info@restaurant.com',
        ...     phone=1234567890
        ... )
        >>> company.set_current_language('en')
        >>> company.name = "Delicious Restaurant"
        >>> company.address = "123 Main Street, City"
        >>> company.set_current_language('es')
        >>> company.name = "Restaurante Delicioso"
        >>> company.address = "Calle Principal 123, Ciudad"
        >>> company.save()
        >>>
        >>> # Upload company logo
        >>> from django.core.files import File
        >>> with open('logo.png', 'rb') as f:
        ...     company.image.save('logo.png', File(f))
        >>> company.save()

    Note:
        - Uses django-parler for multi-language support
        - Phone is stored as integer (consider CharField for international formats)
        - Only one company instance should typically exist in the system
        - Logo images are stored in 'logos/' media directory
    """

    translations = TranslatedFields(
        name=models.CharField('Company', max_length=100),
        address=models.CharField('Address', max_length=200)
    )
    image = models.ImageField('Image', upload_to='logos/', null=True, blank=True)
    email = models.EmailField('Email', max_length=100)
    phone = models.IntegerField('Phone')
    whatsapp_phone = models.CharField('WhatsApp Phone', max_length=20, default='+34623736566')
    business_hours = models.TextField('Business Hours', blank=True, default='Lun-Dom: 08:00 - 23:00')
    delivery_locations = models.JSONField('Delivery Locations', default=list, blank=True, help_text='List of delivery locations with id, name, value, and enabled fields')
    delivery_enabled_days = models.JSONField(
        'Delivery Enabled Days',
        default=dict,
        blank=True,
        help_text='Days when delivery/orders are enabled. Format: {"Lun": true, "Mar": true, ...}'
    )

    class Meta:
        """Meta options for Company model."""

        verbose_name = 'Company'
        verbose_name_plural = 'Company'

    def __str__(self) -> str:
        """Return string representation of the company.

        Returns the company name in the current active language, or falls back
        to any available language translation. If no translation exists, returns
        a generic identifier with the primary key.

        Returns:
            str: Company name or "Company {pk}" if no translation available.

        Example:
            >>> company.set_current_language('en')
            >>> str(company)
            'Delicious Restaurant'
            >>> company.set_current_language('es')
            >>> str(company)
            'Restaurante Delicioso'
        """
        return self.safe_translation_getter('name', any_language=True) or f"Company {self.pk}"