# PROJECT CONTEXT - DigitalLetter API

## Información General

**Nombre:** DigitalLetter API
**Propósito:** Backend RESTful para sistema de restaurante con carta digital, gestión de productos, usuarios con roles diferenciados, y soporte multilenguaje
**Tipo:** Proyecto en desarrollo (75% completado)
**Deadline:** Sin deadline específico (desarrollo continuo)

---

## Stack Tecnológico

- **Framework:** Django 5.2.3 + Django REST Framework 3.16.0
- **Base de datos:** SQLite (desarrollo) / PostgreSQL (producción recomendada)
- **Autenticación:** JWT (Simple JWT 5.5.0)
- **Testing:** pytest 8.4.1 + pytest-django 4.11.1
- **Documentación API:** drf-spectacular 0.28.0
- **Internacionalización:** django-parler 2.3 + django-parler-rest 2.2
- **Filtros:** django-filter 24.3
- **Imágenes:** Pillow 11.2.1
- **Containerización:** Docker + Docker Compose
- **Coverage:** coverage 7.9.2

---

## Arquitectura del Proyecto

### Apps Existentes (Completadas ✅)

#### 1. App: **categories** ✅
- **Propósito:** Gestión de categorías de productos con soporte multilenguaje
- **Modelos:** Category (con traducciones)
- **API:** CRUD completo con ViewSet
- **Serializers:** CategorySerializerGet, CategorySerializerPost
- **Permisos:** AllowAny (acceso público)
- **Tests:** test_categories.py (básico)
- **Estado:** 100% funcional
- **Archivos:**
  - `models.py` ✅ (TranslatableModel con name, description, image)
  - `api/serializers.py` ✅ (separado GET/POST)
  - `api/views.py` ✅ (CategoriesView ModelViewSet)
  - `api/test_categories.py` ✅
  - `admin.py` ✅

#### 2. App: **products** ✅
- **Propósito:** Catálogo de productos con relaciones ManyToMany
- **Modelos:** Product (con traducciones)
- **Relaciones:**
  - ManyToMany con Category
  - ManyToMany con Ingredient
- **API:** CRUD completo con filtros y búsqueda
- **Serializers:** ProductSerializerGet, ProductSerializerPost
- **Permisos:** IsAuthenticatedOrReadOnly
- **Filtros:** available, categories, ingredients
- **Búsqueda:** name, description (multilenguaje)
- **Ordenamiento:** price, stock, created_at, updated_at
- **Tests:** test_products.py (básico)
- **Estado:** 100% funcional
- **Archivos:**
  - `models.py` ✅ (price, stock, available, image, categories, ingredients)
  - `api/serializer.py` ✅ (serializers separados GET/POST)
  - `api/views.py` ✅ (ProductViewSet con filtros)
  - `api/test_products.py` ✅
  - `admin.py` ✅
  - `management/commands/flush_and_seed.py` ✅ (comando de seeding)

#### 3. App: **users** ✅
- **Propósito:** Gestión avanzada de usuarios con sistema de roles
- **Modelos:** User (custom AbstractUser), UserManager
- **Roles:** client, employe, boss
- **API:** Múltiples endpoints especializados
  - RegisterEmploye (ViewSet para empleados)
  - RegisterClients (ViewSet para clientes)
  - UserViewSet (listado general)
  - UserMe (perfil actual)
  - ChangePasswordView
- **Serializers:** SerializerClients, SerializerEmploye, UserListSerializer, ChangePasswordSerializer
- **Permisos Custom:** IsStaff, IsBoss, IsStaffOrEmploye, IsEmploye
- **Campos:** username, name, email, image, role, address, location, province, phone
- **Tests:** test_users.py (básico)
- **Estado:** 100% funcional
- **Archivos:**
  - `models.py` ✅ (User + UserManager)
  - `permisionsUsers.py` ✅ (permisos custom)
  - `api/serializers.py` ✅
  - `api/views.py` ✅ (múltiples ViewSets)
  - `api/test_users.py` ✅
  - `admin.py` ✅

