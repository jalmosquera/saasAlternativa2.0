# 🛠️ Guía de Configuración - Alternativa 2.0 Backend

## 📝 Configuración Local vs Producción

Este proyecto usa diferentes configuraciones según el entorno:

### 🏠 **Desarrollo Local** (Lo que tienes ahora)

- **Base de datos**: SQLite (`db.sqlite3`)
- **Almacenamiento**: Archivos locales en carpeta `media/`
- **DEBUG**: `True`
- **Emails**: Se muestran en la consola
- **CORS**: Permite localhost:5173 y localhost:3000

### 🚀 **Producción** (Railway/Vercel)

- **Base de datos**: PostgreSQL
- **Almacenamiento**: Cloudinary para imágenes
- **DEBUG**: `False`
- **Emails**: SMTP real (Brevo)
- **CORS**: Dominios específicos de producción

---

## 📄 Archivo `.env` Creado

Se ha creado el archivo `.env` en la raíz del backend con la configuración para desarrollo local:

```
backend/
├── .env          ← Configuración LOCAL (no se sube a git)
├── .env.example  ← Plantilla de ejemplo
```

**Variables importantes:**
- `DEBUG=True` → Modo desarrollo
- `ALLOWED_HOSTS=localhost,127.0.0.1` → Solo local
- `CLOUDINARY_*=` (vacío) → Usa almacenamiento local
- `EMAIL_BACKEND=console` → Emails en consola

---

## 🗃️ Base de Datos

### SQLite Local (Actual)

La base de datos está en:
```
backend/db.sqlite3
```

**Comandos útiles:**
```bash
# Ver la base de datos
cd backend
source .venv/bin/activate
python manage.py dbshell

# Hacer backup
cp db.sqlite3 db.sqlite3.backup

# Resetear la base de datos
rm db.sqlite3
python manage.py migrate
python manage.py import_menu_from_json --clear
```

### PostgreSQL (Producción)

En producción se usa PostgreSQL automáticamente cuando existe la variable `DATABASE_URL`.

---

## 🖼️ Almacenamiento de Imágenes

### Local (Sin Cloudinary)

Cuando las variables de Cloudinary están vacías (como ahora):
- Las imágenes se guardan en: `backend/media/Products/`
- Se sirven desde: `http://localhost:8000/media/Products/`

### Cloudinary (Producción)

Para activar Cloudinary en local (opcional):
1. Crear cuenta en https://cloudinary.com
2. Agregar credenciales al `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   ```
3. Reiniciar el servidor

---

## 🚀 Iniciar el Servidor

### Opción 1: Modo Normal

```bash
cd backend
source .venv/bin/activate
python manage.py runserver
```

El servidor estará en: http://localhost:8000

### Opción 2: Con Puerto Específico

```bash
python manage.py runserver 8080
```

### Opción 3: Accesible desde la red local

```bash
python manage.py runserver 0.0.0.0:8000
```

---

## 🔍 Verificar Configuración Actual

Para ver qué configuración está usando:

```bash
cd backend
source .venv/bin/activate
python manage.py shell
```

Luego en la shell de Python:
```python
from django.conf import settings

# Ver DEBUG
print(f"DEBUG: {settings.DEBUG}")

# Ver base de datos
print(f"Database: {settings.DATABASES['default']}")

# Ver almacenamiento
print(f"Storage: {settings.STORAGES['default']['BACKEND']}")

# Ver CORS
print(f"CORS: {settings.CORS_ALLOWED_ORIGINS}")
```

---

## 🔄 Cambiar entre Local y Producción

### Para Development (Local):

Ya está configurado correctamente con el `.env` creado.

### Para Production (Railway):

Railway usa automáticamente `core/production.py` cuando detecta estas variables:
- `DATABASE_URL` → PostgreSQL
- `SECRET_KEY` → Clave secreta de producción
- `ALLOWED_HOSTS` → Dominios permitidos

---

## ⚠️ Problemas Comunes

### "No module named 'dotenv'"

```bash
source .venv/bin/activate
pip install python-dotenv
```

### "Error de Cloudinary"

Deja las variables vacías en `.env`:
```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### "Access denied to database"

Verifica que estés usando SQLite local:
```bash
python manage.py migrate
```

### "CORS error en frontend"

Verifica que el frontend esté en el puerto correcto:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

---

## 📊 Resumen de Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Backend Django | 8000 | http://localhost:8000 |
| Frontend Vite | 5173 | http://localhost:5173 |
| Admin Django | 8000 | http://localhost:8000/admin |
| API Swagger | 8000 | http://localhost:8000/api/swagger/ |

---

## 🔐 Seguridad

**IMPORTANTE:**
- ❌ **NUNCA** subas el archivo `.env` a git
- ✅ El `.env` ya está en `.gitignore`
- ✅ Usa `.env.example` como plantilla para otros developers
- ✅ Cambia `SECRET_KEY` en producción

---

## 📚 Documentación API

Con el servidor corriendo, visita:
- **Swagger UI**: http://localhost:8000/api/swagger/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Schema JSON**: http://localhost:8000/api/schema/

---

## 🎯 Checklist de Configuración Correcta

- [✅] Archivo `.env` creado
- [✅] `DEBUG=True` en `.env`
- [✅] Dependencias instaladas (`pip install -r requirements.txt`)
- [✅] Migraciones aplicadas (`python manage.py migrate`)
- [✅] Datos importados (`python manage.py import_menu_from_json --clear`)
- [✅] SQLite como base de datos local
- [✅] Almacenamiento local de archivos
- [⏳] Crear superusuario (`python manage.py createsuperuser`)
- [⏳] Verificar servidor (`python manage.py runserver`)

---

¡Tu backend está listo para desarrollo local! 🎉
