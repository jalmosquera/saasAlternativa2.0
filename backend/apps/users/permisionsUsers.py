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
    """Permission class for granular role-based CRUD access control.

    Permissions by role:
    - boss: Full CRUD access (GET, POST, PUT, PATCH, DELETE)
    - employe: Granular permissions based on can_create, can_update, can_delete fields
    - client: Read-only access (GET)
    - anonymous: Read-only access (GET)
    """
    def has_permission(self, request, view):
        user = request.user

        # No autenticado → solo GET
        if not user or not user.is_authenticated:
            return request.method in SAFE_METHODS

        role = getattr(user, "role", None)

        # --- boss: CRUD completo ---
        if role == "boss":
            return True

        # --- employe: verificar permisos granulares ---
        if role == "employe":
            # Lectura siempre permitida
            if request.method in SAFE_METHODS:
                return True

            # Verificar permisos específicos
            if request.method == "POST":
                return getattr(user, "can_create", False)

            if request.method in ["PUT", "PATCH"]:
                return getattr(user, "can_update", False)

            if request.method == "DELETE":
                return getattr(user, "can_delete", False)

            return False

        # --- client: solo lectura ---
        if role == "client":
            return request.method in SAFE_METHODS

        # Cualquier otro rol → solo lectura
        return request.method in SAFE_METHODS