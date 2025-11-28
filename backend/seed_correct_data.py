#!/usr/bin/env python
"""Script para cargar los datos correctos del menú según las cartas actualizadas."""
import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product
from apps.categories.models import Category
from apps.ingredients.models import Ingredient
from django.db import transaction


# Iconos para ingredientes comunes
INGREDIENT_ICONS = {
    # Carnes
    'pollo': '🍗',
    'bacon': '🥓',
    'jamón york': '🍖',
    'jamón serrano': '🦵',
    'jamón ibérico': '🦵',
    'ternera': '🥩',
    'lomo': '🥩',
    'cinta de lomo': '🥩',
    'costillas': '🍖',
    'secreto ibérico': '🥩',
    'presa ibérica': '🥩',
    'pluma ibérica': '🥩',
    'solomillo ibérico': '🥩',
    'solomillo de ternera': '🥩',
    'carne picada': '🥩',
    'kebab': '🥙',
    'atún': '🐟',
    'salmón': '🐟',
    'gambas': '🦐',
    'calamares': '🦑',
    'boquerones': '🐟',

    # Quesos
    'queso': '🧀',
    'queso de cabra': '🧀',
    'cheddar': '🧀',
    'mozzarella': '🧀',
    'parmesano': '🧀',
    'queso azul': '🧀',
    'queso de oveja': '🧀',

    # Vegetales
    'lechuga': '🥬',
    'tomate': '🍅',
    'cebolla': '🧅',
    'pepinillo': '🥒',
    'pimiento': '🌶️',
    'pimiento verde': '🫑',
    'pimiento rojo': '🫑',
    'aguacate': '🥑',
    'champiñones': '🍄',
    'aceituna': '🫒',
    'aceituna negra': '🫒',
    'espárragos': '🌿',
    'rúcula': '🥬',
    'canónigos': '🥬',
    'zanahoria': '🥕',
    'maíz': '🌽',
    'calabaza': '🎃',

    # Otros
    'huevo': '🥚',
    'piña': '🍍',
    'nueces': '🥜',
    'almendras': '🥜',
    'pipas': '🌻',
    'patatas fritas': '🍟',
    'pan': '🍞',

    # Salsas
    'alioli': '🥫',
    'mayonesa': '🥫',
    'salsa barbacoa': '🥫',
    'salsa 2.0': '🥫',
    'salsa yogurt': '🥫',
    'salsa césar': '🥫',
    'salsa argentina': '🥫',
    'salsa cheddar': '🥫',
    'salsa brava': '🥫',
    'salsa rosa': '🥫',
    'ketchup': '🥫',
    'mostaza': '🥫',
}


def get_icon(ingredient_name):
    """Obtiene el icono para un ingrediente."""
    return INGREDIENT_ICONS.get(ingredient_name.lower(), '🍽️')


def create_ingredient(name_es, name_en=None, be_extra=False, price=0.50):
    """Crea o actualiza un ingrediente."""
    if name_en is None:
        name_en = name_es

    icon = get_icon(name_es)

    # Buscar si existe
    ingredient = Ingredient.objects.filter(
        translations__name=name_es,
        translations__language_code='es'
    ).first()

    if not ingredient:
        ingredient = Ingredient.objects.create(
            icon=icon,
            be_extra=be_extra,
            price=Decimal(str(price))
        )
    else:
        ingredient.icon = icon
        ingredient.be_extra = be_extra
        ingredient.price = Decimal(str(price))
        ingredient.save()

    # Establecer traducciones
    ingredient.set_current_language('es')
    ingredient.name = name_es
    ingredient.save()

    ingredient.set_current_language('en')
    ingredient.name = name_en
    ingredient.save()

    return ingredient


