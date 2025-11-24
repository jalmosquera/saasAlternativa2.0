# 🍕 Alternativa 2.0 - SaaS Digital Menu Platform

Sistema SaaS completo de menú digital y gestión de pedidos para restaurantes. **Monorepo** con backend Django REST API y frontend React + Vite.

---

## 📋 Descripción

Plataforma moderna y completa para restaurantes que digitaliza todo el proceso de pedidos, desde la visualización del menú hasta la gestión administrativa. Con soporte multi-idioma, personalización de ingredientes, notificaciones en tiempo real y sistema de roles avanzado.

### 🎯 Principales Funcionalidades

#### 👥 Gestión de Usuarios y Roles
- ✅ **Sistema de roles jerárquico**: Cliente, Empleado, Jefe, Invitado
- ✅ **Autenticación JWT** con tokens de acceso y refresco
- ✅ **Registro y login** con validación completa
- ✅ **Perfil de usuario** editable con imagen
- ✅ **Cambio de contraseña** seguro
- ✅ **Checkout como invitado** - Pedidos sin registro
- ✅ **Permisos granulares** por rol

#### 🍽️ Menú Digital Inteligente
- ✅ **Catálogo multi-idioma** (Español/Inglés) con 75+ productos
- ✅ **12 categorías** (Pizzas, Camperos, Burgers, Ensaladas, etc.)
- ✅ **97 ingredientes** con iconos y precios de extras
- ✅ **Personalización de ingredientes** - Agregar/quitar por producto
- ✅ **Sistema de intercambio** - Extras gratis al quitar ingredientes
- ✅ **Opciones de producto** (tipo de carne, salsa, masa, etc.)
- ✅ **Filtrado por categoría** y búsqueda
- ✅ **Productos populares y nuevos** destacados
- ✅ **Control de disponibilidad** por producto

#### 🛒 Sistema de Pedidos
- ✅ **Carrito de compras** con persistencia en localStorage
- ✅ **Pedidos con/sin autenticación** (guest checkout)
- ✅ **Personalización por ítem** del carrito
- ✅ **Cálculo automático de precios** con extras
- ✅ **Validación de stock** en tiempo real
- ✅ **Estados de pedido**: Draft, Pending, Confirmed, Completed, Cancelled
- ✅ **Ubicaciones de entrega** configurables por empresa
- ✅ **Días de entrega** configurables por empresa
- ✅ **Notas adicionales** por pedido

#### 📲 Notificaciones y Comunicación
- ✅ **WebSocket en tiempo real** - Notificaciones instantáneas
- ✅ **Integración WhatsApp** - Envío automático de pedidos
- ✅ **Email de confirmación** - Cliente y restaurante
- ✅ **Notificaciones de cancelación** automáticas
- ✅ **Sistema de notificaciones** en panel de usuario

#### 👨‍💼 Panel Administrativo
- ✅ **Gestión completa de productos** - CRUD con imágenes
- ✅ **Gestión de categorías** e ingredientes
- ✅ **Gestión de pedidos** - Ver, actualizar, cancelar
- ✅ **Gestión de usuarios** - Roles y permisos
- ✅ **Configuración de empresa** - Datos, ubicaciones, horarios
- ✅ **Promociones** - Crear y gestionar ofertas
- ✅ **Vista de pedidos filtrable** - Por estado, usuario, fecha
- ✅ **Búsqueda avanzada** en todos los recursos

#### 🎨 Experiencia de Usuario
- ✅ **Modo oscuro/claro** con persistencia
- ✅ **Diseño responsive** - Mobile-first
- ✅ **Tema personalizable** (Pepper theme)
- ✅ **Cambio de idioma** en tiempo real
- ✅ **Animaciones suaves** y transiciones
- ✅ **Toast notifications** para feedback
- ✅ **Loading states** y spinners
- ✅ **Modales de confirmación** para acciones críticas

#### 🔐 Seguridad y Performance
- ✅ **Rate limiting** - Throttling anti-spam (100 req/hora anónimos, 1000 req/hora autenticados)
- ✅ **Guest checkout throttling** - 5 pedidos/hora por IP
- ✅ **CORS configurado** correctamente
- ✅ **CSRF protection** habilitado
- ✅ **Headers de seguridad** (XSS, nosniff, frame-options)
- ✅ **Transacciones atómicas** en operaciones críticas
- ✅ **SSL obligatorio** en producción
- ✅ **Cookies seguras** en producción
- ✅ **Validación de datos** en frontend y backend
- ✅ **Sanitización de inputs** para prevenir inyecciones

#### 📊 Datos y Almacenamiento
- ✅ **PostgreSQL** en producción
- ✅ **SQLite** en desarrollo
- ✅ **Cloudinary** para imágenes
- ✅ **Redis** para WebSocket/caché
- ✅ **Migraciones automatizadas** en deployment
- ✅ **Seeding de datos** para desarrollo

