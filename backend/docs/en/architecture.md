 # 🏗 Architecture and Organization of the DigitalLetter API Project
 
 This document describes how the project code is structured and organized to facilitate understanding and maintenance.
 
 ---
 
 ## 📁 Main folder structure
 
 ```
 digitalLetter/
 ├── apps/
 │ ├── categories/ # Category management with multilingual support
 │ ├── products/ # Product (dish) management, with translations and ManyToMany relation to categories
 │ ├── users/ # Advanced user management with roles and permissions
 │ └── company/ # General company data and configuration
 ├── core/
 │ ├── settings/ # Environment-specific settings (base, dev, prod, test)
 │ ├── urls.py # Global API and project routing
 │ ├── wsgi.py # WSGI entry point for production
 │ └── asgi.py # ASGI entry point (if used)
 ├── manage.py # Main script for Django commands
 ├── requirements.txt # Project dependencies
 ├── Dockerfile # Configuration to containerize the application
 ├── docker-compose.yml # Container orchestration (app + db + etc)
 └── docs/ # Project documentation (includes this file)
 ```
 ---
 
 ## ⚙️ Settings modularization
 
 - The configuration is divided into several files to facilitate environments:
   - `base.py` with common configuration.
   - `development.py` for local development.
   - `production.py` for production.
   - `test.py` for automated testing.
 
 - This is controlled with the `DJANGO_ENV` environment variable to load the appropriate settings.
 
 ---
 
 ## 📦 Apps and their responsibility
 
 - **Categories:** category management, with translation support using `django-parler`.
 - **Products:** product/dish management, with translations and ManyToMany relation to categories.
 - **Users:** advanced user management, roles (client, employe, boss), and custom permissions.
 - **Company:** general data and administrative configuration of the company.
 
 ---
 
 ## 🔀 Routing and APIs
 
 - `rest_framework.routers.DefaultRouter` is used to register the endpoints of each app.
 - Each app exposes a `ViewSet` or set of RESTful views.
 - URLs are grouped under prefixes like `/api/categories/`, `/api/products/`, `/api/employe/`, etc.
 - Additional endpoints for authentication and user management (JWT login, password change, profile).
 
 ---
 
 ## 🧩 Best practices and patterns
 
 - Clear separation between serializers for reading and writing.
 - Custom validations in serializers for business rules.
 - Use of granular, role-based permissions to control access.
 - Use of automated tests with `pytest` to ensure quality.
 - Implementation of multilingual support only in the apps that need it (`categories` and `products`).
