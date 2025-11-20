"""Ingredient serializers for REST API operations.

This module provides serializers for the Ingredient model, supporting multi-language
translations and CRUD operations through Django REST Framework.
"""

from typing import Any, Dict
from rest_framework import serializers
from apps.ingredients.models import Ingredient
from parler_rest.serializers import TranslatableModelSerializer, TranslatedFieldsField


class IngredientSerializer(TranslatableModelSerializer):
    """Serializer for Ingredient instances with multi-language support.

    Handles all CRUD operations for ingredient data, managing both regular
    fields (icon) and translatable fields (name). Suitable for both reading
    and writing ingredient data with automatic translation management.

    Attributes:
        translations (TranslatedFieldsField): Exposes translatable name field
            for the Ingredient model in all available languages.

    Meta:
        model: Ingredient model this serializer is based on.
        fields: Includes id, translations (name), and icon fields.

    Example:
        >>> # Create ingredient with translations
        >>> data = {
        ...     'translations': {
        ...         'en': {'name': 'Mozzarella Cheese'},
        ...         'es': {'name': 'Queso Mozzarella'},
        ...         'fr': {'name': 'Fromage Mozzarella'}
        ...     },
        ...     'icon': 'fa-cheese'
        ... }
        >>> serializer = IngredientSerializer(data=data)
        >>> if serializer.is_valid():
        ...     ingredient = serializer.save()
        >>>
        >>> # Retrieve ingredient with translations
        >>> serializer = IngredientSerializer(ingredient_instance)
        >>> serializer.data
        {
            'id': 1,
            'translations': {
                'en': {'name': 'Mozzarella Cheese'},
                'es': {'name': 'Queso Mozzarella'},
                'fr': {'name': 'Fromage Mozzarella'}
            },
            'icon': 'fa-cheese'
        }
        >>>
        >>> # Update ingredient
        >>> data = {
        ...     'translations': {
        ...         'en': {'name': 'Fresh Mozzarella'}
        ...     },
        ...     'icon': 'fa-cheese-fresh'
        ... }
        >>> serializer = IngredientSerializer(
        ...     instance=ingredient,
        ...     data=data,
        ...     partial=True
        ... )
        >>> if serializer.is_valid():
        ...     ingredient = serializer.save()

    Note:
        - Uses django-parler-rest for translation serialization
        - Supports both full updates (PUT) and partial updates (PATCH)
        - Icon field can store Font Awesome, Material Icons, or custom icon classes
        - Automatically manages language switching during save operations
    """

    translations = TranslatedFieldsField(shared_model=Ingredient)

    class Meta:
        """Meta options for IngredientSerializer."""

        model = Ingredient
        fields = ['id', 'translations', 'icon', 'be_extra', 'price']

    def create(self, validated_data: Dict[str, Any]) -> Ingredient:
        """Create a new Ingredient instance with translations.

        Extracts translation data from validated_data, creates the base
        ingredient instance with regular fields (icon), then iterates
        through each language to set the translatable name field.

        Args:
            validated_data: Dictionary containing validated field data including
                'translations' key with nested language dictionaries and
                optional 'icon' field.

        Returns:
            Ingredient: The newly created ingredient instance with all
                translations saved.

        Example:
            >>> validated_data = {
            ...     'translations': {
            ...         'en': {'name': 'Tomato'},
            ...         'es': {'name': 'Tomate'}
            ...     },
            ...     'icon': 'fa-tomato'
            ... }
            >>> ingredient = serializer.create(validated_data)
            >>> ingredient.set_current_language('en')
            >>> ingredient.name
            'Tomato'
            >>> ingredient.icon
            'fa-tomato'
        """
        translations = validated_data.pop('translations', {})
        instance = Ingredient.objects.create(**validated_data)
        for lang_code, fields in translations.items():
            instance.set_current_language(lang_code)
            for attr, value in fields.items():
                setattr(instance, attr, value)
        instance.save()
        return instance

    def update(self, instance: Ingredient, validated_data: Dict[str, Any]) -> Ingredient:
        """Update an existing Ingredient instance with new data and translations.

        Updates both regular fields (icon) and translatable fields (name).
        Extracts translation data, updates the instance attributes, then
        iterates through each language to update translatable fields.

        Args:
            instance: The existing ingredient instance to update.
            validated_data: Dictionary containing validated field data including
                optional 'translations' key with nested language dictionaries
                and optional 'icon' field.

        Returns:
            Ingredient: The updated ingredient instance with all changes saved.

        Example:
            >>> # Update only icon
            >>> validated_data = {'icon': 'fa-tomato-new'}
            >>> ingredient = serializer.update(existing_ingredient, validated_data)
            >>> ingredient.icon
            'fa-tomato-new'
            >>>
            >>> # Update translations only
            >>> validated_data = {
            ...     'translations': {
            ...         'en': {'name': 'Cherry Tomato'}
            ...     }
            ... }
            >>> ingredient = serializer.update(existing_ingredient, validated_data)
            >>> ingredient.set_current_language('en')
            >>> ingredient.name
            'Cherry Tomato'
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