def create_category(name_es, name_en=None, description_es='', description_en=''):
    """Crea o actualiza una categoría."""
    if name_en is None:
        name_en = name_es

    # Buscar si existe
    category = Category.objects.filter(
        translations__name=name_es,
        translations__language_code='es'
    ).first()

    if not category:
        category = Category.objects.create()

    # Establecer traducciones
    category.set_current_language('es')
    category.name = name_es
    category.description = description_es
    category.save()

    category.set_current_language('en')
    category.name = name_en
    category.description = description_en
    category.save()

    return category


def create_product(name_es, name_en, price, category, ingredients_list, description_es='', description_en=''):
    """Crea o actualiza un producto."""

    # Buscar si existe
    product = Product.objects.filter(
        translations__name=name_es,
        translations__language_code='es'
    ).first()

    if not product:
        product = Product.objects.create(
            price=Decimal(str(price)),
            stock=100,
            available=True
        )
    else:
        product.price = Decimal(str(price))
        product.save()

    # Establecer traducciones
    product.set_current_language('es')
    product.name = name_es
    product.description = description_es
    product.save()

    product.set_current_language('en')
    product.name = name_en
    product.description = description_en
    product.save()

    # Asociar categoría
    product.categories.clear()
    product.categories.add(category)

    # Asociar ingredientes
    product.ingredients.clear()
    for ing_name in ingredients_list:
        ingredient = Ingredient.objects.filter(
            translations__name=ing_name,
            translations__language_code='es'
        ).first()
        if ingredient:
            product.ingredients.add(ingredient)

    product.save()
    return product


