"""Management command to seed demo data for digital menu system.

This module provides a Django management command that populates the database
with sample categories, ingredients, and products in both Spanish and English
for demonstration and testing purposes.
"""

from typing import List

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.categories.models import Category
from apps.ingredients.models import Ingredients
from apps.products.models import Products


class Command(BaseCommand):
    """Django management command to populate demo data for the menu system.

    This command seeds the database with sample data including categories,
    ingredients, and products with multi-language support (Spanish and English).
    All operations are performed within a database transaction to ensure
    data consistency.

    Command Purpose:
        Populate the database with demo data for testing and demonstration:
        - 3 categories (Starters, Mains, Desserts)
        - 3 ingredients (Tomato, Cheese, Basil)
        - 3 products (Bruschetta, Margherita Pizza, Tiramisu)

    Usage:
        Basic usage:
            python manage.py seed_demo

        From another management command:
            from django.core.management import call_command
            call_command('seed_demo')

    Examples:
        Command line execution:
            $ python manage.py seed_demo
            Seeding demo data...
            Created/ensured 3 categories
            Created/ensured 3 ingredients
            Created/ensured 3 products
            Seeding completed.

    Notes:
        - All operations run within a transaction (atomic)
        - Creates new records each time (does not check for duplicates)
        - Supports multi-language content (ES/EN)
        - Products are automatically linked to categories and ingredients
        - Safe to run multiple times (will create duplicate records)

    Attributes:
        help (str): Short description displayed in management command help.
    """

    help = "Populate demo data: categories -> ingredients -> products (ES/EN)."

    @transaction.atomic
    def handle(self, *args, **options) -> None:
        """Execute the command to seed demo data.

        This is the main entry point for the management command. It orchestrates
        the creation of categories, ingredients, and products in the correct order
        to maintain referential integrity.

        Args:
            *args: Variable length argument list (unused).
            **options: Arbitrary keyword arguments from command line options.

        Returns:
            None

        Note:
            Runs within a database transaction to ensure atomicity.
            If any step fails, all changes are rolled back.
        """
        self.stdout.write(self.style.MIGRATE_HEADING("Seeding demo data..."))

        categories = self._seed_categories()
        self.stdout.write(
            self.style.SUCCESS(f"Created/ensured {len(categories)} categories")
        )

        ingredients = self._seed_ingredients()
        self.stdout.write(
            self.style.SUCCESS(f"Created/ensured {len(ingredients)} ingredients")
        )

        products = self._seed_products(categories, ingredients)
        self.stdout.write(
            self.style.SUCCESS(f"Created/ensured {len(products)} products")
        )

        self.stdout.write(self.style.SUCCESS("Seeding completed."))

    def _seed_categories(self) -> List[Category]:
        """Create demo categories with Spanish and English translations.

        Creates three predefined categories for the menu system:
        - Starters/Entradas
        - Mains/Productos principales
        - Desserts/Postres

        Each category is created with translations in both Spanish and English.

        Returns:
            List[Category]: List of created Category objects.

        Example:
            >>> categories = self._seed_categories()
            >>> len(categories)
            3
            >>> categories[0].safe_translation_getter('name', language_code='en')
            'Starters'
        """
        created = []
        data = [
            {
                "es": {"name": "Entradas", "description": "Productos para iniciar"},
                "en": {"name": "Starters", "description": "Begin your meal"},
            },
            {
                "es": {"name": "Productos principales", "description": "Productos principales"},
                "en": {"name": "Mains", "description": "Main dishes"},
            },
            {
                "es": {"name": "Postres", "description": "Dulces finales"},
                "en": {"name": "Desserts", "description": "Sweet endings"},
            },
        ]
        for item in data:
            obj = Category.objects.create()
            obj.set_current_language('es')
            obj.name = item["es"]["name"]
            obj.description = item["es"].get("description")
            obj.save()
            obj.set_current_language('en')
            obj.name = item["en"]["name"]
            obj.description = item["en"].get("description")
            obj.save()
            created.append(obj)
        return created

    def _seed_ingredients(self) -> List[Ingredients]:
        """Create demo ingredients with Spanish and English translations.

        Creates three predefined ingredients commonly used in menu items:
        - Tomato/Tomate
        - Cheese/Queso
        - Basil/Albahaca

        Each ingredient is created with translations in both Spanish and English.

        Returns:
            List[Ingredients]: List of created Ingredients objects.

        Example:
            >>> ingredients = self._seed_ingredients()
            >>> len(ingredients)
            3
            >>> ingredients[0].safe_translation_getter('name', language_code='es')
            'Tomate'
        """
        created = []
        data = [
            {"es": {"name": "Tomate"}, "en": {"name": "Tomato"}},
            {"es": {"name": "Queso"}, "en": {"name": "Cheese"}},
            {"es": {"name": "Albahaca"}, "en": {"name": "Basil"}},
        ]
        for item in data:
            obj = Ingredients.objects.create()
            obj.set_current_language('es')
            obj.name = item["es"]["name"]
            obj.save()
            obj.set_current_language('en')
            obj.name = item["en"]["name"]
            obj.save()
            created.append(obj)
        return created

    def _seed_products(
        self, categories: List[Category], ingredients: List[Ingredients]
    ) -> List[Products]:
        """Create demo products with translations and associations.

        Creates three sample products with complete details:
        - Bruschetta (Starter)
        - Margherita Pizza (Main)
        - Tiramisu (Dessert)

        Each product includes:
        - Spanish and English name and description
        - Price, stock quantity, and availability status
        - Associated categories and ingredients

        Args:
            categories: List of Category objects to associate with products.
            ingredients: List of Ingredients objects to associate with products.

        Returns:
            List[Products]: List of created Products objects.

        Example:
            >>> products = self._seed_products(categories, ingredients)
            >>> len(products)
            3
            >>> products[0].price
            Decimal('6.50')
            >>> products[0].safe_translation_getter('name', language_code='en')
            'Bruschetta'

        Note:
            - Products are linked to categories and ingredients via ManyToMany
            - Category and ingredient lookups use safe_translation_getter
            - All products are created with available=True
        """
        created = []
        # Simple mapping helpers for category and ingredient lookups
        cat_by_name = {
            c.safe_translation_getter('name', any_language=True): c
            for c in categories
        }
        ing_by_name = {
            i.safe_translation_getter('name', any_language=True): i
            for i in ingredients
        }

        data = [
            {
                "translations": {
                    "es": {
                        "name": "Bruschetta",
                        "description": "Pan con tomate y albahaca",
                    },
                    "en": {
                        "name": "Bruschetta",
                        "description": "Bread with tomato and basil",
                    },
                },
                "price": 6.50,
                "stock": 100,
                "available": True,
                "categories": ["Entradas"],
                "ingredients": ["Tomate", "Albahaca"],
            },
            {
                "translations": {
                    "es": {
                        "name": "Pizza Margarita",
                        "description": "Queso y albahaca",
                    },
                    "en": {
                        "name": "Margherita Pizza",
                        "description": "Cheese and basil",
                    },
                },
                "price": 12.00,
                "stock": 50,
                "available": True,
                "categories": ["Productos principales"],
                "ingredients": ["Tomate", "Queso", "Albahaca"],
            },
            {
                "translations": {
                    "es": {
                        "name": "Tiramisú",
                        "description": "Clásico italiano",
                    },
                    "en": {
                        "name": "Tiramisu",
                        "description": "Italian classic",
                    },
                },
                "price": 7.50,
                "stock": 40,
                "available": True,
                "categories": ["Postres"],
                "ingredients": [],
            },
        ]

        for item in data:
            p = Products.objects.create(
                price=item["price"],
                stock=item["stock"],
                available=item["available"]
            )
            p.set_current_language('es')
            p.name = item["translations"]["es"]["name"]
            p.description = item["translations"]["es"].get("description")
            p.save()
            p.set_current_language('en')
            p.name = item["translations"]["en"]["name"]
            p.description = item["translations"]["en"].get("description")
            p.save()

            for cat_name in item["categories"]:
                c = cat_by_name.get(cat_name)
                if c:
                    p.categories.add(c)
            for ing_name in item["ingredients"]:
                ing = ing_by_name.get(ing_name)
                if ing:
                    p.ingredients.add(ing)
            created.append(p)
        return created





