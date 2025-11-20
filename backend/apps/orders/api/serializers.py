"""Order serializers for REST API operations.

This module provides serializers for the Order and OrderItem models, supporting
order creation, listing, and detail retrieval through Django REST Framework.
"""

from typing import Any, Dict, List
from decimal import Decimal
from rest_framework import serializers
from apps.orders.models import Order, OrderItem
from apps.products.models import Product
from apps.users.models import User


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem model.

    Handles serialization of order items with product information,
    quantities, and pricing. Used for nested representation within orders.

    Attributes:
        product_id (int): ID of the product being ordered.
        product_name (str): Read-only name of the product (in current language).
        product_price (Decimal): Read-only current price of the product.

    Meta:
        model: OrderItem model this serializer is based on.
        fields: Includes order_item details and product information.
        read_only_fields: Subtotal is calculated automatically.

    Example:
        >>> # Serialize an order item
        >>> item = OrderItem.objects.get(id=1)
        >>> serializer = OrderItemSerializer(item)
        >>> serializer.data
        {
            'id': 1,
            'product': 5,
            'product_name': 'Pizza Margherita',
            'product_price': '12.99',
            'quantity': 2,
            'unit_price': '12.99',
            'subtotal': '25.98'
        }

    Note:
        - product_name uses current language translation
        - unit_price stores price at time of order
        - subtotal is automatically calculated on save
    """

    product_name = serializers.SerializerMethodField()
    product_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        source='product.price',
        read_only=True
    )

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'product_name',
            'product_price',
            'quantity',
            'unit_price',
            'subtotal',
            'customization'
        ]
        read_only_fields = ('subtotal',)

    def get_product_name(self, obj: OrderItem) -> str:
        """Get product name in current language.

        Args:
            obj: OrderItem instance.

        Returns:
            str: Product name in current language or 'Unknown Product'.

        Example:
            >>> serializer.get_product_name(order_item)
            'Pizza Margherita'
        """
        try:
            return obj.product.name
        except (AttributeError, Product.DoesNotExist):
            return 'Unknown Product'


class OrderListSerializer(serializers.ModelSerializer):
    """Serializer for listing orders (GET list).

    Provides order information including nested order items for analytics.

    Attributes:
        user_name (str): Read-only name of the user who placed the order.
        user_email (str): Read-only email of the user.
        items_count (int): Read-only count of items in the order.
        items (list): Nested list of order items with product details.

    Meta:
        model: Order model this serializer is based on.
        fields: Order information with nested items.

    Example:
        >>> # List all orders
        >>> orders = Order.objects.all()
        >>> serializer = OrderListSerializer(orders, many=True)
        >>> serializer.data
        [
            {
                'id': 1,
                'user': 1,
                'user_name': 'John Doe',
                'user_email': 'john@example.com',
                'status': 'pending',
                'total_price': '45.50',
                'items_count': 3,
                'items': [...],
                'created_at': '2024-10-30T12:00:00Z'
            },
            ...
        ]

    Note:
        - Includes items for analytics purposes
        - Timestamps are ISO 8601 formatted
    """

    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    items_count = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'user',
            'user_name',
            'user_email',
            'status',
            'total_price',
            'items_count',
            'items',
            'delivery_street',
            'delivery_house_number',
            'delivery_location',
            'phone',
            'created_at'
        ]

    def get_items_count(self, obj: Order) -> int:
        """Get count of items in the order.

        Args:
            obj: Order instance.

        Returns:
            int: Number of items in the order.

        Example:
            >>> serializer.get_items_count(order)
            3
        """
        return obj.items.count()

    def get_items(self, obj: Order) -> List[Dict]:
        """Get order items with product details.

        Args:
            obj: Order instance.

        Returns:
            list: Order items with product info including image.

        Example:
            >>> serializer.get_items(order)
            [{'product': 1, 'product_name': 'Pizza', 'product_image': 'url', ...}]
        """
        request = self.context.get('request')
        items_data = []
        for item in obj.items.all():
            # Build absolute URL for product image
            product_image = None
            if item.product.image:
                if request:
                    product_image = request.build_absolute_uri(item.product.image.url)
                else:
                    product_image = item.product.image.url

            items_data.append({
                'product': item.product.id,
                'product_name': str(item.product),
                'product_image': product_image,
                'quantity': item.quantity,
                'unit_price': str(item.unit_price),
                'subtotal': str(item.subtotal),
                'customization': item.customization,
            })
        return items_data


class OrderDetailSerializer(serializers.ModelSerializer):
    """Serializer for order detail view (GET detail).

    Provides complete order information including nested order items,
    user details, and delivery information. Used for detail endpoints.

    Attributes:
        user_name (str): Read-only name of the user.
        user_email (str): Read-only email of the user.
        items (list): Nested list of OrderItems with full details.

    Meta:
        model: Order model this serializer is based on.
        fields: All order fields plus nested items.

    Example:
        >>> # Get order detail
        >>> order = Order.objects.get(id=1)
        >>> serializer = OrderDetailSerializer(order)
        >>> serializer.data
        {
            'id': 1,
            'user': 1,
            'user_name': 'John Doe',
            'user_email': 'john@example.com',
            'status': 'pending',
            'total_price': '45.50',
            'delivery_street': 'Calle Principal',
            'delivery_house_number': '123',
            'delivery_location': 'Ardales',
            'phone': '+34623736566',
            'notes': 'Ring doorbell twice',
            'items': [
                {
                    'id': 1,
                    'product': 5,
                    'product_name': 'Pizza Margherita',
                    'quantity': 2,
                    'unit_price': '12.99',
                    'subtotal': '25.98'
                },
                ...
            ],
            'created_at': '2024-10-30T12:00:00Z',
            'updated_at': '2024-10-30T12:05:00Z'
        }

    Note:
        - Includes full nested order items
        - Read-only, used only for GET detail requests
        - All timestamps are ISO 8601 formatted
    """

    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'user',
            'user_name',
            'user_email',
            'status',
            'total_price',
            'delivery_street',
            'delivery_house_number',
            'delivery_location',
            'phone',
            'notes',
            'items',
            'created_at',
            'updated_at'
        ]


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new orders (POST).

    Handles order creation with nested order items. Validates order data,
    creates Order instance with OrderItems, and calculates total price.

    Attributes:
        items (list): List of order items to create. Each item must have:
            - product (int): Product ID
            - quantity (int): Quantity to order

    Meta:
        model: Order model this serializer is based on.
        fields: Order fields excluding user (set from request.user).

    Example:
        >>> # Create new order
        >>> data = {
        ...     'delivery_street': 'Calle Principal',
        ...     'delivery_house_number': '123',
        ...     'delivery_location': 'Ardales',
        ...     'phone': '+34623736566',
        ...     'notes': 'Ring doorbell',
        ...     'items': [
        ...         {'product': 5, 'quantity': 2},
        ...         {'product': 7, 'quantity': 1}
        ...     ]
        ... }
        >>> serializer = OrderCreateSerializer(data=data)
        >>> if serializer.is_valid():
        ...     order = serializer.save(user=request.user)
        >>> order.total_price
        Decimal('38.97')

    Note:
        - User is set from request.user in view
        - Items are created with unit_price from Product.price
        - Total price is calculated automatically
        - Validates that products exist and are available
    """

    items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )

    class Meta:
        model = Order
        fields = [
            'delivery_street',
            'delivery_house_number',
            'delivery_location',
            'phone',
            'notes',
            'items'
        ]

    def validate_items(self, value: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validate order items data.

        Ensures each item has required fields and references valid products.

        Args:
            value: List of item dictionaries with 'product', 'quantity', and optional 'customization'.

        Returns:
            List: Validated items data.

        Raises:
            ValidationError: If items are invalid or products don't exist.

        Example:
            >>> items = [{'product': 5, 'quantity': 2, 'customization': {...}}]
            >>> serializer.validate_items(items)
            [{'product': 5, 'quantity': 2, 'customization': {...}}]
        """
        if not value:
            raise serializers.ValidationError("Order must have at least one item.")

        for item in value:
            if 'product' not in item or 'quantity' not in item:
                raise serializers.ValidationError(
                    "Each item must have 'product' and 'quantity' fields."
                )

            try:
                product = Product.objects.get(id=item['product'])
                if not product.available:
                    raise serializers.ValidationError(
                        f"Product '{product.name}' is not available."
                    )
            except Product.DoesNotExist:
                raise serializers.ValidationError(
                    f"Product with id {item['product']} does not exist."
                )

            if item['quantity'] < 1:
                raise serializers.ValidationError("Quantity must be at least 1.")

        return value

    def create(self, validated_data: Dict[str, Any]) -> Order:
        """Create Order instance with nested OrderItems.

        Extracts items from validated data, creates Order, then creates
        OrderItems with current product prices, and calculates total.

        Args:
            validated_data: Validated order data including items.

        Returns:
            Order: Created order instance with items.

        Example:
            >>> order = serializer.create(validated_data)
            >>> order.items.count()
            2
            >>> order.total_price
            Decimal('38.97')
        """
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)

        # Create order items
        for item_data in items_data:
            product = Product.objects.get(id=item_data['product'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                unit_price=product.price,
                customization=item_data.get('customization', None)
            )

        # Calculate and save total price
        order.calculate_total()
        order.save()

        return order
