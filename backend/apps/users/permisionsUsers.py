from rest_framework.permissions import BasePermission,SAFE_METHODS

class IsStaff(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


class IsEmploye(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == 'employe')


class IsBoss(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == 'boss')


class IsStaffOrEmploye(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and
            (user.is_staff or user.role == 'employe')
        )

class ProductRolePermission(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        # No autenticado → solo lectura
        if not user or not user.is_authenticated:
            return request.method in SAFE_METHODS

        role = getattr(user, "role", None)

        if role == "boss":
            return True  # CRUD completo

        if role == "employe":
            if request.method in SAFE_METHODS:
                return True
            return request.method == "POST"  # solo crear

        if role == "client":
            return request.method in SAFE_METHODS  # solo GET

        return request.method in SAFE_METHODS