def seed_database():
    """Carga todos los datos correctos del menú."""
    print("=" * 60)
    print("CARGANDO DATOS CORRECTOS DEL MENÚ")
    print("=" * 60)

    with transaction.atomic():

        # ==================== CREAR INGREDIENTES ====================
        print("\n1. Creando ingredientes base...")

        # Ingredientes base (no extras)
        base_ingredients = [
            'pollo', 'bacon', 'jamón york', 'jamón serrano', 'jamón ibérico',
            'ternera', 'lomo', 'cinta de lomo', 'kebab', 'atún', 'salmón',
            'queso', 'queso de cabra', 'cheddar', 'mozzarella', 'parmesano',
            'lechuga', 'tomate', 'cebolla', 'pepinillo', 'pimiento verde',
            'huevo', 'piña', 'champiñones', 'aceituna negra',
            'alioli', 'mayonesa', 'salsa barbacoa', 'salsa 2.0', 'salsa yogurt',
            'salsa césar', 'salsa argentina', 'salsa cheddar', 'salsa brava',
            'salsa rosa', 'ketchup', 'mostaza',
            'patatas fritas', 'pimiento rojo', 'aguacate', 'rúcula',
            'espárragos', 'nueces', 'canónigos', 'zanahoria', 'maíz',
            'boquerones', 'gambas', 'calamares', 'queso azul', 'queso de oveja',
            'costillas', 'secreto ibérico', 'presa ibérica', 'pluma ibérica',
            'solomillo ibérico', 'solomillo de ternera', 'carne picada',
            'almendras', 'pipas', 'calabaza', 'pan'
        ]

        for ing in base_ingredients:
            create_ingredient(ing, be_extra=False)

        print(f"  ✓ {len(base_ingredients)} ingredientes base creados")

        # Ingredientes que pueden ser extras
        extra_ingredients = [
            ('huevo', 'egg', 0.50),
            ('bacon', 'bacon', 0.50),
            ('queso', 'cheese', 0.50),
            ('jamón serrano', 'serrano ham', 0.50),
            ('jamón york', 'york ham', 0.50),
            ('cheddar', 'cheddar', 0.50),
            ('queso de cabra', 'goat cheese', 0.50),
            ('aguacate', 'avocado', 0.50),
        ]

        for ing_es, ing_en, price in extra_ingredients:
            create_ingredient(ing_es, ing_en, be_extra=True, price=price)

        print(f"  ✓ {len(extra_ingredients)} ingredientes extra creados")


        # ==================== CREAR CATEGORÍAS ====================
        print("\n2. Creando categorías...")

        categories = {}

        categories['entrantes'] = create_category('Entrantes', 'Starters')
        categories['ensaladas'] = create_category('Ensaladas', 'Salads')
        categories['burguer'] = create_category('Burguer 2.0', 'Burger 2.0')
        categories['camperos'] = create_category('Camperos', 'Campero Sandwiches')
        categories['enrollados'] = create_category('Enrollados', 'Wraps')
        categories['pizzas'] = create_category('Pizzas', 'Pizzas')
        categories['ternera'] = create_category('Ternera', 'Beef')
        categories['ibericos'] = create_category('Ibéricos', 'Iberian Pork')
        categories['pollo'] = create_category('Pollo', 'Chicken')
        categories['pescados'] = create_category('Pescados', 'Fish')
        categories['postres'] = create_category('Postres 2.0', 'Desserts 2.0')
        categories['varios'] = create_category('Varios', 'Various')

        print(f"  ✓ {len(categories)} categorías creadas")


        # ==================== CREAR PRODUCTOS ====================
        print("\n3. Creando productos...")

        product_count = 0

        # ========== ENROLLADOS ==========
        print("\n  → Enrollados...")

        create_product(
            'COMPLETO',
            'COMPLETO',
            0.0,  # Sin precio visible en carta
            categories['enrollados'],
            ['lechuga', 'tomate', 'cebolla', 'queso', 'kebab', 'patatas fritas', 'salsa yogurt', 'salsa brava'],
            'Lechuga, tomate, cebolla, queso, kebab de pollo, patata frita, salsa yogurt o brava',
            'Lettuce, tomato, onion, cheese, chicken kebab, french fries, yogurt or spicy sauce'
        )
        product_count += 1

        create_product(
            'CUATRO QUESOS',
            'FOUR CHEESES',
            0.0,
            categories['enrollados'],
            ['lechuga', 'tomate', 'cebolla', 'queso de cabra', 'salsa yogurt', 'salsa brava'],
            'Lechuga, tomate, cebolla, 4 quesos de cabra, salsa yogurt y brava',
            'Lettuce, tomato, onion, 4 goat cheeses, yogurt and spicy sauce'
        )
        product_count += 1

        create_product(
            'COMBINADO DE KEBAB',
            'KEBAB COMBO',
            0.0,
            categories['enrollados'],
            ['kebab', 'lechuga', 'tomate', 'patatas fritas', 'salsa yogurt', 'salsa brava', 'salsa césar', 'alioli'],
            'Kebab de pollo con ensalada y patatas fritas, salsa a elegir: yogurt, brava, césar o alioli',
            'Chicken kebab with salad and french fries, choice of sauce: yogurt, spicy, caesar or aioli'
        )
        product_count += 1


        # ========== BURGUER 2.0 ==========
        print("  → Burguer 2.0...")

        create_product(
            'BURGUER 2.0',
            'BURGER 2.0',
            12.00,
            categories['burguer'],
            ['carne picada', 'bacon', 'queso', 'tomate', 'cebolla', 'lechuga', 'pepinillo', 'salsa 2.0'],
            'Burger de 200g con bacon, queso, tomate, cebolla, lechuga, pepinillos y salsa 2.0',
            '200g beef burger with bacon, cheese, tomato, onion, lettuce, pickles and 2.0 sauce'
        )
        product_count += 1


        # ========== CAMPEROS ==========
        print("  → Camperos...")

        create_product(
            'CLÁSICO',
            'CLASSIC',
            0.0,
            categories['camperos'],
            ['pollo', 'bacon', 'queso', 'lechuga', 'tomate', 'cebolla', 'alioli', 'salsa barbacoa'],
            'Pollo o bacon, queso, lechuga, tomate, cebolla, alioli o salsa barbacoa',
            'Chicken or bacon, cheese, lettuce, tomato, onion, aioli or barbecue sauce'
        )
        product_count += 1

        create_product(
            'VILCANAVRE',
            'VILCANAVRE',
            0.0,
            categories['camperos'],
            ['jamón york', 'queso', 'lechuga', 'tomate', 'cebolla', 'alioli'],
            'Jamón york, queso, lechuga, tomate, cebolla y alioli',
            'York ham, cheese, lettuce, tomato, onion and aioli'
        )
        product_count += 1

        create_product(
            'GALAPAGOS',
            'GALAPAGOS',
            0.0,
            categories['camperos'],
            ['atún', 'queso', 'lechuga', 'tomate', 'cebolla', 'alioli', 'mayonesa'],
            'Atún, queso, lechuga, tomate, cebolla, alioli y mayonesa',
            'Tuna, cheese, lettuce, tomato, onion, aioli and mayonnaise'
        )
        product_count += 1

        create_product(
            'SERRANIETO',
            'SERRANIETO',
            0.0,
            categories['camperos'],
            ['jamón serrano', 'pollo', 'pimiento verde', 'tomate', 'cebolla', 'alioli'],
            'Jamón serrano, pollo, pimiento verde, tomate, cebolla y alioli',
            'Serrano ham, chicken, green pepper, tomato, onion and aioli'
        )
        product_count += 1

        create_product(
            'QUITO',
            'QUITO',
            0.0,
            categories['camperos'],
            ['kebab', 'bacon', 'queso', 'tomate', 'salsa argentina'],
            'Kebab, bacon, queso, tomate, salsa argentina',
            'Kebab, bacon, cheese, tomato, argentinian sauce'
        )
        product_count += 1

        create_product(
            'SIPI LA PINA',
            'SIPI LA PINA',
            0.0,
            categories['camperos'],
            ['pollo', 'bacon', 'piña', 'huevo', 'pimiento verde', 'queso', 'salsa 2.0'],
            'Pollo, bacon, piña, huevo, pimiento verde, queso y salsa 2.0',
            'Chicken, bacon, pineapple, egg, green pepper, cheese and 2.0 sauce'
        )
        product_count += 1

        create_product(
            'CROMETTI',
            'CROMETTI',
            0.0,
            categories['camperos'],
            ['pollo', 'salsa cheddar', 'tomate', 'salsa barbacoa'],
            'Tiras de pollo crujiente, salsa cheddar, tomate y salsa barbacoa',
            'Crispy chicken strips, cheddar sauce, tomato and barbecue sauce'
        )
        product_count += 1


        # ========== PIZZAS (Ejemplos principales) ==========
        print("  → Pizzas...")

        create_product(
            'MARGARITA',
            'MARGARITA',
            9.00,
            categories['pizzas'],
            ['mozzarella', 'tomate'],
            'Mozzarella y tomate',
            'Mozzarella and tomato'
        )
        product_count += 1

        create_product(
            'BARBACOA',
            'BARBECUE',
            10.50,
            categories['pizzas'],
            ['mozzarella', 'pollo', 'bacon', 'cebolla', 'salsa barbacoa'],
            'Mozzarella, pollo, bacon, cebolla y salsa barbacoa',
            'Mozzarella, chicken, bacon, onion and barbecue sauce'
        )
        product_count += 1

        create_product(
            'CARBONARA',
            'CARBONARA',
            10.50,
            categories['pizzas'],
            ['mozzarella', 'bacon', 'huevo', 'cebolla'],
            'Mozzarella, bacon, huevo y cebolla',
            'Mozzarella, bacon, egg and onion'
        )
        product_count += 1


        # ========== ENTRANTES ==========
        print("  → Entrantes...")

        create_product(
            'Patata de Jamón Ibérico',
            'Iberian Ham Potato',
            10.50,
            categories['entrantes'],
            ['jamón ibérico', 'patatas fritas'],
            'Patatas fritas con jamón ibérico',
            'French fries with iberian ham'
        )
        product_count += 1

        create_product(
            'Croquetas',
            'Croquettes',
            0.0,
            categories['entrantes'],
            ['jamón serrano'],
            'Croquetas caseras',
            'Homemade croquettes'
        )
        product_count += 1


        # ========== ENSALADAS ==========
        print("  → Ensaladas...")

        create_product(
            'MISTA',
            'MIXED SALAD',
            10.50,
            categories['ensaladas'],
            ['lechuga', 'tomate', 'cebolla', 'zanahoria', 'maíz', 'aceituna negra'],
            'Lechuga, tomate, cebolla, zanahoria, maíz y aceitunas',
            'Lettuce, tomato, onion, carrot, corn and olives'
        )
        product_count += 1

        create_product(
            'CÉSAR',
            'CAESAR',
            12.00,
            categories['ensaladas'],
            ['lechuga', 'pollo', 'parmesano', 'salsa césar'],
            'Lechuga, pollo, parmesano y salsa césar',
            'Lettuce, chicken, parmesan and caesar dressing'
        )
        product_count += 1


        # ========== TERNERA ==========
        print("  → Ternera...")

        create_product(
            'Solomillo de Ternera',
            'Beef Tenderloin',
            0.0,
            categories['ternera'],
            ['solomillo de ternera'],
            'Solomillo de ternera a la plancha',
            'Grilled beef tenderloin'
        )
        product_count += 1


        # ========== IBÉRICOS ==========
        print("  → Ibéricos...")

        create_product(
            'Pluma Ibérica',
            'Iberian Pluma',
            0.0,
            categories['ibericos'],
            ['pluma ibérica'],
            'Pluma ibérica a la plancha',
            'Grilled iberian pluma'
        )
        product_count += 1

        create_product(
            'Secreto Ibérico',
            'Iberian Secreto',
            0.0,
            categories['ibericos'],
            ['secreto ibérico'],
            'Secreto ibérico a la plancha',
            'Grilled iberian secreto'
        )
        product_count += 1


        # ========== POLLO ==========
        print("  → Pollo...")

        create_product(
            'Pechuga de Pollo',
            'Chicken Breast',
            0.0,
            categories['pollo'],
            ['pollo'],
            'Pechuga de pollo a la plancha',
            'Grilled chicken breast'
        )
        product_count += 1


        # ========== PESCADOS ==========
        print("  → Pescados...")

        create_product(
            'Salmón a la Plancha',
            'Grilled Salmon',
            0.0,
            categories['pescados'],
            ['salmón'],
            'Salmón fresco a la plancha',
            'Fresh grilled salmon'
        )
        product_count += 1


        # ========== POSTRES ==========
        print("  → Postres...")

        create_product(
            'Tarta de Queso',
            'Cheesecake',
            5.00,
            categories['postres'],
            ['queso'],
            'Tarta de queso casera',
            'Homemade cheesecake'
        )
        product_count += 1


        # ========== VARIOS ==========
        print("  → Varios...")

        create_product(
            'Ración de Patatas',
            'Portion of Potatoes',
            0.0,
            categories['varios'],
            ['patatas fritas'],
            'Ración de patatas fritas',
            'Portion of french fries'
        )
        product_count += 1

        create_product(
            'Patatas Gratinadas',
            'Gratin Potatoes',
            0.0,
            categories['varios'],
            ['patatas fritas', 'queso'],
            'Patatas gratinadas con queso',
            'Gratin potatoes with cheese'
        )
        product_count += 1


        print(f"\n  ✓ {product_count} productos creados")

        print("\n" + "=" * 60)
        print("✓ DATOS CARGADOS CORRECTAMENTE")
        print("=" * 60)
        print(f"\nResumen:")
        print(f"  - Categorías: {Category.objects.count()}")
        print(f"  - Ingredientes: {Ingredient.objects.count()}")
        print(f"  - Productos: {Product.objects.count()}")


if __name__ == '__main__':
    try:
        seed_database()
    except Exception as e:
        print(f"\n❌ Error al cargar los datos: {e}")
        import traceback
        traceback.print_exc()