#### 4. App: **company** ✅
- **Propósito:** Información de la empresa/restaurante
- **Modelos:** Company (con traducciones)
- **API:** CRUD completo con ViewSet
- **Serializers:** CompanySerializer
- **Permisos:** Default DRF
- **Campos:** name, address (traducibles), email, phone, image
- **Tests:** ❌ (pendiente)
- **Estado:** Modelo y API completos, tests pendientes
- **Archivos:**
  - `models.py` ✅
  - `api/serializers.py` ✅
  - `api/views.py` ✅ (CompanyView)
  - `admin.py` ✅

#### 5. App: **ingredients** ✅
- **Propósito:** Gestión de ingredientes con soporte multilenguaje
- **Modelos:** Ingredient (con traducciones)
- **API:** CRUD completo con ViewSet
- **Serializers:** IngredientSerializer
- **Permisos:** Default DRF
- **Campos:** name (traducible), icon
- **Tests:** ❌ (pendiente)
- **Estado:** Modelo y API completos, tests pendientes
- **Archivos:**
  - `models.py` ✅
  - `api/serializers.py` ✅
  - `api/views.py` ✅ (IngredientViewSet)
  - `admin.py` ✅

---

### Apps Pendientes (Nuevas Funcionalidades) ⏳

#### 6. App: **orders** (Sistema de Pedidos) ❌
- **Propósito:** Gestión completa de pedidos/órdenes
- **Modelos sugeridos:**
  - Order (id, user, table_number, status, total, created_at, updated_at)
  - OrderItem (order, product, quantity, price, subtotal)
  - OrderStatus (pending, preparing, ready, delivered, cancelled)
- **API:** CRUD completo + endpoints especiales
- **Funcionalidades:**
  - Crear pedido con items
  - Actualizar estado del pedido
  - Calcular totales automáticamente
  - Historial de pedidos por usuario
  - Filtros por estado, fecha, mesa
- **Permisos:** IsAuthenticated para crear, IsStaffOrEmploye para gestionar
- **Estado:** 0% - Por crear

#### 7. App: **reservations** (Sistema de Reservas) ❌
- **Propósito:** Gestión de reservas de mesas
- **Modelos sugeridos:**
  - Reservation (user, date, time, guests_count, table, status, notes)
  - ReservationStatus (pending, confirmed, cancelled, completed)
- **API:** CRUD completo + disponibilidad
- **Funcionalidades:**
  - Crear/cancelar reservas
  - Verificar disponibilidad
  - Notificaciones
  - Historial de reservas
- **Permisos:** IsAuthenticated para clientes, IsStaffOrEmploye para gestión
- **Estado:** 0% - Por crear

#### 8. App: **tables** (Gestión de Mesas) ❌
- **Propósito:** Administración de mesas del restaurante
- **Modelos sugeridos:**
  - Table (number, capacity, location, status, qr_code)
  - TableStatus (available, occupied, reserved, maintenance)
- **API:** CRUD completo + gestión de estado
- **Funcionalidades:**
  - CRUD de mesas
  - Cambiar estado (disponible/ocupada)
  - Generar códigos QR por mesa
  - Asignar pedidos a mesas
- **Permisos:** IsStaffOrEmploye
- **Estado:** 0% - Por crear

#### 9. App: **analytics** (Reportes y Estadísticas) ❌
- **Propósito:** Dashboard con métricas y reportes
- **Modelos sugeridos:**
  - DailySales (date, total_orders, total_revenue, avg_order_value)
  - ProductAnalytics (product, views, orders, revenue)
- **API:** Endpoints de solo lectura con agregaciones
- **Funcionalidades:**
  - Ventas por día/semana/mes
  - Productos más vendidos
  - Análisis de clientes
  - Reportes de empleados
  - Gráficos y métricas
- **Permisos:** IsBoss (solo jefes)
- **Estado:** 0% - Por crear

---

## Configuración del Proyecto

### Settings Multi-entorno ✅
- **Base:** `core/base.py` (configuración compartida)
- **Development:** `core/development.py` (DEBUG=True, SQLite)
- **Production:** `core/production.py` (DEBUG=False, PostgreSQL)
- **Test:** `core/test.py` (para pytest)
- **Main:** `core/settings.py` (carga según DJANGO_ENV)

### URLs ✅
- **Swagger UI:** `/` (raíz)
- **ReDoc:** `/api/redoc/`
- **OpenAPI Schema:** `/api/schema/`
- **Admin:** `/admin/`
- **JWT Token:** `/api/token/`, `/api/token/refresh/`
- **API Routes:** Router con todas las apps

