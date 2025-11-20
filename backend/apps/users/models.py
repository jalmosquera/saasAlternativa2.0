"""User model module for authentication and authorization.

This module defines custom User and UserManager models extending Django's
AbstractUser to support role-based access control and additional user profile
information for the digital menu system.
"""

from typing import Optional
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
import secrets
from datetime import timedelta


class UserManager(BaseUserManager):
    """Custom user manager for creating users and superusers.

    Extends Django's BaseUserManager to handle custom user creation logic,
    including email normalization and role assignment for superusers.

    Methods:
        create_user: Creates and saves a regular user with the given credentials.
        create_superuser: Creates and saves a superuser with staff privileges.

    Note:
        - Email is required for user creation
        - Superusers are automatically assigned the 'boss' role
        - Passwords are properly hashed using set_password()
    """

    def create_user(
        self,
        username: str,
        email: str,
        name: str,
        password: Optional[str] = None
    ) -> 'User':
        """Create and save a regular user with the given credentials.

        Args:
            username: Unique username for authentication (max 50 chars).
            email: User's email address, will be normalized.
            name: User's full name or display name.
            password: Plain text password to be hashed. Defaults to None.

        Returns:
            User: The newly created user instance.

        Raises:
            ValueError: If email is not provided.

        Example:
            >>> user_manager = UserManager()
            >>> user = user_manager.create_user(
            ...     username='johndoe',
            ...     email='john@example.com',
            ...     name='John Doe',
            ...     password='securepass123'
            ... )
            >>> user.is_staff
            False
            >>> user.role
            'client'
        """
        if not email:
            raise ValueError("you need to provide an email")
        user = self.model(
            username=username, email=self.normalize_email(email), name=name
        )
        user.set_password(password)
        user.save()
        return user

    def create_superuser(
        self,
        username: str,
        email: str,
        name: str,
        password: str
    ) -> 'User':
        """Create and save a superuser with staff privileges and boss role.

        Args:
            username: Unique username for authentication (max 50 chars).
            email: User's email address, will be normalized.
            name: User's full name or display name.
            password: Plain text password to be hashed.

        Returns:
            User: The newly created superuser instance with staff privileges.

        Example:
            >>> user_manager = UserManager()
            >>> superuser = user_manager.create_superuser(
            ...     username='admin',
            ...     email='admin@example.com',
            ...     name='Admin User',
            ...     password='adminpass123'
            ... )
            >>> superuser.is_staff
            True
            >>> superuser.role
            'boss'
        """
        user = self.create_user(
            username=username,
            email=email,
            name=name,
            password=password,
        )

        user.is_staff = True
        user.role = 'boss'
        user.save()
        return user


