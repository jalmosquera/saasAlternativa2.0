"""Category serializers for REST API operations.

This module provides serializers for the Category model, supporting multi-language
translations and CRUD operations through Django REST Framework.
"""

from typing import Any, Dict
from parler_rest.serializers import TranslatableModelSerializer, TranslatedFieldsField
from rest_framework import serializers
from apps.categories.models import Category


class CategorySerializerGet(TranslatableModelSerializer):
    """Serializer for retrieving Category instances with translations.

    Handles GET requests for category data, returning all fields including
    translatable fields (name, description) via the TranslatedFieldsField.
    Optimized for read operations with automatic translation handling.

    Attributes:
        translations (TranslatedFieldsField): Exposes all translatable fields
            (name, description) for the Category model.

    Meta:
        model: Category model this serializer is based on.
        fields: All model fields are included in serialization.
        read_only_fields: Timestamp fields that cannot be modified via API.

    Example:
        >>> # Retrieve category with translations
        >>> serializer = CategorySerializerGet(category_instance)
        >>> serializer.data
        {
            'id': 1,
            'translations': {
                'en': {'name': 'Main Courses', 'description': '...'},
                'es': {'name': 'Platos Principales', 'description': '...'}
            },
            'created_at': '2024-01-15T10:30:00Z',
            'updated_at': '2024-01-15T10:30:00Z'
        }

    Note:
        - Uses django-parler-rest for translation serialization
        - Automatically includes all available language translations
        - Timestamps are read-only and auto-managed
    """

    translations = TranslatedFieldsField(shared_model=Category)

    class Meta:
        """Meta options for CategorySerializerGet."""

        model = Category
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class CategorySerializerPost(serializers.ModelSerializer):
    """Serializer for creating and updating Category instances with translations.

    Handles POST, PUT, and PATCH requests for category data, managing both
    regular fields and multi-language translations. Provides custom create
    and update methods to properly handle translatable fields.

    Meta:
        model: Category model this serializer is based on.
        fields: All model fields are included in serialization.
        read_only_fields: Timestamp fields that cannot be modified via API.

    Example:
        >>> # Create category with translations
        >>> data = {
        ...     'translations': {
        ...         'en': {'name': 'Desserts', 'description': 'Sweet treats'},
        ...         'es': {'name': 'Postres', 'description': 'Dulces delicias'}
        ...     }
        ... }
        >>> serializer = CategorySerializerPost(data=data)
        >>> if serializer.is_valid():
        ...     category = serializer.save()
        >>>
        >>> # Update category
        >>> serializer = CategorySerializerPost(
        ...     instance=category,
        ...     data=updated_data,
        ...     partial=True
        ... )
        >>> if serializer.is_valid():
        ...     category = serializer.save()

    Note:
        - Handles translation data separately from regular fields
        - Supports partial updates for PATCH requests
        - Automatically manages language switching during save
        - Timestamps are auto-managed and cannot be set via API
    """

    class Meta:
        """Meta options for CategorySerializerPost."""

        model = Category
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def create(self, validated_data: Dict[str, Any]) -> Category:
        """Create a new Category instance with translations.

        Extracts translation data from validated_data, creates the base
        category instance, then iterates through each language to set
        the translatable fields.

        Args:
            validated_data: Dictionary containing validated field data including
                'translations' key with nested language dictionaries.

        Returns:
            Category: The newly created category instance with all translations saved.

        Example:
            >>> validated_data = {
            ...     'translations': {
            ...         'en': {'name': 'Appetizers', 'description': 'Starters'},
            ...         'es': {'name': 'Entrantes', 'description': 'Aperitivos'}
            ...     }
            ... }
            >>> category = serializer.create(validated_data)
            >>> category.set_current_language('en')
            >>> category.name
            'Appetizers'
        """
        translations = validated_data.pop('translations', {})
        instance = Category.objects.create(**validated_data)
        for lang_code, fields in translations.items():
            instance.set_current_language(lang_code)
            for attr, value in fields.items():
                setattr(instance, attr, value)
            instance.save()
        return instance

    def update(self, instance: Category, validated_data: Dict[str, Any]) -> Category:
        """Update an existing Category instance with new data and translations.

        Updates both regular fields and translatable fields. Extracts translation
        data, updates the instance attributes, then iterates through each language
        to update translatable fields.

        Args:
            instance: The existing category instance to update.
            validated_data: Dictionary containing validated field data including
                optional 'translations' key with nested language dictionaries.

        Returns:
            Category: The updated category instance with all changes saved.

        Example:
            >>> validated_data = {
            ...     'translations': {
            ...         'en': {'name': 'Updated Name'}
            ...     }
            ... }
            >>> category = serializer.update(existing_category, validated_data)
            >>> category.set_current_language('en')
            >>> category.name
            'Updated Name'
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
