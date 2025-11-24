import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()


class OrderConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time order notifications.

    Groups:
    - orders_staff: All staff members (boss and employe) receive all order notifications
    - orders_user_{user_id}: Individual users receive notifications for their own orders
    """

    async def connect(self):
        """
        Handle WebSocket connection.
        Authenticates user via JWT token and adds them to appropriate groups.
        """
        self.user = None
        self.user_group = None
        self.staff_group = 'orders_staff'

        # Get token from query string
        query_string = self.scope['query_string'].decode()
        token = None

        # Parse query string for token
        for param in query_string.split('&'):
            if param.startswith('token='):
                token = param.split('=')[1]
                break

        if not token:
            # Reject connection if no token provided
            await self.close()
            return

        # Authenticate user with JWT token
        self.user = await self.authenticate_user(token)

        if not self.user:
            # Reject connection if authentication fails
            await self.close()
            return

        # Add to appropriate groups based on user role
        print(f"[Consumer] User {self.user.id} ({self.user.username}, role={self.user.role}) connecting...")
        if self.user.role in ['boss', 'employe']:
            # Staff members join the staff group to receive all order notifications
            print(f"[Consumer] Adding user {self.user.id} to 'orders_staff' group")
            await self.channel_layer.group_add(
                self.staff_group,
                self.channel_name
            )

        # All authenticated users join their personal group
        self.user_group = f'orders_user_{self.user.id}'
        print(f"[Consumer] Adding user {self.user.id} to '{self.user_group}' group")
        await self.channel_layer.group_add(
            self.user_group,
            self.channel_name
        )

        # Accept the WebSocket connection
        await self.accept()

        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to order notifications',
            'user_id': self.user.id,
            'username': self.user.username,
            'role': self.user.role,
        }))

    async def disconnect(self, close_code):
        """
        Handle WebSocket disconnection.
        Removes user from all groups.
        """
        if self.user:
            # Remove from staff group if applicable
            if self.user.role in ['boss', 'employe']:
                await self.channel_layer.group_discard(
                    self.staff_group,
                    self.channel_name
                )

            # Remove from personal group
            if self.user_group:
                await self.channel_layer.group_discard(
                    self.user_group,
                    self.channel_name
                )

    async def receive(self, text_data):
        """
        Handle messages received from WebSocket client.
        Currently not used, but can be extended for client-to-server messages.
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type', '')

            # Handle ping/pong for connection keep-alive
            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': data.get('timestamp'),
                }))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format',
            }))

    async def order_notification(self, event):
        """
        Handler for order_notification events from channel layer.
        Sends the notification to the WebSocket client.
        """
        print(f"[Consumer] Received notification for user {self.user.id} ({self.user.username})")
        print(f"[Consumer] Notification data: action={event['data'].get('action')}, order_id={event['data']['data'].get('order_id')}")

        # Send notification to WebSocket
        await self.send(text_data=json.dumps(event['data']))
        print(f"[Consumer] Notification sent to user {self.user.id}")

    @database_sync_to_async
    def authenticate_user(self, token):
        """
        Authenticate user using JWT token.

        Args:
            token (str): JWT access token

        Returns:
            User object if authentication successful, None otherwise
        """
        try:
            # Decode and validate JWT token
            access_token = AccessToken(token)
            user_id = access_token['user_id']

            # Get user from database
            user = User.objects.get(id=user_id, is_active=True)
            return user
        except Exception as e:
            # Authentication failed
            print(f"Authentication error: {e}")
            return None
