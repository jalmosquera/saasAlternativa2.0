"""Django admin configuration for the products application.

This module configures the Django admin interface for Product models,
providing a comprehensive interface for managing product information
with multi-language support through django-parler.

Classes:
    ProductAdmin: Admin interface configuration for Product model.

Notes:
    - Uses TranslatableAdmin to support multi-language translations.
    - Displays key product information in the list view.
    - Products can have translatable names and descriptions for
      different languages to support internationalization.
    - Includes timestamp tracking for created_at and updated_at fields.

See Also:
    - apps.products.models.Product for model definition
    - django-parler documentation for translation features
"""

from django.contrib import admin
from parler.admin import TranslatableAdmin, TranslatableTabularInline

from .models import Product, ProductOption, ProductOptionChoice


@admin.register(Product)
class ProductAdmin(TranslatableAdmin):
    """Admin configuration for Product model with translation support.

    This admin class provides a customized interface for managing Product
    instances in the Django admin panel. It extends TranslatableAdmin to
    enable multi-language support for translatable fields such as product
    name and description.

    Attributes:
        list_display: Tuple of field names to display in the admin list view,
            showing name, description, and timestamps for easy management.

    Examples:
        Access the admin interface::

            # Navigate to /admin/products/product/
            # View list of products with names, descriptions, and timestamps
            # Click on a product to edit its details in multiple languages

        Managing products::

            # Add new products with translated names and descriptions
            # View when products were created and last updated
            # Edit product information in different languages

    Notes:
        - Automatically registered with Django admin via @admin.register.
        - TranslatableAdmin provides language tabs for editing translations.
        - List view shows: name, description, created_at, updated_at.
        - Products can be related to categories and ingredients.
        - Fields can be edited in multiple languages as configured in settings.
        - Timestamp fields (created_at, updated_at) are typically auto-managed.
    """

    list_display = ('name', 'description', 'created_at', 'updated_at')


class ProductOptionChoiceInline(TranslatableTabularInline):
    """Inline admin for ProductOptionChoice within ProductOption.

    This inline admin allows managing option choices directly within
    the product option edit page. Users can add, edit, or delete
    choices without leaving the option edit screen.

    Attributes:
        model: ProductOptionChoice model to manage.
        extra: Number of empty choice forms to display by default.
        fields: Fields to display/edit in the inline form.
    """

    model = ProductOptionChoice
    extra = 1
    fields = ('name', 'icon', 'price_adjustment', 'order')


@admin.register(ProductOption)
class ProductOptionAdmin(TranslatableAdmin):
    """Admin configuration for ProductOption model with translation support.

    This admin class provides an interface for managing product options
    (like "Tipo de Carne", "Tipo de Salsa") with their associated choices.

    Attributes:
        list_display: Fields shown in the list view.
        list_filter: Filters available in the sidebar.
        inlines: Inline forms for managing choices within the option.

    Examples:
        Create a new option::

            # Navigate to /admin/products/productoption/add/
            # Set name in Spanish: "Tipo de Carne"
            # Set name in English: "Meat Type"
            # Set is_required: True
            # Add choices inline:
            #   - Pollo / Chicken 🍗
            #   - Carne / Beef 🥩
            #   - Pescado / Fish 🐟
            #   - Sin carne / No meat
    """

    list_display = ('name', 'is_required', 'order', 'created_at')
    list_filter = ('is_required',)
    inlines = [ProductOptionChoiceInline]
    ordering = ['order', 'id']


@admin.register(ProductOptionChoice)
class ProductOptionChoiceAdmin(TranslatableAdmin):
    """Admin configuration for ProductOptionChoice model.

    Standalone admin for managing individual option choices.
    Typically choices are managed through the ProductOption inline,
    but this provides a separate interface if needed.

    Attributes:
        list_display: Fields shown in the list view.
        list_filter: Filters available in the sidebar.
    """

    list_display = ('name', 'option', 'icon', 'price_adjustment', 'order')
    list_filter = ('option',)
    ordering = ['option', 'order', 'id']

