# Changelog

All notable changes to DigitalLetter API will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Ingredients API**: Removed duplicate ingredients from API response caused by django-parler translations join (2025-01-07)
  - Added `.distinct()` to queryset to prevent duplicates
  - Moved alphabetical sorting to Python (in `list()` method) to avoid JOIN issues
  - API now correctly returns 143 unique ingredients instead of 285 duplicated entries

- **Ingredients API**: Disabled pagination for ingredients endpoint (2025-01-07)
  - Removed pagination to show all ingredients in a single request
  - Added alphabetical sorting by translated name
  - Improves UX in admin panels by showing all available ingredients at once

- **Products API**: Fixed FormData handling for multiple ingredients and categories (2024-XX-XX)
  - Correctly process multiple ingredients from FormData arrays
  - Fixed category assignment in product creation/update

### Added
- **Orders**: Added customization field to OrderItem model (2024-XX-XX)
  - Allows storing customer customizations for order items
  - Supports ingredient modifications and special requests

- **Admin APIs**: Added SearchFilter with icontains to all admin APIs (2024-XX-XX)
  - Improved search functionality across products, categories, ingredients, and users
  - Case-insensitive search for better UX

## [1.0.0] - 2024-10-26

### Added
- Initial release of DigitalLetter API
- **Multi-language Support**: Products, categories, and ingredients with EN/ES translations using django-parler
- **User Management**: Three user roles (client, employee, boss) with role-based access control
- **RESTful API**: Complete CRUD operations for:
  - Products with translations, pricing, stock management
  - Categories with translations and hierarchical structure
  - Ingredients with translations and extra pricing
  - Company information
  - User management
- **Authentication**: JWT-based authentication with djangorestframework-simplejwt
- **API Documentation**: Auto-generated Swagger UI and ReDoc with drf-spectacular
- **Image Management**: Support for product and company images
- **Advanced Filtering**: Django-filter integration for complex queries
- **Testing**: Comprehensive test suite with pytest and pytest-django

### Tech Stack
- Python 3.12+
- Django 5.2.3
- Django REST Framework 3.16
- django-parler 2.3 for multi-language
- drf-spectacular 0.28 for API documentation
- djangorestframework-simplejwt 5.5 for JWT auth

---

## Release Notes

### Version 1.0.0 - Initial Release

The first stable release of DigitalLetter API provides a complete backend solution for managing digital restaurant menus with multi-language support.

**Key Features:**
- Full bilingual support (English/Spanish)
- Role-based access control
- RESTful API with auto-generated documentation
- JWT authentication
- Image upload and management
- Ingredient tracking with pricing
- Advanced filtering and search

**Database:**
- SQLite for development
- PostgreSQL ready for production

**Deployment:**
- Railway deployment ready
- WhiteNoise for static files
- Gunicorn WSGI server

---

## How to Read This Changelog

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

## Links

- [Documentation](README.md)
- [API Documentation](http://localhost:8000/) (when running locally)
- [GitHub Repository](https://github.com/jalmosquera/digitalLetter)
