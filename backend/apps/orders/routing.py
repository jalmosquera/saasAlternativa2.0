from django.urls import re_path
from . import consumers

# WebSocket URL patterns for the orders app
websocket_urlpatterns = [
    re_path(r'^ws/orders/?$', consumers.OrderConsumer.as_asgi()),
]
