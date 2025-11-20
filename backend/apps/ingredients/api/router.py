from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.ingredients.api.views import IngredientViewSet

router = DefaultRouter()
router.register(r'ingredients', IngredientViewSet, basename='ingredient')

urlpatterns = [
    path('', include(router.urls)),
]