### Autenticación ✅
- **Método:** JWT vía Simple JWT
- **Endpoints:**
  - `/api/token/` (login)
  - `/api/token/refresh/` (refresh token)
- **Permisos Custom:** IsStaff, IsBoss, IsEmploye, IsStaffOrEmploye

---

## Estado Actual del Proyecto

### ✅ COMPLETADO (75%)

#### 🔧 SETUP (100%):
- ✅ Estructura del proyecto Django
- ✅ Configuración multi-entorno (dev/prod/test)
- ✅ Docker + Docker Compose setup
- ✅ Requirements.txt completo
- ✅ pytest configurado (pytest.ini)
- ✅ Variables de entorno (.env)
- ✅ Git configurado (.gitignore)

#### 🏗️ BUILD - Apps Core (100%):
- ✅ App Categories (modelo, serializers, viewset, admin)
- ✅ App Products (modelo, serializers, viewset, filtros, admin)
- ✅ App Users (modelo custom, manager, múltiples viewsets, permisos)
- ✅ App Company (modelo, serializers, viewset, admin)
- ✅ App Ingredients (modelo, serializers, viewset, admin)
- ✅ Relaciones ManyToMany (Products-Categories, Products-Ingredients)
- ✅ JWT Authentication configurado
- ✅ Permisos custom (IsStaff, IsBoss, etc.)
- ✅ Documentación API (drf-spectacular)
- ✅ Comando de seeding (flush_and_seed)

#### 🧪 TEST (30%):
- ✅ pytest configurado
- ✅ Tests básicos de Products API
- ✅ Tests básicos de Users API
- ✅ Tests básicos de Categories API
- ❌ Tests de Company (pendiente)
- ❌ Tests de Ingredients (pendiente)
- ❌ Tests de permisos (pendiente)
- ❌ Tests de autenticación completos (pendiente)
- ❌ Coverage > 80% (pendiente)

#### 📝 DOC (60%):
- ✅ README.md (español e inglés)
- ✅ Docstrings completos en todos los modelos
- ✅ Docstrings completos en serializers
- ✅ Docstrings completos en views
- ✅ OpenAPI/Swagger automático
- ❌ Docs técnicos actualizados (architecture.md, api-routes.md)
- ❌ Guía de deployment (pendiente)

---

### ⏳ PENDIENTE (25%)

#### 🏗️ BUILD - Nuevas Apps (0%):
- ❌ App Orders (pedidos)
- ❌ App Reservations (reservas)
- ❌ App Tables (mesas)
- ❌ App Analytics (reportes)

#### 🧪 TEST (70% pendiente):
- ❌ Tests completos de Company
- ❌ Tests completos de Ingredients
- ❌ Tests de permisos custom
- ❌ Tests de autenticación JWT
- ❌ Tests de Orders (cuando se cree)
- ❌ Tests de Reservations (cuando se cree)
- ❌ Tests de Tables (cuando se cree)
- ❌ Tests de Analytics (cuando se cree)
- ❌ Coverage report y mejora a 80%+

#### 📝 DOC (40% pendiente):
- ❌ Actualizar docs/es/architecture.md
- ❌ Actualizar docs/es/api-routes.md
- ❌ Actualizar docs/es/translations.md
- ❌ Crear guía de deployment
- ❌ Documentar nuevas apps (Orders, Reservations, etc.)
- ❌ Crear CHANGELOG.md

#### 🔧 OPTIMIZACIÓN/REFACTORING:
- ❌ Optimizar queries (select_related, prefetch_related)
- ❌ Implementar caching (Redis opcional)
- ❌ Paginación optimizada
- ❌ Índices de base de datos
- ❌ Validaciones adicionales

#### 🚀 DEPLOY/PRODUCCIÓN:
- ❌ Configurar PostgreSQL para producción
- ❌ Configurar static files (S3/CDN)
- ❌ Configurar media files (S3/CDN)
- ❌ Variables de entorno para producción
- ❌ CI/CD (GitHub Actions)
- ❌ Deploy a Railway/Heroku/AWS
- ❌ Monitoreo (Sentry opcional)
- ❌ Backup strategy

---

## Prioridades del Proyecto

