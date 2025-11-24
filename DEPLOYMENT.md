# 🚀 Guía de Deployment

Esta guía explica cómo hacer deploy de la aplicación en Railway (backend) y Vercel (frontend).

## 📦 Backend - Railway

### Prerequisitos

- Cuenta en [Railway](https://railway.app/)
- Base de datos PostgreSQL configurada en Railway
- Variables de entorno configuradas

### Variables de Entorno Requeridas

```bash
# Django
SECRET_KEY=<tu-secret-key-segura>
DEBUG=False
DJANGO_SETTINGS_MODULE=core.production

# Database (Railway PostgreSQL auto-configura DATABASE_URL)
DATABASE_URL=postgresql://...

# Hosts permitidos (separados por comas)
ALLOWED_HOSTS=.railway.app,tudominio.com

# CORS - Frontend URL
CORS_ALLOWED_ORIGINS=https://tu-app.vercel.app,https://tudominio.com
CSRF_TRUSTED_ORIGINS=https://tu-app.vercel.app,https://*.railway.app

# Cloudinary (opcional - para imágenes)
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Email (opcional - para notificaciones)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-password-app
```

### Pasos de Deployment

1. **Crear nuevo proyecto en Railway**
   ```bash
   # Conectar repositorio de GitHub
   # Railway detectará automáticamente el Dockerfile
   ```

2. **Agregar servicio PostgreSQL**
   - En el dashboard de Railway: "New" → "Database" → "PostgreSQL"
   - Railway auto-configura la variable `DATABASE_URL`

3. **Configurar variables de entorno**
   - Settings → Variables
   - Agregar todas las variables listadas arriba

4. **Deploy automático**
   - Railway ejecutará:
     - Build del Dockerfile
     - Migraciones (`python manage.py migrate`)
     - Collectstatic (`python manage.py collectstatic`)
     - Inicio de Gunicorn con gevent

### Configuración de Throttling

El backend tiene protección anti-spam configurada:

- **Usuarios anónimos**: 100 requests/hora
- **Usuarios autenticados**: 1000 requests/hora
- **Guest checkout**: 5 pedidos/hora por IP

---

## 🌐 Frontend - Vercel

### Prerequisitos

- Cuenta en [Vercel](https://vercel.com/)
- Variables de entorno configuradas

### Variables de Entorno Requeridas

```bash
# API Backend URL (Railway)
VITE_API_URL=https://tu-backend.railway.app
VITE_API_BASE_URL=https://tu-backend.railway.app/api

# App Configuration
VITE_APP_NAME=Equus Pub

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false

# Environment
VITE_NODE_ENV=production
```

### Pasos de Deployment

1. **Conectar repositorio**
   ```bash
   # En Vercel dashboard:
   # New Project → Import Git Repository
   # Seleccionar el repositorio y la carpeta /frontend
   ```

2. **Configurar proyecto**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Agregar variables de entorno**
   - Settings → Environment Variables
   - Agregar todas las variables listadas arriba
   - Importante: Actualizar `VITE_API_URL` con tu URL de Railway

4. **Deploy**
   - Click "Deploy"
   - Vercel automáticamente:
     - Instala dependencias
     - Ejecuta `npm run build`
     - Despliega a CDN global

### Configuración de SPA Routing

El archivo `vercel.json` ya está configurado para:
- ✅ Reescribir todas las rutas a `index.html` (React Router)
- ✅ Cache agresivo de assets (`max-age=31536000`)
- ✅ Headers de seguridad (XSS, nosniff, frame-options)

---

## 🔄 Actualizar URLs después del deployment

### 1. Backend (Railway)

Después del primer deploy, Railway te dará una URL como:
```
https://tu-proyecto.up.railway.app
```

### 2. Frontend (Vercel)

Después del primer deploy, Vercel te dará una URL como:
```
https://tu-proyecto.vercel.app
```

### 3. Actualizar configuración cruzada

**En Railway (Backend):**
```bash
CORS_ALLOWED_ORIGINS=https://tu-proyecto.vercel.app
CSRF_TRUSTED_ORIGINS=https://tu-proyecto.vercel.app,https://*.railway.app
```

**En Vercel (Frontend):**
```bash
VITE_API_URL=https://tu-proyecto.up.railway.app
VITE_API_BASE_URL=https://tu-proyecto.up.railway.app/api
```

### 4. Re-deploy

Después de actualizar las variables:
- Railway: Re-deploy automático
- Vercel: Re-deploy automático

---

## 🔍 Troubleshooting

### CORS Errors

**Problema:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solución:**
1. Verificar que `CORS_ALLOWED_ORIGINS` incluye la URL de Vercel
2. Verificar que la URL NO termina en `/`
3. Re-deploy el backend después de cambiar

### 502 Bad Gateway (Railway)

**Problema:** El backend no responde

**Solución:**
1. Verificar logs en Railway
2. Verificar que `DATABASE_URL` está configurada
3. Verificar que las migraciones se ejecutaron

### 404 en rutas del frontend (Vercel)

**Problema:** Refresh en rutas internas da 404

**Solución:**
1. Verificar que `vercel.json` existe y tiene rewrites
2. Re-deploy el frontend

---

## 📊 Monitoreo

### Railway
- Logs: Dashboard → Deployments → View Logs
- Métricas: CPU, memoria, requests

### Vercel
- Analytics: Dashboard → Analytics
- Logs: Dashboard → Deployments → Function Logs

---

## 🔐 Seguridad

### Backend
- ✅ HTTPS obligatorio (SSL redirect)
- ✅ Cookies seguras
- ✅ CSRF protection
- ✅ XSS protection
- ✅ Throttling habilitado

### Frontend
- ✅ Headers de seguridad configurados
- ✅ Cache optimizado
- ✅ HTTPS automático (Vercel)

---

## 📝 Checklist de Deployment

### Backend (Railway)
- [ ] PostgreSQL configurado
- [ ] SECRET_KEY generada
- [ ] ALLOWED_HOSTS configurado
- [ ] CORS_ALLOWED_ORIGINS con URL de Vercel
- [ ] Migraciones ejecutadas
- [ ] Collectstatic ejecutado
- [ ] Endpoint funciona: `https://tu-backend.railway.app/api/`

### Frontend (Vercel)
- [ ] VITE_API_URL apunta a Railway
- [ ] Build exitoso
- [ ] Rutas funcionan (home, login, checkout, etc.)
- [ ] CORS funciona (no hay errores en consola)
- [ ] Guest checkout funciona

---

## 🎯 Próximos pasos

Después del deployment exitoso:

1. **Dominio personalizado** (opcional)
   - Railway: Settings → Custom Domain
   - Vercel: Settings → Domains

2. **Monitoreo de errores**
   - Considerar Sentry para tracking de errores

3. **Backups automáticos**
   - Railway PostgreSQL tiene backups automáticos

4. **CDN para media files**
   - Cloudinary está configurado para imágenes de productos

---

¿Necesitas ayuda? Revisa los logs en:
- **Railway**: Dashboard → Deployments → Logs
- **Vercel**: Dashboard → Deployments → Function Logs
