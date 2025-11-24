"""
Order signals for real-time WebSocket notifications.

This module defines Django signals that trigger WebSocket notifications
when orders are created or updated, enabling real-time updates to the frontend.
"""

import json
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Order


@receiver(post_save, sender=Order)
def order_notification(sender, instance, created, **kwargs):
    """
    Send WebSocket notification when an order is created or updated.

    This signal handler broadcasts order notifications to:
    - orders_staff: All staff members (boss and employe) for all orders
    - orders_user_{user_id}: Individual user for their specific orders

    Note: Draft orders do not trigger notifications. Notifications are only sent
    when the order status is NOT 'draft' (i.e., when customer confirms the order).

    Special case: When an order transitions from 'draft' to 'pending', it's treated
    as a new order creation (action='created') for notification purposes.

    Args:
        sender: The model class (Order)
        instance: The Order instance that was saved
        created: Boolean indicating if this is a new order
        **kwargs: Additional keyword arguments from the signal

    Message format:
        {
            "type": "order_notification",
            "action": "created" | "updated",
            "data": {
                "order_id": int,
                "status": str,
                "total_price": str,
                "user": {
                    "id": int,
                    "username": str,
                    "name": str,
                    "email": str
                },
                "delivery_address": str,
                "phone": str,
                "notes": str,
                "items_count": int,
                "created_at": str,
                "updated_at": str
            }
        }
    """
    # Skip notifications for draft orders (not yet confirmed by customer)
    if instance.status == 'draft':
        return

    channel_layer = get_channel_layer()

    # Determine action type
    # Treat draft→pending transition as 'created' (new confirmed order)
    # Since orders start as 'draft' and only become 'pending' when confirmed,
    # any non-created save with status='pending' is a customer confirmation
    if not created and instance.status == 'pending':
        action = 'created'  # Treat confirmation as new order for notifications
    else:
        action = 'created' if created else 'updated'

    print(f"[Signal] Order #{instance.id} - created={created}, status={instance.status}, action={action}, user_id={instance.user.id}")

    # Prepare order data for notification
    order_data = {
        'type': 'order_notification',
        'action': action,
        'data': {
            'order_id': instance.id,
            'status': instance.status,
            'total_price': str(instance.total_price),
            'user': {
                'id': instance.user.id,
                'username': instance.user.username,
                'name': instance.user.name if hasattr(instance.user, 'name') else instance.user.username,
                'email': instance.user.email,
            },
            'delivery_address': f"{instance.delivery_street}, {instance.delivery_house_number}, {instance.delivery_location}",
            'phone': instance.phone,
            'notes': instance.notes or '',
            'items_count': instance.items.count(),
            'created_at': instance.created_at.isoformat(),
            'updated_at': instance.updated_at.isoformat(),
        }
    }

    # Broadcast to staff group (all orders)
    print(f"[Signal] Sending to 'orders_staff' group")
    async_to_sync(channel_layer.group_send)(
        'orders_staff',
        {
            'type': 'order_notification',
            'data': order_data
        }
    )

    # Broadcast to specific user group (their own order)
    user_group = f'orders_user_{instance.user.id}'
    print(f"[Signal] Sending to '{user_group}' group")
    async_to_sync(channel_layer.group_send)(
        user_group,
        {
            'type': 'order_notification',
            'data': order_data
        }
    )


@receiver(post_delete, sender=Order)
def order_deleted_notification(sender, instance, **kwargs):
    """
    Send WebSocket notification when an order is deleted.

    This signal handler broadcasts order deletion notifications to:
    - orders_staff: All staff members
    - orders_user_{user_id}: The user who owned the order

    Args:
        sender: The model class (Order)
        instance: The Order instance that was deleted
        **kwargs: Additional keyword arguments from the signal

    Message format:
        {
            "type": "order_notification",
            "action": "deleted",
            "data": {
                "order_id": int,
                "user_id": int,
                "message": str
            }
        }
    """
    channel_layer = get_channel_layer()

    # Prepare deletion notification data
    deletion_data = {
        'type': 'order_notification',
        'action': 'deleted',
        'data': {
            'order_id': instance.id,
            'user_id': instance.user.id,
            'message': f'Order #{instance.id} has been deleted'
        }
    }

    # Broadcast to staff group
    async_to_sync(channel_layer.group_send)(
        'orders_staff',
        {
            'type': 'order_notification',
            'data': deletion_data
        }
    )

    # Broadcast to specific user group
    user_group = f'orders_user_{instance.user.id}'
    async_to_sync(channel_layer.group_send)(
        user_group,
        {
            'type': 'order_notification',
            'data': deletion_data
        }
    )
