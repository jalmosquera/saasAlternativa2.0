"""Orders API views module.

This module provides REST API viewsets for managing customer orders in the digital
menu system. Orders can be created by authenticated users, and viewed/managed
based on user permissions.

Typical usage example:
    GET /api/orders/ - List user's own orders (or all for staff)
    POST /api/orders/ - Create a new order (authenticated users only)
    GET /api/orders/{id}/ - Retrieve order details
    PATCH /api/orders/{id}/ - Update order status (staff only)
"""

from typing import Any
import threading

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.serializers import Serializer
from rest_framework.filters import SearchFilter
from rest_framework.throttling import AnonRateThrottle
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse
from django.db import transaction
from django.contrib.auth import get_user_model
import secrets

from apps.orders.models import Order
from apps.orders.api.serializers import (
    OrderListSerializer,
    OrderDetailSerializer,
    OrderCreateSerializer
)
from apps.orders.email_service import send_order_confirmation_emails, send_order_cancellation_email
from apps.company.models import Company

User = get_user_model()


class GuestOrderThrottle(AnonRateThrottle):
    """Custom throttle for guest orders: 5 requests per hour."""
    rate = '5/hour'


@extend_schema_view(
    list=extend_schema(
        tags=['orders'],
        description="List all orders. Regular users see only their orders, staff see all.",
        responses={
            200: OrderListSerializer(many=True),
        },
    ),
    create=extend_schema(
        tags=['orders'],
        description="Create a new order with delivery details and items.",
        request=OrderCreateSerializer,
        responses={
            201: OrderDetailSerializer,
            400: OpenApiResponse(description='Invalid data or unavailable products'),
        },
    ),
    retrieve=extend_schema(
        tags=['orders'],
        description="Retrieve order details.",
        responses={
            200: OrderDetailSerializer,
            403: OpenApiResponse(description='Not your order'),
            404: OpenApiResponse(description='Not found'),
        },
    ),
    partial_update=extend_schema(
        tags=['orders'],
        description="Update order status. Regular users can confirm draft orders (draft→pending). Staff can update any order status.",
        responses={
            200: OrderDetailSerializer,
            400: OpenApiResponse(description='Invalid data'),
            403: OpenApiResponse(description='Permission denied - Users can only confirm their own draft orders'),
        },
    ),
)
class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for managing customer orders.

    Provides CRUD operations for orders with user-based filtering.
    Regular users can only create and view their own orders.
    Staff users can view and update all orders.

    Permissions:
        - list: Authenticated users (filtered by user)
        - create: Authenticated users
        - retrieve: Order owner or staff
        - update/partial_update: Order owner (draft→pending only) or staff (any status)
        - destroy: Not allowed

    Attributes:
        permission_classes: Requires authentication for all actions.
        http_method_names: Allowed HTTP methods (no DELETE).

    Example:
        >>> # Create order (from view)
        >>> POST /api/orders/
        >>> {
        ...     "delivery_address": "Calle 123",
        ...     "delivery_location": "Madrid",
        ...     "phone": "+34623736566",
        ...     "items": [
        ...         {"product": 5, "quantity": 2},
        ...         {"product": 7, "quantity": 1}
        ...     ]
        ... }
        >>> # Response: 201 Created with order details

    Note:
        - Users automatically set as order owner on creation
        - Orders cannot be deleted (only cancelled by updating status)
        - Staff can update order status to track fulfillment
    """

    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'head', 'options']  # No DELETE
    filter_backends = [SearchFilter]
    search_fields = ['user__username', 'user__email', 'id', 'delivery_location']

    def get_queryset(self):
        """Get queryset filtered by user permissions.

        Regular users see only their own orders (including drafts).
        Staff users see all orders EXCEPT drafts (draft orders are not yet confirmed by customer).

        Performance optimizations:
        - select_related('user'): Reduces queries for user data
        - prefetch_related('items__product__translations'): Reduces N+1 queries for items
        - prefetch_related('items__product__categories__translations'): Preloads categories

        Returns:
            QuerySet: Optimized and filtered orders queryset.

        Example:
            >>> # Regular user sees only their orders (including drafts)
            >>> user.orders.all()
            >>> # Staff sees all confirmed orders (excluding drafts)
            >>> Order.objects.exclude(status='draft')
        """
        user = self.request.user

        # Base queryset with optimized prefetching
        queryset = Order.objects.select_related('user').prefetch_related(
            'items__product__translations',
            'items__product__categories__translations',
            'items__product__ingredients__translations',
            'items__product__options__translations',
        )

        if user.is_staff:
            # Staff sees all orders except drafts (drafts are not yet confirmed by customer)
            return queryset.exclude(status='draft')
        return queryset.filter(user=user)

    def get_serializer_class(self) -> type[Serializer]:
        """Return appropriate serializer based on action.

        Returns:
            Serializer: OrderListSerializer for list,
                       OrderDetailSerializer for retrieve,
                       OrderCreateSerializer for create.

        Example:
            >>> viewset.action = 'list'
            >>> viewset.get_serializer_class()
            <class 'OrderListSerializer'>
        """
        if self.action == 'list':
            return OrderListSerializer
        elif self.action == 'retrieve':
            return OrderDetailSerializer
        return OrderCreateSerializer

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Create a new order.

        Creates order with authenticated user as owner and provided items.

        Args:
            request: HTTP request with order data.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: 201 with created order details or 400 with errors.

        Example:
            >>> POST /api/orders/
            >>> {
            ...     "delivery_address": "Calle 123",
            ...     "delivery_location": "Madrid",
            ...     "phone": "+34623736566",
            ...     "items": [{"product": 5, "quantity": 2}]
            ... }
            >>> # Returns 201 with OrderDetailSerializer data
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save(user=request.user)

        # Return detailed order response
        detail_serializer = OrderDetailSerializer(order)
        return Response(
            detail_serializer.data,
            status=status.HTTP_201_CREATED
        )

    def partial_update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Update order status.

        Permissions:
        - Regular users: Can only update their own orders from 'draft' to 'pending' (order confirmation)
        - Staff: Can update any order to any status

        Args:
            request: HTTP request with update data.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: 200 with updated order or 403 if permission denied.

        Example:
            >>> # User confirming their draft order
            >>> PATCH /api/orders/1/
            >>> {"status": "pending"}
            >>> # Staff updating order status
            >>> PATCH /api/orders/1/
            >>> {"status": "confirmed"}
        """
        instance = self.get_object()

        # Check permissions
        if not request.user.is_staff:
            # Regular users can only update their own orders
            if instance.user != request.user:
                return Response(
                    {"detail": "You can only update your own orders."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Regular users can only change from 'draft' to 'pending'
            new_status = request.data.get('status')
            if instance.status != 'draft' or new_status != 'pending':
                return Response(
                    {"detail": "You can only confirm draft orders (draft → pending)."},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Only allow status updates
        if 'status' in request.data:
            instance.status = request.data['status']
            instance.save()

        serializer = OrderDetailSerializer(instance)
        return Response(serializer.data)

    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Retrieve order details.

        Users can only view their own orders, staff can view all.

        Args:
            request: HTTP request.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: 200 with order details or 403 if not owner.

        Example:
            >>> GET /api/orders/1/
            >>> # Returns order details if user is owner or staff
        """
        instance = self.get_object()

        # Check permission: owner or staff
        if instance.user != request.user and not request.user.is_staff:
            return Response(
                {"detail": "You can only view your own orders."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel(self, request: Request, pk=None) -> Response:
        """Cancel an order (user can only cancel their own orders).

        Users can cancel orders that are in 'pending' or 'confirmed' status.
        Sends notification emails to company owner when order is cancelled.

        Args:
            request: HTTP request.
            pk: Order primary key.

        Returns:
            Response: 200 with updated order or 400/403 with error.

        Example:
            >>> POST /api/orders/1/cancel/
            >>> # Returns 200 with cancelled order details
        """
        order = self.get_object()

        # Check permission: only owner can cancel
        if order.user != request.user:
            return Response(
                {"detail": "Solo puedes cancelar tus propios pedidos."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if order can be cancelled
        if order.status not in ['pending', 'confirmed']:
            return Response(
                {"detail": f"No puedes cancelar un pedido con estado '{order.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update status
        order.status = 'cancelled'
        order.save()

        # Send cancellation notifications asynchronously
        def send_cancellation_notifications():
            try:
                # Get company email
                company = Company.objects.first()
                if company and company.email:
                    send_order_cancellation_email(order, company.email)

                # TODO: Implement WhatsApp notification
                # send_whatsapp_notification(order, company)

                # TODO: Create admin panel notification
                # create_admin_notification(order)

            except Exception as e:
                print(f"Error sending cancellation notifications: {e}")

        # Start notifications in background thread
        notification_thread = threading.Thread(target=send_cancellation_notifications)
        notification_thread.daemon = True
        notification_thread.start()

        return Response(
            OrderDetailSerializer(order).data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def send_confirmation(self, request: Request) -> Response:
        """Send order confirmation emails to customer and company.

        Expects order data in request body and sends confirmation emails
        to both customer and company.

        Args:
            request: HTTP request with order data.

        Returns:
            Response: 200 with email status or 400 with errors.

        Request body example:
            {
                "order_id": "12345",
                "user_name": "Juan Pérez",
                "user_email": "juan@example.com",
                "language": "es",
                "delivery_info": {
                    "street": "Calle Principal",
                    "house_number": "123",
                    "location": "Ardales",
                    "phone": "+34623736566",
                    "notes": "Ring doorbell"
                },
                "items": [
                    {
                        "name": "Pizza Margherita",
                        "quantity": 2,
                        "unit_price": 12.50,
                        "subtotal": 25.00,
                        "customization": {
                            "deselected_ingredients": ["Cebolla"],
                            "selected_extras": [
                                {"name": "Queso extra", "price": 2.00}
                            ],
                            "additional_notes": "Extra crispy"
                        }
                    }
                ],
                "total_price": 27.00
            }
        """
        # Get company email from database
        try:
            company = Company.objects.first()
            company_email = company.email if company else None
        except Company.DoesNotExist:
            company_email = None

        if not company_email:
            return Response(
                {"detail": "Company email not configured."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Extract data from request
        order_data = request.data
        user_email = order_data.get('user_email') or request.user.email

        if not user_email:
            return Response(
                {"detail": "User email not provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Send emails asynchronously to avoid blocking the response
        def send_emails_async():
            try:
                send_order_confirmation_emails(
                    order_data=order_data,
                    user_email=user_email,
                    company_email=company_email
                )
            except Exception as e:
                # Log the error but don't crash (email sending is not critical)
                print(f"Error sending confirmation emails: {e}")

        # Start email sending in background thread
        email_thread = threading.Thread(target=send_emails_async)
        email_thread.daemon = True
        email_thread.start()

        # Return immediately without waiting for emails
        return Response({
            "message": "Order confirmation initiated. Emails will be sent shortly."
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[], throttle_classes=[GuestOrderThrottle])
    @transaction.atomic
    def guest_checkout(self, request: Request) -> Response:
        """Create order as guest without authentication.

        Creates a temporary guest user account and associated order in draft status.
        The frontend should then confirm the order (PATCH to pending) to trigger
        notifications and emails.

        Protection: Rate limited to 5 requests per hour per IP.

        Request body should include:
        - guest_name: Full name of the guest
        - guest_email: Email address (will be used as username)
        - guest_phone: Phone number
        - delivery_street: Delivery street address
        - delivery_house_number: House/building number
        - delivery_location: City/locality
        - notes: Optional delivery notes
        - items: Array of order items with product ID and customization

        Returns:
            Response: 201 with order details (draft status) or 400/409 with errors

        Example:
            >>> POST /api/orders/guest_checkout/
            >>> {
            ...     "guest_name": "John Doe",
            ...     "guest_email": "john@example.com",
            ...     "guest_phone": "+34623736566",
            ...     "delivery_street": "Calle Principal",
            ...     "delivery_house_number": "123",
            ...     "delivery_location": "Madrid",
            ...     "notes": "Ring doorbell",
            ...     "items": [{"product": 5, "quantity": 2}]
            ... }
        """
        # Extract guest information
        guest_name = request.data.get('guest_name', '').strip()
        guest_email = request.data.get('guest_email', '').strip()
        guest_phone = request.data.get('guest_phone', '').strip()

        # Validate required fields
        if not all([guest_name, guest_email, guest_phone]):
            return Response(
                {"detail": "Se requiere nombre, email y teléfono para pedidos como invitado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user with this email already exists
        existing_user = User.objects.filter(email=guest_email).first()

        if existing_user and existing_user.role != 'guest':
            # Non-guest user exists - return 409 Conflict with clear message
            return Response(
                {
                    "detail": "Ya existe una cuenta con este email. Por favor inicia sesión.",
                    "existing_user": True,
                    "should_login": True
                },
                status=status.HTTP_409_CONFLICT
            )

        # Reuse existing guest or create new one
        if existing_user:
            guest_user = existing_user
            # Update phone if changed
            if guest_user.phone != guest_phone:
                guest_user.phone = guest_phone
                guest_user.save()
        else:
            # Create new guest user
            username_base = guest_email.split('@')[0]
            username = f"guest_{username_base}_{secrets.token_hex(4)}"
            random_password = secrets.token_urlsafe(32)

            guest_user = User.objects.create_user(
                username=username,
                email=guest_email,
                name=guest_name,
                password=random_password
            )
            guest_user.role = 'guest'
            guest_user.phone = guest_phone
            guest_user.save()

        # Prepare order data
        order_data = {
            'delivery_street': request.data.get('delivery_street'),
            'delivery_house_number': request.data.get('delivery_house_number'),
            'delivery_location': request.data.get('delivery_location'),
            'phone': guest_phone,
            'notes': request.data.get('notes', ''),
            'items': request.data.get('items', [])
        }

        # Create order using existing serializer (creates in 'draft' status)
        serializer = OrderCreateSerializer(data=order_data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save(user=guest_user)

        # Update order to pending and trigger notifications
        order.status = 'pending'
        order.save()

        # Send confirmation emails asynchronously
        def send_guest_notifications():
            try:
                # Get company email
                company = Company.objects.first()
                company_email = company.email if company else None

                if company_email:
                    # Prepare email data
                    email_data = {
                        'order_id': order.id,
                        'user_name': guest_name,
                        'user_email': guest_email,
                        'language': request.data.get('language', 'es'),
                        'delivery_info': {
                            'street': order.delivery_street,
                            'house_number': order.delivery_house_number,
                            'location': order.delivery_location,
                            'phone': order.phone,
                            'notes': order.notes or '',
                        },
                        'items': [],  # Will be populated from order items
                        'total_price': float(order.total_price),
                    }

                    # Send confirmation emails
                    send_order_confirmation_emails(
                        order_data=email_data,
                        user_email=guest_email,
                        company_email=company_email
                    )
            except Exception as e:
                print(f"Error sending guest order notifications: {e}")

        # Start notifications in background
        notification_thread = threading.Thread(target=send_guest_notifications)
        notification_thread.daemon = True
        notification_thread.start()

        # Return order details
        detail_serializer = OrderDetailSerializer(order)
        return Response(
            {
                "order": detail_serializer.data,
                "message": "Pedido creado exitosamente. Recibirás un email de confirmación.",
                "guest_user": True
            },
            status=status.HTTP_201_CREATED
        )
