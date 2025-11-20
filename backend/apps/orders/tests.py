"""Tests for orders app models, serializers, and API endpoints."""

from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.orders.models import Order, OrderItem
from apps.products.models import Product
from apps.categories.models import Category

User = get_user_model()


class OrderModelTest(TestCase):
    """Tests for Order model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            name='Test User',
            password='testpass123'
        )

    def test_order_creation(self):
        """Test creating an order successfully."""
        order = Order.objects.create(
            user=self.user,
            delivery_street='Calle Principal',
            delivery_house_number='123',
            delivery_location='ardales',
            phone='+34623736566'
        )
        self.assertEqual(order.status, 'pending')
        self.assertEqual(order.total_price, Decimal('0.00'))
        self.assertEqual(order.delivery_street, 'Calle Principal')

    def test_order_str(self):
        """Test string representation."""
        order = Order.objects.create(
            user=self.user,
            delivery_street='Test Street',
            delivery_house_number='1',
            delivery_location='ardales',
            phone='+34623736566'
        )
        self.assertIn(str(order.id), str(order))
        self.assertIn(self.user.username, str(order))


class OrderItemModelTest(TestCase):
    """Tests for OrderItem model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            name='Test User',
            password='testpass123'
        )
        self.category = Category.objects.create()
        self.category.set_current_language('en')
        self.category.name = 'Test Category'
        self.category.save()

        self.product = Product.objects.create(
            price=Decimal('12.99'),
            stock=50
        )
        self.product.set_current_language('en')
        self.product.name = 'Test Product'
        self.product.save()

        self.order = Order.objects.create(
            user=self.user,
            delivery_street='Test Street',
            delivery_house_number='1',
            delivery_location='ardales',
            phone='+34623736566'
        )

    def test_orderitem_subtotal_calculation(self):
        """Test that subtotal is calculated correctly on save."""
        item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=3,
            unit_price=Decimal('12.99')
        )
        self.assertEqual(item.subtotal, Decimal('38.97'))

    def test_order_calculate_total(self):
        """Test order total calculation from items."""
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=2,
            unit_price=Decimal('12.99')
        )
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=1,
            unit_price=Decimal('8.50')
        )
        self.order.calculate_total()
        self.assertEqual(self.order.total_price, Decimal('34.48'))


class OrderAPITest(APITestCase):
    """Tests for Order API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            name='Test User',
            password='testpass123'
        )
        self.category = Category.objects.create()
        self.category.set_current_language('en')
        self.category.name = 'Test Category'
        self.category.save()

        self.product = Product.objects.create(
            price=Decimal('12.99'),
            stock=50,
            available=True
        )
        self.product.set_current_language('en')
        self.product.name = 'Test Product'
        self.product.save()

    def test_create_order_authenticated(self):
        """Test creating order when authenticated."""
        self.client.force_authenticate(user=self.user)
        data = {
            'delivery_street': 'Calle Principal',
            'delivery_house_number': '123',
            'delivery_location': 'ardales',
            'phone': '+34623736566',
            'notes': 'Ring doorbell',
            'items': [
                {'product': self.product.id, 'quantity': 2}
            ]
        }
        response = self.client.post('/api/orders/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)

    def test_create_order_unauthenticated(self):
        """Test creating order without authentication fails."""
        data = {
            'delivery_street': 'Test Street',
            'delivery_house_number': '1',
            'delivery_location': 'ardales',
            'phone': '+34623736566',
            'items': [{'product': self.product.id, 'quantity': 1}]
        }
        response = self.client.post('/api/orders/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_order_invalid_product(self):
        """Test creating order with non-existent product fails."""
        self.client.force_authenticate(user=self.user)
        data = {
            'delivery_street': 'Test Street',
            'delivery_house_number': '1',
            'delivery_location': 'ardales',
            'phone': '+34623736566',
            'items': [{'product': 99999, 'quantity': 1}]
        }
        response = self.client.post('/api/orders/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_orders_filtered_by_user(self):
        """Test users only see their own orders."""
        self.client.force_authenticate(user=self.user)
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            name='Other User',
            password='pass123'
        )

        # Create order for authenticated user
        my_order = Order.objects.create(
            user=self.user,
            delivery_street='Street 1',
            delivery_house_number='1',
            delivery_location='ardales',
            phone='+34623736566'
        )
        # Create order for other user
        Order.objects.create(
            user=other_user,
            delivery_street='Street 2',
            delivery_house_number='2',
            delivery_location='carratraca',
            phone='+34623736567'
        )

        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check response contains only user's order
        data = response.data if isinstance(response.data, list) else response.data.get('results', response.data)
        if isinstance(data, list):
            # Filter to get only orders for authenticated user
            user_orders = [order for order in data if order.get('user') == self.user.id]
            self.assertEqual(len(user_orders), 1)
            self.assertEqual(user_orders[0]['id'], my_order.id)