1. **Tests completos** (según agente TEST) - 80%+ coverage
2. **Documentación técnica actualizada** - Docs completos y actualizados
3. **Nuevas funcionalidades** - Orders, Reservations, Tables, Analytics
4. **Optimización/refactoring** - Performance y código limpio
5. **Deploy/producción** - Railway/producción lista

---

## Decisiones Técnicas Importantes

### Internacionalización
- **django-parler** para traducciones en: Categories, Products, Ingredients, Company
- **Idiomas soportados:** Español (es), Inglés (en)
- **Campos traducibles:** name, description, address

### Permisos y Roles
- **Roles de usuario:** client, employe, boss
- **Permisos custom:** IsStaff, IsBoss, IsEmploye, IsStaffOrEmploye
- **Estrategia:** Role-based access control (RBAC)

### Serializers
- **Patrón:** Serializers separados para GET (lectura) y POST (escritura)
- **Ventaja:** Optimización de queries y validaciones específicas

### API Design
- **Estilo:** RESTful con ViewSets
- **Router:** DefaultRouter de DRF
- **Versionado:** No implementado (considerar /api/v1/ en futuro)
- **Filtros:** django-filter + SearchFilter + OrderingFilter

### Base de Datos
- **Desarrollo:** SQLite (db.sqlite3)
- **Producción:** PostgreSQL (recomendado)
- **Nombres de tablas:** Backward compatibility (ej: 'products_products', 'users_users')

---

## Archivos Clave

### Configuración
- `/core/settings.py` - Settings principal
- `/core/base.py` - Configuración base
- `/core/urls.py` - URLs principales
- `/manage.py` - Django management
- `/requirements.txt` - Dependencias Python
- `/pytest.ini` - Configuración de pytest
- `/.env` - Variables de entorno (no en git)
- `/Dockerfile` - Container Docker
- `/docker-compose.yml` - Orquestación

### Datos
- `/db.sqlite3` - Base de datos SQLite
- `/populate.py` - Script de población de datos
- `/menu_text.JSON` - Datos de menú (seed)

### Documentación
- `/README.md` - Documentación principal (ES)
- `/README.en.md` - Documentación en inglés
- `/docs/es/architecture.md` - Arquitectura
- `/docs/es/api-routes.md` - Rutas API
- `/docs/es/translations.md` - Traducciones

---

## Notas para Agentes

### Para SETUP:
- Proyecto ya configurado ✅
- No necesita setup inicial
- Puede necesitar configuración de nuevas apps (Orders, Reservations, etc.)

### Para BUILD:
- Seguir patrón existente de apps
- Usar TranslatableModel cuando sea necesario
- Separar serializers GET/POST
- Implementar permisos apropiados
- Agregar filtros y búsqueda cuando aplique

### Para TEST:
- Usar pytest + pytest-django
- Seguir patrón de fixtures existente
- Objetivo: 80%+ coverage
- Tests pendientes en: Company, Ingredients, permisos, autenticación
- Nuevas apps necesitarán tests completos

### Para DOC-CODE:
- Seguir estilo Google Docstrings (ya aplicado)
- Mantener consistencia con docs existentes
- Documentar nuevas apps siguiendo mismo patrón

### Para DOC-API:
- Actualizar docs/ cuando se agreguen nuevas apps
- Mantener README.md actualizado
- drf-spectacular genera OpenAPI automáticamente

### Para REVIEW:
- Verificar consistencia de patrones
- Revisar permisos de seguridad
- Validar serializers
- Optimizar queries (select_related, prefetch_related)

### Para FIX:
- Tests identificarán bugs
- Priorizar fixes de seguridad
- Mantener backward compatibility

---

## Estado de Progreso: 75% Completado

**Resumen Visual:**
```
████████████████████░░░░░  75%
```

**Desglose por Área:**
- SETUP: ████████████████████ 100%
- BUILD (Apps Core): ████████████████████ 100%
- BUILD (Nuevas Apps): ░░░░░░░░░░░░░░░░░░░░ 0%
- TEST: ██████░░░░░░░░░░░░░░ 30%
- DOC: ████████████░░░░░░░░ 60%
- OPTIMIZACIÓN: ░░░░░░░░░░░░░░░░░░░░ 0%
- DEPLOY: ░░░░░░░░░░░░░░░░░░░░ 0%

---

**Última actualización:** 2025-10-26
**Generado por:** PROJECT MANAGER Agent
**Proyecto:** DigitalLetter API
