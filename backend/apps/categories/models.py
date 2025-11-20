"""Category model module for product classification.

This module defines the Category model with multi-language support for
organizing products in the digital menu system.
"""

from django.db import models
from parler.models import TranslatableModel, TranslatedFields


class Category(TranslatableModel):
    """Category model for product classification with multi-language support.

    Represents a category used to organize and classify products in the menu.
    Supports translatable name and description fields for multi-language menus.

    Attributes:
        translations (TranslatedFields): Translatable fields (name, description).
        created_at (datetime): Timestamp when category was created.
        updated_at (datetime): Timestamp of last update.

    Translatable Fields:
        name (str): Category name in multiple languages (max 100 chars).
        description (str): Category description in multiple languages (optional).

    Example:
        >>> category = Category.objects.create()
        >>> category.set_current_language('en')
        >>> category.name = "Main Courses"
        >>> category.description = "Delicious main course options"
        >>> category.set_current_language('es')
        >>> category.name = "Platos Principales"
        >>> category.description = "Deliciosas opciones de platos principales"
        >>> category.save()

    Note:
        - Uses django-parler for multi-language support
        - Can be associated with multiple products via ManyToMany relationship
    """

    translations = TranslatedFields(
        name=models.CharField('Name', max_length=100),
        description=models.TextField('Description', blank=True, null=True)
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def __str__(self) -> str:
        """Return string representation of the category.

        Returns the category name in the current active language, or falls back
        to any available language translation. If no translation exists, returns
        a generic identifier with the primary key.

        Returns:
            str: Category name or "Category {pk}" if no translation available.

        Example:
            >>> category.set_current_language('en')
            >>> str(category)
            'Main Courses'
        """
        return self.safe_translation_getter('name', any_language=True) or f"Category {self.pk}"