"""Company serializers for REST API operations.

This module provides serializers for the Company model, supporting multi-language
translations and CRUD operations for business information through Django REST Framework.
"""

from typing import Any, Dict
from rest_framework import serializers
from apps.company.models import Company
from parler_rest.serializers import TranslatableModelSerializer, TranslatedFieldsField


class CompanySerializer(TranslatableModelSerializer):
    """Serializer for Company instances with multi-language support.

    Handles all CRUD operations for company/restaurant information, managing
    both regular fields (email, phone, image) and translatable fields (name,
    address). Enforces required field validation and provides custom create
    and update methods for proper translation handling.

    Attributes:
        translations (TranslatedFieldsField): Exposes translatable fields
            (name, address) for the Company model in all available languages.

    Meta:
        model: Company model this serializer is based on.
        fields: All model fields are included in serialization.
        read_only_fields: ID and timestamp fields that cannot be modified via API.
        extra_kwargs: Additional validation and constraints for fields:
            - name: Required, max 100 characters (translatable)
            - address: Required, max 200 characters (translatable)
            - email: Required, max 100 characters
            - phone: Required

    Example:
        >>> # Create company with translations
        >>> data = {
        ...     'translations': {
        ...         'en': {
        ...             'name': 'Delicious Restaurant',
        ...             'address': '123 Main Street, New York, NY'
        ...         },
        ...         'es': {
        ...             'name': 'Restaurante Delicioso',
        ...             'address': 'Calle Principal 123, Nueva York, NY'
        ...         },
        ...         'fr': {
        ...             'name': 'Restaurant Délicieux',
        ...             'address': '123 Rue Principale, New York, NY'
        ...         }
        ...     },
        ...     'email': 'info@restaurant.com',
        ...     'phone': 1234567890,
        ...     'image': image_file
        ... }
        >>> serializer = CompanySerializer(data=data)
        >>> if serializer.is_valid():
        ...     company = serializer.save()
        >>>
        >>> # Retrieve company with all translations
        >>> serializer = CompanySerializer(company_instance)
        >>> serializer.data
        {
            'id': 1,
            'translations': {
                'en': {
                    'name': 'Delicious Restaurant',
                    'address': '123 Main Street, New York, NY'
                },
                'es': {
                    'name': 'Restaurante Delicioso',
                    'address': 'Calle Principal 123, Nueva York, NY'
                }
            },
            'email': 'info@restaurant.com',
            'phone': 1234567890,
            'image': '/media/logos/logo.jpg'
        }
        >>>
        >>> # Update company information
        >>> data = {
        ...     'translations': {
        ...         'en': {'address': '456 Oak Avenue, New York, NY'}
        ...     },
        ...     'phone': 9876543210
        ... }
        >>> serializer = CompanySerializer(
        ...     instance=company,
        ...     data=data,
        ...     partial=True
        ... )
        >>> if serializer.is_valid():
        ...     company = serializer.save()

    Note:
        - Uses django-parler-rest for translation serialization
        - Supports both full updates (PUT) and partial updates (PATCH)
        - Name and address are translatable and required
        - Email and phone are required but not translatable
        - Phone is stored as integer (may not support international formats with +)
        - Typically only one Company instance should exist in the system
        - Timestamps (created_at, updated_at) are auto-managed
    """

    translations = TranslatedFieldsField(shared_model=Company)

    class Meta:
        """Meta options for CompanySerializer."""

        model = Company
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
        extra_kwargs = {
            'name': {'required': True, 'max_length': 100},
            'address': {'required': True, 'max_length': 200},
            'email': {'required': True, 'max_length': 100},
            'phone': {'required': True}
        }

    def create(self, validated_data: Dict[str, Any]) -> Company:
        """Create a new Company instance with translations.

        Extracts translation data from validated_data, creates the base
        company instance with regular fields (email, phone, image), then
        iterates through each language to set the translatable fields
        (name, address).

        Args:
            validated_data: Dictionary containing validated field data including:
                - 'translations': Dict with language codes and translatable fields
                - 'email': Company contact email
                - 'phone': Company contact phone number
                - 'image': Optional company logo file

        Returns:
            Company: The newly created company instance with all translations saved.

        Example:
            >>> validated_data = {
            ...     'translations': {
            ...         'en': {
            ...             'name': 'Pizza Palace',
            ...             'address': '789 Pizza Ave, Chicago, IL'
            ...         },
            ...         'es': {
            ...             'name': 'Palacio de Pizza',
            ...             'address': 'Avenida Pizza 789, Chicago, IL'
            ...         }
            ...     },
            ...     'email': 'contact@pizzapalace.com',
            ...     'phone': 5551234567
            ... }
            >>> company = serializer.create(validated_data)
            >>> company.set_current_language('en')
            >>> company.name
            'Pizza Palace'
            >>> company.email
            'contact@pizzapalace.com'
        """
        translations = validated_data.pop('translations', {})
        instance = Company.objects.create(**validated_data)
        for lang_code, fields in translations.items():
            instance.set_current_language(lang_code)
            for attr, value in fields.items():
                setattr(instance, attr, value)
            instance.save()
        return instance

    def update(self, instance: Company, validated_data: Dict[str, Any]) -> Company:
        """Update an existing Company instance with new data and translations.

        Updates both regular fields (email, phone, image) and translatable
        fields (name, address). Extracts translation data, updates the instance
        attributes, then iterates through each language to update translatable fields.

        Args:
            instance: The existing company instance to update.
            validated_data: Dictionary containing validated field data including:
                - Optional 'translations': Dict with language codes and fields
                - Optional 'email': Updated company email
                - Optional 'phone': Updated company phone number
                - Optional 'image': Updated company logo file

        Returns:
            Company: The updated company instance with all changes saved.

        Example:
            >>> # Update only contact information
            >>> validated_data = {
            ...     'email': 'newemail@restaurant.com',
            ...     'phone': 1112223333
            ... }
            >>> company = serializer.update(existing_company, validated_data)
            >>> company.email
            'newemail@restaurant.com'
            >>>
            >>> # Update translations for specific language
            >>> validated_data = {
            ...     'translations': {
            ...         'en': {
            ...             'name': 'Updated Restaurant Name',
            ...             'address': 'New Address 456'
            ...         }
            ...     }
            ... }
            >>> company = serializer.update(existing_company, validated_data)
            >>> company.set_current_language('en')
            >>> company.name
            'Updated Restaurant Name'
        """
        translations = validated_data.pop('translations', {})
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        for lang_code, fields in translations.items():
            instance.set_current_language(lang_code)
            for attr, value in fields.items():
                setattr(instance, attr, value)
        instance.save()
        return instance
