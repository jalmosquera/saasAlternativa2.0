"""Tests for Company model."""

from django.test import TestCase
from apps.company.models import Company


class CompanyModelTest(TestCase):
    """Test cases for Company model with translations."""

    def test_create_company_successfully(self):
        """Test creating a company with valid data."""
        company = Company.objects.create(
            email='info@restaurant.com',
            phone=1234567890
        )
        company.set_current_language('en')
        company.name = "Delicious Restaurant"
        company.address = "123 Main Street, City"
        company.save()

        self.assertEqual(company.name, "Delicious Restaurant")
        self.assertEqual(company.address, "123 Main Street, City")
        self.assertEqual(company.email, 'info@restaurant.com')
        self.assertEqual(company.phone, 1234567890)

    def test_company_str_with_translation(self):
        """Test string representation returns company name."""
        company = Company.objects.create(
            email='contact@company.com',
            phone=9876543210
        )
        company.set_current_language('en')
        company.name = "The Best Pizzeria"
        company.address = "456 Pizza Street"
        company.save()

        self.assertEqual(str(company), "The Best Pizzeria")

    def test_company_email_validation(self):
        """Test company email field works correctly."""
        company = Company.objects.create(
            email='valid@email.com',
            phone=1111111111
        )
        self.assertEqual(company.email, 'valid@email.com')

    def test_company_multi_language_support(self):
        """Test company supports multiple languages."""
        company = Company.objects.create(
            email='info@multilang.com',
            phone=5555555555
        )

        # English translation
        company.set_current_language('en')
        company.name = "Italian Restaurant"
        company.address = "789 Rome Avenue"
        company.save()

        # Spanish translation
        company.set_current_language('es')
        company.name = "Restaurante Italiano"
        company.address = "Avenida Roma 789"
        company.save()

        # Verify both languages
        company.set_current_language('en')
        self.assertEqual(company.name, "Italian Restaurant")
        self.assertEqual(company.address, "789 Rome Avenue")

        company.set_current_language('es')
        self.assertEqual(company.name, "Restaurante Italiano")
        self.assertEqual(company.address, "Avenida Roma 789")
