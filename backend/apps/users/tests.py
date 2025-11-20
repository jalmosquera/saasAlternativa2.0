"""Tests for User model and manager."""

from django.test import TestCase
from django.core.exceptions import ValidationError
from apps.users.models import User


class UserManagerTest(TestCase):
    """Test cases for custom UserManager."""

    def test_create_user_successfully(self):
        """Test creating a regular user with valid data."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            name='Test User',
            password='testpass123'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.name, 'Test User')
        self.assertEqual(user.role, 'client')
        self.assertFalse(user.is_staff)
        self.assertTrue(user.check_password('testpass123'))

    def test_create_user_without_email_fails(self):
        """Test that creating user without email raises ValueError."""
        with self.assertRaises(ValueError) as context:
            User.objects.create_user(
                username='testuser',
                email='',
                name='Test User',
                password='testpass123'
            )
        self.assertIn('email', str(context.exception).lower())

    def test_create_superuser_successfully(self):
        """Test creating a superuser with boss role."""
        superuser = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            name='Admin User',
            password='adminpass123'
        )
        self.assertEqual(superuser.role, 'boss')
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.check_password('adminpass123'))


class UserModelTest(TestCase):
    """Test cases for User model."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            name='Test User',
            password='testpass123'
        )

    def test_user_str_representation(self):
        """Test string representation returns user's name."""
        self.assertEqual(str(self.user), 'Test User')

    def test_user_default_role_is_client(self):
        """Test that default role is client."""
        self.assertEqual(self.user.role, 'client')

    def test_user_has_perm_returns_true(self):
        """Test has_perm always returns True."""
        self.assertTrue(self.user.has_perm('any.permission'))

    def test_user_has_module_perms_returns_true(self):
        """Test has_module_perms always returns True."""
        self.assertTrue(self.user.has_module_perms('any_app'))