class User(AbstractUser):
    """Custom user model with role-based access control and profile information.

    Extends Django's AbstractUser to add role-based permissions (client, boss, employee),
    profile information (address, phone, location), and avatar support. Used for
    authentication and authorization throughout the digital menu system.

    Attributes:
        objects (UserManager): Custom manager for user creation and management.
        username (str): Unique username for authentication (max 50 chars).
        name (str): User's full name or display name (max 100 chars).
        email (str): Unique email address for the user.
        image (ImageField): User avatar uploaded to 'avatar/' directory.
                           Defaults to 'avatar/default.jpg'.
        is_staff (bool): Whether user has staff/admin privileges. Defaults to False.
        role (str): User's role in the system. Choices: 'client', 'boss', 'employe'.
                   Defaults to 'client'.
        address (str): User's street address (max 250 chars, optional).
        location (str): User's city or locality (max 250 chars, optional).
        province (str): User's province or state (max 100 chars, optional).
        phone (str): User's phone number (max 20 chars, optional).

    Role Choices:
        - client: Regular customer with ordering permissions
        - boss: Manager/owner with full administrative access
        - employe: Staff member with limited administrative access

    Example:
        >>> # Create a regular client user
        >>> user = User.objects.create_user(
        ...     username='customer1',
        ...     email='customer@example.com',
        ...     name='Jane Customer',
        ...     password='securepass'
        ... )
        >>> user.role
        'client'
        >>> user.is_staff
        False
        >>>
        >>> # Create a superuser (boss)
        >>> boss = User.objects.create_superuser(
        ...     username='admin',
        ...     email='admin@example.com',
        ...     name='Admin User',
        ...     password='adminpass'
        ... )
        >>> boss.role
        'boss'
        >>> boss.is_staff
        True
        >>>
        >>> # Update user profile
        >>> user.address = '123 Main St'
        >>> user.phone = '+1234567890'
        >>> user.save()

    Note:
        - Username and email must be unique
        - Email is required for user creation
        - Default avatar is provided at 'avatar/default.jpg'
        - Table name preserved as 'users_users' for backward compatibility
        - All users have full permissions (has_perm returns True)
    """

    ROLE = (
        (
            "client",
            "client",
        ),
        (
            "boss",
            "boss",
        ),
        (
            "employe",
            "employe",
        ),
    )

    # Custom manager
    objects = UserManager()

    # Database fields
    username = models.CharField("Username", max_length=50, unique=True)
    name = models.CharField("Name", max_length=100)
    email = models.EmailField("Email", max_length=254, unique=True)
    image = models.ImageField(
        "Image", upload_to="avatar", null=True, blank=True, default="avatar/default.jpg"
    )
    # Permissions
    is_staff = models.BooleanField(default=False)
    role = models.CharField("Role", choices=ROLE, max_length=50, default="client")
    # Profile data
    address = models.CharField("Address", max_length=250, blank=True, null=True)
    location = models.CharField("Location", max_length=250, blank=True, null=True)
    province = models.CharField("Province", max_length=100, blank=True, null=True)
    phone = models.CharField("Phone", max_length=20, blank=True, null=True)

    class Meta:
        db_table = 'users_users'  # Keep the old table name to avoid migration issues

    def __str__(self) -> str:
        """Return string representation of the user.

        Returns the user's full name for display purposes.

        Returns:
            str: User's name.

        Example:
            >>> user = User.objects.get(username='johndoe')
            >>> str(user)
            'John Doe'
        """
        return self.name

    def has_perm(self, perm: str, obj: Optional[object] = None) -> bool:
        """Check if user has a specific permission.

        Currently returns True for all users, granting universal permissions.
        Can be customized to implement role-based permission checks.

        Args:
            perm: Permission string to check (e.g., 'app.add_model').
            obj: Optional object to check permission against. Defaults to None.

        Returns:
            bool: Always True in current implementation.

        Example:
            >>> user.has_perm('products.add_product')
            True
        """
        return True

    def has_module_perms(self, app_label: str) -> bool:
        """Check if user has permissions to access a specific app module.

        Currently returns True for all users and all modules. Can be customized
        to implement role-based module access control.

        Args:
            app_label: Django app label to check permissions for (e.g., 'products').

        Returns:
            bool: Always True in current implementation.

        Example:
            >>> user.has_module_perms('products')
            True
            >>> user.has_module_perms('admin')
            True
        """
        return True

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email", "name"]


class PasswordResetToken(models.Model):
    """Model for managing password reset tokens.

    Stores temporary tokens used for password reset functionality. Tokens are
    randomly generated and expire after 1 hour for security purposes.

    Attributes:
        user (ForeignKey): Reference to the User requesting password reset.
        token (str): Random 64-character token for verification.
        created_at (datetime): Timestamp when token was created.
        expires_at (datetime): Expiration timestamp (1 hour after creation).
        used (bool): Whether the token has been used. Defaults to False.

    Example:
        >>> # Create password reset token
        >>> user = User.objects.get(email='user@example.com')
        >>> reset_token = PasswordResetToken.objects.create(user=user)
        >>> reset_token.token
        'abc123def456...'  # 64-character random token
        >>> reset_token.is_valid()
        True
        >>>
        >>> # Check if token is still valid
        >>> if reset_token.is_valid():
        ...     user.set_password('newpassword')
        ...     user.save()
        ...     reset_token.used = True
        ...     reset_token.save()

    Note:
        - Tokens expire 1 hour after creation
        - Tokens can only be used once (used=True after first use)
        - Old tokens should be cleaned up periodically
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens',
        verbose_name='User'
    )
    token = models.CharField('Token', max_length=64, unique=True)
    created_at = models.DateTimeField('Created At', auto_now_add=True)
    expires_at = models.DateTimeField('Expires At')
    used = models.BooleanField('Used', default=False)

    class Meta:
        db_table = 'password_reset_tokens'
        verbose_name = 'Password Reset Token'
        verbose_name_plural = 'Password Reset Tokens'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        """Override save to generate token and set expiration.

        Automatically generates a secure random token and sets expiration
        to 1 hour from creation if this is a new instance.
        """
        if not self.pk:  # New instance
            self.token = secrets.token_urlsafe(48)  # Generates 64-char token
            self.expires_at = timezone.now() + timedelta(hours=1)
        super().save(*args, **kwargs)

    def is_valid(self) -> bool:
        """Check if the token is still valid.

        Returns:
            bool: True if token hasn't been used and hasn't expired.

        Example:
            >>> token = PasswordResetToken.objects.get(token='abc123...')
            >>> if token.is_valid():
            ...     # Process password reset
            ...     pass
        """
        return not self.used and timezone.now() < self.expires_at

    def __str__(self) -> str:
        """Return string representation of the token.

        Returns:
            str: User email and token status.
        """
        status = "Valid" if self.is_valid() else "Invalid/Expired"
        return f"{self.user.email} - {status}"