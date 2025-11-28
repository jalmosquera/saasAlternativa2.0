#!/usr/bin/env python
"""Script completo para cargar TODOS los datos del menú según las cartas actualizadas."""
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
    'jamón cocido': '🍖',
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
    'carne argentina': '🥩',
    'kebab': '🥙',
    'kebab de pollo': '🥙',
    'atún': '🐟',
    'salmón': '🐟',
    'gambas': '🦐',
    'calamares': '🦑',
    'boquerones': '🐟',
    'chicharros': '🐟',
    'anchoas': '🐟',
    'pepperoni': '🍕',
    'salami': '🥓',
    'salchicha': '🌭',
    'chorizo': '🌭',

    # Quesos
    'queso': '🧀',
    'queso de cabra': '🧀',
    'queso fresco de cabra': '🧀',
    'cheddar': '🧀',
    'mozzarella': '🧀',
    'parmesano': '🧀',
    'queso azul': '🧀',
    'queso de oveja': '🧀',

    # Vegetales
    'lechuga': '🥬',
    'tomate': '🍅',
    'tomate natural': '🍅',
    'tomate cherry': '🍅',
    'cebolla': '🧅',
    'cebolla frita': '🧅',
    'pepinillo': '🥒',
    'pepinillos': '🥒',
    'pimiento': '🌶️',
    'pimiento verde': '🫑',
    'pimiento rojo': '🫑',
    'jalapeños': '🌶️',
    'aguacate': '🥑',
    'champiñones': '🍄',
    'aceituna': '🫒',
    'aceituna negra': '🫒',
    'aceitunas': '🫒',
    'alcaparras': '🫒',
    'espárragos': '🌿',
    'rúcula': '🥬',
    'canónigos': '🥬',
    'zanahoria': '🥕',
    'maíz': '🌽',
    'calabaza': '🎃',
    'albahaca': '🌿',
    'orégano': '🌿',
    'ajo': '🧄',

    # Otros
    'huevo': '🥚',
    'piña': '🍍',
    'manzana': '🍎',
    'mango': '🥭',
    'nueces': '🥜',
    'almendras': '🥜',
    'pipas': '🌻',
    'pipas de girasol': '🌻',
    'pipas de calabaza': '🎃',
    'quinoa': '🌾',
    'patatas fritas': '🍟',
    'patata': '🥔',
    'pan': '🍞',
    'trufa': '🍄',

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
    'salsa carbonara': '🥫',
    'salsa picante': '🥫',
    'ketchup': '🥫',
    'mostaza': '🥫',
    'chimichurri': '🥫',
    'aceite de oliva': '🫒',
    'vinagre balsámico': '🥫',
    'vinagreta': '🥫',
}


def get_icon(ingredient_name):
    """Obtiene el icono para un ingrediente."""
    return INGREDIENT_ICONS.get(ingredient_name.lower(), '🍽️')


