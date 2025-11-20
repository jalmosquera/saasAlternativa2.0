"""Tests for Product model."""

from decimal import Decimal
from django.test import TestCase
from django.core.exceptions import ValidationError
from apps.products.models import Product
from apps.categories.models import Category
from apps.ingredients.models import Ingredient


class ProductModelTest(TestCase):
    """Test cases for Product model with translations and validations."""

    def setUp(self):
        """Set up test data."""
        self.category = Category.objects.create()
        self.category.set_current_language('en')
        self.category.name = "Pizzas"
        self.category.save()

        self.ingredient = Ingredient.objects.create()
        self.ingredient.set_current_language('en')
        self.ingredient.name = "Cheese"
        self.ingredient.save()

    def test_create_product_successfully(self):
        """Test creating a product with valid data."""
        product = Product.objects.create(
            price=Decimal('12.99'),
            stock=50
        )
        product.set_current_language('en')
        product.name = "Margherita Pizza"
        product.description = "Classic pizza with tomato and mozzarella"
        product.save()

        self.assertEqual(product.name, "Margherita Pizza")
        self.assertEqual(product.price, Decimal('12.99'))
        self.assertEqual(product.stock, 50)
        self.assertTrue(product.available)

    def test_product_price_validation(self):
        """Test that price must be positive."""
        product = Product(price=Decimal('0.00'), stock=10)
        with self.assertRaises(ValidationError):
            product.full_clean()

    def test_product_stock_validation(self):
        """Test that stock cannot be negative."""
        product = Product(price=Decimal('10.00'), stock=-5)
        with self.assertRaises(ValidationError):
            product.full_clean()

    def test_product_str_with_translation(self):
        """Test string representation returns product name."""
        product = Product.objects.create(price=Decimal('9.99'), stock=20)
        product.set_current_language('en')
        product.name = "Pepperoni Pizza"
        product.save()

        self.assertEqual(str(product), "Pepperoni Pizza")

    def test_product_has_timestamps(self):
        """Test product has automatic timestamps."""
        product = Product.objects.create(price=Decimal('9.99'), stock=20)
        self.assertIsNotNone(product.created_at)
        self.assertIsNotNone(product.updated_at)

    def test_product_categories_relationship(self):
        """Test product can be associated with categories."""
        product = Product.objects.create(price=Decimal('15.99'), stock=30)
        product.categories.add(self.category)

        self.assertIn(self.category, product.categories.all())
        self.assertIn(product, self.category.products.all())

    def test_product_ingredients_relationship(self):
        """Test product can be associated with ingredients."""
        product = Product.objects.create(price=Decimal('11.99'), stock=25)
        product.ingredients.add(self.ingredient)

        self.assertIn(self.ingredient, product.ingredients.all())
        self.assertIn(product, self.ingredient.products.all())

    def test_product_multi_language_support(self):
        """Test product supports multiple languages."""
        product = Product.objects.create(price=Decimal('10.99'), stock=40)

        # English translation
        product.set_current_language('en')
        product.name = "Hawaiian Pizza"
        product.save()

        # Spanish translation
        product.set_current_language('es')
        product.name = "Pizza Hawaiana"
        product.save()

        # Verify both languages
        product.set_current_language('en')
        self.assertEqual(product.name, "Hawaiian Pizza")

        product.set_current_language('es')
        self.assertEqual(product.name, "Pizza Hawaiana")

    # Note: be_extra field was removed from Product model
    # This field now exists in Ingredient model instead
