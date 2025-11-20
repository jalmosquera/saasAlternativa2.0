"""Django admin configuration for the users application.

This module configures the Django admin interface for user-related models.
Currently, no custom admin classes are registered, but this file is preserved
for future admin customizations.

Notes:
    - No models are currently registered in this admin module.
    - User authentication is handled through Django's built-in User model
      or a custom User model defined in apps.users.models.
    - Custom permission classes are defined in apps.users.permisionsUsers.
    - Future admin customizations for user management can be added here.

See Also:
    - apps.users.models for User model definition
    - apps.users.permisionsUsers for custom permission classes
    - Django admin documentation for user management
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, PasswordResetToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model with custom fields."""

    list_display = ('username', 'email', 'name', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'name', 'phone')
    ordering = ('-date_joined',)

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('name', 'email', 'phone', 'image')}),
        ('Location', {'fields': ('address', 'location', 'province')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'name', 'password1', 'password2', 'role', 'is_staff'),
        }),
    )

    readonly_fields = ('last_login', 'date_joined')


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    """Admin interface for PasswordResetToken model."""

    list_display = ('user', 'token_preview', 'created_at', 'expires_at', 'used', 'is_valid_display')
    list_filter = ('used', 'created_at')
    search_fields = ('user__email', 'user__username', 'token')
    readonly_fields = ('token', 'created_at', 'expires_at')
    ordering = ('-created_at',)

    def token_preview(self, obj):
        """Show first 16 characters of token."""
        return f"{obj.token[:16]}..."
    token_preview.short_description = 'Token'

    def is_valid_display(self, obj):
        """Display token validity status."""
        return obj.is_valid()
    is_valid_display.boolean = True
    is_valid_display.short_description = 'Is Valid'