#### 🚀 DevOps y Deployment
- ✅ **Docker** containerizado
- ✅ **Railway** ready (Backend)
- ✅ **Vercel** ready (Frontend)
- ✅ **CI/CD** con GitHub Actions
- ✅ **Testing automatizado** (29 tests frontend, tests backend)
- ✅ **Documentación API** con Swagger/ReDoc
- ✅ **Environment variables** configuradas
- ✅ **Health checks** en producción

---

## 🏗️ Estructura del Monorepo

```
alternativa_2.0/
├── backend/          # Django REST API
├── frontend/         # React + Vite
├── assets/           # Archivos de datos y scripts
└── README.md         # Este archivo
```

---

## 🚀 Tech Stack

### Backend
- **Django 5.2.3** + Django REST Framework
- **Python 3.12.7**
- **PostgreSQL** (producción) / **SQLite** (desarrollo)
- **JWT** Authentication
- **Cloudinary** para imágenes
- **django-parler** para multi-idioma

### Frontend
- **React 19.1.1**
- **Vite 7.1.7**
- **Tailwind CSS 3.4.18**
- **React Router DOM 7.9.4**
- **Axios** con interceptores JWT
- **React Hook Form** para formularios

---

## 🔧 Instalación Local

### Prerrequisitos
- Python 3.12+
- Node.js 18+
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone https://github.com/jalmosquera/saasAlternativa2.0.git
cd saasAlternativa2.0
```

### 2. Backend Setup

```bash
cd backend

# Crear entorno virtual
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Copiar variables de entorno
cp .env.example .env

# Aplicar migraciones
python manage.py migrate

# Importar datos de ejemplo (opcional)
python manage.py import_menu_from_json --clear

# Crear superusuario
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

Backend corriendo en: **http://localhost:8000**

### 3. Frontend Setup

```bash
cd frontend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

Frontend corriendo en: **http://localhost:5173**

---

## 📚 Documentación Completa

### 📖 Documentación por Módulo

#### Backend (Django REST API)
- 📘 **[README Backend](backend/README_ES.md)** - Instalación, configuración y uso del API
  - [Inicio Rápido](backend/README_ES.md#inicio-rápido)
  - [Variables de Entorno](backend/README_ES.md#variables-de-entorno)
  - [Estructura del Proyecto](backend/README_ES.md#estructura-del-proyecto)
  - [Servicios Implementados](backend/README_ES.md#servicios-implementados)
- 📗 **[PROJECT_CONTEXT.md](backend/PROJECT_CONTEXT.md)** - Contexto técnico completo del proyecto
  - [Apps y Modelos](backend/PROJECT_CONTEXT.md#apps-existentes)
  - [Sistema de Permisos](backend/PROJECT_CONTEXT.md#sistema-de-permisos)
  - [Arquitectura](backend/PROJECT_CONTEXT.md#arquitectura-del-proyecto)
- 📙 **[README_CONFIGURACION.md](backend/README_CONFIGURACION.md)** - Configuración avanzada
- 📕 **[CHANGELOG.md](backend/CHANGELOG.md)** - Historial de cambios
- 📄 **[Products API Usage](backend/docs/products_api_usage.md)** - Guía de uso del API de productos

#### Frontend (React + Vite)
- 📘 **[README Frontend](frontend/README_ES.md)** - Instalación, configuración y estructura
  - [Características](frontend/README_ES.md#características)
  - [Stack Tecnológico](frontend/README_ES.md#stack-tecnológico)
  - [Scripts Disponibles](frontend/README_ES.md#scripts-disponibles)
  - [Testing](frontend/README_ES.md#pruebas)
- 📗 **[COMPONENTS.md](frontend/COMPONENTS.md)** - Documentación completa de componentes
  - [Menu Components](frontend/COMPONENTS.md#menu-components)
  - [Layout Components](frontend/COMPONENTS.md#layout-components)
  - [Pages](frontend/COMPONENTS.md#pages)
- 📙 **[CONTEXTS.md](frontend/CONTEXTS.md)** - Documentación de Context API
  - [AuthContext](frontend/CONTEXTS.md#authcontext)
  - [CartContext](frontend/CONTEXTS.md#cartcontext)
  - [LanguageContext](frontend/CONTEXTS.md#languagecontext)
  - [ThemeContext](frontend/CONTEXTS.md#themecontext)

#### Deployment
- 🚀 **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía completa de deployment
  - [Railway (Backend)](DEPLOYMENT.md#backend---railway)
  - [Vercel (Frontend)](DEPLOYMENT.md#frontend---vercel)
  - [Variables de Entorno](DEPLOYMENT.md#variables-de-entorno-requeridas)
  - [Troubleshooting](DEPLOYMENT.md#troubleshooting)
  - [Checklist](DEPLOYMENT.md#checklist-de-deployment)

### 🔗 Enlaces Rápidos

#### Desarrollo Local
- **API Docs (Swagger)**: http://localhost:8000/api/swagger/
- **API Docs (ReDoc)**: http://localhost:8000/api/redoc/
- **Admin Panel Django**: http://localhost:8000/admin
- **Frontend Dev Server**: http://localhost:5173

#### Recursos API
- **Productos**: `/api/products/`
- **Categorías**: `/api/categories/`
- **Ingredientes**: `/api/ingredients/`
- **Pedidos**: `/api/orders/`
- **Usuarios**: `/api/users/`
- **Empresa**: `/api/company/`
- **Promociones**: `/api/promotions/`
- **Guest Checkout**: `/api/orders/guest_checkout/`

---

## 🗂️ Estructura de Datos

El sistema incluye:
- ✅ **75+ productos** con descripciones y precios
- ✅ **12 categorías** (Pizzas, Camperos, Burgers, Ensaladas, etc.)
- ✅ **97 ingredientes** con iconos y precios de extras
- ✅ Multi-idioma completo (ES/EN)

---

## 🔐 Variables de Entorno

### Backend (.env)
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📦 Scripts Útiles

### Backend

```bash
# Importar menú desde JSON
python manage.py import_menu_from_json --clear

