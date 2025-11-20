# 🍕 Alternativa 2.0 - SaaS Digital Menu Platform

Sistema SaaS de menú digital y gestión de pedidos para restaurantes. **Monorepo** con backend Django y frontend React.

---

## 📋 Descripción

Plataforma completa para restaurantes que incluye:
- 📱 Menú digital interactivo
- 🛒 Sistema de pedidos en línea
- 👨‍💼 Panel administrativo completo
- 🌍 Multi-idioma (Español/Inglés)
- 🎨 Personalización por restaurante
- 📊 Analytics y reportes

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

## 📚 Documentación

- **API Docs (Swagger)**: http://localhost:8000/api/swagger/
- **API Docs (ReDoc)**: http://localhost:8000/api/redoc/
- **Admin Panel**: http://localhost:8000/admin

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

### Backend (Railway)
- Configurar variables de entorno en Railway
- `DATABASE_URL` se configura automáticamente
- Usar `Procfile` incluido

### Frontend (Vercel)
- Conectar repositorio en Vercel
- Build command: `npm run build`
- Output directory: `dist`

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
