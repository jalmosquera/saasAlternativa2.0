#!/usr/bin/env python
"""Script para limpiar completamente la base de datos de productos, ingredientes y categorías."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product, ProductOption, ProductOptionChoice
from apps.categories.models import Category
from apps.ingredients.models import Ingredient
from apps.orders.models import Order, OrderItem
from django.db import transaction


def clean_database():
    """Elimina todos los productos, ingredientes, categorías, órdenes y sus relaciones."""
    print("=" * 60)
    print("LIMPIANDO BASE DE DATOS")
    print("=" * 60)

    with transaction.atomic():
        # Contar registros antes de eliminar
        products_count = Product.objects.count()
        ingredients_count = Ingredient.objects.count()
        categories_count = Category.objects.count()
        options_count = ProductOption.objects.count()
        choices_count = ProductOptionChoice.objects.count()
        orders_count = Order.objects.count()
        order_items_count = OrderItem.objects.count()

        print(f"\nRegistros actuales:")
        print(f"  - Productos: {products_count}")
        print(f"  - Ingredientes: {ingredients_count}")
        print(f"  - Categorías: {categories_count}")
        print(f"  - Opciones de producto: {options_count}")
        print(f"  - Choices de opciones: {choices_count}")
        print(f"  - Órdenes: {orders_count}")
        print(f"  - Items de órdenes: {order_items_count}")

        # Eliminar en orden para evitar problemas de integridad referencial
        print("\nEliminando datos...")

        # 0. Eliminar órdenes primero (esto también elimina los OrderItems por CASCADE)
        Order.objects.all().delete()
        print("  ✓ Órdenes eliminadas")

        # 1. Eliminar productos (esto también elimina las relaciones ManyToMany)
        Product.objects.all().delete()
        print("  ✓ Productos eliminados")

        # 2. Eliminar opciones de producto y sus choices
        ProductOptionChoice.objects.all().delete()
        print("  ✓ Choices de opciones eliminados")

        ProductOption.objects.all().delete()
        print("  ✓ Opciones de producto eliminadas")

        # 3. Eliminar ingredientes
        Ingredient.objects.all().delete()
        print("  ✓ Ingredientes eliminados")

        # 4. Eliminar categorías
        Category.objects.all().delete()
        print("  ✓ Categorías eliminadas")

        print("\n" + "=" * 60)
        print("✓ BASE DE DATOS LIMPIADA CORRECTAMENTE")
        print("=" * 60)


if __name__ == '__main__':
    try:
        clean_database()
    except Exception as e:
        print(f"\n❌ Error al limpiar la base de datos: {e}")
        import traceback
        traceback.print_exc()
