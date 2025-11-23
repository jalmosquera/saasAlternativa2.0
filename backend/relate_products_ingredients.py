"""
Script para relacionar productos con sus ingredientes basado en la carta del restaurante.
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product
from apps.ingredients.models import Ingredient


# Mapeo de productos a ingredientes basado en las cartas
PRODUCT_INGREDIENTS = {
    # ENROLLADOS (cartaCamperos.jpeg)
    "Completo": ["lechuga", "tomate", "cebolla", "queso", "kebab de pollo", "salsa yogurt", "salsa brava"],

    # CAMPEROS (cartaCamperos.jpeg)
    "Clásico": ["lomo", "queso", "lechuga", "tomate", "pimiento rojo", "cebolla", "salsa agridulce"],
    "Villacampa": ["lomo", "queso", "lechuga", "tomate", "cebolla", "bacon"],
    "Calarpos": ["atún", "queso", "lechuga", "tomate", "cebolla", "mayonesa"],
    "Serranito": ["lomo", "jamón serrano", "pimiento verde", "tomate"],
    "Quier": ["kebab", "bacon", "queso", "tomate", "salsa argentina", "pimiento morrón", "salsa yogurt 2.0"],
    "Super Marc": ["bacon", "lomo", "pimiento verde", "huevo", "queso", "tomate", "salsa brava"],
    "Crujiente": ["tiras de pollo crujiente", "salsa cheddar", "tomate", "salsa brava"],

    # BURGERS 2.0 (cartaCamperos.jpeg)
    "Burger 2.0": ["burger de buey", "queso", "bacon", "tomate", "lechuga", "cebolla"],

    # PIZZAS (cartaPizza.jpeg)
    "Mari_Lin": ["mermelada gaitanejo", "gambas", "pimentón picante", "mozzarella", "cebolla", "pimiento rojo"],
    "Gaitanes": ["tomate", "mozzarella", "atún", "gambas", "mejillones", "bocas de mar", "anchoas"],
    "Serendipia": ["nata trufada", "mozzarella", "aguacate", "cebolla", "salmón", "cheddar"],
    "Rumiñaui": ["mozzarella", "manzana", "secreto", "alioli", "mojo picón", "escamas de sal", "reducción de Pedro Ximénez"],
    "Margarita": ["tomate", "mozzarella"],
    "Básica": ["tomate", "mozzarella", "jamón york"],
    "Duende": ["salsa barbacoa", "mozzarella", "bacon", "pollo", "ternera"],
    "Turón": ["salsa argentina", "mozzarella", "bacon", "cebolla", "champiñones"],
    "Fuente El Colegial": ["tomate", "mozzarella", "jamón york", "piña", "cheddar"],
    "Bobastro": ["mozzarella", "gouda", "roquefort", "cheddar", "orégano"],
    "Bombay": ["mozzarella", "nata", "curry", "tacos de pollo", "cebolla", "salsa de yogur"],
    "Picardía": ["tomate", "aguacate", "mozzarella", "cebolla", "pimientos variados"],
    "Alcaparaín": ["tomate", "mozzarella", "búfala", "tomate natural", "albahaca", "orégano"],
    "Sierra de las Nieves": ["alioli", "mozzarella", "pimiento frito", "kebab de pollo", "pimiento morrón"],
    "Moronta": ["salsa argentina", "mozzarella", "cebolla", "pimientos fritos", "kebab de pollo", "salsa yogurt"],
    "Capricho de la Tierra": ["nata trufada", "mozzarella", "trufa", "parmesano", "queso chèvre", "cebolla", "champiñones", "jamón york"],
    "Avocado": ["salsa mexicana", "mozzarella", "ternera", "pimientos variados", "cebolla", "aguacate"],
    "La Alternativa 2.0": ["salsa pesto", "mozzarella", "tomate natural", "albahaca", "queso burrata"],
    "Cucarra": ["tomate", "mozzarella", "bacon", "pepperoni", "cebolla", "pollo", "orégano"],
    "Alamedilla": ["tomate", "mozzarella", "jamón york", "atún", "bacon", "champiñones", "orégano"],
    "Los Lunes al Sol": ["nata", "mozzarella", "cebolla caramelizada", "pepperoni", "tomillo", "reducción de Pedro Ximénez"],
    "Ortegicar": ["tomate", "mozzarella", "cebolla", "pimiento verde", "pimiento rojo", "champiñones", "aceitunas negras"],
    "Charco la Olla": ["tomate", "mozzarella", "atún", "bocas de mar", "cebolla", "salsa carbonara", "orégano"],
    "Chano": ["tomate", "mozzarella", "cheddar", "búfala", "ternera", "bacon"],
    "Gaitanejo": ["cebolla caramelizada", "mozzarella", "queso de cabra", "secreto"],
    "Gratinada": ["tomate", "mozzarella", "patatas fritas", "bacon", "salsa yogurt"],
    "Bogotá": ["salsa mexicana", "mozzarella", "secreto", "cebolla", "orégano"],
    "Marsella": ["salsa brava mexicana", "mozzarella", "bacon", "salsa carbonara", "patatas fritas", "salsa yogurt"],
    "The U2": ["tomate", "mozzarella", "champiñones", "huevo", "jamón york", "jamón serrano", "parmesano", "orégano"],
    "The Beatles": ["cebolla", "mozzarella", "aguacate", "salmón ahumado", "parmesano", "orégano"],
    "Jhon Lenon": ["salsa pesto", "mozzarella", "tomate natural", "atún", "cebolla", "queso chèvre", "parmesano", "albahaca"],

    # ENTRANTES (cartaGeneral.jpeg)
    "Plato de Jamón Ibérico": ["jamón serrano"],
    "Tabla de Quesos": ["queso"],
    "Surtido de Croquetas": [],  # No especificado
    "Plato de Alitas de Pollo": ["pollo"],
    "Gambas al Pil Pil": ["gambas", "ajo", "pimentón picante", "perejil"],
    "Plato de Vieiras": [],  # No especificado

    # ENSALADAS (cartaGeneral.jpeg)
    "Ensalada Mixta": ["lechuga", "tomate", "cebolla", "zanahoria", "maíz", "atún"],
    "Ensalada de Burrata": ["mezcla de lechuga", "burratina", "tomate", "remolacha", "zanahoria", "vinagreta de semillas de mostaza"],
    "Tomate de la Tierra": ["tomate", "aguacate", "queso burrata", "escamas de sal", "vinagre balsámico"],
    "Ensalada Tropical": ["lechuga", "bacon", "piña", "queso", "tomate"],
    "Ensalada César": ["lechuga", "pollo", "queso", "tomate", "picatostes", "salsa césar"],
    "Ensalada Templada": ["mezcla de lechuga", "langostinos", "tomate", "cebolla", "champiñones", "salsa cocktail"],

    # IBÉRICOS (cartaGeneral.jpeg)
    "Abanico Ibérico": [],
    "Secreto Ibérico": ["secreto"],
    "Presa Ibérica": [],
    "Pluma Ibérica": [],
    "Lagarto Ibérico": [],
    "Chacina 900g": [],
    "Flamenco Casero": [],

    # POLLO (cartaGeneral.jpeg)
    "Pechuga de Pollo": ["pollo"],
    "Pinchitos Ardaleños": ["pollo"],
    "Churrasco de Pollo": ["pollo"],
    "Tiras de Pollo con Verdura y Soja": ["pollo", "verduras"],

    # PESCADOS (cartaGeneral.jpeg)
    "Salmón Plancha": ["salmón"],
    "Calamares Fritos": [],
    "Calamares Plancha": [],

    # OTROS PRODUCTOS (de la DB sin detalles en carta)
    "Cuatro Quesos": ["mozzarella", "cheddar", "roquefort", "parmesano"],
    "Combinado de Kebab": ["kebab de pollo", "lechuga", "tomate", "salsa yogurt"],
    "Ración de Patatas": ["patatas"],
    "Patatas Gratinadas": ["patatas", "queso"],
    "Mari_Lin": [],  # No encontrado en carta
    "Gaitanes": [],  # No encontrado en carta
    "Serendipia": [],  # No encontrado en carta
    "Rumiñaui": [],  # No encontrado en carta
    "Costillar BBQ": ["salsa barbacoa"],
    "Costillar a la Mostaza": [],
    "Codillo al Horno": [],
    "Rabo de Toro": [],
    "Postres del Día": [],
}


def get_ingredient_by_name(name):
    """Buscar ingrediente por nombre (insensible a mayúsculas/minúsculas)."""
    try:
        # Primero intentar buscar exacto
        return Ingredient.objects.get(translations__name__iexact=name)
    except Ingredient.DoesNotExist:
        # Intentar buscar con contains
        results = Ingredient.objects.filter(translations__name__icontains=name)
        if results.count() == 1:
            return results.first()
        elif results.count() > 1:
            # Si hay múltiples, tomar el primero
            print(f"⚠️  Múltiples ingredientes para '{name}', usando el primero")
            return results.first()
        return None
    except Ingredient.MultipleObjectsReturned:
        # Si hay duplicados exactos, tomar el primero
        print(f"⚠️  Ingredientes duplicados para '{name}', usando el primero")
        return Ingredient.objects.filter(translations__name__iexact=name).first()


def relate_products_to_ingredients():
    """Relaciona cada producto con sus ingredientes."""

    stats = {
        'productos_procesados': 0,
        'productos_sin_match': [],
        'relaciones_creadas': 0,
        'ingredientes_no_encontrados': set()
    }

    for product_name, ingredient_names in PRODUCT_INGREDIENTS.items():
        # Buscar el producto
        try:
            product = Product.objects.get(translations__name__iexact=product_name)
        except Product.DoesNotExist:
            stats['productos_sin_match'].append(product_name)
            continue
        except Product.MultipleObjectsReturned:
            print(f"⚠️  Múltiples productos con nombre '{product_name}', usando el primero")
            product = Product.objects.filter(translations__name__iexact=product_name).first()

        # Limpiar relaciones anteriores
        product.ingredients.clear()

        # Añadir nuevos ingredientes
        for ing_name in ingredient_names:
            ingredient = get_ingredient_by_name(ing_name)
            if ingredient:
                product.ingredients.add(ingredient)
                stats['relaciones_creadas'] += 1
            else:
                stats['ingredientes_no_encontrados'].add(ing_name)
                print(f"❌ Ingrediente no encontrado: '{ing_name}' para {product_name}")

        stats['productos_procesados'] += 1
        print(f"✅ {product_name}: {len(ingredient_names)} ingredientes")

    return stats


if __name__ == "__main__":
    print("=" * 60)
    print("RELACIONANDO PRODUCTOS CON INGREDIENTES")
    print("=" * 60)

    stats = relate_products_to_ingredients()

    print("\n" + "=" * 60)
    print("RESUMEN")
    print("=" * 60)
    print(f"✅ Productos procesados: {stats['productos_procesados']}")
    print(f"🔗 Relaciones creadas: {stats['relaciones_creadas']}")
    print(f"\n❌ Productos sin match en DB ({len(stats['productos_sin_match'])}):")
    for p in stats['productos_sin_match']:
        print(f"   - {p}")

    print(f"\n❌ Ingredientes no encontrados ({len(stats['ingredientes_no_encontrados'])}):")
    for i in sorted(stats['ingredientes_no_encontrados']):
        print(f"   - {i}")
