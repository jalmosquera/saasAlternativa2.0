#!/usr/bin/env python
"""Script para asignar ingredientes a los productos"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product
from apps.ingredients.models import Ingredient

def create_base_ingredients():
    """Crear ingredientes base comunes"""
    base_ingredients = [
        {'name_es': 'Patatas', 'name_en': 'Potatoes', 'price': 0},
        {'name_es': 'Lechuga', 'name_en': 'Lettuce', 'price': 0},
        {'name_es': 'Tomate', 'name_en': 'Tomato', 'price': 0},
        {'name_es': 'Cebolla', 'name_en': 'Onion', 'price': 0},
        {'name_es': 'Mayonesa', 'name_en': 'Mayonnaise', 'price': 0},
        {'name_es': 'Pan', 'name_en': 'Bread', 'price': 0},
        {'name_es': 'Pollo', 'name_en': 'Chicken', 'price': 0},
        {'name_es': 'Cerdo', 'name_en': 'Pork', 'price': 0},
        {'name_es': 'Ternera', 'name_en': 'Beef', 'price': 0},
        {'name_es': 'Atún', 'name_en': 'Tuna', 'price': 0},
        {'name_es': 'Pimiento', 'name_en': 'Pepper', 'price': 0},
        {'name_es': 'Alioli', 'name_en': 'Aioli', 'price': 0},
        {'name_es': 'Salsa barbacoa', 'name_en': 'BBQ sauce', 'price': 0},
        {'name_es': 'Salsa yogurt', 'name_en': 'Yogurt sauce', 'price': 0},
        {'name_es': 'Carne kebab', 'name_en': 'Kebab meat', 'price': 0},
        {'name_es': 'Tomate cherry', 'name_en': 'Cherry tomato', 'price': 0},
    ]

    ingredients_dict = {}
    for ing_data in base_ingredients:
        existing = Ingredient.objects.filter(translations__name=ing_data['name_es']).first()

        if not existing:
            ing = Ingredient.objects.create(price=ing_data['price'])
            ing.set_current_language('es')
            ing.name = ing_data['name_es']
            ing.save()
            ing.set_current_language('en')
            ing.name = ing_data['name_en']
            ing.save()
            print(f"✓ Ingrediente base creado: {ing_data['name_es']}")
            ingredients_dict[ing_data['name_es']] = ing
        else:
            ingredients_dict[ing_data['name_es']] = existing

    return ingredients_dict

def assign_ingredients_to_products(ingredients):
    """Asignar ingredientes a productos basándose en nombres y descripciones"""

    # Obtener ingredientes extras
    extras = {
        'Jamón serrano': Ingredient.objects.filter(translations__name='Jamón serrano').first(),
        'Jamón york': Ingredient.objects.filter(translations__name='Jamón york').first(),
        'Huevo': Ingredient.objects.filter(translations__name='Huevo').first(),
        'Bacon': Ingredient.objects.filter(translations__name='Bacon').first(),
        'Queso de cabra': Ingredient.objects.filter(translations__name='Queso de cabra').first(),
        'Queso': Ingredient.objects.filter(translations__name='Queso').first(),
    }

    # Mapeo simple: buscar palabras clave y asignar ingredientes
    products = Product.objects.all()
    count = 0

    for product in products:
        product.set_current_language('es')
        name = product.name.lower()
        desc = (product.description or '').lower()
        text = name + ' ' + desc

        assigned = []

        # Ingredientes base comunes
        if 'patatas' in text or 'patatas' in name:
            if 'Patatas' in ingredients:
                assigned.append(ingredients['Patatas'])

        if 'ensalada' in name:
            if 'Lechuga' in ingredients:
                assigned.append(ingredients['Lechuga'])
            if 'Tomate cherry' in ingredients:
                assigned.append(ingredients['Tomate cherry'])

        if 'hamburguesa' in name or 'burger' in name:
            assigned.extend([ingredients.get('Pan'), ingredients.get('Lechuga'),
                           ingredients.get('Tomate'), ingredients.get('Cebolla'),
                           ingredients.get('Mayonesa')])
            if 'pollo' in text:
                assigned.append(ingredients.get('Pollo'))
            elif 'cerdo' in text:
                assigned.append(ingredients.get('Cerdo'))
            else:
                assigned.append(ingredients.get('Ternera'))

        if 'campero' in name or 'montadito' in name or 'pepito' in name or 'sandwich' in name or 'serranito' in name:
            assigned.extend([ingredients.get('Pan'), ingredients.get('Lechuga'),
                           ingredients.get('Tomate'), ingredients.get('Mayonesa')])

            if 'pollo' in text:
                assigned.append(ingredients.get('Pollo'))
            if 'lomo' in text:
                assigned.append(ingredients.get('Cerdo'))
            if 'atún' in text:
                assigned.append(ingredients.get('Atún'))
            if 'serrano' in text and extras.get('Jamón serrano'):
                assigned.append(extras['Jamón serrano'])
            if 'bacon' in text and extras.get('Bacon'):
                assigned.append(extras['Bacon'])
            if 'huevo' in text and extras.get('Huevo'):
                assigned.append(extras['Huevo'])

        # Asignar ingredientes únicos
        assigned = [i for i in assigned if i is not None]
        if assigned:
            product.ingredients.set(assigned)
            count += 1
            print(f"✓ {len(assigned)} ingredientes asignados a: {product.name}")

    return count

def main():
    print("=" * 60)
    print("ASIGNANDO INGREDIENTES A PRODUCTOS")
    print("=" * 60)

    print("\n1. Creando ingredientes base...")
    ingredients = create_base_ingredients()

    print("\n2. Asignando ingredientes a productos...")
    count = assign_ingredients_to_products(ingredients)

    print("\n" + "=" * 60)
    print(f"✓ COMPLETADO: {count} productos actualizados")
    print("=" * 60)

if __name__ == '__main__':
    main()
