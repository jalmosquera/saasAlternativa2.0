"""Categories API views module.

This module provides REST API viewsets for managing product categories with
internationalization support through django-parler. Categories can be created,
retrieved, updated, and deleted with multilingual name and description fields.

Typical usage example:
    GET /api/categories/ - List all categories with translations
    POST /api/categories/ - Create a new category
    GET /api/categories/{id}/ - Retrieve a specific category
    PUT /api/categories/{id}/ - Update a category
    PATCH /api/categories/{id}/ - Partially update a category
    DELETE /api/categories/{id}/ - Delete a category
"""

from typing import Any

from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.serializers import Serializer
from rest_framework.filters import SearchFilter
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse

from apps.categories.models import Category
from apps.categories.api.serializers import (
    CategorySerializerGet,
    CategorySerializerPost,
)


@extend_schema_view(
    list=extend_schema(
        tags=['categories'],
        summary='List all categories',
        description='Retrieve a list of all categories with their translations',
        responses={
            200: CategorySerializerGet(many=True),
        },
    ),
    create=extend_schema(
        tags=['categories'],
        summary='Create a new category',
        description='Create a new category with multilingual support',
        request=CategorySerializerPost,
        responses={
            201: CategorySerializerGet,
            400: OpenApiResponse(description='Invalid data'),
        },
    ),
    retrieve=extend_schema(
        tags=['categories'],
        summary='Retrieve a category',
        description='Get details of a specific category by ID',
        responses={
            200: CategorySerializerGet,
            404: OpenApiResponse(description='Category not found'),
        },
    ),
    update=extend_schema(
        tags=['categories'],
        summary='Update a category',
        description='Fully update a category and its translations',
        request=CategorySerializerPost,
        responses={
            200: CategorySerializerGet,
            400: OpenApiResponse(description='Invalid data'),
            404: OpenApiResponse(description='Category not found'),
        },
    ),
    partial_update=extend_schema(
        tags=['categories'],
        summary='Partially update a category',
        description='Partially update a category and its translations',
        request=CategorySerializerPost,
        responses={
            200: CategorySerializerGet,
            400: OpenApiResponse(description='Invalid data'),
            404: OpenApiResponse(description='Category not found'),
        },
    ),
    destroy=extend_schema(
        tags=['categories'],
        summary='Delete a category',
        description='Delete a category and all its translations',
        responses={
            204: OpenApiResponse(description='Category deleted successfully'),
            404: OpenApiResponse(description='Category not found'),
        },
    ),
)
class CategoriesView(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ['translations__name', 'translations__description']

    def get_serializer_class(self) -> type[Serializer]:
        """Return the appropriate serializer class based on the action.

        Returns:
            CategorySerializerGet for list and retrieve actions.
            CategorySerializerPost for create, update, and delete actions.
        """
        if self.action in ['list', 'retrieve']:
            return CategorySerializerGet
        return CategorySerializerPost

    def get_serializer(self, *args: Any, **kwargs: Any) -> Serializer:
        """Get serializer instance with custom logic for write operations.

        For create/update/partial_update actions, returns CategorySerializerGet
        instance to ensure the response includes all translations.

        Args:
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Serializer instance appropriate for the current action.

        Notes:
            This ensures that write operations return the full category object
            with all translations, improving client-side data consistency.
        """
        # For create/update/partial_update responses, use GET serializer
        # to include all translations in the response
        if self.action in ['create', 'update', 'partial_update']:
            kwargs.setdefault('context', self.get_serializer_context())
            return CategorySerializerGet(*args, **kwargs)
        return super().get_serializer(*args, **kwargs)
