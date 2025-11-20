"""Tests for Ingredient model."""

from django.test import TestCase
from apps.ingredients.models import Ingredient


class IngredientModelTest(TestCase):
    """Test cases for Ingredient model with translations."""

    def test_create_ingredient_successfully(self):
        """Test creating an ingredient with translation and icon."""
        ingredient = Ingredient.objects.create(icon='fa-cheese')
        ingredient.set_current_language('en')
        ingredient.name = "Mozzarella Cheese"
        ingredient.save()

        self.assertEqual(ingredient.name, "Mozzarella Cheese")
        self.assertEqual(ingredient.icon, 'fa-cheese')

    def test_ingredient_str_with_translation(self):
        """Test string representation returns ingredient name."""
        ingredient = Ingredient.objects.create()
        ingredient.set_current_language('en')
        ingredient.name = "Tomato"
        ingredient.save()

        self.assertEqual(str(ingredient), "Tomato")

    def test_ingredient_without_icon(self):
        """Test ingredient can be created without icon."""
        ingredient = Ingredient.objects.create()
        ingredient.set_current_language('en')
        ingredient.name = "Salt"
        ingredient.save()
        self.assertIsNone(ingredient.icon)

    def test_ingredient_multi_language_support(self):
        """Test ingredient supports multiple languages."""
        ingredient = Ingredient.objects.create()

        # English translation
        ingredient.set_current_language('en')
        ingredient.name = "Onion"
        ingredient.save()

        # Spanish translation
        ingredient.set_current_language('es')
        ingredient.name = "Cebolla"
        ingredient.save()

        # Verify both languages
        ingredient.set_current_language('en')
        self.assertEqual(ingredient.name, "Onion")

        ingredient.set_current_language('es')
        self.assertEqual(ingredient.name, "Cebolla")
