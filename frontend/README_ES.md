# Digital Letter - Sistema de Menú para Restaurantes

> Aplicación web moderna para visualización de menú de restaurante con soporte multi-idioma, personalización de ingredientes e integración con WhatsApp.

[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.0-6E9F18.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> 📖 [English Version](README.md)

## 📋 Tabla de Contenidos

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Instalación](#instalación)
- [Variables de Entorno](#variables-de-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Scripts Disponibles](#scripts-disponibles)
- [Características Clave](#características-clave)
- [Documentación de Componentes](#documentación-de-componentes)
- [Context API](#context-api)
- [Servicios](#servicios)
- [Pruebas](#pruebas)
- [Contribuir](#contribuir)

## ✨ Características

- **Interfaz Moderna** - Diseño limpio construido con Tailwind CSS y tema personalizado (Pepper)
- **Desarrollo Rápido** - Potenciado por Vite con HMR
- **Soporte Multi-idioma** - Español e Inglés con LanguageContext personalizado
- **Modo Oscuro** - Soporte completo de tema oscuro con ThemeContext
- **Personalización de Ingredientes** - Los usuarios pueden seleccionar/deseleccionar ingredientes y agregar extras (143 ingredientes disponibles, ordenados alfabéticamente)
- **Carrito de Compras** - Sistema completo de carrito con persistencia en localStorage
- **Integración WhatsApp** - Realización de pedidos directo por WhatsApp
- **Diseño Responsive** - Enfoque mobile-first para todos los tamaños de pantalla
- **Listo para Testing** - 29 pruebas con Vitest + Testing Library
- **Listo para CI/CD** - Flujo de trabajo de GitHub Actions configurado
- **Type Safe** - Validación PropTypes en todos los componentes

## 🛠️ Stack Tecnológico

**Frontend:**
- [React 19.1](https://reactjs.org/) - Librería UI con las últimas características
- [Vite 7.1](https://vitejs.dev/) - Herramienta de construcción de próxima generación
- [Tailwind CSS 3.4](https://tailwindcss.com/) - CSS utility-first
- [React Router 7.9](https://reactrouter.com/) - Enrutamiento del lado del cliente
- [FontAwesome 7.1](https://fontawesome.com/) - Librería de iconos

**Gestión de Estado:**
- React Context API - AuthContext, CartContext, LanguageContext, ThemeContext

**Obtención de Datos:**
- [Axios 1.13](https://axios-http.com/) - Cliente HTTP
- Hook useFetch personalizado - Obtención simplificada de datos

**Formularios:**
- [React Hook Form 7.65](https://react-hook-form.com/) - Validación de formularios

**Testing:**
- [Vitest 4.0](https://vitest.dev/) - Framework de pruebas unitarias
- [Testing Library 16.3](https://testing-library.com/) - Pruebas de componentes
- [jsdom 27.0](https://github.com/jsdom/jsdom) - Implementación DOM

**Calidad de Código:**
- [ESLint 9.36](https://eslint.org/) - Linter de código
- [Prettier 3.6](https://prettier.io/) - Formateo de código

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ (recomendado: Node.js 20+)
- npm o yarn
- API Backend ejecutándose (ver repositorio backend)

### Configuración

1. **Clonar el repositorio**
```bash
git clone https://github.com/tuusuario/digitalLetterFrontEnd.git
cd digitalLetterFrontEnd
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
# Editar .env.local con tus valores
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

5. **Abrir navegador**
Navegar a [http://localhost:5173](http://localhost:5173)

## ⚙️ Variables de Entorno

Crear un archivo `.env.local` en el directorio raíz:

```env
# Configuración API
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Digital Letter

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true

# Entorno
VITE_NODE_ENV=development
```

Ver `.env.example` para todas las variables disponibles.

## 📁 Estructura del Proyecto

```
src/
├── features/               # Módulos basados en características
│   ├── auth/              # Autenticación
│   │   ├── pages/         # Login, Register
│   │   └── components/    # Componentes específicos de auth
│   ├── menu/              # Menú público
│   │   ├── pages/         # HomePage, ProductDetailPage, ContactPage, PrivacyPage
│   │   ├── components/    # ProductCard, ProductGrid, CategoryFilter
│   │   └── hooks/         # useProducts, useCategories
│   ├── cart/              # Carrito de compras
│   │   ├── pages/         # CartPage, CheckoutPage
│   │   └── components/    # Componentes específicos de carrito
│   └── admin/             # Panel de administración
│       ├── products/      # Gestión de productos
│       ├── categories/    # Gestión de categorías
│       ├── ingredients/   # Gestión de ingredientes
│       └── users/         # Gestión de usuarios
├── shared/                # Recursos compartidos
│   ├── components/        # Componentes reutilizables
│   │   ├── layout/        # MenuLayout
│   │   └── menu/          # Navbar, Footer
│   ├── contexts/          # Proveedores de React Context
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   ├── LanguageContext.jsx
│   │   └── ThemeContext.jsx
│   ├── services/          # Servicios API
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── whatsappService.js
│   ├── hooks/             # Hooks personalizados
│   │   └── useFetch.js
│   └── utils/             # Funciones de utilidad
├── config/                # Configuración de la aplicación
├── test/                  # Configuración de pruebas y utilidades
├── App.jsx                # Componente raíz con enrutamiento
└── main.jsx               # Punto de entrada de la aplicación
```

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor dev (puerto 5173)
npm run dev -- --port 3000  # Iniciar en puerto personalizado

# Construcción
npm run build            # Construir para producción
npm run preview          # Vista previa de construcción de producción

# Calidad de Código
npm run lint             # Ejecutar ESLint
npm run format           # Formatear con Prettier

# Testing
npm run test             # Ejecutar pruebas una vez
npm run test:watch       # Ejecutar pruebas en modo watch
npm run test:ui          # Abrir interfaz de Vitest
npm run test:coverage    # Generar informe de cobertura
```

## 🎯 Características Clave

### 1. Sistema de Personalización de Ingredientes

Los usuarios pueden personalizar sus pedidos seleccionando/deseleccionando ingredientes y agregando solicitudes especiales:

**Implementación:**
- Selección de ingredientes basada en checkboxes en ProductDetailPage
- Campo de texto para ingredientes adicionales
- Personalización almacenada con artículos del carrito
- Mostrado en checkout y pedido de WhatsApp

**Ejemplo de Uso:**
```jsx
import { useCart } from '@shared/contexts/CartContext';

function ProductDetail() {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    const customization = {
      selectedIngredients: [1, 2, 3], // IDs de ingredientes seleccionados
      additionalNotes: 'Queso extra por favor'
    };
    addToCart(product, quantity, customization);
  };
}
```

### 2. Carrito de Compras con localStorage

Sistema completo de carrito con persistencia entre sesiones del navegador:

**Características:**
- Agregar/eliminar artículos
- Actualizar cantidades
- Artículos personalizados (con personalización de ingredientes) almacenados por separado
- Sincronización automática con localStorage
- Insignia de conteo de carrito en navbar

### 3. Integración con WhatsApp

Realización de pedidos directa por WhatsApp con mensajes bilingües formateados:

**Características:**
- Mensajes de pedido bilingües (Español/Inglés)
- Detalles completos del pedido incluyendo personalizaciones
- Información del cliente y entrega
- Desglose de precios

### 4. Soporte Multi-idioma

Sistema completo de traducción Español/Inglés:

**Características:**
- Cambio dinámico de idioma
- Función de traducción para datos de API
- Almacenado en localStorage
- Afecta todo el texto de la UI y mensajes de WhatsApp

### 5. Checkout con Campos de Dirección Separados

Formulario de checkout mejorado con campos de dirección específicos:

**Características:**
- Campos separados: Calle, Número de Casa
- Dropdown de ubicación: Ardales, Carratraca
- Campo de número de teléfono
- Notas opcionales
- Validación de formulario

## 📚 Documentación de Componentes

Para documentación detallada de componentes, ver [COMPONENTS.md](./COMPONENTS.md)

**Componentes Clave:**
- `ProductCard` - Mostrar producto con imagen, nombre, precio, insignias
- `ProductGrid` - Diseño de cuadrícula para productos con estados de carga
- `CategoryFilter` - Filtrar productos por categoría
- `MenuLayout` - Diseño principal con Navbar y Footer
- `CartPage` - Carrito de compras con gestión de artículos
- `CheckoutPage` - Formulario de checkout con integración WhatsApp
- `ProductDetailPage` - Detalles del producto con personalización de ingredientes

## 🧩 Context API

Para documentación detallada de contextos, ver [CONTEXTS.md](./CONTEXTS.md)

### Contextos Disponibles

#### AuthContext
Gestiona autenticación y autorización de usuarios.

```jsx
import { useAuth } from '@shared/contexts/AuthContext';

const { user, isAuthenticated, login, logout, register } = useAuth();
```

#### CartContext
Gestiona el estado del carrito de compras con persistencia en localStorage.

```jsx
import { useCart } from '@shared/contexts/CartContext';

const {
  items,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getTotalPrice,
  getItemCount
} = useCart();
```

#### LanguageContext
Gestiona el idioma de la aplicación (Español/Inglés).

```jsx
import { useLanguage } from '@shared/contexts/LanguageContext';

const { language, switchLanguage, t, getTranslation } = useLanguage();
```

#### ThemeContext
Gestiona tema oscuro/claro.

```jsx
import { useTheme } from '@shared/contexts/ThemeContext';

const { theme, toggleTheme, isDark } = useTheme();
```

## 🔌 Servicios

### API Service (`api.js`)
Instancia centralizada de Axios con interceptores para autenticación y manejo de errores.

### Auth Service (`authService.js`)
Operaciones de autenticación (login, registro, logout, refresco de token).

### WhatsApp Service (`whatsappService.js`)
Generar y enviar pedidos vía WhatsApp.

## 🧪 Pruebas

Usamos Vitest y Testing Library para cobertura completa de pruebas.

**Cobertura de Pruebas:**
- 29 pruebas pasando
- CartContext: Agregar, eliminar, actualizar, persistencia
- WhatsApp Service: Generación de mensajes, soporte bilingüe
- LanguageContext: Cambio de idioma, traducciones
- ThemeContext: Alternancia de tema
- ProductCard: Renderizado, interacciones

**Ejecutar Pruebas:**
```bash
npm run test              # Ejecutar todas las pruebas
npm run test:watch        # Modo watch
npm run test:ui           # UI interactiva
npm run test:coverage     # Informe de cobertura
```

## 🎨 Estilización con Tailwind

### Tema Personalizado - Pepper

El proyecto usa un tema personalizado "Pepper" para el menú público:

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      pepper: {
        orange: '#F76511',
        yellow: '#ffcc00',
        red: '#ff003c',
        green: '#0a9900',
        charcoal: '#1a1a1a',
        light: '#fafafa',
      }
    },
    fontFamily: {
      'gabarito': ['Gabarito', 'sans-serif'],
      'inter': ['Inter', 'sans-serif'],
    }
  }
}
```

## 📦 Servicios Implementados

Esta sección proporciona una visión general completa de todos los servicios frontend que se han implementado en este proyecto, organizados por categoría.

### ⚙️ Configuración Base

| Servicio | Descripción |
|---------|-------------|
| Setup de proyecto (Vite + React) | Configuración inicial, estructura de carpetas |
| Configuración de Tailwind CSS | Tema personalizado, plugins |
| Configuración de React Router | Rutas públicas y protegidas |
| Configuración de path aliases | @shared, @features, etc. |
| Configuración de ESLint/Prettier | Herramientas de calidad de código |
| Setup de hot-reload y HMR | Optimización de experiencia de desarrollo |

### 🎨 UI/UX Base

| Servicio | Descripción |
|---------|-------------|
| Sistema de diseño (Design Tokens) | Colores, tipografías, espaciados personalizados |
| Tema oscuro / personalización de UI | Dark mode completo con toggle |
| Componentes base reutilizables | Botones, inputs, cards, modals |
| Navbar responsive | Con menú móvil y carrito |
| Footer completo | Links, redes sociales, info |
| Loading states y skeletons | Placeholders durante carga |
| Animaciones y transiciones | Smooth UX con CSS/Framer Motion |
| Toasts y notificaciones | React-hot-toast configurado |
| Responsive design completo | Mobile-first approach |

### 🌍 Internacionalización

| Servicio | Descripción |
|---------|-------------|
| Multi-idioma (2 idiomas: ES/EN) | Textos y componentes traducidos |
| Context de idioma | LanguageContext con toggle |
| Persistencia de preferencia | Integración con LocalStorage |
| Traducción de formularios | Validaciones y mensajes |
| Traducción de emails | Si aplica en frontend |

### 🔐 Autenticación

| Servicio | Descripción |
|---------|-------------|
| Context de autenticación | AuthContext con login/logout |
| Páginas de login y registro | Formularios completos |
| Protección de rutas (ProtectedRoute) | HOC para rutas privadas |
| Gestión de tokens | LocalStorage/cookies |
| Redirect automático | Navegación post-login |
| Persistencia de sesión | Auto-login con token |

### 📄 Páginas Públicas

| Servicio | Descripción |
|---------|-------------|
| Landing/Home page | Hero section responsive (desktop/mobile) |
| Integración de carrusel en home | Componente PromotionsCarousel |
| Preload de imágenes hero | Optimización de rendimiento |
| Scroll indicator | Animación bounce |
| Página de productos/menú | Grid con filtros y paginación |
| Filtro por categorías | Componente CategoryFilter |
| Búsqueda de productos | Barra de búsqueda con debounce |
| Vista de detalle de producto | Página individual con info completa |
| Página de contacto | Formulario con validaciones |
| Integración WhatsApp | Botón flotante y links |

### 🛒 Carrito y Checkout

| Servicio | Descripción |
|---------|-------------|
| Context de carrito | CartContext con add/remove/update |
| Componente de carrito en navbar | Badge con cantidad |
| Página de carrito | Lista de items con totales |
| Actualización de cantidades | Botones increase/decrease |
| Eliminación de items | Con confirmación |
| Cálculo de totales en tiempo real | Subtotal, impuestos, total |
| Página de checkout | Formulario de datos de entrega |
| Validaciones de checkout | Validación completa de formulario |
| Selección de ubicación de entrega | Dropdown con opciones |
| Confirmación de pedido | Modal o página de éxito |
| Integración con backend | API POST de pedidos |

### 📦 Gestión de Pedidos

| Servicio | Descripción |
|---------|-------------|
| Página "Mis Pedidos" (MyOrdersPage) | Historial de pedidos del usuario |
| Componente de tarjeta de pedido | OrderCard con detalles |
| Tracking de estado de pedido | Timeline visual |
| Botón de cancelar pedido | Con confirmación |
| Filtros de pedidos | Por estado, fecha |
| Vista de detalle de pedido | Modal o página expandida |
| Actualización en tiempo real | Polling o WebSockets |

### 🎁 Promociones y Carrusel

| Servicio | Descripción |
|---------|-------------|
| Modal de promociones automático | PromotionsModal con carousel interno |
| Carrusel de imágenes en modal | Integración Swiper/embla |
| Control de "mostrar solo una vez" | SessionStorage |
| Componente PromotionsCarousel | Scroll infinito animado |
| Animación de scroll continuo | Animaciones CSS (5s configurable) |
| Pause on hover | Interacción UX |
| Cards personalizables | Emoji, texto, color de fondo |
| Gradientes de fade en bordes | Overlays w-8 |
| Border radius redondeado | Estilo rounded-3xl |
| Responsive carousel | Mobile/tablet/desktop |

### 👨‍💼 Panel Administrativo

| Servicio | Descripción |
|---------|-------------|
| Layout de admin | AdminLayout con sidebar y header |
| Sidebar colapsable | Toggle con iconos |
| Dashboard principal | DashboardPage con métricas |
| Tarjetas de estadísticas | Stats cards con iconos |
| Gráficos y charts | Integración Chart.js o Recharts |
| Página de gestión de productos | ProductsPage con tabla y CRUD |
| Modal de crear/editar producto | ProductModal con upload |
| Página de gestión de categorías | CategoriesPage |
| Modal de categorías | CategoryModal |
| Página de gestión de ingredientes | IngredientsPage |
| Modal de ingredientes | IngredientModal |
| Página de gestión de pedidos | OrdersPage con filtros |
| Vista de detalle de pedido admin | OrderDetailModal |
| Cambio de estado de pedido | Dropdown con actualización |
| Página de gestión de usuarios | UsersPage |
| Edición de roles de usuario | RoleModal |
| Página de promociones admin | PromotionsPage con CRUD |
| Modal de promociones | PromotionModal con upload |
| Página de carousel cards admin | CarouselCardsPage con CRUD |
| Modal de carousel cards | CarouselCardModal con pickers |
| Color picker en modal | Paleta + input hex personalizado |
| Emoji picker en modal | Sugerencias clickables |
| Live preview en modal | Preview card en tiempo real |
| Página de analytics | AnalyticsPage con estadísticas |
| Página de settings | SettingsPage con tabs |
| Gestión de horarios | Editor de horarios |
| Gestión de ubicaciones | CRUD de ubicaciones |
| Gestión de WhatsApp numbers | Lista de números de teléfono |

### 🔌 Integración con Backend

| Servicio | Descripción |
|---------|-------------|
| Hook personalizado useFetch | Hook personalizado para llamadas API |
| Hook usePaginatedFetch | Paginación automática |
| Gestión de estado de carga | Estados de carga |
| Gestión de errores | Manejo y visualización de errores |
| Retry logic | Auto-retry en peticiones fallidas |
| Interceptors de Axios/Fetch | Headers, auth, errores |
| Upload de imágenes | Carga de archivos con preview |
| Optimización de peticiones | Debounce, throttle |

### ⚡ Optimizaciones y Performance

| Servicio | Descripción |
|---------|-------------|
| Code splitting | Lazy loading de rutas |
| Optimización de imágenes | Lazy loading, WebP |
| Memoización de componentes | React.memo, useMemo |
| Virtual scrolling | Para listas largas |
| Service Worker / PWA | Soporte offline |
| Compresión de assets | Gzip, minificación |
| Bundle optimization | Tree shaking, chunks |

### 🧪 Testing

| Servicio | Descripción |
|---------|-------------|
| Setup de testing | Jest + React Testing Library |
| Tests unitarios de componentes | Cobertura básica |
| Tests de integración | Flujos de usuario |
| Tests de hooks | Testing de hooks personalizados |

### 📱 Responsive y Accesibilidad

| Servicio | Descripción |
|---------|-------------|
| Breakpoints personalizados | Mobile/tablet/desktop |
| Touch gestures | Optimizaciones swipe, tap |
| Accesibilidad (a11y) | ARIA labels, navegación por teclado |
| SEO básico | Meta tags, sitemap |

## 🤝 Contribuir

¡Bienvenidas las contribuciones! Por favor sigue estas pautas:

### Flujo de Trabajo Git

1. Crear una rama de característica desde `main`:
```bash
git checkout main
git pull origin main
git checkout -b feature/nombre-de-tu-característica
```

2. Hacer cambios y commit:
```bash
git add .
git commit -m "feat: agregar nueva característica"
```

3. Push y crear Pull Request:
```bash
git push origin feature/nombre-de-tu-característica
```

### Convención de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nueva característica
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Cambios de estilo de código (formato)
- `refactor:` - Refactorización de código
- `test:` - Agregar o actualizar pruebas
- `chore:` - Tareas de mantenimiento
- `ci:` - Cambios en CI/CD

### Estándares de Código

- Usar configuraciones de ESLint y Prettier
- Escribir PropTypes para todos los componentes
- Agregar pruebas para nuevas características
- Seguir la estructura existente del proyecto
- Usar componentes funcionales con hooks
- Mantener componentes pequeños y enfocados

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **Tu Nombre** - [Perfil de GitHub](https://github.com/tuusuario)

## 🙏 Agradecimientos

- Construido con [Vite](https://vitejs.dev/) para desarrollo ultra rápido
- Estilizado con [Tailwind CSS](https://tailwindcss.com/) para desarrollo rápido de UI
- Probado con [Vitest](https://vitest.dev/) para cobertura de pruebas confiable
- Iconos por [FontAwesome](https://fontawesome.com/)

## 📧 Soporte

Para soporte, enviar email a tu-email@ejemplo.com o abrir un issue en el repositorio.

---

Hecho con ❤️ para restaurantes

**Nota:** Esta es la versión en español. Para la versión en inglés, ver [README.md](README.md).
