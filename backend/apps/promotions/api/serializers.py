"""Promotion serializers for REST API operations."""

from rest_framework import serializers
from apps.promotions.models import Promotion, CarouselCard


class PromotionSerializer(serializers.ModelSerializer):
    """Serializer for Promotion model.

    Handles serialization of promotions with image URLs and descriptions.

    Attributes:
        image_url (str): Read-only absolute URL for the promotion image.

    Meta:
        model: Promotion model this serializer is based on.
        fields: All promotion fields including computed image_url.

    Example:
        >>> promotion = Promotion.objects.get(id=1)
        >>> serializer = PromotionSerializer(promotion, context={'request': request})
        >>> serializer.data
        {
            'id': 1,
            'title': 'Summer Sale',
            'description': '50% off all pizzas!',
            'image': '/media/promotions/summer_sale.jpg',
            'image_url': 'https://example.com/media/promotions/summer_sale.jpg',
            'is_active': True,
            'order': 1,
            'created_at': '2024-11-12T10:00:00Z',
            'updated_at': '2024-11-12T10:00:00Z'
        }

    Note:
        - image_url provides absolute URL for frontend consumption
        - Requires request in context to build absolute URLs
    """

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Promotion
        fields = [
            'id',
            'title',
            'description',
            'image',
            'image_url',
            'is_active',
            'order',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')

    def get_image_url(self, obj: Promotion) -> str:
        """Get absolute URL for promotion image.

        Args:
            obj: Promotion instance.

        Returns:
            str: Absolute URL for the image or None if no image.

        Example:
            >>> serializer.get_image_url(promotion)
            'https://example.com/media/promotions/summer_sale.jpg'
        """
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class PromotionListSerializer(serializers.ModelSerializer):
    """Serializer for listing active promotions.

    Lightweight serializer for public-facing active promotions list.
    Only includes essential fields needed for display.

    Meta:
        model: Promotion model this serializer is based on.
        fields: Minimal set of fields for display.

    Example:
        >>> promotions = Promotion.objects.filter(is_active=True)
        >>> serializer = PromotionListSerializer(promotions, many=True, context={'request': request})
        >>> serializer.data
        [
            {
                'id': 1,
                'description': '50% off all pizzas!',
                'image_url': 'https://example.com/media/promotions/summer_sale.jpg',
                'order': 1
            },
            ...
        ]

    Note:
        - Used for public API endpoint
        - Only shows active promotions
        - Minimal data transfer for performance
    """

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Promotion
        fields = [
            'id',
            'description',
            'image_url',
            'order'
        ]

    def get_image_url(self, obj: Promotion) -> str:
        """Get absolute URL for promotion image.

        Args:
            obj: Promotion instance.

        Returns:
            str: Absolute URL for the image or None if no image.
        """
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class CarouselCardSerializer(serializers.ModelSerializer):
    """Serializer for CarouselCard model.

    Handles serialization of carousel cards with text, emoji, and background color.

    Meta:
        model: CarouselCard model this serializer is based on.
        fields: All carousel card fields.

    Example:
        >>> card = CarouselCard.objects.get(id=1)
        >>> serializer = CarouselCardSerializer(card)
        >>> serializer.data
        {
            'id': 1,
            'text': 'Hamburguesas Deliciosas',
            'emoji': '🍔',
            'background_color': '#FF6B35',
            'is_active': True,
            'order': 1,
            'created_at': '2024-11-12T10:00:00Z',
            'updated_at': '2024-11-12T10:00:00Z'
        }

    Note:
        - All fields are included for admin management
        - Public endpoints may use a filtered version
    """

    class Meta:
        model = CarouselCard
        fields = [
            'id',
            'text',
            'emoji',
            'background_color',
            'is_active',
            'order',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')
