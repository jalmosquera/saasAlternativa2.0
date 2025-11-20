"""Custom permission classes for user role-based access control.

This module defines permission classes that extend Django REST Framework's
BasePermission to implement role-based access control. These permissions
are used to restrict API endpoints based on user roles and staff status.

Classes:
    IsStaff: Permits access only to staff users.
    IsEmploye: Permits access only to users with 'employe' role.
    IsBoss: Permits access only to users with 'boss' role.
    IsStaffOrEmploye: Permits access to staff users or users with 'employe' role.

Example:
    Use these permissions in Django REST Framework views or viewsets::

        from rest_framework.views import APIView
        from apps.users.permisionsUsers import IsStaff, IsBoss

        class AdminOnlyView(APIView):
            permission_classes = [IsStaff]

            def get(self, request):
                return Response({'message': 'Admin access granted'})

        class BossOnlyView(APIView):
            permission_classes = [IsBoss]

            def get(self, request):
                return Response({'message': 'Boss access granted'})

Notes:
    - All permission classes assume a custom User model with 'role' and
      'is_staff' attributes.
    - The 'role' field should contain string values like 'employe' or 'boss'.
    - These permissions are used at the view level, not the object level.
    - Multiple permissions can be combined using AND logic by listing them
      together, or OR logic by creating custom permission classes.

See Also:
    - Django REST Framework permissions documentation
    - apps.users.models for User model definition
"""

from typing import Any

from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView


class IsStaff(BasePermission):
    """Permission class that grants access only to staff users.

    This permission checks whether the requesting user has staff privileges
    by verifying the 'is_staff' attribute on the User model. Staff users
    typically have elevated permissions in the Django admin and other
    administrative functions.

    Methods:
        has_permission: Determines if the user has staff status.

    Examples:
        Basic usage in a view::

            from rest_framework.views import APIView
            from apps.users.permisionsUsers import IsStaff

            class StaffOnlyView(APIView):
                permission_classes = [IsStaff]

                def get(self, request):
                    return Response({'data': 'Staff-only data'})

        Using in a viewset::

            from rest_framework import viewsets
            from apps.users.permisionsUsers import IsStaff

            class AdminViewSet(viewsets.ModelViewSet):
                permission_classes = [IsStaff]
                queryset = SomeModel.objects.all()
                serializer_class = SomeSerializer

    Notes:
        - Returns True only if the user is authenticated AND has is_staff=True.
        - Unauthenticated requests will be denied.
        - This is a view-level permission, not object-level.
        - The permission check uses boolean coercion for safety.
    """

    def has_permission(self, request: Request, view: APIView) -> bool:
        """Check if the requesting user has staff privileges.

        Args:
            request: The incoming HTTP request containing user information.
            view: The view being accessed (not used in this implementation).

        Returns:
            bool: True if the user is authenticated and has staff status,
                False otherwise.

        Examples:
            The method is called automatically by DRF::

                # User with is_staff=True
                >>> permission = IsStaff()
                >>> permission.has_permission(request_with_staff, view)
                True

                # User with is_staff=False
                >>> permission.has_permission(request_without_staff, view)
                False

                # Unauthenticated user
                >>> permission.has_permission(anonymous_request, view)
                False
        """
        return bool(request.user and request.user.is_staff is True)


class IsEmploye(BasePermission):
    """Permission class that grants access only to users with 'employe' role.

    This permission verifies that the requesting user has the 'employe' role
    assigned in their user profile. Employees typically have access to
    operational features but not administrative functions.

    Methods:
        has_permission: Determines if the user has the 'employe' role.

    Examples:
        Basic usage in a view::

            from rest_framework.views import APIView
            from apps.users.permisionsUsers import IsEmploye

            class EmployeeView(APIView):
                permission_classes = [IsEmploye]

                def get(self, request):
                    return Response({'data': 'Employee data'})

        Combining with other permissions (AND logic)::

            from rest_framework.permissions import IsAuthenticated
            from apps.users.permisionsUsers import IsEmploye

            class SecureEmployeeView(APIView):
                permission_classes = [IsAuthenticated, IsEmploye]

    Notes:
        - Requires the User model to have a 'role' field.
        - Only checks for exact match with string 'employe'.
        - Case-sensitive comparison.
        - User must be authenticated for the role check to work.
        - Returns False if the user is not authenticated or role is different.
    """

    def has_permission(self, request: Request, view: APIView) -> bool:
        """Check if the requesting user has the 'employe' role.

        Args:
            request: The incoming HTTP request containing user information.
            view: The view being accessed (not used in this implementation).

        Returns:
            bool: True if the user is authenticated and has role='employe',
                False otherwise.

        Examples:
            The method is called automatically by DRF::

                # User with role='employe'
                >>> permission = IsEmploye()
                >>> permission.has_permission(request_with_employe, view)
                True

                # User with role='boss'
                >>> permission.has_permission(request_with_boss, view)
                False

                # Unauthenticated user
                >>> permission.has_permission(anonymous_request, view)
                False
        """
        return bool(request.user and request.user.role == 'employe')


