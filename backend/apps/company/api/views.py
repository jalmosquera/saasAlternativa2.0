"""Company API views module.

This module provides REST API viewsets for managing company information in
the digital menu system. Company data includes business details such as name,
address, contact information, and operating hours.

Typical usage example:
    GET /api/company/ - List all companies
    POST /api/company/ - Create a new company
    GET /api/company/{id}/ - Retrieve company details
    PUT /api/company/{id}/ - Update company information
    PATCH /api/company/{id}/ - Partially update company information
    DELETE /api/company/{id}/ - Delete a company
"""

from typing import Any

from rest_framework import viewsets
from rest_framework.serializers import Serializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.response import Response

from apps.company.models import Company
from apps.company.api.serializers import CompanySerializer


@extend_schema_view(
    list=extend_schema(
        tags=['company'],
        responses=CompanySerializer(many=True),
    ),
    create=extend_schema(
        tags=['company'],
        request=CompanySerializer,
        responses={
            201: CompanySerializer,
            400: Response({'detail': 'Invalid data'}),
        },
    ),
    retrieve=extend_schema(
        tags=['company'],
        responses={
            200: CompanySerializer,
            404: Response({'detail': 'Not found'}),
        },
    ),
    update=extend_schema(
        tags=['company'],
        request=CompanySerializer,
        responses={
            200: CompanySerializer,
            400: Response({'detail': 'Invalid data'}),
        },
    ),
    partial_update=extend_schema(
        tags=['company'],
        request=CompanySerializer,
        responses={
            200: CompanySerializer,
            400: Response({'detail': 'Invalid data'}),
        },
    ),
    destroy=extend_schema(
        tags=['company'],
        responses={204: Response({'detail': 'Deleted successfully'})},
    ),
)
class CompanyView(viewsets.ModelViewSet):
    """ViewSet for managing company information.

    Public access (AllowAny):
        - list: GET /api/company/ - List all companies
        - retrieve: GET /api/company/{id}/ - Get company details

    Authenticated access only (IsAuthenticated):
        - create: POST /api/company/
        - update: PUT /api/company/{id}/
        - partial_update: PATCH /api/company/{id}/
        - destroy: DELETE /api/company/{id}/
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

    def get_permissions(self):
        """Return appropriate permission classes based on the action.

        Returns:
            list: Permission classes for the current action.
                - AllowAny for read operations (list, retrieve)
                - IsAuthenticated for write operations (create, update, partial_update, destroy)
        """
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