# Crear superusuario
python manage.py createsuperuser

# Ejecutar tests
pytest

# Crear migraciones
python manage.py makemigrations
python manage.py migrate
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview build
npm run preview

# Linting
npm run lint
```

---

## 🚀 Deployment

> 📖 **Guía completa de deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)

### Backend → Railway
1. Conectar repositorio GitHub
2. Agregar PostgreSQL
3. Configurar variables de entorno
4. Deploy automático con Dockerfile
5. Migraciones y collectstatic automáticos

### Frontend → Vercel
1. Conectar repositorio GitHub
2. Root Directory: `frontend`
3. Configurar variables de entorno
4. Deploy automático

### Archivos de Configuración
- ✅ `backend/Dockerfile` - Configuración Docker para Railway
- ✅ `backend/.dockerignore` - Optimización de builds
- ✅ `backend/railway.json` - Configuración Railway
- ✅ `backend/core/production.py` - Settings de producción
- ✅ `frontend/vercel.json` - Configuración Vercel con cache y seguridad

---

## 📊 Estadísticas del Proyecto

- **Líneas de código**: ~15,000+
- **Componentes React**: 30+
- **Endpoints API**: 50+
- **Tests**: 29 (frontend) + tests backend
- **Idiomas soportados**: 2 (ES/EN)
- **Productos de ejemplo**: 75+
- **Categorías**: 12
- **Ingredientes**: 97
- **Roles de usuario**: 4 (Cliente, Empleado, Jefe, Invitado)

---

## 🎨 Stack Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                        │
│  React 19 + Vite 7 + Tailwind CSS + React Router           │
│  • MenuPage  • ProductDetail  • Cart  • Checkout           │
│  • AuthContext  • CartContext  • ThemeContext              │
│  • LanguageContext  • WebSocket Client                     │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API + WebSocket
                      │ (Axios + JWT)
┌─────────────────────┴───────────────────────────────────────┐
│                    BACKEND (Railway)                        │
│  Django 5.2 + DRF + Channels + PostgreSQL + Redis          │
│  • Products  • Categories  • Ingredients  • Orders         │
│  • Users  • Company  • Promotions  • Notifications         │
│  • JWT Auth  • Throttling  • WebSocket Server              │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┬─────────────────┐
        │                           │                 │
   PostgreSQL                   Cloudinary        WhatsApp API
   (Database)                   (Images)         (Notifications)
```

---

## 🔄 Flujo de Pedido (Guest Checkout)

```
Usuario sin cuenta
      ↓
Navega menú → Agrega productos al carrito
      ↓
Click "Enviar pedido"
      ↓
Checkout Page
      ↓
Opción: "Continuar como invitado"
      ↓
Completa formulario:
  • Nombre
  • Email
  • Teléfono
  • Dirección de entrega
      ↓
Backend (Transacción Atómica):
  1. Crea usuario invitado (role=guest)
  2. Crea pedido (status=pending)
  3. Envía email de confirmación
  4. Notifica por WhatsApp
      ↓
Pedido visible para el restaurante
      ↓
Usuario recibe confirmación
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado y propietario.

---

## 👨‍💻 Desarrollado por

**jalmosquera**
- GitHub: [@jalmosquera](https://github.com/jalmosquera)

---

## 📞 Soporte

Para reportar bugs o solicitar features, abre un issue en GitHub.

---

**🎉 ¡Listo para usar!** Visita http://localhost:5173 para ver la aplicación en acción.
