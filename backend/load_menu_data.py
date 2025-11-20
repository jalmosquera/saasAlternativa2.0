#!/usr/bin/env python
"""Script para cargar los productos del menú del restaurante"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product
from apps.categories.models import Category
from apps.ingredients.models import Ingredient

def create_categories():
    categories = [
        {'name_es': 'Para Picar', 'name_en': 'Appetizers'},
        {'name_es': 'Algo ligü-fusión', 'name_en': 'Light Fusion'},
        {'name_es': 'Entre pan y pan', 'name_en': 'Sandwiches'},
        {'name_es': 'Hamburguesas', 'name_en': 'Burgers'},
        {'name_es': 'Montaditos', 'name_en': 'Small Sandwiches'},
        {'name_es': 'Camperos', 'name_en': 'Campero Sandwiches'},
        {'name_es': 'Serranitos', 'name_en': 'Serranitos'},
        {'name_es': 'Combinados', 'name_en': 'Combos'},
    ]

    created_cats = {}
    for cat_data in categories:
        # Check if exists by searching translations
        existing = Category.objects.filter(translations__name=cat_data['name_es']).first()

        if existing:
            cat = existing
            created = False
        else:
            cat = Category.objects.create()
            cat.set_current_language('es')
            cat.name = cat_data['name_es']
            cat.save()
            cat.set_current_language('en')
            cat.name = cat_data['name_en']
            cat.save()
            created = True
            print(f"✓ Categoría creada: {cat_data['name_es']}")

        created_cats[cat_data['name_es']] = cat

    return created_cats

def create_ingredients():
    extras = [
        {'name_es': 'Jamón serrano', 'name_en': 'Serrano ham', 'price': 0.50},
        {'name_es': 'Jamón york', 'name_en': 'York ham', 'price': 0.50},
        {'name_es': 'Huevo', 'name_en': 'Egg', 'price': 0.50},
        {'name_es': 'Cheddar', 'name_en': 'Cheddar', 'price': 0.50},
        {'name_es': 'Queso', 'name_en': 'Cheese', 'price': 0.50},
        {'name_es': 'Queso de cabra', 'name_en': 'Goat cheese', 'price': 0.50},
        {'name_es': 'Bacon', 'name_en': 'Bacon', 'price': 0.50},
        {'name_es': 'Pan sin gluten', 'name_en': 'Gluten-free bread', 'price': 0.50},
        {'name_es': 'Pimiento frito', 'name_en': 'Fried pepper', 'price': 0.50},
    ]

    created_ingr = []
    for ing_data in extras:
        existing = Ingredient.objects.filter(translations__name=ing_data['name_es']).first()

        if existing:
            ing = existing
            created = False
        else:
            ing = Ingredient.objects.create(price=ing_data['price'])
            ing.set_current_language('es')
            ing.name = ing_data['name_es']
            ing.save()
            ing.set_current_language('en')
            ing.name = ing_data['name_en']
            ing.save()
            created = True
            print(f"✓ Ingrediente creado: {ing_data['name_es']}")

        created_ingr.append(ing)

    return created_ingr

def create_products(categories):
    products = [
        # Para Picar
        {
            'category': 'Para Picar',
            'name_es': 'Patatas Fritas',
            'name_en': 'French Fries',
            'price': 4.00,
            'description_es': '',
            'description_en': '',
        },
        {
            'category': 'Para Picar',
            'name_es': 'Patatas Gratinadas',
            'name_en': 'Gratin Potatoes',
            'price': 5.00,
            'description_es': 'Salsa de yogurt, barbacoa o alioli, carne de kebab y queso gratinado',
            'description_en': 'Yogurt, barbecue or aioli sauce, kebab meat and gratin cheese',
        },
        {
            'category': 'Para Picar',
            'name_es': 'Patatas Bravas',
            'name_en': 'Patatas Bravas',
            'price': 5.00,
            'description_es': 'Con alioli, queso y salsa brava',
            'description_en': 'With aioli, cheese and spicy sauce',
        },
        {
            'category': 'Para Picar',
            'name_es': 'Patatas Carbonara',
            'name_en': 'Carbonara Potatoes',
            'price': 7.00,
            'description_es': 'Con salsa carbonara, bacon, huevo a la plancha y queso gratinado',
            'description_en': 'With carbonara sauce, bacon, fried egg and gratin cheese',
        },
        {
            'category': 'Para Picar',
            'name_es': 'Nachos',
            'name_en': 'Nachos',
            'price': 8.00,
            'description_es': 'Nachos de maíz con salsa cheddar, queso y carne de kebab',
            'description_en': 'Corn nachos with cheddar sauce, cheese and kebab meat',
        },

        # Algo ligü-fusión
        {
            'category': 'Algo ligü-fusión',
            'name_es': 'Ensalada Equus',
            'name_en': 'Equus Salad',
            'price': 8.50,
            'description_es': 'Lechuga, tomate cherry, queso de cabra, pipas de girasol, pipas de calabaza y una lluvia de aceitunas negras. Con vinagreta de arándanos',
            'description_en': 'Lettuce, cherry tomato, goat cheese, sunflower seeds, pumpkin seeds and black olives. With cranberry vinaigrette',
        },
        {
            'category': 'Algo ligü-fusión',
            'name_es': 'Ensalada César',
            'name_en': 'Caesar Salad',
            'price': 8.50,
            'description_es': 'Lechuga, acompañado de tacos de pollo a la plancha, queso parmesano, tomate cherry, picatostes y salsa césar',
            'description_en': 'Lettuce, grilled chicken, parmesan cheese, cherry tomato, croutons and caesar dressing',
        },
        {
            'category': 'Algo ligü-fusión',
            'name_es': 'Ensalada de Pesto con bola de helado',
            'name_en': 'Pesto Salad with ice cream',
            'price': 10.00,
            'description_es': 'Especial de Temporada. Lechuga, queso fresco de cabra, tomate cherry, nueces, salsa pesto y bola de helado de limón',
            'description_en': 'Seasonal Special. Lettuce, fresh goat cheese, cherry tomato, walnuts, pesto sauce and lemon ice cream',
        },

        # Entre pan y pan
        {
            'category': 'Entre pan y pan',
            'name_es': 'Pepito Equus',
            'name_en': 'Equus Sandwich',
            'price': 4.00,
            'description_es': 'Atún, lechuga y salsa rosa',
            'description_en': 'Tuna, lettuce and pink sauce',
        },
        {
            'category': 'Entre pan y pan',
            'name_es': 'Pepito Serrano',
            'name_en': 'Serrano Sandwich',
            'price': 4.00,
            'description_es': 'Jamón serrano, rodajas de tomate, aceite o mayonesa',
            'description_en': 'Serrano ham, tomato slices, oil or mayonnaise',
        },
        {
            'category': 'Entre pan y pan',
            'name_es': 'Pepito Wili',
            'name_en': 'Wili Sandwich',
            'price': 4.50,
            'description_es': 'Filete de pollo y cinta de lomo, queso de cabra, tomate frito y albahaca',
            'description_en': 'Chicken fillet and pork loin, goat cheese, fried tomato and basil',
        },
        {
            'category': 'Entre pan y pan',
            'name_es': 'Pepito Anvir',
            'name_en': 'Anvir Sandwich',
            'price': 5.50,
            'description_es': 'Queso de cabra fresco a la plancha, jamón serrano, rodajas de tomate, aceite y orégano',
            'description_en': 'Grilled fresh goat cheese, serrano ham, tomato slices, oil and oregano',
        },
        {
            'category': 'Entre pan y pan',
            'name_es': 'Pepito Queso Fresco',
            'name_en': 'Fresh Cheese Sandwich',
            'price': 5.00,
            'description_es': 'Queso fresco, rodajas de tomate y aceite',
            'description_en': 'Fresh cheese, tomato slices and oil',
        },
        {
            'category': 'Entre pan y pan',
            'name_es': 'Perrito Caliente',
            'name_en': 'Hot Dog',
            'price': 5.00,
            'description_es': 'Salchicha, salsa de cheddar, queso, cebolla frita, mostaza, ketchup, mayonesa y patatas paja en su interior',
            'description_en': 'Sausage, cheddar sauce, cheese, fried onion, mustard, ketchup, mayonnaise and crispy potatoes inside',
        },
        {
            'category': 'Entre pan y pan',
            'name_es': 'Sandwich mixto',
            'name_en': 'Mixed Sandwich',
            'price': 4.00,
            'description_es': '',
            'description_en': '',
        },
        {
            'category': 'Entre pan y pan',
            'name_es': 'Sandwich vegetal',
            'name_en': 'Veggie Sandwich',
            'price': 4.50,
            'description_es': 'York, queso, mayonesa, lechuga y tomate',
            'description_en': 'Ham, cheese, mayonnaise, lettuce and tomato',
        },

        # Hamburguesas
        {
            'category': 'Hamburguesas',
            'name_es': 'Hamburguesa de Pollo',
            'name_en': 'Chicken Burger',
            'price': 4.50,
            'description_es': 'Con mayonesa, lechuga, tomate y cebolla',
            'description_en': 'With mayonnaise, lettuce, tomato and onion',
        },
        {
            'category': 'Hamburguesas',
            'name_es': 'Hamburguesa de Cerdo',
            'name_en': 'Pork Burger',
            'price': 4.50,
            'description_es': 'Con mayonesa, lechuga, tomate y cebolla',
            'description_en': 'With mayonnaise, lettuce, tomato and onion',
        },
        {
            'category': 'Hamburguesas',
            'name_es': 'Hamburguesa Vegana',
            'name_en': 'Vegan Burger',
            'price': 5.00,
            'description_es': 'Con mayonesa, lechuga, tomate y cebolla',
            'description_en': 'With mayonnaise, lettuce, tomato and onion',
        },
        {
            'category': 'Hamburguesas',
            'name_es': 'Especial del día',
            'name_en': 'Special of the day',
            'price': 5.00,
            'description_es': 'Con mayonesa, lechuga, tomate y cebolla',
            'description_en': 'With mayonnaise, lettuce, tomato and onion',
        },
        {
            'category': 'Hamburguesas',
            'name_es': 'Super Burger',
            'name_en': 'Super Burger',
            'price': 8.50,
            'description_es': 'Con mayonesa, lechuga, tomate y cebolla',
            'description_en': 'With mayonnaise, lettuce, tomato and onion',
        },
        {
            'category': 'Hamburguesas',
            'name_es': 'Burger a la Barbacoa',
            'name_en': 'BBQ Burger',
            'price': 7.00,
            'description_es': 'Ternera + BBQ + Bacon con huevo, lechuga, cebolla crujiente, tomate e inyección de queso cheddar',
            'description_en': 'Beef + BBQ + Bacon with egg, lettuce, crispy onion, tomato and cheddar cheese injection',
        },

        # Montaditos
        {
            'category': 'Montaditos',
            'name_es': 'Montadito Cinta de lomo',
            'name_en': 'Pork Loin Montadito',
            'price': 4.50,
            'description_es': 'Con mayonesa, lechuga y tomate',
            'description_en': 'With mayonnaise, lettuce and tomato',
        },
        {
            'category': 'Montaditos',
            'name_es': 'Montadito Filete de Pollo',
            'name_en': 'Chicken Montadito',
            'price': 4.50,
            'description_es': 'Con mayonesa, lechuga y tomate',
            'description_en': 'With mayonnaise, lettuce and tomato',
        },
        {
            'category': 'Montaditos',
            'name_es': 'Montadito Lomo Adobado',
            'name_en': 'Marinated Pork Montadito',
            'price': 4.50,
            'description_es': 'Con mayonesa, lechuga y tomate',
            'description_en': 'With mayonnaise, lettuce and tomato',
        },

        # Camperos
        {
            'category': 'Camperos',
            'name_es': 'Campero Mixto',
            'name_en': 'Mixed Campero',
            'price': 4.50,
            'description_es': 'Con mayonesa, lechuga y tomate',
            'description_en': 'With mayonnaise, lettuce and tomato',
        },
        {
            'category': 'Camperos',
            'name_es': 'Campero Filete de Pollo',
            'name_en': 'Chicken Campero',
            'price': 4.50,
            'description_es': 'Con mayonesa, lechuga y tomate',
            'description_en': 'With mayonnaise, lettuce and tomato',
        },
        {
            'category': 'Camperos',
            'name_es': 'Campero Pollo Asado',
            'name_en': 'Roasted Chicken Campero',
            'price': 4.50,
            'description_es': 'Con mayonesa, lechuga y tomate',
            'description_en': 'With mayonnaise, lettuce and tomato',
        },
        {
            'category': 'Camperos',
            'name_es': 'Campero Cinta de Lomo',
            'name_en': 'Pork Loin Campero',
            'price': 4.50,
            'description_es': 'Con mayonesa, lechuga y tomate',
            'description_en': 'With mayonnaise, lettuce and tomato',
        },
        {
            'category': 'Camperos',
            'name_es': 'Campero Kebab',
            'name_en': 'Kebab Campero',
            'price': 5.00,
            'description_es': 'Con mayonesa, lechuga y tomate',
            'description_en': 'With mayonnaise, lettuce and tomato',
        },
        {
            'category': 'Camperos',
            'name_es': 'Campero Bacon',
            'name_en': 'Bacon Campero',
            'price': 4.50,
            'description_es': 'Con mayonesa, lechuga y tomate',
            'description_en': 'With mayonnaise, lettuce and tomato',
        },
        {
            'category': 'Camperos',
            'name_es': 'Campero Atún',
            'name_en': 'Tuna Campero',
            'price': 5.00,
            'description_es': 'Con mayonesa, lechuga y tomate',
            'description_en': 'With mayonnaise, lettuce and tomato',
        },
        {
            'category': 'Camperos',
            'name_es': 'Campero Huevo',
            'name_en': 'Egg Campero',
            'price': 4.50,
            'description_es': 'Con mayonesa, lechuga y tomate',
            'description_en': 'With mayonnaise, lettuce and tomato',
        },

        # Serranitos
        {
            'category': 'Serranitos',
            'name_es': 'Serranito Pollo',
            'name_en': 'Chicken Serranito',
            'price': 5.00,
            'description_es': 'Serrano, pimiento y alioli a mayonesa',
            'description_en': 'Serrano ham, pepper and aioli mayonnaise',
        },
        {
            'category': 'Serranitos',
            'name_es': 'Serranito Lomo',
            'name_en': 'Pork Serranito',
            'price': 5.00,
            'description_es': 'Serrano, pimiento y alioli a mayonesa',
            'description_en': 'Serrano ham, pepper and aioli mayonnaise',
        },

        # Combinados
        {
            'category': 'Combinados',
            'name_es': 'Combinado de kebab o pollo asado',
            'name_en': 'Kebab or roasted chicken combo',
            'price': 9.00,
            'description_es': 'Torre de trigo, lechuga, tomate, cebolla y patatas fritas. Elige tu salsa: yogur, barbacoa, césar o brava',
            'description_en': 'Wheat tower, lettuce, tomato, onion and french fries. Choose your sauce: yogurt, barbecue, caesar or spicy',
        },
    ]

    count = 0
    for prod_data in products:
        cat = categories[prod_data['category']]

        existing = Product.objects.filter(translations__name=prod_data['name_es']).first()

        if existing:
            prod = existing
            created = False
        else:
            prod = Product.objects.create(price=prod_data['price'], available=True)
            prod.set_current_language('es')
            prod.name = prod_data['name_es']
            prod.description = prod_data['description_es']
            prod.save()

            prod.set_current_language('en')
            prod.name = prod_data['name_en']
            prod.description = prod_data['description_en']
            prod.save()

            prod.categories.add(cat)
            count += 1
            print(f"✓ Producto creado: {prod_data['name_es']} - €{prod_data['price']}")

    return count

def main():
    print("=" * 60)
    print("CARGANDO MENÚ DEL RESTAURANTE")
    print("=" * 60)

    print("\n1. Creando categorías...")
    categories = create_categories()

    print("\n2. Creando ingredientes extras...")
    create_ingredients()

    print("\n3. Creando productos...")
    count = create_products(categories)

    print("\n" + "=" * 60)
    print(f"✓ COMPLETADO: {count} productos creados")
    print("=" * 60)

if __name__ == '__main__':
    main()
