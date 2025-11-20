"""
Management command to import menu data from JSON files.

This command imports categories, ingredients, and products from JSON files
with bilingual support (Spanish and English).

Usage:
    python manage.py import_menu_from_json
"""

import json
import os
from decimal import Decimal
from pathlib import Path
from django.core.management.base import BaseCommand
from apps.categories.models import Category
from apps.ingredients.models import Ingredient
from apps.products.models import Product


class Command(BaseCommand):
    help = 'Import menu data from JSON files (ingredients → categories → products)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing data before importing',
        )
        parser.add_argument(
            '--assets-path',
            type=str,
            default='/Users/jalberth/Documents/monorepos/alternativa_2.0/assets',
            help='Path to assets folder containing JSON files',
        )

    def handle(self, *args, **options):
        assets_path = Path(options['assets_path'])

        self.stdout.write(self.style.SUCCESS('🚀 Starting menu import from JSON files...'))

        # Clear existing data if requested
        if options['clear']:
            self.stdout.write(self.style.WARNING('⚠️  Clearing existing data...'))
            Product.objects.all().delete()
            Category.objects.all().delete()
            Ingredient.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✓ Data cleared'))

        # Step 1: Import Ingredients (no dependencies)
        self.stdout.write(self.style.SUCCESS('\n📦 Step 1: Importing Ingredients...'))
        ingredients_map = {}

        ingredient_files = [
            'ingredientes_pizzas_final_1euro.json',
            'ingredientes_toda_la_carta.json',
            'ingredientes_camperos_burger_enrollados_varios_fixed (1).json',
        ]

        for filename in ingredient_files:
            file_path = assets_path / filename
            if not file_path.exists():
                self.stdout.write(self.style.WARNING(f'⚠️  File not found: {filename}'))
                continue

            with open(file_path, 'r', encoding='utf-8') as f:
                ingredients_data = json.load(f)

            for ing_data in ingredients_data:
                # Check if ingredient already exists by name
                ingredient_name_es = ing_data['translations']['es']['name']

                # Skip duplicates
                if ingredient_name_es in ingredients_map:
                    continue

                ingredient = Ingredient.objects.create(
                    icon=ing_data.get('icon', ''),
                    be_extra=ing_data.get('be_extra', False),
                    price=Decimal(ing_data.get('price', '0.00'))
                )

                # Set Spanish translation
                ingredient.set_current_language('es')
                ingredient.name = ing_data['translations']['es']['name']

                # Set English translation
                ingredient.set_current_language('en')
                ingredient.name = ing_data['translations']['en']['name']

                ingredient.save()
                ingredients_map[ingredient_name_es] = ingredient

            self.stdout.write(f'  ✓ Imported {len(ingredients_data)} ingredients from {filename}')

        self.stdout.write(self.style.SUCCESS(f'✅ Total ingredients imported: {len(ingredients_map)}'))

        # Step 2: Import Categories (no dependencies)
        self.stdout.write(self.style.SUCCESS('\n📂 Step 2: Importing Categories...'))
        categories_map = {}

        categories_file = assets_path / 'categorias_carta_con_postres.json'
        if not categories_file.exists():
            self.stdout.write(self.style.ERROR('❌ Categories file not found!'))
            return

        with open(categories_file, 'r', encoding='utf-8') as f:
            categories_data = json.load(f)

        for cat_data in categories_data:
            category = Category.objects.create()

            # Set Spanish translation
            category.set_current_language('es')
            category.name = cat_data['translations']['es']['name']
            category.description = cat_data['translations']['es'].get('description', '')

            # Set English translation
            category.set_current_language('en')
            category.name = cat_data['translations']['en']['name']
            category.description = cat_data['translations']['en'].get('description', '')

            category.save()
            categories_map[cat_data['translations']['es']['name']] = category

            self.stdout.write(f'  ✓ Created category: {cat_data["translations"]["es"]["name"]}')

        self.stdout.write(self.style.SUCCESS(f'✅ Total categories imported: {len(categories_map)}'))

        # Step 3: Import Products (depends on categories and ingredients)
        self.stdout.write(self.style.SUCCESS('\n🍕 Step 3: Importing Products...'))

        products_file = assets_path / 'productos_completos_con_precios.json'
        if not products_file.exists():
            self.stdout.write(self.style.ERROR('❌ Products file not found!'))
            return

        with open(products_file, 'r', encoding='utf-8') as f:
            products_data = json.load(f)

        products_created = 0
        for prod_data in products_data:
            try:
                product = Product.objects.create(
                    price=Decimal(prod_data.get('price', '0.00')),
                    stock=100,
                    available=prod_data.get('available', True),
                    allows_extra_ingredients=prod_data.get('allows_extra_ingredients', True)
                )

                # Set Spanish translation
                product.set_current_language('es')
                product.name = prod_data['translations']['es']['name']
                product.description = prod_data['translations']['es'].get('description', '')

                # Set English translation
                product.set_current_language('en')
                product.name = prod_data['translations']['en']['name']
                product.description = prod_data['translations']['en'].get('description', '')

                product.save()

                # Set category if exists
                category_name = prod_data.get('category')
                if category_name and category_name in categories_map:
                    product.categories.add(categories_map[category_name])

                # Note: Ingredient relationships would need to be defined in the JSON
                # For now, we're not setting ingredients as they're not in the current JSON structure

                products_created += 1
                emoji = prod_data.get('emoji', '📦')
                self.stdout.write(f'  ✓ {emoji} Created: {prod_data["translations"]["es"]["name"]} - {prod_data.get("price", "0.00")}€')

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Error creating product {prod_data["translations"]["es"]["name"]}: {str(e)}')
                )

        self.stdout.write(self.style.SUCCESS(f'✅ Total products imported: {products_created}'))

        # Summary
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS('📊 IMPORT SUMMARY'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(f'  Ingredients: {len(ingredients_map)}')
        self.stdout.write(f'  Categories: {len(categories_map)}')
        self.stdout.write(f'  Products: {products_created}')
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(self.style.SUCCESS('✅ Menu import completed successfully!'))
