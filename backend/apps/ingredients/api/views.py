"""Ingredients API views module.

This module provides REST API viewsets for managing product ingredients with
internationalization support through django-parler. Ingredients can be created,
retrieved, updated, and deleted with multilingual name and description fields.

Typical usage example:
    GET /api/ingredients/ - List all ingredients with translations
    POST /api/ingredients/ - Create a new ingredient
    GET /api/ingredients/{id}/ - Retrieve a specific ingredient
    PUT /api/ingredients/{id}/ - Update an ingredient
    PATCH /api/ingredients/{id}/ - Partially update an ingredient
    DELETE /api/ingredients/{id}/ - Delete an ingredient
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse

from apps.ingredients.models import Ingredient
from apps.ingredients.api.serializers import IngredientSerializer


@extend_schema_view(
    list=extend_schema(
        tags=['ingredients'],
        summary='List all ingredients',
        description='Retrieve a list of all ingredients with their translations',
        responses={
            200: IngredientSerializer(many=True),
        },
    ),
    create=extend_schema(
        tags=['ingredients'],
        summary='Create a new ingredient',
        description='Create a new ingredient with multilingual support',
        request=IngredientSerializer,
        responses={
            201: IngredientSerializer,
            400: OpenApiResponse(description='Invalid data'),
        },
    ),
    retrieve=extend_schema(
        tags=['ingredients'],
        summary='Retrieve an ingredient',
        description='Get details of a specific ingredient by ID',
        responses={
            200: IngredientSerializer,
            404: OpenApiResponse(description='Ingredient not found'),
        },
    ),
    update=extend_schema(
        tags=['ingredients'],
        summary='Update an ingredient',
        description='Fully update an ingredient and its translations',
        request=IngredientSerializer,
        responses={
            200: IngredientSerializer,
            400: OpenApiResponse(description='Invalid data'),
            404: OpenApiResponse(description='Ingredient not found'),
        },
    ),
    partial_update=extend_schema(
        tags=['ingredients'],
        summary='Partially update an ingredient',
        description='Partially update an ingredient and its translations',
        request=IngredientSerializer,
        responses={
            200: IngredientSerializer,
            400: OpenApiResponse(description='Invalid data'),
            404: OpenApiResponse(description='Ingredient not found'),
        },
    ),
    destroy=extend_schema(
        tags=['ingredients'],
        summary='Delete an ingredient',
        description='Delete an ingredient and all its translations',
        responses={
            204: OpenApiResponse(description='Ingredient deleted successfully'),
            404: OpenApiResponse(description='Ingredient not found'),
        },
    ),
)
class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [SearchFilter]
    search_fields = ['translations__name']
    pagination_class = None  # Disable pagination for ingredients

    def get_queryset(self):
        """Filter ingredients by be_extra query parameter if provided."""
        queryset = super().get_queryset()
        be_extra = self.request.query_params.get('be_extra', None)

        if be_extra is not None:
            # Convert string to boolean
            be_extra_bool = be_extra.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(be_extra=be_extra_bool)

        # Remove duplicates caused by translations join, then order by ID
        # Note: Ordering by translated fields causes duplicates with parler
        return queryset.distinct()

    def list(self, request, *args, **kwargs):
        """Override list to sort results by translated name after fetching."""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)

        # Sort by translated name in Python (after distinct)
        from django.utils.translation import get_language
        current_lang = get_language() or 'es'

        sorted_data = sorted(
            serializer.data,
            key=lambda x: x.get('translations', {}).get(current_lang, {}).get('name', '').lower()
        )

        return Response(sorted_data)
