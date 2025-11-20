# DigitalLetter API

API RESTful para gestión de menús digitales construida con Django y Django REST Framework, con soporte multi-idioma y control de acceso basado en roles.

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.2+-green.svg)](https://djangoproject.com)
[![DRF](https://img.shields.io/badge/DRF-3.16+-red.svg)](https://www.django-rest-framework.org/)
[![codecov](https://codecov.io/gh/Jal7823/digitalLetter/branch/main/graph/badge.svg)](https://codecov.io/gh/Jal7823/digitalLetter)

> 📖 [English Version](README.md)

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Inicio Rápido](#inicio-rápido)
- [Documentación de la API](#documentación-de-la-api)
- [Variables de Entorno](#variables-de-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Deployment](#deployment)
- [Servicios Implementados](#servicios-implementados)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

## 🎯 Descripción General

DigitalLetter API es una solución backend completa para gestionar menús digitales de restaurantes. Proporciona soporte multi-idioma para productos y categorías, gestión de usuarios basada en roles y una API RESTful completa para integración con aplicaciones frontend.

El sistema soporta:
- Contenido multi-idioma (Inglés/Español) para productos y categorías
- Tres roles de usuario: cliente, empleado y jefe
- Operaciones CRUD completas para productos, categorías, ingredientes e información de la empresa
- Autenticación basada en JWT
- Documentación automática de API con Swagger/ReDoc

## ✨ Características

- **Soporte Multi-idioma**: Productos y categorías con traducciones usando django-parler
- **Control de Acceso Basado en Roles**: Tres roles de usuario distintos (cliente, empleado, jefe)
- **API RESTful**: Operaciones CRUD completas para todos los recursos
- **Autenticación JWT**: Autenticación segura basada en tokens
- **Documentación de API**: Documentación auto-generada con Swagger UI y ReDoc
- **Gestión de Imágenes**: Soporte para imágenes de productos y empresa
- **Seguimiento de Ingredientes**: Gestiona y rastrea ingredientes de productos con ordenamiento alfabético (sin paginación)
- **Filtrado y Búsqueda**: Capacidades avanzadas de filtrado con django-filter

## 🛠️ Stack Tecnológico

**Backend:**
- Python 3.12+
- Django 5.2.3
- Django REST Framework 3.16
- SQLite (desarrollo) / PostgreSQL (listo para producción)

**Librerías Principales:**
- django-parler 2.3 - Soporte multi-idioma
- drf-spectacular 0.28 - Documentación de API
- djangorestframework-simplejwt 5.5 - Autenticación JWT
- django-filter 24.3 - Filtrado avanzado
- Pillow 11.2 - Procesamiento de imágenes

**Desarrollo y Testing:**
- pytest 8.4 - Framework de testing
- pytest-django 4.11 - Utilidades de testing para Django
- coverage 7.9 - Cobertura de código

## 🚀 Inicio Rápido

### Prerequisitos

- Python 3.12+
- pip
- Entorno virtual (recomendado)

### Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/jalmosquera/digitalLetter.git
cd digitalLetter
```

2. **Crear y activar entorno virtual:**
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

3. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tu configuración
```

5. **Ejecutar migraciones:**
```bash
python manage.py migrate
```

6. **Crear superusuario:**
```bash
python manage.py createsuperuser
# Seguir las instrucciones:
# - Nombre de usuario
# - Email
# - Nombre
# - Contraseña
```

7. **Ejecutar servidor de desarrollo:**
```bash
python manage.py runserver
```

Visita http://localhost:8000 para ver la documentación Swagger UI.

## 📚 Documentación de la API

La documentación interactiva de la API está disponible en:

- **Swagger UI:** http://localhost:8000/ (raíz)
- **ReDoc:** http://localhost:8000/api/redoc/
- **Esquema OpenAPI:** http://localhost:8000/api/schema/

### Autenticación

La API usa JWT (JSON Web Tokens) para autenticación. Para acceder a endpoints protegidos:

1. **Obtener token:**
```bash
POST /api/token/
Content-Type: application/json

{
  "username": "tu_usuario",
  "password": "tu_contraseña"
}

Respuesta:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

2. **Usar token en peticiones:**
```bash
GET /api/products/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

3. **Refrescar token:**
```bash
POST /api/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Endpoints Principales

| Recurso | Endpoint | Métodos | Descripción |
|---------|----------|---------|-------------|
| Productos | `/api/products/` | GET, POST, PUT, DELETE | Gestionar productos con traducciones |
| Categorías | `/api/categories/` | GET, POST, PUT, DELETE | Gestionar categorías con traducciones |
| Ingredientes | `/api/ingredients/` | GET, POST, PUT, DELETE | Gestionar ingredientes con traducciones |
| Usuarios | `/api/users/` | GET, POST, PUT, DELETE | Gestión de usuarios con roles |
| Empresa | `/api/company/` | GET, POST, PUT, DELETE | Información de la empresa |
| Auth | `/api/token/` | POST | Obtener tokens JWT |
| Auth | `/api/token/refresh/` | POST | Refrescar tokens JWT |

### Ejemplo: Crear un Producto

```bash
POST /api/products/
Authorization: Bearer TU_TOKEN_DE_ACCESO
Content-Type: application/json

{
  "translations": {
    "en": {
      "name": "Margherita Pizza",
      "description": "Classic Italian pizza with tomato and mozzarella"
    },
    "es": {
      "name": "Pizza Margarita",
      "description": "Pizza italiana clásica con tomate y mozzarella"
    }
  },
  "price": "12.99",
  "stock": 50,
  "available": true,
  "categories": [1, 2],
  "ingredients": [1, 3, 5]
}
```

## ⚙️ Variables de Entorno

Crea un archivo `.env` en el directorio raíz:

```env
# Django
SECRET_KEY=tu-clave-secreta-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de Datos (Desarrollo - SQLite)
# SQLite se usa por defecto, no necesita configuración

# Base de Datos (Producción - PostgreSQL)
# DATABASE_URL=postgresql://usuario:password@localhost:5432/digitalletter

# CORS (si usas frontend)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Idioma
LANGUAGE_CODE=es
```

Ver `.env.example` para una lista completa de opciones de configuración.

## 📁 Estructura del Proyecto

```
digitalLetter/
├── apps/
│   ├── categories/      # Gestión de categorías (con traducciones)
│   │   ├── api/         # Vistas API, serializers, routers
│   │   ├── models.py
│   │   └── admin.py
│   ├── products/        # Gestión de productos (con traducciones)
│   │   ├── api/
│   │   ├── models.py
│   │   └── admin.py
│   ├── ingredients/     # Gestión de ingredientes (con traducciones)
│   │   ├── api/
│   │   ├── models.py
│   │   └── admin.py
│   ├── users/           # Gestión de usuarios con roles
│   │   ├── api/
│   │   ├── models.py
│   │   └── admin.py
│   └── company/         # Información de la empresa
│       ├── api/
│       ├── models.py
│       └── admin.py
├── core/                # Configuración del proyecto
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── media/               # Archivos subidos por usuarios
├── static/              # Archivos estáticos
├── manage.py
├── requirements.txt
└── README.md
```

## 🧪 Testing

Ejecutar tests con pytest:

```bash
# Ejecutar todos los tests
pytest

# Ejecutar con cobertura
coverage run --source='.' -m pytest
coverage report
coverage html  # Generar reporte HTML
```

## 🚀 Deployment

### Desplegar en Railway

1. **Sube tu código a GitHub**

2. **Ve a [Railway](https://railway.app) y crea un nuevo proyecto**

3. **Selecciona "Deploy from GitHub"**

4. **Elige tu repositorio**

5. **Agrega base de datos PostgreSQL:**
   - New → Database → PostgreSQL

6. **Configura las variables de entorno en el dashboard de Railway:**
   - `SECRET_KEY`: Tu clave secreta de Django
   - `DEBUG`: False
   - `ALLOWED_HOSTS`: tu-app.railway.app
   - `DATABASE_URL`: (configurada automáticamente por Railway PostgreSQL)

7. **Agrega comando de inicio en configuración de Railway:**
```bash
python manage.py migrate && python manage.py collectstatic --noinput && gunicorn core.wsgi
```

8. **¡Despliega!**

### Consideraciones de Producción

- Configura `DEBUG=False` en producción
- Usa PostgreSQL en lugar de SQLite
- Configura `ALLOWED_HOSTS` apropiadamente
- Sirve archivos estáticos con WhiteNoise o CDN
- Usa variables de entorno para datos sensibles
- Habilita cookies solo HTTPS
- Configura CORS apropiadamente

## 📦 Servicios Implementados

Esta sección proporciona una visión completa de todos los servicios backend implementados en la API de DigitalLetter.

### 🔧 Infraestructura y Configuración

| Servicio | Descripción |
|----------|-------------|
| API REST básica (CRUD estándar) | Endpoints GET/POST/PUT/DELETE para varios modelos. Sin autenticación ni roles |
| Configuración de entorno y seguridad (producción) | Variables de entorno, CORS, HTTPS, PostgreSQL, DEBUG=False, ALLOWED_HOSTS |
| Despliegue en Railway (backend) | Configuración de contenedor, base de datos y entorno en Railway |
| Documentación automática de API (Swagger o ReDoc) | Configuración y exposición de documentación interactiva |
| Dominio y SSL personalizado | Configuración DNS + HTTPS (dominio no incluido) |
| Configuración de PostgreSQL | Setup y optimización de base de datos en producción |
| Configuración de archivos estáticos/media | S3/Cloudinary o almacenamiento local para imágenes |
| CORS avanzado configurado | Configuración de orígenes permitidos y headers |
| Rate limiting y throttling | Límites de peticiones por IP/usuario |
| Logging y monitoreo básico | Configuración de logs y alertas básicas |

### 🔐 Autenticación y Seguridad

| Servicio | Descripción |
|----------|-------------|
| Autenticación de usuarios (JWT o session) | Login, registro, recuperación de contraseña, tokens y validación segura |
| Sistema de roles y permisos | Distintos accesos para empleados, administradores o clientes |
| Middleware de permisos personalizados | IsAdminUser, IsOwner, IsEmployee, etc. |
| Validaciones de formularios avanzadas | Validators personalizados en serializers y modelos |
| Sanitización de inputs | Protección contra XSS, SQL injection |
| Gestión de tokens (refresh/access) | Implementación de refresh tokens para JWT |
| Password reset con email | Flujo completo de recuperación de contraseña |

### 🛒 Sistema de Productos

| Servicio | Descripción |
|----------|-------------|
| Modelo de Productos | Campos: nombre, descripción, precio, disponibilidad, imagen |
| CRUD de productos | API endpoints completos para productos |
| Modelo de Categorías | Categorías con nombre, descripción, orden |
| CRUD de categorías | API endpoints para gestión de categorías |
| Modelo de Ingredientes | Ingredientes con nombre, disponibilidad |
| CRUD de ingredientes | API endpoints para ingredientes |
| Relación Productos-Categorías | Many-to-many o ForeignKey |
| Relación Productos-Ingredientes | Many-to-many |
| Filtros por categoría | Query params para filtrar productos |
| Búsqueda de productos | Search por nombre/descripción |
| Paginación avanzada | Page size configurable, metadata |
| Ordenamiento de productos | Por precio, nombre, fecha, popularidad |
| Gestión de imágenes optimizada | Upload, validación, optimización (Pillow/Cloudinary) |
| Productos destacados/favoritos | Campo is_featured o similar |

### 🛍️ Sistema de Carrito y Pedidos

| Servicio | Descripción |
|----------|-------------|
| Modelo de Carrito | Cart con items, cantidades, totales |
| CRUD de carrito | Añadir, actualizar, eliminar items |
| Cálculo de totales automático | Subtotal, impuestos, descuentos |
| Persistencia de carrito (usuario autenticado) | Guardar carrito en BD |
| Modelo de Pedidos | Order con usuario, items, estado, total, fecha |
| CRUD de pedidos | Crear, listar, actualizar, cancelar pedidos |
| Estados de pedidos | Pending, Processing, Delivered, Cancelled |
| Tracking de pedidos | Timeline de estados |
| Cancelación de pedidos | Lógica y validaciones |
| Historial de pedidos por usuario | Filtros y ordenamiento |
| Validación de stock | Verificar disponibilidad antes de pedido |
| Generación de número de pedido único | Order ID automático |

### 📧 Sistema de Emails

| Servicio | Descripción |
|----------|-------------|
| Configuración SMTP/Brevo | Setup de servicio de emails |
| Email de confirmación de pedido | Template HTML + lógica |
| Email de cancelación de pedido | Template HTML + lógica |
| Email de confirmación de registro | Welcome email |
| Email de recuperación de contraseña | Reset password email |
| Templates HTML profesionales | Diseño responsive de emails |
| Email de cambio de estado de pedido | Notificación automática |
| Gestión de errores de envío | Retry logic, logging |

### 🎯 Promociones y Marketing

| Servicio | Descripción |
|----------|-------------|
| Modelo de Promociones | Título, descripción, imagen, fechas, is_active |
| CRUD de promociones | API endpoints para admin |
| Endpoint público de promociones activas | Filtro por fecha y estado |
| Validación de fechas de promociones | Auto-activación/desactivación |
| Ordenamiento de promociones | Por prioridad o fecha |
| Modelo de CarouselCard | Emoji, texto, color, orden, is_active |
| CRUD de carousel cards | API endpoints para admin |
| Endpoint público de carousel activas | Solo cards activas ordenadas |
| Validación de colores hexadecimales | Validator para background_color |

### 🏢 Configuración de Empresa

| Servicio | Descripción |
|----------|-------------|
| Modelo Company (Singleton) | Información general de la empresa |
| Configuración de horarios de atención | JSON field con días y horas |
| Gestión de ubicaciones de entrega | JSON field o modelo relacionado |
| Números de WhatsApp configurables | Lista de contactos |
| Días de entrega habilitados | Configuración semanal |
| CRUD de configuración | Endpoints para actualizar settings |
| Validaciones de horarios | Formato correcto de horas |
| Endpoint público de configuración | Info visible para clientes |

### 📊 Analytics y Monitoreo

| Servicio | Descripción |
|----------|-------------|
| Modelo de Visitas | Tracking de visitas con IP, fecha, página |
| Endpoint de tracking de visitas | POST para registrar visita |
| Contador de visitas totales | Aggregate query |
| Estadísticas de pedidos | Total, promedio, por estado |
| Estadísticas de productos | Más vendidos, más vistos |
| Estadísticas de usuarios | Registros, activos |
| Dashboard de métricas | Endpoint consolidado de stats |
| Filtros por fecha en analytics | Date range queries |
| Exportación de datos (CSV/Excel) | Download de reportes |

### 🧪 Testing y Calidad

| Servicio | Descripción |
|----------|-------------|
| Suite de pruebas (testing) | Configuración de Jest o Pytest + tests básicos |
| Tests unitarios de modelos | Coverage de models |
| Tests de API endpoints | Tests de CRUD |
| Tests de autenticación | Login, registro, permisos |
| Tests de validaciones | Edge cases |
| CI/CD básico | GitHub Actions o similar |

### ⚡ Optimizaciones

| Servicio | Descripción |
|----------|-------------|
| Select related / Prefetch related | Optimización de queries N+1 |
| Indexación de base de datos | Índices en campos frecuentes |
| Caching con Redis | Cache de queries pesadas |
| Compresión de respuestas | GZip middleware |
| Optimización de imágenes | Resize automático, WebP |

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama de feature (`git checkout -b feature/CaracteristicaIncreible`)
3. Haz commit de tus cambios (`git commit -m 'feat: agregar característica increíble'`)
4. Push a la rama (`git push origin feature/CaracteristicaIncreible`)
5. Abre un Pull Request

### Convención de Commits

Este proyecto sigue commits convencionales:
- `feat:` Nuevas características
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `test:` Agregar o actualizar tests
- `refactor:` Refactorización de código

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👤 Autor

**Jalberth Mosquera**
- GitHub: [@jalmosquera](https://github.com/jalmosquera)

## ⭐ Muestra tu apoyo

¡Dale una ⭐️ si este proyecto te ayudó!

---

**Nota:** Esta es la documentación en español. Para la versión en inglés, ver [README.md](README.md).
