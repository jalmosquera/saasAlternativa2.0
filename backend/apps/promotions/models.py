"""Promotions models module for managing promotional banners.

This module defines the Promotion model for handling promotional
images and messages that are displayed to customers.
"""

from django.db import models
from django.core.validators import MinValueValidator


class Promotion(models.Model):
    """Promotion model for managing promotional banners and announcements.

    Represents a promotional banner with an image and optional text overlay.
    Promotions can be activated/deactivated and ordered for display sequence.

    Attributes:
        title (str): Title of the promotion (for admin reference).
        description (str): Text to display at the bottom of the image.
        image (ImageField): Promotional image file.
        is_active (bool): Whether promotion is active. Defaults to True.
        order (int): Display order (lower numbers appear first). Defaults to 0.
        created_at (datetime): Timestamp when promotion was created.
        updated_at (datetime): Timestamp of last update.

    Example:
        >>> promotion = Promotion.objects.create(
        ...     title='Summer Sale',
        ...     description='50% off all pizzas!',
        ...     image='promotions/summer_sale.jpg',
        ...     is_active=True,
        ...     order=1
        ... )
        >>> promotion.title
        'Summer Sale'

    Note:
        - Only active promotions are displayed to customers
        - Promotions are ordered by the 'order' field (ascending)
        - Images are uploaded to MEDIA_ROOT/promotions/
    """

    title = models.CharField(
        'Title',
        max_length=200,
        help_text='Internal title for admin reference'
    )
    description = models.TextField(
        'Description',
        max_length=500,
        blank=True,
        help_text='Text displayed at the bottom of the image'
    )
    image = models.ImageField(
        'Image',
        upload_to='promotions/',
        help_text='Promotional banner image'
    )
    is_active = models.BooleanField(
        'Active',
        default=True,
        help_text='Whether this promotion is currently active'
    )
    order = models.IntegerField(
        'Display Order',
        default=0,
        validators=[MinValueValidator(0)],
        help_text='Order in which promotions are displayed (lower numbers first)'
    )
    created_at = models.DateTimeField('Created At', auto_now_add=True)
    updated_at = models.DateTimeField('Updated At', auto_now=True)

    class Meta:
        db_table = 'promotions'
        ordering = ['order', '-created_at']
        verbose_name = 'Promotion'
        verbose_name_plural = 'Promotions'

    def __str__(self) -> str:
        """Return string representation of the promotion.

        Returns:
            str: Promotion title and status.

        Example:
            >>> str(promotion)
            'Summer Sale (Active)'
        """
        status = 'Active' if self.is_active else 'Inactive'
        return f"{self.title} ({status})"


class CarouselCard(models.Model):
    """Carousel card model for animated promotional cards.

    Represents a promotional card that appears in the animated carousel
    on the home page. Cards display emoji, text, and custom background color.

    Attributes:
        text (str): Main text content of the card.
        emoji (str): Emoji icon to display (e.g., 🍔, 🍕, 🌮).
        background_color (str): Hex color code for card background.
        is_active (bool): Whether card is active. Defaults to True.
        order (int): Display order in carousel (lower numbers first). Defaults to 0.
        created_at (datetime): Timestamp when card was created.
        updated_at (datetime): Timestamp of last update.

    Example:
        >>> card = CarouselCard.objects.create(
        ...     text='Hamburguesas Deliciosas',
        ...     emoji='🍔',
        ...     background_color='#FF6B35',
        ...     is_active=True,
        ...     order=1
        ... )
        >>> card.text
        'Hamburguesas Deliciosas'

    Note:
        - Only active cards are displayed in carousel
        - Cards scroll automatically from right to left
        - Background color should be in hex format (#RRGGBB)
    """

    text = models.CharField(
        'Text',
        max_length=100,
        help_text='Text content displayed on the card'
    )
    emoji = models.CharField(
        'Emoji',
        max_length=10,
        help_text='Emoji icon (e.g., 🍔, 🍕, 🌮)'
    )
    background_color = models.CharField(
        'Background Color',
        max_length=7,
        default='#FF6B35',
        help_text='Hex color code for card background (e.g., #FF6B35)'
    )
    is_active = models.BooleanField(
        'Active',
        default=True,
        help_text='Whether this card is currently active'
    )
    order = models.IntegerField(
        'Display Order',
        default=0,
        validators=[MinValueValidator(0)],
        help_text='Order in carousel (lower numbers appear first)'
    )
    created_at = models.DateTimeField('Created At', auto_now_add=True)
    updated_at = models.DateTimeField('Updated At', auto_now=True)

    class Meta:
        db_table = 'carousel_cards'
        ordering = ['order', '-created_at']
        verbose_name = 'Carousel Card'
        verbose_name_plural = 'Carousel Cards'

    def __str__(self) -> str:
        """Return string representation of the carousel card.

        Returns:
            str: Card emoji and text with status.

        Example:
            >>> str(card)
            '🍔 Hamburguesas Deliciosas (Active)'
        """
        status = 'Active' if self.is_active else 'Inactive'
        return f"{self.emoji} {self.text} ({status})"
