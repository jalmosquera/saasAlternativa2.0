"""Ingredient model module for tracking product components.

This module defines the Ingredient model with multi-language support for
managing and displaying product ingredients in the digital menu.
"""

from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator
from parler.models import TranslatableModel, TranslatedFields


class Ingredient(TranslatableModel):
    """Ingredient model for tracking product components with multi-language support.

    Represents an ingredient that can be associated with products in the menu.
    Supports translatable names for multi-language ingredient display and
    optional icon identifiers for UI representation.

    Attributes:
        translations (TranslatedFields): Translatable fields (name).
        icon (str): Optional icon identifier or class name (max 50 chars).
                   Can be used for Font Awesome, Material Icons, or custom icon sets.
        be_extra (bool): Indicates if this ingredient can be added as an extra by customers.
                        When True, customers can add this ingredient as an extra charge.
                        Default is False.

    Translatable Fields:
        name (str): Ingredient name in multiple languages (max 50 chars).

    Example:
        >>> ingredient = Ingredient.objects.create(icon='fa-cheese')
        >>> ingredient.set_current_language('en')
        >>> ingredient.name = "Mozzarella Cheese"
        >>> ingredient.set_current_language('es')
        >>> ingredient.name = "Queso Mozzarella"
        >>> ingredient.save()
        >>> # Associate with product
        >>> product.ingredients.add(ingredient)

    Note:
        - Uses django-parler for multi-language support
        - Can be associated with multiple products via ManyToMany relationship
        - Icon field supports icon library class names (e.g., 'fa-cheese', 'mdi-cheese')
        - Table name preserved as 'ingredients_ingredients' for backward compatibility
    """

    translations = TranslatedFields(
        name=models.CharField('Name', max_length=50)
    )
    icon = models.CharField('Icon', max_length=50, null=True, blank=True)
    be_extra = models.BooleanField(
        'Can be Extra',
        default=False,
        help_text='Indicates if this ingredient can be added as an extra to products'
    )
    price = models.DecimalField(
        'Price',
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Extra charge when added as extra ingredient (in euros)'
    )

    class Meta:
        db_table = 'ingredients_ingredients'  # Keep old table name for backward compatibility
        verbose_name = 'Ingredient'
        verbose_name_plural = 'Ingredients'

    def __str__(self) -> str:
        """Return string representation of the ingredient.

        Returns the ingredient name in the current active language, or falls back
        to any available language translation. If no translation exists, returns
        a generic identifier with the primary key.

        Returns:
            str: Ingredient name or "Ingredient {pk}" if no translation available.

        Example:
            >>> ingredient.set_current_language('en')
            >>> str(ingredient)
            'Mozzarella Cheese'
        """
        return self.safe_translation_getter('name', any_language=True) or f"Ingredient {self.pk}"

