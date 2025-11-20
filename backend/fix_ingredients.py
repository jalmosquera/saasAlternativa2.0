#!/usr/bin/env python
"""Asignar ingredientes específicos según descripciones"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product
from apps.ingredients.models import Ingredient

def get_or_create_ingredient(name_es, name_en, price=0):
    existing = Ingredient.objects.filter(translations__name=name_es).first()
    if existing:
        return existing

    ing = Ingredient.objects.create(price=price)
    ing.set_current_language('es')
    ing.name = name_es
    ing.save()
    ing.set_current_language('en')
    ing.name = name_en
    ing.save()
    return ing

def assign_specific_ingredients():
    # Mapeo de productos con sus ingredientes específicos
    product_ingredients = {
        'Patatas Gratinadas': [
            ('Salsa de yogurt', 'Yogurt sauce'),
            ('Salsa barbacoa', 'BBQ sauce'),
            ('Alioli', 'Aioli'),
            ('Carne de kebab', 'Kebab meat'),
            ('Queso gratinado', 'Gratin cheese'),
        ],
        'Patatas Bravas': [
            ('Alioli', 'Aioli'),
            ('Queso', 'Cheese'),
            ('Salsa brava', 'Spicy sauce'),
        ],
        'Patatas Carbonara': [
            ('Salsa carbonara', 'Carbonara sauce'),
            ('Bacon', 'Bacon'),
            ('Huevo a la plancha', 'Fried egg'),
            ('Queso gratinado', 'Gratin cheese'),
        ],
        'Nachos': [
            ('Nachos de maíz', 'Corn nachos'),
            ('Salsa cheddar', 'Cheddar sauce'),
            ('Queso', 'Cheese'),
            ('Carne de kebab', 'Kebab meat'),
        ],
        'Ensalada Equus': [
            ('Lechuga', 'Lettuce'),
            ('Tomate cherry', 'Cherry tomato'),
            ('Queso de cabra', 'Goat cheese'),
            ('Pipas de girasol', 'Sunflower seeds'),
            ('Pipas de calabaza', 'Pumpkin seeds'),
            ('Aceitunas negras', 'Black olives'),
            ('Vinagreta de arándanos', 'Cranberry vinaigrette'),
        ],
        'Ensalada César': [
            ('Lechuga', 'Lettuce'),
            ('Pollo a la plancha', 'Grilled chicken'),
            ('Queso parmesano', 'Parmesan cheese'),
            ('Tomate cherry', 'Cherry tomato'),
            ('Picatostes', 'Croutons'),
            ('Salsa césar', 'Caesar dressing'),
        ],
        'Ensalada de Pesto con bola de helado': [
            ('Lechuga', 'Lettuce'),
            ('Queso fresco de cabra', 'Fresh goat cheese'),
            ('Tomate cherry', 'Cherry tomato'),
            ('Nueces', 'Walnuts'),
            ('Salsa pesto', 'Pesto sauce'),
            ('Helado de limón', 'Lemon ice cream'),
        ],
        'Pepito Equus': [
            ('Pan', 'Bread'),
            ('Atún', 'Tuna'),
            ('Lechuga', 'Lettuce'),
            ('Salsa rosa', 'Pink sauce'),
        ],
        'Pepito Serrano': [
            ('Pan', 'Bread'),
            ('Jamón serrano', 'Serrano ham'),
            ('Rodajas de tomate', 'Tomato slices'),
            ('Aceite o mayonesa', 'Oil or mayonnaise'),
        ],
        'Pepito Wili': [
            ('Pan', 'Bread'),
            ('Filete de pollo', 'Chicken fillet'),
            ('Cinta de lomo', 'Pork loin'),
            ('Queso de cabra', 'Goat cheese'),
            ('Tomate frito', 'Fried tomato'),
            ('Albahaca', 'Basil'),
        ],
        'Pepito Anvir': [
            ('Pan', 'Bread'),
            ('Queso de cabra fresco', 'Fresh goat cheese'),
            ('Jamón serrano', 'Serrano ham'),
            ('Rodajas de tomate', 'Tomato slices'),
            ('Aceite', 'Oil'),
            ('Orégano', 'Oregano'),
        ],
        'Pepito Queso Fresco': [
            ('Pan', 'Bread'),
            ('Queso fresco', 'Fresh cheese'),
            ('Rodajas de tomate', 'Tomato slices'),
            ('Aceite', 'Oil'),
        ],
        'Perrito Caliente': [
            ('Pan', 'Bread'),
            ('Salchicha', 'Sausage'),
            ('Salsa de cheddar', 'Cheddar sauce'),
            ('Queso', 'Cheese'),
            ('Cebolla frita', 'Fried onion'),
            ('Mostaza', 'Mustard'),
            ('Ketchup', 'Ketchup'),
            ('Mayonesa', 'Mayonnaise'),
            ('Patatas paja', 'Crispy potatoes'),
        ],
        'Sandwich vegetal': [
            ('Pan', 'Bread'),
            ('York', 'Ham'),
            ('Queso', 'Cheese'),
            ('Mayonesa', 'Mayonnaise'),
            ('Lechuga', 'Lettuce'),
            ('Tomate', 'Tomato'),
        ],
        'Hamburguesa de Pollo': [
            ('Pan', 'Bread'),
            ('Hamburguesa de pollo', 'Chicken patty'),
            ('Mayonesa', 'Mayonnaise'),
            ('Lechuga', 'Lettuce'),
            ('Tomate', 'Tomato'),
            ('Cebolla', 'Onion'),
        ],
        'Hamburguesa de Cerdo': [
            ('Pan', 'Bread'),
            ('Hamburguesa de cerdo', 'Pork patty'),
            ('Mayonesa', 'Mayonnaise'),
            ('Lechuga', 'Lettuce'),
            ('Tomate', 'Tomato'),
            ('Cebolla', 'Onion'),
        ],
        'Hamburguesa Vegana': [
            ('Pan', 'Bread'),
            ('Hamburguesa vegana', 'Vegan patty'),
            ('Mayonesa', 'Mayonnaise'),
            ('Lechuga', 'Lettuce'),
            ('Tomate', 'Tomato'),
            ('Cebolla', 'Onion'),
        ],
        'Burger a la Barbacoa': [
            ('Pan', 'Bread'),
            ('Hamburguesa de ternera', 'Beef patty'),
            ('Salsa BBQ', 'BBQ sauce'),
            ('Bacon', 'Bacon'),
            ('Huevo', 'Egg'),
            ('Lechuga', 'Lettuce'),
            ('Cebolla crujiente', 'Crispy onion'),
            ('Tomate', 'Tomato'),
            ('Queso cheddar', 'Cheddar cheese'),
        ],
        'Montadito Cinta de lomo': [
            ('Pan', 'Bread'),
            ('Cinta de lomo', 'Pork loin'),
            ('Mayonesa', 'Mayonnaise'),
            ('Lechuga', 'Lettuce'),
            ('Tomate', 'Tomato'),
        ],
        'Montadito Filete de Pollo': [
            ('Pan', 'Bread'),
            ('Filete de pollo', 'Chicken fillet'),
            ('Mayonesa', 'Mayonnaise'),
            ('Lechuga', 'Lettuce'),
            ('Tomate', 'Tomato'),
        ],
        'Montadito Lomo Adobado': [
            ('Pan', 'Bread'),
            ('Lomo adobado', 'Marinated pork'),
            ('Mayonesa', 'Mayonnaise'),
            ('Lechuga', 'Lettuce'),
            ('Tomate', 'Tomato'),
        ],
        'Serranito Pollo': [
            ('Pan', 'Bread'),
            ('Pollo', 'Chicken'),
            ('Jamón serrano', 'Serrano ham'),
            ('Pimiento', 'Pepper'),
            ('Alioli', 'Aioli'),
        ],
        'Serranito Lomo': [
            ('Pan', 'Bread'),
            ('Lomo', 'Pork'),
            ('Jamón serrano', 'Serrano ham'),
            ('Pimiento', 'Pepper'),
            ('Alioli', 'Aioli'),
        ],
        'Combinado de kebab o pollo asado': [
            ('Torre de trigo', 'Wheat wrap'),
            ('Lechuga', 'Lettuce'),
            ('Tomate', 'Tomato'),
            ('Cebolla', 'Onion'),
            ('Patatas fritas', 'French fries'),
            ('Kebab o pollo asado', 'Kebab or roasted chicken'),
        ],
    }

    count = 0
    for product_name, ingredients_list in product_ingredients.items():
        product = Product.objects.filter(translations__name=product_name).first()
        if not product:
            print(f"⚠ Producto no encontrado: {product_name}")
            continue

        # Crear y asignar ingredientes
        ingredients = []
        for name_es, name_en in ingredients_list:
            ing = get_or_create_ingredient(name_es, name_en)
            ingredients.append(ing)

        product.ingredients.set(ingredients)
        count += 1
        print(f"✓ {len(ingredients)} ingredientes asignados a: {product_name}")

    return count

def main():
    print("=" * 60)
    print("ASIGNANDO INGREDIENTES ESPECÍFICOS")
    print("=" * 60)

    count = assign_specific_ingredients()

    print("\n" + "=" * 60)
    print(f"✓ COMPLETADO: {count} productos actualizados")
    print("=" * 60)

if __name__ == '__main__':
    main()
