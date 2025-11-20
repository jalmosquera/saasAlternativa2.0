"""
Management command to load the complete Equus menu (carta) into the database.

This command creates all categories, ingredients, and products for the restaurant menu
with bilingual support (Spanish and English).

Usage:
    python manage.py load_carta
"""

from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.categories.models import Category
from apps.ingredients.models import Ingredient
from apps.products.models import Product


class Command(BaseCommand):
    help = 'Load the complete Equus menu (carta) into the database'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to load carta...'))

        # Create categories
        self.stdout.write('Creating categories...')
        categories = self.create_categories()

        # Create ingredients
        self.stdout.write('Creating ingredients...')
        ingredients = self.create_ingredients()

        # Create products
        self.stdout.write('Creating products...')
        self.create_products(categories, ingredients)

        self.stdout.write(self.style.SUCCESS('✅ Carta loaded successfully!'))

    def create_categories(self):
        """Create all menu categories."""
        categories_data = [
            {
                'es': {'name': 'Para Picar', 'description': 'Deliciosos aperitivos para compartir'},
                'en': {'name': 'Appetizers', 'description': 'Delicious starters to share'}
            },
            {
                'es': {'name': 'Algo Light–Fusión', 'description': 'Opciones ligeras y saludables con un toque especial'},
                'en': {'name': 'Light Fusion', 'description': 'Light and healthy options with a special touch'}
            },
            {
                'es': {'name': 'Entre Pan y Pan', 'description': 'Bocadillos y sándwiches para todos los gustos'},
                'en': {'name': 'Sandwiches', 'description': 'Sandwiches for all tastes'}
            },
            {
                'es': {'name': 'Hamburguesas', 'description': 'Nuestras jugosas hamburguesas artesanales'},
                'en': {'name': 'Burgers', 'description': 'Our juicy artisan burgers'}
            },
            {
                'es': {'name': 'Montaditos', 'description': 'Montaditos recién preparados'},
                'en': {'name': 'Small Sandwiches', 'description': 'Freshly prepared small sandwiches'}
            },
            {
                'es': {'name': 'Camperos', 'description': 'Bocadillos camperos en pan especial'},
                'en': {'name': 'Camperos', 'description': 'Campero sandwiches on special bread'}
            },
            {
                'es': {'name': 'Serranitos', 'description': 'Tradicionales serranitos andaluces'},
                'en': {'name': 'Serranitos', 'description': 'Traditional Andalusian serranitos'}
            },
            {
                'es': {'name': 'Combinados', 'description': 'Platos combinados completos'},
                'en': {'name': 'Combo Plates', 'description': 'Complete combo plates'}
            },
        ]

        categories = {}
        for idx, cat_data in enumerate(categories_data, 1):
            category = Category.objects.create()
            category.set_current_language('es')
            category.name = cat_data['es']['name']
            category.description = cat_data['es']['description']
            category.set_current_language('en')
            category.name = cat_data['en']['name']
            category.description = cat_data['en']['description']
            category.save()
            categories[cat_data['es']['name']] = category
            self.stdout.write(f'  ✓ Created category: {cat_data["es"]["name"]}')

        return categories

    def create_ingredients(self):
        """Create all ingredients including extras."""
        ingredients_data = [
            # Básicos comunes
            {'es': 'Mayonesa', 'en': 'Mayonnaise', 'icon': '🥄', 'extra': False, 'price': '0.00'},
            {'es': 'Lechuga', 'en': 'Lettuce', 'icon': '🥬', 'extra': False, 'price': '0.00'},
            {'es': 'Tomate', 'en': 'Tomato', 'icon': '🍅', 'extra': False, 'price': '0.00'},
            {'es': 'Cebolla', 'en': 'Onion', 'icon': '🧅', 'extra': False, 'price': '0.00'},

            # Para Picar
            {'es': 'Salsa de yogurt', 'en': 'Yogurt sauce', 'icon': '🥛', 'extra': False, 'price': '0.00'},
            {'es': 'Salsa barbacoa', 'en': 'BBQ sauce', 'icon': '🍖', 'extra': False, 'price': '0.00'},
            {'es': 'Alioli', 'en': 'Aioli', 'icon': '🧄', 'extra': False, 'price': '0.00'},
            {'es': 'Carne de kebab', 'en': 'Kebab meat', 'icon': '🥙', 'extra': False, 'price': '0.00'},
            {'es': 'Queso gratinado', 'en': 'Gratin cheese', 'icon': '🧀', 'extra': False, 'price': '0.00'},
            {'es': 'Queso', 'en': 'Cheese', 'icon': '🧀', 'extra': True, 'price': '0.50'},
            {'es': 'Salsa brava', 'en': 'Spicy sauce', 'icon': '🌶️', 'extra': False, 'price': '0.00'},
            {'es': 'Salsa carbonara', 'en': 'Carbonara sauce', 'icon': '🥓', 'extra': False, 'price': '0.00'},
            {'es': 'Bacon', 'en': 'Bacon', 'icon': '🥓', 'extra': True, 'price': '0.50'},
            {'es': 'Huevo a la plancha', 'en': 'Fried egg', 'icon': '🍳', 'extra': False, 'price': '0.00'},
            {'es': 'Nachos de maíz', 'en': 'Corn nachos', 'icon': '🌽', 'extra': False, 'price': '0.00'},
            {'es': 'Salsa cheddar', 'en': 'Cheddar sauce', 'icon': '🧀', 'extra': False, 'price': '0.00'},

            # Ensaladas
            {'es': 'Tomate cherry', 'en': 'Cherry tomato', 'icon': '🍅', 'extra': False, 'price': '0.00'},
            {'es': 'Queso de cabra', 'en': 'Goat cheese', 'icon': '🧀', 'extra': True, 'price': '0.50'},
            {'es': 'Pipas de girasol', 'en': 'Sunflower seeds', 'icon': '🌻', 'extra': False, 'price': '0.00'},
            {'es': 'Pipas de calabaza', 'en': 'Pumpkin seeds', 'icon': '🎃', 'extra': False, 'price': '0.00'},
            {'es': 'Aceitunas negras', 'en': 'Black olives', 'icon': '🫒', 'extra': False, 'price': '0.00'},
            {'es': 'Vinagreta de arándanos', 'en': 'Cranberry vinaigrette', 'icon': '🫐', 'extra': False, 'price': '0.00'},
            {'es': 'Pollo a la plancha', 'en': 'Grilled chicken', 'icon': '🍗', 'extra': False, 'price': '0.00'},
            {'es': 'Queso parmesano', 'en': 'Parmesan cheese', 'icon': '🧀', 'extra': False, 'price': '0.00'},
            {'es': 'Picatostes', 'en': 'Croutons', 'icon': '🍞', 'extra': False, 'price': '0.00'},
            {'es': 'Salsa césar', 'en': 'Caesar dressing', 'icon': '🥗', 'extra': False, 'price': '0.00'},
            {'es': 'Queso fresco de cabra', 'en': 'Fresh goat cheese', 'icon': '🧀', 'extra': False, 'price': '0.00'},
            {'es': 'Nueces', 'en': 'Walnuts', 'icon': '🌰', 'extra': False, 'price': '0.00'},
            {'es': 'Salsa pesto', 'en': 'Pesto sauce', 'icon': '🌿', 'extra': False, 'price': '0.00'},
            {'es': 'Helado de limón', 'en': 'Lemon ice cream', 'icon': '🍋', 'extra': False, 'price': '0.00'},

            # Bocadillos y sandwiches
            {'es': 'Atún', 'en': 'Tuna', 'icon': '🐟', 'extra': False, 'price': '0.00'},
            {'es': 'Salsa rosa', 'en': 'Pink sauce', 'icon': '🥄', 'extra': False, 'price': '0.00'},
            {'es': 'Jamón serrano', 'en': 'Serrano ham', 'icon': '🥓', 'extra': True, 'price': '0.50'},
            {'es': 'Rodajas de tomate', 'en': 'Tomato slices', 'icon': '🍅', 'extra': False, 'price': '0.00'},
            {'es': 'Aceite', 'en': 'Oil', 'icon': '🫒', 'extra': False, 'price': '0.00'},
            {'es': 'Filete de pollo', 'en': 'Chicken fillet', 'icon': '🍗', 'extra': False, 'price': '0.00'},
            {'es': 'Cinta de lomo', 'en': 'Pork loin', 'icon': '🥩', 'extra': False, 'price': '0.00'},
            {'es': 'Tomate frito', 'en': 'Fried tomato', 'icon': '🍅', 'extra': False, 'price': '0.00'},
            {'es': 'Albahaca', 'en': 'Basil', 'icon': '🌿', 'extra': False, 'price': '0.00'},
            {'es': 'Orégano', 'en': 'Oregano', 'icon': '🌿', 'extra': False, 'price': '0.00'},
            {'es': 'Salchicha', 'en': 'Sausage', 'icon': '🌭', 'extra': False, 'price': '0.00'},
            {'es': 'Cebolla frita', 'en': 'Fried onion', 'icon': '🧅', 'extra': False, 'price': '0.00'},
            {'es': 'Mostaza', 'en': 'Mustard', 'icon': '🌭', 'extra': False, 'price': '0.00'},
            {'es': 'Ketchup', 'en': 'Ketchup', 'icon': '🍅', 'extra': False, 'price': '0.00'},
            {'es': 'Patatas paja', 'en': 'Shoestring fries', 'icon': '🍟', 'extra': False, 'price': '0.00'},
            {'es': 'Jamón york', 'en': 'York ham', 'icon': '🥓', 'extra': True, 'price': '0.50'},

            # Hamburguesas
            {'es': 'Hamburguesa de pollo', 'en': 'Chicken patty', 'icon': '🍗', 'extra': False, 'price': '0.00'},
            {'es': 'Hamburguesa de cerdo', 'en': 'Pork patty', 'icon': '🥩', 'extra': False, 'price': '0.00'},
            {'es': 'Hamburguesa vegana', 'en': 'Vegan patty', 'icon': '🥬', 'extra': False, 'price': '0.00'},
            {'es': 'Hamburguesa de ternera', 'en': 'Beef patty', 'icon': '🥩', 'extra': False, 'price': '0.00'},
            {'es': 'BBQ', 'en': 'BBQ sauce', 'icon': '🍖', 'extra': False, 'price': '0.00'},
            {'es': 'Bacon con huevo', 'en': 'Bacon with egg', 'icon': '🥓', 'extra': False, 'price': '0.00'},
            {'es': 'Cebolla crujiente', 'en': 'Crispy onion', 'icon': '🧅', 'extra': False, 'price': '0.00'},
            {'es': 'Inyección de queso cheddar', 'en': 'Cheddar cheese injection', 'icon': '🧀', 'extra': False, 'price': '0.00'},
            {'es': 'Cheddar', 'en': 'Cheddar', 'icon': '🧀', 'extra': True, 'price': '0.50'},

            # Montaditos
            {'es': 'Lomo adobado', 'en': 'Marinated pork loin', 'icon': '🥩', 'extra': False, 'price': '0.00'},

            # Camperos
            {'es': 'Mixto', 'en': 'Mixed', 'icon': '🥪', 'extra': False, 'price': '0.00'},
            {'es': 'Pollo asado', 'en': 'Roasted chicken', 'icon': '🍗', 'extra': False, 'price': '0.00'},
            {'es': 'Huevo', 'en': 'Egg', 'icon': '🥚', 'extra': True, 'price': '0.50'},

            # Serranitos
            {'es': 'Pimiento', 'en': 'Pepper', 'icon': '🫑', 'extra': False, 'price': '0.00'},
            {'es': 'Pimiento frito', 'en': 'Fried pepper', 'icon': '🫑', 'extra': True, 'price': '0.50'},

            # Combinado
            {'es': 'Torta de trigo', 'en': 'Wheat tortilla', 'icon': '🌯', 'extra': False, 'price': '0.00'},
            {'es': 'Patatas fritas', 'en': 'French fries', 'icon': '🍟', 'extra': False, 'price': '0.00'},

            # Extras adicionales mencionados
            {'es': 'Pan sin gluten', 'en': 'Gluten-free bread', 'icon': '🍞', 'extra': True, 'price': '0.50'},
        ]

        ingredients = {}
        for ing_data in ingredients_data:
            ingredient = Ingredient.objects.create(
                icon=ing_data['icon'],
                be_extra=ing_data['extra'],
                price=Decimal(ing_data['price'])
            )
            ingredient.set_current_language('es')
            ingredient.name = ing_data['es']
            ingredient.set_current_language('en')
            ingredient.name = ing_data['en']
            ingredient.save()
            ingredients[ing_data['es']] = ingredient

        self.stdout.write(f'  ✓ Created {len(ingredients)} ingredients')
        return ingredients

    def create_products(self, categories, ingredients):
        """Create all products with their relationships."""

        # Helper function to get ingredient IDs
        def get_ing_ids(ing_names):
            return [ingredients[name] for name in ing_names if name in ingredients]

        products_data = [
            # PARA PICAR
            {
                'category': 'Para Picar',
                'es_name': 'Patatas Fritas',
                'en_name': 'French Fries',
                'es_desc': 'Crujientes patatas fritas doradas, perfectas para acompañar o disfrutar solas',
                'en_desc': 'Crispy golden french fries, perfect to share or enjoy alone',
                'price': '4.00',
                'ingredients': []
            },
            {
                'category': 'Para Picar',
                'es_name': 'Patatas Gratinadas',
                'en_name': 'Gratin Fries',
                'es_desc': 'Crujientes patatas fritas con tu elección de salsa (yogurt, barbacoa o alioli), jugosa carne de kebab y generosa capa de queso gratinado',
                'en_desc': 'Crispy fries with your choice of sauce (yogurt, BBQ or aioli), juicy kebab meat and generous layer of gratin cheese',
                'price': '5.00',
                'ingredients': ['Salsa de yogurt', 'Salsa barbacoa', 'Alioli', 'Carne de kebab', 'Queso gratinado']
            },
            {
                'category': 'Para Picar',
                'es_name': 'Patatas Bravas',
                'en_name': 'Patatas Bravas',
                'es_desc': 'Patatas fritas bañadas en alioli cremoso, queso fundido y nuestra picante salsa brava casera',
                'en_desc': 'French fries bathed in creamy aioli, melted cheese and our homemade spicy brava sauce',
                'price': '5.00',
                'ingredients': ['Alioli', 'Queso', 'Salsa brava']
            },
            {
                'category': 'Para Picar',
                'es_name': 'Patatas Carbonara',
                'en_name': 'Carbonara Fries',
                'es_desc': 'Deliciosas patatas cubiertas con cremosa salsa carbonara, crujiente bacon, huevo a la plancha y queso gratinado',
                'en_desc': 'Delicious fries covered with creamy carbonara sauce, crispy bacon, fried egg and gratin cheese',
                'price': '7.00',
                'ingredients': ['Salsa carbonara', 'Bacon', 'Huevo a la plancha', 'Queso gratinado']
            },
            {
                'category': 'Para Picar',
                'es_name': 'Nachos',
                'en_name': 'Nachos',
                'es_desc': 'Crujientes nachos de maíz cubiertos con salsa cheddar, queso fundido y sabrosa carne de kebab',
                'en_desc': 'Crispy corn nachos topped with cheddar sauce, melted cheese and tasty kebab meat',
                'price': '8.00',
                'ingredients': ['Nachos de maíz', 'Salsa cheddar', 'Queso', 'Carne de kebab']
            },

            # ALGO LIGHT-FUSIÓN
            {
                'category': 'Algo Light–Fusión',
                'es_name': 'Ensalada Equus',
                'en_name': 'Equus Salad',
                'es_desc': 'Fresca combinación de lechuga, tomate cherry, queso de cabra, pipas de girasol y calabaza, aceitunas negras, todo aliñado con nuestra especial vinagreta de arándanos',
                'en_desc': 'Fresh combination of lettuce, cherry tomatoes, goat cheese, sunflower and pumpkin seeds, black olives, all dressed with our special cranberry vinaigrette',
                'price': '8.50',
                'ingredients': ['Lechuga', 'Tomate cherry', 'Queso de cabra', 'Pipas de girasol', 'Pipas de calabaza', 'Aceitunas negras', 'Vinagreta de arándanos']
            },
            {
                'category': 'Algo Light–Fusión',
                'es_name': 'Ensalada César',
                'en_name': 'Caesar Salad',
                'es_desc': 'Clásica ensalada césar con lechuga fresca, jugosos tacos de pollo a la plancha, queso parmesano, tomate cherry, crujientes picatostes y nuestra cremosa salsa césar',
                'en_desc': 'Classic Caesar salad with fresh lettuce, juicy grilled chicken strips, parmesan cheese, cherry tomatoes, crispy croutons and our creamy Caesar dressing',
                'price': '8.50',
                'ingredients': ['Lechuga', 'Pollo a la plancha', 'Queso parmesano', 'Tomate cherry', 'Picatostes', 'Salsa césar']
            },
            {
                'category': 'Algo Light–Fusión',
                'es_name': 'Ensalada de Pesto con bola de helado',
                'en_name': 'Pesto Salad with Ice Cream Ball',
                'es_desc': 'Especial de temporada: Lechuga fresca, queso fresco de cabra, tomate cherry, nueces crujientes, salsa pesto aromática y sorprendente bola de helado de limón',
                'en_desc': 'Seasonal special: Fresh lettuce, fresh goat cheese, cherry tomatoes, crunchy walnuts, aromatic pesto sauce and surprising lemon ice cream ball',
                'price': '10.00',
                'ingredients': ['Lechuga', 'Queso fresco de cabra', 'Tomate cherry', 'Nueces', 'Salsa pesto', 'Helado de limón']
            },

            # ENTRE PAN Y PAN
            {
                'category': 'Entre Pan y Pan',
                'es_name': 'Pepito Equus',
                'en_name': 'Equus Sandwich',
                'es_desc': 'Delicioso bocadillo de atún con lechuga fresca y cremosa salsa rosa',
                'en_desc': 'Delicious tuna sandwich with fresh lettuce and creamy pink sauce',
                'price': '4.00',
                'ingredients': ['Atún', 'Lechuga', 'Salsa rosa']
            },
            {
                'category': 'Entre Pan y Pan',
                'es_name': 'Pepito Serrano',
                'en_name': 'Serrano Sandwich',
                'es_desc': 'Tradicional bocadillo de jamón serrano con rodajas de tomate fresco y tu elección de aceite o mayonesa',
                'en_desc': 'Traditional serrano ham sandwich with fresh tomato slices and your choice of oil or mayonnaise',
                'price': '4.00',
                'ingredients': ['Jamón serrano', 'Rodajas de tomate', 'Aceite', 'Mayonesa']
            },
            {
                'category': 'Entre Pan y Pan',
                'es_name': 'Pepito Willi',
                'en_name': 'Willi Sandwich',
                'es_desc': 'Bocadillo con tu elección de filete de pollo o cinta de lomo, acompañado de queso de cabra, tomate frito y aromática albahaca',
                'en_desc': 'Sandwich with your choice of chicken fillet or pork loin, accompanied by goat cheese, fried tomato and aromatic basil',
                'price': '4.50',
                'ingredients': ['Filete de pollo', 'Cinta de lomo', 'Queso de cabra', 'Tomate frito', 'Albahaca']
            },
            {
                'category': 'Entre Pan y Pan',
                'es_name': 'Pepito Amyr',
                'en_name': 'Amyr Sandwich',
                'es_desc': 'Exquisito bocadillo de queso de cabra fresco a la plancha, jamón serrano, rodajas de tomate, aceite de oliva y orégano',
                'en_desc': 'Exquisite sandwich with grilled fresh goat cheese, serrano ham, tomato slices, olive oil and oregano',
                'price': '5.50',
                'ingredients': ['Queso fresco de cabra', 'Jamón serrano', 'Rodajas de tomate', 'Aceite', 'Orégano']
            },
            {
                'category': 'Entre Pan y Pan',
                'es_name': 'Pepito Queso Fresco',
                'en_name': 'Fresh Cheese Sandwich',
                'es_desc': 'Simple y delicioso bocadillo de queso fresco con rodajas de tomate y un toque de aceite de oliva',
                'en_desc': 'Simple and delicious fresh cheese sandwich with tomato slices and a touch of olive oil',
                'price': '5.00',
                'ingredients': ['Queso fresco de cabra', 'Rodajas de tomate', 'Aceite']
            },
            {
                'category': 'Entre Pan y Pan',
                'es_name': 'Perrito Caliente',
                'en_name': 'Hot Dog',
                'es_desc': 'Jugoso perrito caliente con salsa de cheddar, queso fundido, cebolla frita crujiente, mostaza, ketchup, mayonesa y patatas paja en su interior',
                'en_desc': 'Juicy hot dog with cheddar sauce, melted cheese, crispy fried onion, mustard, ketchup, mayonnaise and shoestring fries inside',
                'price': '5.00',
                'ingredients': ['Salchicha', 'Salsa cheddar', 'Queso', 'Cebolla frita', 'Mostaza', 'Ketchup', 'Mayonesa', 'Patatas paja']
            },
            {
                'category': 'Entre Pan y Pan',
                'es_name': 'Sandwich Mixto',
                'en_name': 'Mixed Sandwich',
                'es_desc': 'Clásico sándwich mixto con jamón york y queso, tostado a la perfección',
                'en_desc': 'Classic mixed sandwich with york ham and cheese, toasted to perfection',
                'price': '4.00',
                'ingredients': ['Jamón york', 'Queso']
            },
            {
                'category': 'Entre Pan y Pan',
                'es_name': 'Sandwich Vegetal',
                'en_name': 'Veggie Sandwich',
                'es_desc': 'Completo sándwich vegetal con jamón york, queso, mayonesa cremosa, lechuga fresca y tomate',
                'en_desc': 'Complete veggie sandwich with york ham, cheese, creamy mayonnaise, fresh lettuce and tomato',
                'price': '4.50',
                'ingredients': ['Jamón york', 'Queso', 'Mayonesa', 'Lechuga', 'Tomate']
            },

            # HAMBURGUESAS (Todas llevan mayonesa, lechuga, tomate y cebolla)
            {
                'category': 'Hamburguesas',
                'es_name': 'Hamburguesa de Pollo',
                'en_name': 'Chicken Burger',
                'es_desc': 'Jugosa hamburguesa de pollo a la parrilla con mayonesa cremosa, lechuga fresca, tomate maduro y cebolla crujiente',
                'en_desc': 'Juicy grilled chicken burger with creamy mayonnaise, fresh lettuce, ripe tomato and crispy onion',
                'price': '4.50',
                'ingredients': ['Hamburguesa de pollo', 'Mayonesa', 'Lechuga', 'Tomate', 'Cebolla']
            },
            {
                'category': 'Hamburguesas',
                'es_name': 'Hamburguesa de Cerdo',
                'en_name': 'Pork Burger',
                'es_desc': 'Sabrosa hamburguesa de cerdo con mayonesa cremosa, lechuga fresca, tomate maduro y cebolla crujiente',
                'en_desc': 'Tasty pork burger with creamy mayonnaise, fresh lettuce, ripe tomato and crispy onion',
                'price': '4.50',
                'ingredients': ['Hamburguesa de cerdo', 'Mayonesa', 'Lechuga', 'Tomate', 'Cebolla']
            },
            {
                'category': 'Hamburguesas',
                'es_name': 'Hamburguesa Vegana',
                'en_name': 'Vegan Burger',
                'es_desc': 'Deliciosa hamburguesa 100% vegetal con mayonesa, lechuga fresca, tomate maduro y cebolla crujiente',
                'en_desc': 'Delicious 100% plant-based burger with mayonnaise, fresh lettuce, ripe tomato and crispy onion',
                'price': '5.00',
                'ingredients': ['Hamburguesa vegana', 'Mayonesa', 'Lechuga', 'Tomate', 'Cebolla']
            },
            {
                'category': 'Hamburguesas',
                'es_name': 'Especial del día',
                'en_name': 'Special of the Day',
                'es_desc': 'Nuestra hamburguesa especial del día con mayonesa cremosa, lechuga fresca, tomate maduro y cebolla crujiente',
                'en_desc': 'Our special burger of the day with creamy mayonnaise, fresh lettuce, ripe tomato and crispy onion',
                'price': '5.00',
                'ingredients': ['Mayonesa', 'Lechuga', 'Tomate', 'Cebolla']
            },
            {
                'category': 'Hamburguesas',
                'es_name': 'Super Burger',
                'en_name': 'Super Burger',
                'es_desc': 'Nuestra hamburguesa más completa con mayonesa cremosa, lechuga fresca, tomate maduro y cebolla crujiente',
                'en_desc': 'Our most complete burger with creamy mayonnaise, fresh lettuce, ripe tomato and crispy onion',
                'price': '8.50',
                'ingredients': ['Mayonesa', 'Lechuga', 'Tomate', 'Cebolla']
            },
            {
                'category': 'Hamburguesas',
                'es_name': 'Burger a la Barbacoa',
                'en_name': 'BBQ Burger',
                'es_desc': 'Espectacular hamburguesa de ternera con salsa BBQ, bacon con huevo, lechuga, cebolla crujiente, tomate y sorprendente inyección de queso cheddar',
                'en_desc': 'Spectacular beef burger with BBQ sauce, bacon with egg, lettuce, crispy onion, tomato and surprising cheddar cheese injection',
                'price': '7.00',
                'ingredients': ['Hamburguesa de ternera', 'BBQ', 'Bacon con huevo', 'Lechuga', 'Cebolla crujiente', 'Tomate', 'Inyección de queso cheddar']
            },

            # MONTADITOS (Todos llevan mayonesa, lechuga y tomate)
            {
                'category': 'Montaditos',
                'es_name': 'Montadito de Cinta de Lomo',
                'en_name': 'Pork Loin Small Sandwich',
                'es_desc': 'Sabroso montadito de cinta de lomo con mayonesa cremosa, lechuga fresca y tomate',
                'en_desc': 'Tasty pork loin small sandwich with creamy mayonnaise, fresh lettuce and tomato',
                'price': '4.50',
                'ingredients': ['Cinta de lomo', 'Mayonesa', 'Lechuga', 'Tomate']
            },
            {
                'category': 'Montaditos',
                'es_name': 'Montadito de Filete de Pollo',
                'en_name': 'Chicken Fillet Small Sandwich',
                'es_desc': 'Jugoso montadito de filete de pollo con mayonesa cremosa, lechuga fresca y tomate',
                'en_desc': 'Juicy chicken fillet small sandwich with creamy mayonnaise, fresh lettuce and tomato',
                'price': '4.50',
                'ingredients': ['Filete de pollo', 'Mayonesa', 'Lechuga', 'Tomate']
            },
            {
                'category': 'Montaditos',
                'es_name': 'Montadito de Lomo Adobado',
                'en_name': 'Marinated Loin Small Sandwich',
                'es_desc': 'Delicioso montadito de lomo adobado con mayonesa cremosa, lechuga fresca y tomate',
                'en_desc': 'Delicious marinated pork loin small sandwich with creamy mayonnaise, fresh lettuce and tomato',
                'price': '4.50',
                'ingredients': ['Lomo adobado', 'Mayonesa', 'Lechuga', 'Tomate']
            },

            # CAMPEROS (Todos llevan mayonesa, lechuga y tomate)
            {
                'category': 'Camperos',
                'es_name': 'Campero Mixto',
                'en_name': 'Mixed Campero',
                'es_desc': 'Campero mixto en pan especial con mayonesa cremosa, lechuga fresca y tomate',
                'en_desc': 'Mixed campero on special bread with creamy mayonnaise, fresh lettuce and tomato',
                'price': '4.50',
                'ingredients': ['Mixto', 'Mayonesa', 'Lechuga', 'Tomate']
            },
            {
                'category': 'Camperos',
                'es_name': 'Campero de Filete de Pollo',
                'en_name': 'Chicken Fillet Campero',
                'es_desc': 'Campero de filete de pollo en pan especial con mayonesa cremosa, lechuga fresca y tomate',
                'en_desc': 'Chicken fillet campero on special bread with creamy mayonnaise, fresh lettuce and tomato',
                'price': '4.50',
                'ingredients': ['Filete de pollo', 'Mayonesa', 'Lechuga', 'Tomate']
            },
            {
                'category': 'Camperos',
                'es_name': 'Campero de Pollo Asado',
                'en_name': 'Roasted Chicken Campero',
                'es_desc': 'Campero de jugoso pollo asado en pan especial con mayonesa cremosa, lechuga fresca y tomate',
                'en_desc': 'Juicy roasted chicken campero on special bread with creamy mayonnaise, fresh lettuce and tomato',
                'price': '4.50',
                'ingredients': ['Pollo asado', 'Mayonesa', 'Lechuga', 'Tomate']
            },
            {
                'category': 'Camperos',
                'es_name': 'Campero de Cinta de Lomo',
                'en_name': 'Pork Loin Campero',
                'es_desc': 'Campero de cinta de lomo en pan especial con mayonesa cremosa, lechuga fresca y tomate',
                'en_desc': 'Pork loin campero on special bread with creamy mayonnaise, fresh lettuce and tomato',
                'price': '4.50',
                'ingredients': ['Cinta de lomo', 'Mayonesa', 'Lechuga', 'Tomate']
            },
            {
                'category': 'Camperos',
                'es_name': 'Campero de Kebab',
                'en_name': 'Kebab Campero',
                'es_desc': 'Campero de sabrosa carne de kebab en pan especial con mayonesa cremosa, lechuga fresca y tomate',
                'en_desc': 'Tasty kebab meat campero on special bread with creamy mayonnaise, fresh lettuce and tomato',
                'price': '5.00',
                'ingredients': ['Carne de kebab', 'Mayonesa', 'Lechuga', 'Tomate']
            },
            {
                'category': 'Camperos',
                'es_name': 'Campero de Bacon',
                'en_name': 'Bacon Campero',
                'es_desc': 'Campero de crujiente bacon en pan especial con mayonesa cremosa, lechuga fresca y tomate',
                'en_desc': 'Crispy bacon campero on special bread with creamy mayonnaise, fresh lettuce and tomato',
                'price': '4.50',
                'ingredients': ['Bacon', 'Mayonesa', 'Lechuga', 'Tomate']
            },
            {
                'category': 'Camperos',
                'es_name': 'Campero de Atún',
                'en_name': 'Tuna Campero',
                'es_desc': 'Campero de atún en pan especial con mayonesa cremosa, lechuga fresca y tomate',
                'en_desc': 'Tuna campero on special bread with creamy mayonnaise, fresh lettuce and tomato',
                'price': '5.00',
                'ingredients': ['Atún', 'Mayonesa', 'Lechuga', 'Tomate']
            },
            {
                'category': 'Camperos',
                'es_name': 'Campero de Huevo',
                'en_name': 'Egg Campero',
                'es_desc': 'Campero de huevo en pan especial con mayonesa cremosa, lechuga fresca y tomate',
                'en_desc': 'Egg campero on special bread with creamy mayonnaise, fresh lettuce and tomato',
                'price': '4.50',
                'ingredients': ['Huevo', 'Mayonesa', 'Lechuga', 'Tomate']
            },

            # SERRANITOS
            {
                'category': 'Serranitos',
                'es_name': 'Serranito de Pollo',
                'en_name': 'Chicken Serranito',
                'es_desc': 'Tradicional serranito andaluz con jugoso filete de pollo, jamón serrano, pimiento frito y tu elección de alioli o mayonesa',
                'en_desc': 'Traditional Andalusian serranito with juicy chicken fillet, serrano ham, fried pepper and your choice of aioli or mayonnaise',
                'price': '5.00',
                'ingredients': ['Filete de pollo', 'Jamón serrano', 'Pimiento', 'Alioli', 'Mayonesa']
            },
            {
                'category': 'Serranitos',
                'es_name': 'Serranito de Lomo',
                'en_name': 'Pork Loin Serranito',
                'es_desc': 'Tradicional serranito andaluz con sabrosa cinta de lomo, jamón serrano, pimiento frito y tu elección de alioli o mayonesa',
                'en_desc': 'Traditional Andalusian serranito with tasty pork loin, serrano ham, fried pepper and your choice of aioli or mayonnaise',
                'price': '5.00',
                'ingredients': ['Cinta de lomo', 'Jamón serrano', 'Pimiento', 'Alioli', 'Mayonesa']
            },

            # COMBINADOS
            {
                'category': 'Combinados',
                'es_name': 'Combinado de Kebab',
                'en_name': 'Kebab Combo',
                'es_desc': 'Completo plato combinado con torta de trigo, jugosa carne de kebab, lechuga, tomate, cebolla y crujientes patatas fritas. Incluye tu elección de salsa: yogurt, barbacoa, césar o brava',
                'en_desc': 'Complete combo plate with wheat tortilla, juicy kebab meat, lettuce, tomato, onion and crispy french fries. Includes your choice of sauce: yogurt, BBQ, caesar or spicy',
                'price': '9.00',
                'ingredients': ['Torta de trigo', 'Carne de kebab', 'Lechuga', 'Tomate', 'Cebolla', 'Patatas fritas', 'Salsa de yogurt', 'Salsa barbacoa', 'Salsa césar', 'Salsa brava']
            },
            {
                'category': 'Combinados',
                'es_name': 'Combinado de Pollo Asado',
                'en_name': 'Roasted Chicken Combo',
                'es_desc': 'Completo plato combinado con torta de trigo, jugoso pollo asado, lechuga, tomate, cebolla y crujientes patatas fritas. Incluye tu elección de salsa: yogurt, barbacoa, césar o brava',
                'en_desc': 'Complete combo plate with wheat tortilla, juicy roasted chicken, lettuce, tomato, onion and crispy french fries. Includes your choice of sauce: yogurt, BBQ, caesar or spicy',
                'price': '9.00',
                'ingredients': ['Torta de trigo', 'Pollo asado', 'Lechuga', 'Tomate', 'Cebolla', 'Patatas fritas', 'Salsa de yogurt', 'Salsa barbacoa', 'Salsa césar', 'Salsa brava']
            },
        ]

        for prod_data in products_data:
            product = Product.objects.create(
                price=Decimal(prod_data['price']),
                stock=100,
                available=True
            )

            # Set translations
            product.set_current_language('es')
            product.name = prod_data['es_name']
            product.description = prod_data['es_desc']
            product.set_current_language('en')
            product.name = prod_data['en_name']
            product.description = prod_data['en_desc']
            product.save()

            # Set category
            category = categories[prod_data['category']]
            product.categories.add(category)

            # Set ingredients
            ing_objects = get_ing_ids(prod_data['ingredients'])
            if ing_objects:
                product.ingredients.set(ing_objects)

            self.stdout.write(f'  ✓ Created product: {prod_data["es_name"]}')

        self.stdout.write(f'  ✓ Created {len(products_data)} products')