class IsBoss(BasePermission):
    """Permission class that grants access only to users with 'boss' role.

    This permission verifies that the requesting user has the 'boss' role
    assigned in their user profile. Bosses typically have higher-level access
    than employees but may not have full administrative privileges.

    Methods:
        has_permission: Determines if the user has the 'boss' role.

    Examples:
        Basic usage in a view::

            from rest_framework.views import APIView
            from apps.users.permisionsUsers import IsBoss

            class BossOnlyView(APIView):
                permission_classes = [IsBoss]

                def get(self, request):
                    return Response({'data': 'Management data'})

        Using in a viewset with multiple actions::

            from rest_framework import viewsets
            from rest_framework.decorators import action
            from apps.users.permisionsUsers import IsBoss

            class ReportViewSet(viewsets.ViewSet):
                permission_classes = [IsBoss]

                @action(detail=False, methods=['get'])
                def summary(self, request):
                    return Response({'report': 'Summary data'})

    Notes:
        - Requires the User model to have a 'role' field.
        - Only checks for exact match with string 'boss'.
        - Case-sensitive comparison.
        - User must be authenticated for the role check to work.
        - Returns False if the user is not authenticated or role is different.
    """

    def has_permission(self, request: Request, view: APIView) -> bool:
        """Check if the requesting user has the 'boss' role.

        Args:
            request: The incoming HTTP request containing user information.
            view: The view being accessed (not used in this implementation).

        Returns:
            bool: True if the user is authenticated and has role='boss',
                False otherwise.

        Examples:
            The method is called automatically by DRF::

                # User with role='boss'
                >>> permission = IsBoss()
                >>> permission.has_permission(request_with_boss, view)
                True

                # User with role='employe'
                >>> permission.has_permission(request_with_employe, view)
                False

                # Unauthenticated user
                >>> permission.has_permission(anonymous_request, view)
                False
        """
        return bool(request.user and request.user.role == 'boss')


class IsStaffOrEmploye(BasePermission):
    """Permission class that grants access to staff users or employees.

    This permission implements OR logic, allowing access to users who are
    either staff members OR have the 'employe' role. This is useful for
    endpoints that should be accessible to operational users, whether they
    are designated as staff in Django or have the employee role.

    Methods:
        has_permission: Determines if the user is staff or an employee.

    Examples:
        Basic usage in a view::

            from rest_framework.views import APIView
            from apps.users.permisionsUsers import IsStaffOrEmploye

            class OperationalView(APIView):
                permission_classes = [IsStaffOrEmploye]

                def get(self, request):
                    return Response({'data': 'Operational data'})

        Using in a viewset::

            from rest_framework import viewsets
            from apps.users.permisionsUsers import IsStaffOrEmploye

            class OrderViewSet(viewsets.ModelViewSet):
                permission_classes = [IsStaffOrEmploye]
                queryset = Order.objects.all()
                serializer_class = OrderSerializer

    Notes:
        - Explicitly checks user.is_authenticated for security.
        - Uses OR logic: grants access if EITHER condition is true.
        - More permissive than using IsStaff and IsEmploye separately.
        - Useful for endpoints that need to be accessible to operational
          users regardless of their specific role designation.
        - Returns False for unauthenticated users even if other conditions
          would be true.
    """

    def has_permission(self, request: Request, view: APIView) -> bool:
        """Check if the user is staff or has the 'employe' role.

        This method implements an OR condition, granting access if the user
        is either a staff member OR has the 'employe' role. The user must
        be authenticated in all cases.

        Args:
            request: The incoming HTTP request containing user information.
            view: The view being accessed (not used in this implementation).

        Returns:
            bool: True if the user is authenticated AND (is staff OR has
                role='employe'), False otherwise.

        Examples:
            The method is called automatically by DRF::

                # Staff user (even without 'employe' role)
                >>> permission = IsStaffOrEmploye()
                >>> permission.has_permission(staff_request, view)
                True

                # Employee user (even without staff status)
                >>> permission.has_permission(employe_request, view)
                True

                # Boss user (neither staff nor employe)
                >>> permission.has_permission(boss_request, view)
                False

                # Unauthenticated user
                >>> permission.has_permission(anonymous_request, view)
                False
        """
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_staff or user.role == "employe")
        )

