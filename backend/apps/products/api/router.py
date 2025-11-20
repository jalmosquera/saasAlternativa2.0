from rest_framework.routers import DefaultRouter
from apps.products.api.views import (
    ProductViewSet,
    ProductOptionViewSet,
    ProductOptionChoiceViewSet,
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='products')
router.register(r'product-options', ProductOptionViewSet, basename='product-options')
router.register(r'product-option-choices', ProductOptionChoiceViewSet, basename='product-option-choices')


urlpatterns = router.urls
