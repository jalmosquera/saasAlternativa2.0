"""Order models module for order management and tracking.

This module defines the Order and OrderItem models for handling customer orders
in the digital menu system. Orders contain customer delivery information and
multiple OrderItems representing the products ordered.
"""

from decimal import Decimal
from typing import Optional
from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth import get_user_model

User = get_user_model()


class Order(models.Model):
    """Order model for managing customer orders and delivery information.

    Represents a customer order with delivery details, status tracking, and
    calculated total price. Each order belongs to a user and contains multiple
    order items (products with quantities).

    Attributes:
        user (ForeignKey): User who placed the order.
        status (str): Current order status. Choices: 'pending', 'confirmed',
            'completed', 'cancelled'. Defaults to 'pending'.
        total_price (Decimal): Total price of the order (calculated automatically).
        delivery_street (str): Street name for delivery.
        delivery_house_number (str): House number for delivery.
        delivery_location (str): City or locality for delivery (dynamically configured in company settings).
        phone (str): Contact phone number for delivery.
        notes (str): Optional additional notes or instructions (max 500 chars).
        created_at (datetime): Timestamp when order was created.
        updated_at (datetime): Timestamp of last update.

    Status Choices:
        - pending: Order placed, awaiting confirmation
        - confirmed: Order confirmed by restaurant
        - completed: Order delivered and completed
        - cancelled: Order cancelled

    Example:
        >>> user = User.objects.get(id=1)
        >>> order = Order.objects.create(
        ...     user=user,
        ...     delivery_street='Calle Principal',
        ...     delivery_house_number='123',
        ...     delivery_location='Ardales',
        ...     phone='+34623736566',
        ...     notes='Ring the doorbell twice'
        ... )
        >>> order.status
        'pending'
        >>> order.total_price
        Decimal('0.00')
        >>> # Add items to order
        >>> OrderItem.objects.create(
        ...     order=order,
        ...     product=product,
        ...     quantity=2,
        ...     unit_price=product.price
        ... )
        >>> order.calculate_total()
        >>> order.total_price
        Decimal('25.98')

    Note:
        - Total price is calculated from order items
        - User must be authenticated to create orders
        - Delivery address fields are required for order creation
        - Phone number should include country code
    """

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='orders',
        verbose_name='User'
    )
    status = models.CharField(
        'Status',
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    total_price = models.DecimalField(
        'Total Price',
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )

    # Delivery information
    delivery_street = models.CharField('Delivery Street', max_length=200)
    delivery_house_number = models.CharField('House Number', max_length=20)
    delivery_location = models.CharField(
        'Delivery Location',
        max_length=100,
        help_text='Delivery location name (dynamically managed from company settings)'
    )
    phone = models.CharField('Phone', max_length=20)
    notes = models.TextField(
        'Notes',
        max_length=500,
        blank=True,
        null=True,
        help_text='Additional delivery instructions'
    )

    # Timestamps
    created_at = models.DateTimeField('Created At', auto_now_add=True)
    updated_at = models.DateTimeField('Updated At', auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        # Performance optimization: Add indexes for common queries
        indexes = [
            models.Index(fields=['user', '-created_at'], name='order_user_created_idx'),
            models.Index(fields=['status', '-created_at'], name='order_status_created_idx'),
            models.Index(fields=['-created_at'], name='order_created_idx'),
        ]

    def __str__(self) -> str:
        """Return string representation of the order.

        Returns:
            str: Order ID, user, and status.

        Example:
            >>> str(order)
            'Order #123 - john_doe (pending)'
        """
        return f"Order #{self.id} - {self.user.username} ({self.status})"

    def calculate_total(self) -> None:
        """Calculate and update the total price from all order items.

        Sums up the subtotal of all OrderItems related to this order and
        updates the total_price field. Must be saved after calling.

        Example:
            >>> order.calculate_total()
            >>> order.save()
            >>> order.total_price
            Decimal('45.50')
        """
        self.total_price = sum(
            item.subtotal for item in self.items.all()
        )


class OrderItem(models.Model):
    """OrderItem model representing individual products in an order.

    Represents a product within an order with quantity and pricing information.
    Stores the unit price at the time of order to maintain price history even
    if product prices change later.

    Attributes:
        order (ForeignKey): Order this item belongs to.
        product (ForeignKey): Product being ordered.
        quantity (int): Quantity of the product ordered (minimum 1).
        unit_price (Decimal): Price per unit at time of order (minimum 0.01).
        subtotal (Decimal): Calculated subtotal (unit_price * quantity).

    Example:
        >>> order = Order.objects.get(id=1)
        >>> product = Product.objects.get(id=5)
        >>> item = OrderItem.objects.create(
        ...     order=order,
        ...     product=product,
        ...     quantity=3,
        ...     unit_price=product.price
        ... )
        >>> item.subtotal
        Decimal('38.97')
        >>> item.save()

    Note:
        - unit_price is stored to preserve pricing at order time
        - subtotal is automatically calculated from quantity * unit_price
        - Deleting an order will cascade delete all its items
        - Product should not be deleted if referenced in orders (PROTECT)
    """

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Order'
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.PROTECT,
        related_name='order_items',
        verbose_name='Product'
    )
    quantity = models.PositiveIntegerField(
        'Quantity',
        default=1,
        validators=[MinValueValidator(1)]
    )
    unit_price = models.DecimalField(
        'Unit Price',
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text='Price per unit at time of order'
    )
    subtotal = models.DecimalField(
        'Subtotal',
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    customization = models.JSONField(
        'Customization',
        blank=True,
        null=True,
        help_text='Product customization: selected ingredients, extras, and notes'
    )

    class Meta:
        db_table = 'order_items'
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'

    def __str__(self) -> str:
        """Return string representation of the order item.

        Returns:
            str: Product name, quantity, and order ID.

        Example:
            >>> str(order_item)
            'Pizza Margherita x2 (Order #123)'
        """
        return f"{self.product} x{self.quantity} (Order #{self.order.id})"

    def save(self, *args, **kwargs) -> None:
        """Save the order item and calculate subtotal.

        Automatically calculates the subtotal (quantity * unit_price) before
        saving the instance.

        Args:
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Example:
            >>> item = OrderItem(order=order, product=product, quantity=2, unit_price=Decimal('12.50'))
            >>> item.save()
            >>> item.subtotal
            Decimal('25.00')
        """
        self.subtotal = self.quantity * self.unit_price
        super().save(*args, **kwargs)
