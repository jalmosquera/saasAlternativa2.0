"""Tests for Category model."""

from django.test import TestCase
from apps.categories.models import Category


class CategoryModelTest(TestCase):
    """Test cases for Category model with translations."""

    def test_create_category_successfully(self):
        """Test creating a category with English translation."""
        category = Category.objects.create()
        category.set_current_language('en')
        category.name = "Main Courses"
        category.description = "Delicious main course options"
        category.save()

        self.assertEqual(category.name, "Main Courses")
        self.assertEqual(category.description, "Delicious main course options")

    def test_category_str_with_translation(self):
        """Test string representation returns category name."""
        category = Category.objects.create()
        category.set_current_language('en')
        category.name = "Desserts"
        category.save()

        self.assertEqual(str(category), "Desserts")

    def test_category_has_created_and_updated_timestamps(self):
        """Test category has automatic timestamps."""
        category = Category.objects.create()
        self.assertIsNotNone(category.created_at)
        self.assertIsNotNone(category.updated_at)

    def test_category_multi_language_support(self):
        """Test category supports multiple languages."""
        category = Category.objects.create()

        # English translation
        category.set_current_language('en')
        category.name = "Beverages"
        category.save()

        # Spanish translation
        category.set_current_language('es')
        category.name = "Bebidas"
        category.save()

        # Verify English
        category.set_current_language('en')
        self.assertEqual(category.name, "Beverages")

        # Verify Spanish
        category.set_current_language('es')
        self.assertEqual(category.name, "Bebidas")
