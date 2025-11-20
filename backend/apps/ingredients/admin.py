"""Django admin configuration for the ingredients application.

This module configures the Django admin interface for Ingredient models,
providing a management interface for ingredient data with multi-language
support through django-parler.

Classes:
    IngredientAdmin: Admin interface configuration for Ingredient model.

Notes:
    - Uses TranslatableAdmin to support multi-language translations.
    - Displays ingredient names in the list view.
    - Ingredients can have translatable names for different languages
      to support internationalization in menu displays.
    - Ingredients can be associated with products to track allergens
      and dietary information.

See Also:
    - apps.ingredients.models.Ingredient for model definition
    - django-parler documentation for translation features
"""

from django.contrib import admin
from parler.admin import TranslatableAdmin

from .models import Ingredient


@admin.register(Ingredient)
class IngredientAdmin(TranslatableAdmin):
    """Admin configuration for Ingredient model with translation support.

    This admin class provides a customized interface for managing Ingredient
    instances in the Django admin panel. It extends TranslatableAdmin to
    enable multi-language support for translatable fields, primarily the
    ingredient name.

    Attributes:
        list_display: Tuple of field names to display in the admin list view,
            showing just the name field for simplicity.

    Examples:
        Access the admin interface::

            # Navigate to /admin/ingredients/ingredient/
            # View list of ingredients with their names
            # Click on an ingredient to edit its name in multiple languages

        Managing ingredients::

            # Add new ingredients with translated names
            # Edit ingredient names in different languages
            # Associate ingredients with products for allergen tracking

    Notes:
        - Automatically registered with Django admin via @admin.register.
        - TranslatableAdmin provides language tabs for editing translations.
        - List view shows only the name field for clean presentation.
        - Ingredients are typically linked to products via many-to-many
          relationships for allergen and dietary information.
        - Fields can be edited in multiple languages as configured in settings.
        - Simple model with minimal fields focused on ingredient identification.
    """

    list_display = ('name',)