"""Promotions API views module."""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.request import Request
from drf_spectacular.utils import extend_schema, extend_schema_view

from apps.promotions.models import Promotion, CarouselCard
from apps.promotions.api.serializers import PromotionSerializer, PromotionListSerializer, CarouselCardSerializer


@extend_schema_view(
    list=extend_schema(
        tags=['promotions'],
        description="List all promotions (admin only)",
        responses={200: PromotionSerializer(many=True)},
    ),
    retrieve=extend_schema(
        tags=['promotions'],
        description="Get promotion details (admin only)",
        responses={200: PromotionSerializer},
    ),
    create=extend_schema(
        tags=['promotions'],
        description="Create new promotion (admin only)",
        responses={201: PromotionSerializer},
    ),
    update=extend_schema(
        tags=['promotions'],
        description="Update promotion (admin only)",
        responses={200: PromotionSerializer},
    ),
    partial_update=extend_schema(
        tags=['promotions'],
        description="Partially update promotion (admin only)",
        responses={200: PromotionSerializer},
    ),
    destroy=extend_schema(
        tags=['promotions'],
        description="Delete promotion (admin only)",
        responses={204: None},
    ),
)
class PromotionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing promotions.

    Provides CRUD operations for promotions. Admin-only access for management,
    with public endpoint for active promotions.

    Permissions:
        - list, create, update, delete: Admin only
        - active: Public access (no authentication required)

    Attributes:
        queryset: All promotions ordered by display order.
        serializer_class: PromotionSerializer for all operations.

    Example:
        >>> # List all promotions (admin)
        >>> GET /api/promotions/

        >>> # Get active promotions (public)
        >>> GET /api/promotions/active/

        >>> # Create promotion (admin)
        >>> POST /api/promotions/
        >>> {
        ...     "title": "Summer Sale",
        ...     "description": "50% off!",
        ...     "image": <file>,
        ...     "is_active": true,
        ...     "order": 1
        ... }
    """

    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer
    pagination_class = None  # Disable pagination for this ViewSet

    def get_permissions(self):
        """Get permissions based on action.

        Returns:
            list: Permission classes for the current action.

        Note:
            - 'active' action allows any user (no auth required)
            - All other actions require admin permissions
        """
        if self.action == 'active':
            return [AllowAny()]
        return [IsAdminUser()]

    @extend_schema(
        tags=['promotions'],
        description="Get all active promotions for display (public endpoint)",
        responses={200: PromotionListSerializer(many=True)},
    )
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def active(self, request: Request) -> Response:
        """Get all active promotions.

        Public endpoint that returns only active promotions, ordered by
        display order. Used by frontend to show promotions in modal.

        Args:
            request: HTTP request.

        Returns:
            Response: List of active promotions with minimal data.

        Example:
            >>> GET /api/promotions/active/
            >>> [
            ...     {
            ...         "id": 1,
            ...         "description": "50% off all pizzas!",
            ...         "image_url": "https://example.com/media/promotions/sale.jpg",
            ...         "order": 1
            ...     },
            ...     ...
            ... ]

        Note:
            - No authentication required
            - Only returns active promotions (is_active=True)
            - Ordered by 'order' field (ascending)
        """
        active_promotions = self.queryset.filter(is_active=True)
        serializer = PromotionListSerializer(
            active_promotions,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema_view(
    list=extend_schema(
        tags=['carousel-cards'],
        description="List all carousel cards (admin only)",
        responses={200: CarouselCardSerializer(many=True)},
    ),
    retrieve=extend_schema(
        tags=['carousel-cards'],
        description="Get carousel card details (admin only)",
        responses={200: CarouselCardSerializer},
    ),
    create=extend_schema(
        tags=['carousel-cards'],
        description="Create new carousel card (admin only)",
        responses={201: CarouselCardSerializer},
    ),
    update=extend_schema(
        tags=['carousel-cards'],
        description="Update carousel card (admin only)",
        responses={200: CarouselCardSerializer},
    ),
    partial_update=extend_schema(
        tags=['carousel-cards'],
        description="Partially update carousel card (admin only)",
        responses={200: CarouselCardSerializer},
    ),
    destroy=extend_schema(
        tags=['carousel-cards'],
        description="Delete carousel card (admin only)",
        responses={204: None},
    ),
)
class CarouselCardViewSet(viewsets.ModelViewSet):
    """ViewSet for managing carousel cards.

    Provides CRUD operations for carousel cards. Admin-only access for management,
    with public endpoint for active cards.

    Permissions:
        - list, create, update, delete: Admin only
        - active: Public access (no authentication required)

    Attributes:
        queryset: All carousel cards ordered by display order.
        serializer_class: CarouselCardSerializer for all operations.

    Example:
        >>> # List all cards (admin)
        >>> GET /api/carousel-cards/

        >>> # Get active cards (public)
        >>> GET /api/carousel-cards/active/

        >>> # Create card (admin)
        >>> POST /api/carousel-cards/
        >>> {
        ...     "text": "Hamburguesas Deliciosas",
        ...     "emoji": "🍔",
        ...     "background_color": "#FF6B35",
        ...     "is_active": true,
        ...     "order": 1
        ... }
    """

    queryset = CarouselCard.objects.all()
    serializer_class = CarouselCardSerializer
    pagination_class = None  # Disable pagination for this ViewSet

    def get_permissions(self):
        """Get permissions based on action.

        Returns:
            list: Permission classes for the current action.

        Note:
            - 'active' action allows any user (no auth required)
            - All other actions require admin permissions
        """
        if self.action == 'active':
            return [AllowAny()]
        return [IsAdminUser()]

    @extend_schema(
        tags=['carousel-cards'],
        description="Get all active carousel cards for display (public endpoint)",
        responses={200: CarouselCardSerializer(many=True)},
    )
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def active(self, request: Request) -> Response:
        """Get all active carousel cards.

        Public endpoint that returns only active cards, ordered by
        display order. Used by frontend to show cards in carousel.

        Args:
            request: HTTP request.

        Returns:
            Response: List of active carousel cards.

        Example:
            >>> GET /api/carousel-cards/active/
            >>> [
            ...     {
            ...         "id": 1,
            ...         "text": "Hamburguesas Deliciosas",
            ...         "emoji": "🍔",
            ...         "background_color": "#FF6B35",
            ...         "is_active": true,
            ...         "order": 1
            ...     },
            ...     ...\
            ... ]

        Note:
            - No authentication required
            - Only returns active cards (is_active=True)
            - Ordered by 'order' field (ascending)
        """
        active_cards = self.queryset.filter(is_active=True)
        serializer = CarouselCardSerializer(active_cards, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