def create_ingredient(name_es, name_en=None, be_extra=False, price=0.50):
    """Crea o actualiza un ingrediente."""
    if name_en is None:
        name_en = name_es

    icon = get_icon(name_es)

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

    category = Category.objects.filter(
        translations__name=name_es,
        translations__language_code='es'
    ).first()

    if not category:
        category = Category.objects.create()

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

    product.set_current_language('es')
    product.name = name_es
    product.description = description_es
    product.save()

    product.set_current_language('en')
    product.name = name_en
    product.description = description_en
    product.save()

    product.categories.clear()
    product.categories.add(category)

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
    print("=" * 70)
    print("CARGANDO MENÚ COMPLETO DE ALTERNATIVA 2.0")
    print("=" * 70)

    with transaction.atomic():

        # ==================== CREAR INGREDIENTES ====================
        print("\n1. Creando ingredientes...")

        # Todos los ingredientes que aparecen en las cartas
        all_ingredients = [
            # Carnes
            'pollo', 'bacon', 'jamón york', 'jamón serrano', 'jamón ibérico', 'jamón cocido',
            'ternera', 'lomo', 'cinta de lomo', 'kebab', 'kebab de pollo', 'atún', 'salmón',
            'gambas', 'calamares', 'boquerones', 'chicharros', 'anchoas',
            'pepperoni', 'salami', 'salchicha', 'chorizo',
            'costillas', 'secreto ibérico', 'presa ibérica', 'pluma ibérica',
            'solomillo ibérico', 'solomillo de ternera', 'carne picada', 'carne argentina',

            # Quesos
            'queso', 'queso de cabra', 'queso fresco de cabra', 'cheddar', 'mozzarella',
            'parmesano', 'queso azul', 'queso de oveja',

            # Vegetales
            'lechuga', 'tomate', 'tomate natural', 'tomate cherry', 'cebolla', 'cebolla frita',
            'pepinillo', 'pepinillos', 'pimiento verde', 'pimiento rojo', 'pimiento', 'jalapeños',
            'aguacate', 'champiñones', 'aceituna negra', 'aceitunas', 'alcaparras',
            'espárragos', 'rúcula', 'canónigos', 'zanahoria', 'maíz', 'calabaza',
            'albahaca', 'orégano', 'ajo',

            # Otros
            'huevo', 'piña', 'manzana', 'mango', 'nueces', 'almendras',
            'pipas de girasol', 'pipas de calabaza', 'quinoa',
            'patatas fritas', 'patata', 'pan', 'trufa',

            # Salsas
            'alioli', 'mayonesa', 'salsa barbacoa', 'salsa 2.0', 'salsa yogurt',
            'salsa césar', 'salsa argentina', 'salsa cheddar', 'salsa brava',
            'salsa rosa', 'salsa carbonara', 'salsa picante',
            'ketchup', 'mostaza', 'chimichurri', 'aceite de oliva', 'vinagre balsámico',
            'vinagreta',
        ]

        for ing in all_ingredients:
            create_ingredient(ing, be_extra=False)

        print(f"  ✓ {len(all_ingredients)} ingredientes base creados")

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

        print(f"  ✓ Ingredientes extra configurados")


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

        # ========== ENTRANTES ==========
        print("\n  → Entrantes...")

        create_product(
            'Patata de Jamón Ibérico',
            'Iberian Ham Potato',
            10.50,
            categories['entrantes'],
            ['patatas fritas', 'jamón ibérico'],
            'Patatas fritas con jamón ibérico',
            'French fries with Iberian ham'
        )
        product_count += 1

        create_product(
            'Croquetas',
            'Croquettes',
            12.00,
            categories['entrantes'],
            ['jamón serrano'],
            'Croquetas caseras (4 unidades)',
            'Homemade croquettes (4 units)'
        )
        product_count += 1

        create_product(
            'Bombas de patata (6 unidades)',
            'Potato Bombs (6 units)',
            12.00,
            categories['entrantes'],
            ['patata', 'carne picada'],
            'Bombas de patata rellenas (6 unidades)',
            'Stuffed potato bombs (6 units)'
        )
        product_count += 1

        create_product(
            'Patata de Pollo (6 unidades)',
            'Chicken Potato (6 units)',
            12.00,
            categories['entrantes'],
            ['patatas fritas', 'pollo'],
            'Patatas con pollo (6 unidades)',
            'Potatoes with chicken (6 units)'
        )
        product_count += 1

        create_product(
            'Gambas al ajillo',
            'Garlic Prawns',
            14.50,
            categories['entrantes'],
            ['gambas', 'ajo', 'aceite de oliva'],
            'Gambas al ajillo',
            'Garlic prawns'
        )
        product_count += 1

        create_product(
            'Tabla de Quesos (6 unidades)',
            'Cheese Board (6 units)',
            10.00,
            categories['entrantes'],
            ['queso', 'queso de cabra', 'queso azul'],
            'Tabla de quesos variados (6 unidades)',
            'Assorted cheese board (6 units)'
        )
        product_count += 1


        # ========== ENSALADAS ==========
        print("  → Ensaladas...")

        create_product(
            'MISTA',
            'MIXED SALAD',
            10.50,
            categories['ensaladas'],
            ['lechuga', 'tomate', 'cebolla', 'canónigos', 'zanahoria', 'maíz',
             'aceituna negra', 'pipas de calabaza', 'pipas de girasol', 'vinagreta'],
            'Lechuga, tomate, cebolla, canónigos, zanahoria, maíz y aliño con vinagreta de aceitunas negras, pipas de calabaza y pipas de girasol',
            'Lettuce, tomato, onion, lamb\'s lettuce, carrot, corn and vinaigrette with black olives, pumpkin and sunflower seeds'
        )
        product_count += 1

        create_product(
            'ENSALADA DE QUINOA',
            'QUINOA SALAD',
            10.50,
            categories['ensaladas'],
            ['quinoa', 'tomate', 'cebolla', 'parmesano', 'aguacate'],
            'Quinoa cocida, tomate, cebolla, parmesano y aguacate',
            'Cooked quinoa, tomato, onion, parmesan and avocado'
        )
        product_count += 1

        create_product(
            'TOMATE CON QUESO DE CABRA',
            'TOMATO WITH GOAT CHEESE',
            12.00,
            categories['ensaladas'],
            ['tomate', 'queso fresco de cabra', 'pipas de calabaza', 'nueces', 'vinagre balsámico', 'aceite de oliva', 'orégano'],
            'Tomate con queso de cabra, pipas de calabaza, nueces, reducción de vinagre balsámico, aceite de oliva virgen extra y orégano',
            'Tomato with goat cheese, pumpkin seeds, walnuts, balsamic vinegar reduction, extra virgin olive oil and oregano'
        )
        product_count += 1

        create_product(
            'TROPICAL',
            'TROPICAL',
            12.00,
            categories['ensaladas'],
            ['lechuga', 'bacon', 'atún', 'pollo', 'mango', 'piña', 'manzana', 'nueces',
             'queso de cabra', 'tomate cherry', 'parmesano', 'salsa césar'],
            'Lechuga, bacon, atún o pollo, vinagreta de mango, piña, manzana, nueces, queso de cabra, tomate cherry y parmesano con salsa césar',
            'Lettuce, bacon, tuna or chicken, mango vinaigrette, pineapple, apple, walnuts, goat cheese, cherry tomato and parmesan with caesar dressing'
        )
        product_count += 1

        create_product(
            'CAPRESE',
            'CAPRESE',
            10.00,
            categories['ensaladas'],
            ['tomate', 'mozzarella', 'albahaca', 'aguacate', 'aceite de oliva'],
            'Tomate, mozzarella, albahaca, láminas de aguacate y aceite de oliva',
            'Tomato, mozzarella, basil, avocado slices and olive oil'
        )
        product_count += 1


        # ========== BURGUER 2.0 ==========
        print("  → Burguer 2.0...")

        create_product(
            'BURGUER 2.0',
            'BURGER 2.0',
            12.00,
            categories['burguer'],
            ['carne picada', 'bacon', 'queso', 'tomate', 'cebolla', 'lechuga', 'pepinillos', 'salsa 2.0'],
            'Burger de 200g con bacon, queso, tomate, cebolla, lechuga, pepinillos y salsa 2.0',
            '200g beef burger with bacon, cheese, tomato, onion, lettuce, pickles and 2.0 sauce'
        )
        product_count += 1

        create_product(
            'CÉSAR',
            'CAESAR',
            12.00,
            categories['burguer'],
            ['carne picada', 'ternera', 'lechuga', 'tomate', 'queso', 'salsa césar', 'bacon', 'parmesano'],
            'Medallón de ternera, lechuga, tomate, queso, salsa césar, bacon y queso parmesano',
            'Beef medallion, lettuce, tomato, cheese, caesar sauce, bacon and parmesan cheese'
        )
        product_count += 1

        create_product(
            'GOKU',
            'GOKU',
            12.00,
            categories['burguer'],
            ['carne picada', 'bacon', 'queso', 'cebolla frita', 'lechuga'],
            'Hamburguesa doble, bacon doble, queso doble, cebolla frita, lechuga y salsa especial',
            'Double burger, double bacon, double cheese, fried onion, lettuce and special sauce'
        )
        product_count += 1


        # ========== ENROLLADOS ==========
        print("  → Enrollados...")

        create_product(
            'COMPLETO',
            'COMPLETE',
            0.0,
            categories['enrollados'],
            ['lechuga', 'tomate', 'cebolla', 'queso', 'kebab de pollo', 'patatas fritas', 'salsa yogurt', 'salsa brava'],
            'Lechuga, tomate, cebolla, queso, kebab de pollo, patata frita y salsa yogurt o brava',
            'Lettuce, tomato, onion, cheese, chicken kebab, french fries and yogurt or spicy sauce'
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
            ['kebab de pollo', 'lechuga', 'tomate', 'patatas fritas', 'salsa yogurt', 'salsa brava', 'salsa césar', 'alioli'],
            'Kebab de pollo con ensalada y patatas fritas, salsa a elegir: yogurt, brava, césar o alioli',
            'Chicken kebab with salad and french fries, choice of sauce: yogurt, spicy, caesar or aioli'
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
            'Kebab, bacon, queso, tomate y salsa argentina',
            'Kebab, bacon, cheese, tomato and Argentinian sauce'
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


        # ========== PIZZAS ==========
        print("  → Pizzas...")

        # Pizza MARGARITA
        create_product(
            'MARGARITA',
            'MARGARITA',
            9.00,
            categories['pizzas'],
            ['tomate natural', 'mozzarella', 'orégano'],
            'Tomate natural, mozzarella y orégano',
            'Natural tomato, mozzarella and oregano'
        )
        product_count += 1

        # Pizza BÁSICA
        create_product(
            'BÁSICA',
            'BASIC',
            7.00,
            categories['pizzas'],
            ['tomate', 'mozzarella', 'jamón york'],
            'Tomate, mozzarella y jamón york',
            'Tomato, mozzarella and york ham'
        )
        product_count += 1

        # Pizza BARBACOA
        create_product(
            'BARBACOA',
            'BARBECUE',
            10.50,
            categories['pizzas'],
            ['mozzarella', 'pollo', 'bacon', 'cebolla', 'pimiento rojo', 'salsa barbacoa'],
            'Mozzarella, pollo, bacon, cebolla, pimiento rojo y salsa barbacoa',
            'Mozzarella, chicken, bacon, onion, red pepper and barbecue sauce'
        )
        product_count += 1

        # Pizza CARBONARA
        create_product(
            'CARBONARA',
            'CARBONARA',
            10.50,
            categories['pizzas'],
            ['mozzarella', 'bacon', 'huevo', 'cebolla', 'salsa carbonara'],
            'Mozzarella, bacon, huevo, cebolla y salsa carbonara',
            'Mozzarella, bacon, egg, onion and carbonara sauce'
        )
        product_count += 1

        # Pizza ESPECIAL 2
        create_product(
            'ESPECIAL 2',
            'SPECIAL 2',
            10.50,
            categories['pizzas'],
            ['tomate', 'mozzarella', 'jamón york', 'champiñones', 'huevo'],
            'Tomate, mozzarella, jamón york, champiñones y huevo',
            'Tomato, mozzarella, york ham, mushrooms and egg'
        )
        product_count += 1

        # Pizza PEPPERONI
        create_product(
            'PEPPERONI',
            'PEPPERONI',
            10.50,
            categories['pizzas'],
            ['mozzarella', 'pepperoni', 'orégano'],
            'Mozzarella, pepperoni y orégano',
            'Mozzarella, pepperoni and oregano'
        )
        product_count += 1

        # Pizza VEGETAL
        create_product(
            'VEGETAL',
            'VEGETARIAN',
            9.00,
            categories['pizzas'],
            ['mozzarella', 'tomate', 'cebolla', 'pimiento verde', 'champiñones', 'aceitunas'],
            'Mozzarella, tomate, cebolla, pimiento verde, champiñones y aceitunas',
            'Mozzarella, tomato, onion, green pepper, mushrooms and olives'
        )
        product_count += 1

        # Pizza JAMÓN CHAMPIÑONES
        create_product(
            'JAMÓN CHAMPIÑONES',
            'HAM MUSHROOMS',
            9.00,
            categories['pizzas'],
            ['mozzarella', 'jamón york', 'champiñones'],
            'Mozzarella, jamón york y champiñones',
            'Mozzarella, york ham and mushrooms'
        )
        product_count += 1

        # Pizza HAWAIANA
        create_product(
            'HAWAIANA',
            'HAWAIIAN',
            10.50,
            categories['pizzas'],
            ['tomate natural', 'mozzarella', 'jamón york', 'piña'],
            'Tomate natural, mozzarella, jamón york y piña',
            'Natural tomato, mozzarella, york ham and pineapple'
        )
        product_count += 1

        # Pizza CUATRO QUESOS
        create_product(
            'CUATRO QUESOS',
            'FOUR CHEESES',
            10.50,
            categories['pizzas'],
            ['mozzarella', 'parmesano', 'queso azul', 'queso de cabra'],
            'Mozzarella, parmesano, queso azul y queso de cabra',
            'Mozzarella, parmesan, blue cheese and goat cheese'
        )
        product_count += 1

        # Pizza DIÁVOLA
        create_product(
            'DIÁVOLA',
            'DEVIL',
            10.50,
            categories['pizzas'],
            ['mozzarella', 'salami', 'chorizo', 'jalapeños', 'salsa picante'],
            'Mozzarella, salami, chorizo picante y jalapeños',
            'Mozzarella, salami, spicy chorizo and jalapeños'
        )
        product_count += 1

        # Pizza CAPRESE
        create_product(
            'CAPRESE',
            'CAPRESE',
            10.00,
            categories['pizzas'],
            ['mozzarella', 'tomate natural', 'albahaca', 'aceite de oliva'],
            'Mozzarella, tomate natural, albahaca y aceite de oliva',
            'Mozzarella, natural tomato, basil and olive oil'
        )
        product_count += 1

        # Pizza FUNGI
        create_product(
            'FUNGI',
            'FUNGI',
            10.00,
            categories['pizzas'],
            ['mozzarella', 'champiñones', 'trufa', 'parmesano'],
            'Mozzarella, champiñones, trufa y parmesano',
            'Mozzarella, mushrooms, truffle and parmesan'
        )
        product_count += 1

        # Pizza FUENTE EL CARESAL
        create_product(
            'FUENTE EL CARESAL',
            'FUENTE EL CARESAL',
            10.00,
            categories['pizzas'],
            ['mozzarella', 'jamón serrano', 'rúcula', 'parmesano', 'tomate cherry', 'cebolla'],
            'Mozzarella, jamón serrano, rúcula, parmesano, tomate cherry y cebolla',
            'Mozzarella, serrano ham, arugula, parmesan, cherry tomato and onion'
        )
        product_count += 1

        # Pizza MARINARA
        create_product(
            'MARINARA',
            'MARINARA',
            10.50,
            categories['pizzas'],
            ['tomate', 'ajo', 'orégano', 'albahaca', 'aceite de oliva'],
            'Tomate, ajo, orégano, albahaca y aceite de oliva',
            'Tomato, garlic, oregano, basil and olive oil'
        )
        product_count += 1

        # Pizza ROMANA
        create_product(
            'ROMANA',
            'ROMAN',
            10.50,
            categories['pizzas'],
            ['tomate', 'mozzarella', 'anchoas', 'alcaparras', 'orégano'],
            'Tomate, mozzarella, anchoas, alcaparras y orégano',
            'Tomato, mozzarella, anchovies, capers and oregano'
        )
        product_count += 1

        # Pizza POLLO CESAR
        create_product(
            'POLLO CESAR',
            'CHICKEN CAESAR',
            10.50,
            categories['pizzas'],
            ['mozzarella', 'pollo', 'lechuga', 'parmesano', 'salsa césar'],
            'Mozzarella, pollo, lechuga, parmesano y salsa césar',
            'Mozzarella, chicken, lettuce, parmesan and caesar sauce'
        )
        product_count += 1

        # Pizza CAMPESINA ARGENTINA
        create_product(
            'CAMPESINA ARGENTINA',
            'ARGENTINIAN COUNTRY',
            10.50,
            categories['pizzas'],
            ['mozzarella', 'carne argentina', 'jamón cocido', 'tomate', 'cebolla', 'chimichurri'],
            'Mozzarella, carne argentina, jamón cocido, tomate, cebolla y chimichurri',
            'Mozzarella, argentinian beef, cooked ham, tomato, onion and chimichurri'
        )
        product_count += 1

        # Pizza ALOHA
        create_product(
            'ALOHA',
            'ALOHA',
            10.50,
            categories['pizzas'],
            ['mozzarella', 'piña', 'bacon', 'tomate', 'cebolla'],
            'Mozzarella, piña, bacon, tomate y cebolla',
            'Mozzarella, pineapple, bacon, tomato and onion'
        )
        product_count += 1

        # Pizza SICILIANA
        create_product(
            'SICILIANA',
            'SICILIAN',
            11.20,
            categories['pizzas'],
            ['mozzarella', 'anchoas', 'alcaparras', 'cebolla', 'aceitunas', 'tomate'],
            'Mozzarella, anchoas, alcaparras, cebolla, aceitunas y tomate',
            'Mozzarella, anchovies, capers, onion, olives and tomato'
        )
        product_count += 1

        # Pizza LAS CASAS 2.0
        create_product(
            'LAS CASAS 2.0',
            'LAS CASAS 2.0',
            10.00,
            categories['pizzas'],
            ['mozzarella', 'queso de cabra', 'nueces', 'rúcula', 'tomate', 'jamón serrano'],
            'Mozzarella, queso de cabra, nueces, rúcula, tomate y jamón serrano',
            'Mozzarella, goat cheese, walnuts, arugula, tomato and serrano ham'
        )
        product_count += 1

        # Pizza TROPICAL
        create_product(
            'TROPICAL',
            'TROPICAL',
            10.50,
            categories['pizzas'],
            ['mozzarella', 'jamón york', 'piña', 'cebolla', 'champiñones', 'bacon'],
            'Mozzarella, jamón york, piña, cebolla, champiñones y bacon',
            'Mozzarella, york ham, pineapple, onion, mushrooms and bacon'
        )
        product_count += 1

        # Pizza PORTUGUESA
        create_product(
            'PORTUGUESA',
            'PORTUGUESE',
            12.00,
            categories['pizzas'],
            ['tomate', 'mozzarella', 'jamón cocido', 'huevo', 'cebolla', 'pimiento', 'aceitunas'],
            'Tomate, mozzarella, jamón cocido, huevo, cebolla, pimiento y aceitunas',
            'Tomato, mozzarella, cooked ham, egg, onion, pepper and olives'
        )
        product_count += 1

        # Pizza SACIANTE
        create_product(
            'SACIANTE',
            'FILLING',
            10.00,
            categories['pizzas'],
            ['mozzarella', 'bacon', 'jamón york', 'chorizo', 'carne picada', 'salchicha'],
            'Mozzarella, bacon, jamón york, chorizo, carne picada y salchicha',
            'Mozzarella, bacon, york ham, chorizo, ground beef and sausage'
        )
        product_count += 1

        # Pizza CACCIATORE
        create_product(
            'CACCIATORE',
            'HUNTER',
            10.50,
            categories['pizzas'],
            ['mozzarella', 'salami', 'champiñones', 'cebolla', 'pimiento', 'aceitunas'],
            'Mozzarella, salami, champiñones, cebolla, pimiento y aceitunas',
            'Mozzarella, salami, mushrooms, onion, pepper and olives'
        )
        product_count += 1

        # Pizza DAKOTAZ
        create_product(
            'DAKOTAZ',
            'DAKOTAZ',
            10.50,
            categories['pizzas'],
            ['mozzarella', 'bacon', 'pollo', 'tomate', 'cebolla', 'jalapeños'],
            'Mozzarella, bacon, pollo, tomate, cebolla y jalapeños',
            'Mozzarella, bacon, chicken, tomato, onion and jalapeños'
        )
        product_count += 1

        # Pizza TRE MUSETTE
        create_product(
            'TRE MUSETTE',
            'THREE MUSKETEERS',
            10.00,
            categories['pizzas'],
            ['mozzarella', 'jamón york', 'salami', 'bacon', 'champiñones', 'cebolla', 'pimiento'],
            'Mozzarella, jamón york, salami, bacon, champiñones, cebolla y pimiento',
            'Mozzarella, york ham, salami, bacon, mushrooms, onion and pepper'
        )
        product_count += 1

        # CALZONE
        create_product(
            'CALZONE',
            'CALZONE',
            10.50,
            categories['pizzas'],
            ['mozzarella', 'jamón york', 'tomate', 'champiñones', 'cebolla'],
            'Pizza cerrada con mozzarella, jamón york, tomate, champiñones y cebolla',
            'Closed pizza with mozzarella, york ham, tomato, mushrooms and onion'
        )
        product_count += 1


        # ========== TERNERA ==========
        print("  → Ternera...")

        create_product(
            'Costillas BBQ',
            'BBQ Ribs',
            0.0,
            categories['ternera'],
            ['costillas', 'salsa barbacoa'],
            'Costillas de ternera con salsa barbacoa (600g/400g)',
            'Beef ribs with BBQ sauce (600g/400g)'
        )
        product_count += 1

        create_product(
            'Solomillo de Ternera',
            'Beef Tenderloin',
            0.0,
            categories['ternera'],
            ['solomillo de ternera'],
            'Solomillo de ternera a la plancha (200g)',
            'Grilled beef tenderloin (200g)'
        )
        product_count += 1

        create_product(
            'Tataki de Ternera',
            'Beef Tataki',
            0.0,
            categories['ternera'],
            ['ternera'],
            'Tataki de ternera ligeramente sellado',
            'Lightly seared beef tataki'
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
            'Grilled Iberian pluma'
        )
        product_count += 1

        create_product(
            'Secreto Ibérico',
            'Iberian Secreto',
            0.0,
            categories['ibericos'],
            ['secreto ibérico'],
            'Secreto ibérico a la plancha',
            'Grilled Iberian secreto'
        )
        product_count += 1

        create_product(
            'Presa Ibérica',
            'Iberian Presa',
            0.0,
            categories['ibericos'],
            ['presa ibérica'],
            'Presa ibérica a la plancha',
            'Grilled Iberian presa'
        )
        product_count += 1

        create_product(
            'Solomillo Ibérico',
            'Iberian Tenderloin',
            0.0,
            categories['ibericos'],
            ['solomillo ibérico'],
            'Solomillo ibérico a la plancha',
            'Grilled Iberian tenderloin'
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

        create_product(
            'Alitas de Pollo',
            'Chicken Wings',
            0.0,
            categories['pollo'],
            ['pollo'],
            'Alitas de pollo crujientes',
            'Crispy chicken wings'
        )
        product_count += 1

        create_product(
            'Pechugas Asiáticas',
            'Asian Chicken',
            0.0,
            categories['pollo'],
            ['pollo'],
            'Pechugas de pollo estilo asiático',
            'Asian-style chicken breasts'
        )
        product_count += 1

        create_product(
            'Chuletón de Pollo',
            'Chicken T-Bone',
            0.0,
            categories['pollo'],
            ['pollo'],
            'Chuletón de pollo a la plancha',
            'Grilled chicken T-bone'
        )
        product_count += 1


        # ========== PESCADOS ==========
        print("  → Pescados...")

        create_product(
            'Calamares',
            'Squid',
            0.0,
            categories['pescados'],
            ['calamares'],
            'Calamares a la andaluza',
            'Andalusian-style squid'
        )
        product_count += 1

        create_product(
            'Chicharros Fritos (Pescadito)',
            'Fried Baby Jack',
            0.0,
            categories['pescados'],
            ['chicharros'],
            'Chicharros fritos pequeños',
            'Fried baby jack fish'
        )
        product_count += 1

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

        create_product(
            'Tataki de Atún',
            'Tuna Tataki',
            0.0,
            categories['pescados'],
            ['atún'],
            'Tataki de atún ligeramente sellado',
            'Lightly seared tuna tataki'
        )
        product_count += 1


        # ========== POSTRES ==========
        print("  → Postres...")

        create_product(
            'Postres del Día',
            'Daily Desserts',
            0.0,
            categories['postres'],
            [],
            'Preguntar postres del día',
            'Ask for daily desserts'
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
            ['patatas fritas', 'bacon', 'queso', 'salsa yogurt'],
            'Patatas, bacon, queso y salsa yogurt o picante',
            'Potatoes, bacon, cheese and yogurt or spicy sauce'
        )
        product_count += 1


        print(f"\n  ✓ {product_count} productos creados")

        print("\n" + "=" * 70)
        print("✓ MENÚ COMPLETO CARGADO CORRECTAMENTE")
        print("=" * 70)
        print(f"\nResumen final:")
        print(f"  - Categorías: {Category.objects.count()}")
        print(f"  - Ingredientes: {Ingredient.objects.count()}")
        print(f"  - Productos: {Product.objects.count()}")
        print("=" * 70)


if __name__ == '__main__':
    try:
        seed_database()
    except Exception as e:
        print(f"\n❌ Error al cargar los datos: {e}")
        import traceback
        traceback.print_exc()
