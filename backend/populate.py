"""Database population script for importing menu data from JSON file.

This module provides a standalone utility script to populate the database with
products, categories, and ingredients from a JSON file (menu_text.JSON). It is
designed to be run directly as a script for initial data import or data refresh.

The script reads menu data from 'menu_text.JSON' and creates or updates:
- Categories with Spanish and English translations
- Ingredients with Spanish and English names and optional icons
- Products with complete details in both languages

All database operations are wrapped in a transaction to ensure data consistency.

Usage:
    Run directly as a Python script (requires Django environment):
        python populate.py

    Or within Django shell:
        python manage.py shell < populate.py

Requirements:
    - menu_text.JSON file must exist in the same directory
    - Django environment must be properly configured
    - Database must be migrated and ready

Example JSON structure:
    [
        {
            "category_es": "Entradas",
            "category_en": "Starters",
            "products": [
                {
                    "name_es": "Bruschetta",
                    "name_en": "Bruschetta",
                    "description_es": "Pan con tomate",
                    "description_en": "Bread with tomato",
                    "price": 6.50,
                    "ingredients": [
                        {"name_es": "Tomate", "name_en": "Tomato", "icon": "🍅"}
                    ]
                }
            ]
        }
    ]

Note:
    - This script should be converted to a management command for production use
    - All products are assigned a default image: "Products/2.jpeg"
    - All products are created with stock=10 and available=True
    - Runs within a transaction; all-or-nothing import

See Also:
    - seed_demo: Management command for demo data seeding
    - flush_and_seed: Management command for database reset and seeding
"""

import json
from typing import Dict, Any

from django.db import transaction

from apps.categories.models import Category
from apps.ingredients.models import Ingredients
from apps.products.models import Products

# Default image path for all products (relative to MEDIA_ROOT)
PRODUCT_IMAGE_SRC = "Products/2.jpeg"

# Load menu data from JSON file
with open('menu_text.JSON', encoding='utf-8') as f:
    carta = json.load(f)


def get_or_create_ingredient(ingredient_dict: Dict[str, Any]) -> Ingredients:
    """Get or create an ingredient with multi-language support.

    Retrieves an existing ingredient by Spanish name, or creates a new one
    if it doesn't exist. Updates translations in both Spanish and English.

    Args:
        ingredient_dict: Dictionary containing ingredient data with keys:
            - name_es (str): Spanish name (required)
            - name_en (str): English name (optional, defaults to name_es)
            - icon (str): Emoji or icon representation (optional)

    Returns:
        Ingredients: The ingredient object (existing or newly created).

    Example:
        >>> ing_dict = {
        ...     "name_es": "Tomate",
        ...     "name_en": "Tomato",
        ...     "icon": "🍅"
        ... }
        >>> ingredient = get_or_create_ingredient(ing_dict)
        >>> ingredient.icon
        '🍅'

    Note:
        - Searches for existing ingredient by Spanish name only
        - Updates both language translations even for existing ingredients
        - Icon field is set only during creation
    """
    name_es = ingredient_dict["name_es"].strip()
    name_en = ingredient_dict.get("name_en", name_es).strip()
    icon = ingredient_dict.get("icon", "")

    # Search for existing ingredient by Spanish name
    ingredient = Ingredients.objects.filter(
        translations__name=name_es
    ).first()

    if not ingredient:
        ingredient = Ingredients.objects.create(icon=icon)

    ingredient.set_current_language('es')
    ingredient.name = name_es
    ingredient.save()
    ingredient.set_current_language('en')
    ingredient.name = name_en
    ingredient.save()
    return ingredient


def get_or_create_category(cat_es: str, cat_en: str) -> Category:
    """Get or create a category with multi-language support.

    Retrieves an existing category by Spanish name, or creates a new one
    if it doesn't exist. Updates translations in both Spanish and English.

    Args:
        cat_es: Spanish category name.
        cat_en: English category name.

    Returns:
        Category: The category object (existing or newly created).

    Example:
        >>> category = get_or_create_category("Postres", "Desserts")
        >>> category.safe_translation_getter('name', language_code='en')
        'Desserts'

    Note:
        - Searches for existing category by Spanish name only
        - Updates both language translations even for existing categories
        - Automatically strips whitespace from category names
    """
    # Search for existing category by Spanish name
    cat = Category.objects.filter(
        translations__name=cat_es.strip()
    ).first()

    if not cat:
        cat = Category.objects.create()

    cat.set_current_language('es')
    cat.name = cat_es.strip()
    cat.save()
    cat.set_current_language('en')
    cat.name = cat_en.strip()
    cat.save()
    return cat


def process_product(product_dict: Dict[str, Any], category: Category) -> None:
    """Process and create a single product with all relationships.

    Creates a new product with Spanish and English translations, assigns it
    to the specified category, and links all associated ingredients.

    Args:
        product_dict: Dictionary containing product data with keys:
            - name_es (str): Spanish product name (required)
            - name_en (str): English name (optional, defaults to name_es)
            - description_es (str): Spanish description (optional)
            - description_en (str): English description (optional, defaults to description_es)
            - price (float/str): Product price (optional, defaults to 0.0)
            - ingredients (list): List of ingredient dictionaries (optional)
        category: Category object to associate with the product.

    Returns:
        None

    Example:
        >>> product_data = {
        ...     "name_es": "Pizza",
        ...     "name_en": "Pizza",
        ...     "price": 12.00,
        ...     "ingredients": [{"name_es": "Queso", "name_en": "Cheese"}]
        ... }
        >>> process_product(product_data, category)

    Note:
        - All products created with stock=10, available=True
        - All products assigned default image from PRODUCT_IMAGE_SRC
        - Ingredients are created/retrieved and linked via ManyToMany
        - Product is saved multiple times for translation updates
    """
    name_es = product_dict["name_es"].strip()
    name_en = product_dict.get("name_en", name_es).strip()
    desc_es = product_dict.get("description_es", "")
    desc_en = product_dict.get("description_en", desc_es)
    price = float(product_dict.get("price", 0.0))

    # Create product with default values
    product = Products.objects.create(
        price=price,
        stock=10,
        available=True,
        image=PRODUCT_IMAGE_SRC
    )
    # Spanish translation
    product.set_current_language('es')
    product.name = name_es
    product.description = desc_es
    product.save()
    # English translation
    product.set_current_language('en')
    product.name = name_en
    product.description = desc_en
    product.save()
    # Associate category
    product.categories.add(category)
    # Associate ingredients
    for ing_dict in product_dict.get("ingredients", []):
        ingredient = get_or_create_ingredient(ing_dict)
        product.ingredients.add(ingredient)
    product.save()


# Main execution: Import all data within a transaction
with transaction.atomic():
    for block in carta:
        # Check if block contains a category with products or a standalone product
        if "products" in block:
            # Block is a category containing multiple products
            cat_es = block.get("category_es", "Sin categoría")
            cat_en = block.get("category_en", cat_es)
            category = get_or_create_category(cat_es, cat_en)

            for product_dict in block["products"]:
                process_product(product_dict, category)
        else:
            # Block is a standalone product without specific category
            category = get_or_create_category("Sin categoría", "No category")
            process_product(block, category)

print("¡Carta insertada correctamente en la base de datos en español e inglés con emojis y categorías!")
