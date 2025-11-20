# 📋 Guía de Importación del Menú

Esta guía explica cómo importar los datos del menú del restaurante a la base de datos.

## 📦 Archivos JSON Preparados

Los siguientes archivos contienen los datos del menú listos para importar:

### ✅ Ingredientes:
- `ingredientes_pizzas_final_1euro.json` - 67 ingredientes para pizzas
- `ingredientes_toda_la_carta.json` - 97 ingredientes generales
- `ingredientes_camperos_burger_enrollados_varios_fixed (1).json` - 32 ingredientes específicos

**Total**: ~196 ingredientes únicos (se eliminan duplicados automáticamente)
**Precio extras**: 1.00€ cada uno

### ✅ Categorías:
- `categorias_carta_con_postres.json` - 12 categorías
  - Pizzas
  - Camperos
  - Burgers 2.0
  - Enrollados
  - Entrantes
  - Ensaladas
  - Carnes de Ternera
  - Ibéricos
  - Pollo
  - Pescados
  - Especialidades 2.0
  - Postres

### ✅ Productos:
- `productos_completos_con_precios.json` - 80+ productos con:
  - ✓ Precios reales (basados en las cartas)
  - ✓ Descripciones en español e inglés
  - ✓ Emojis apropiados
  - ✓ Categorías asignadas
  - ✓ Disponibilidad configurada

---

## 🚀 Métodos de Importación

### Opción 1: Script Bash Automático (Recomendado)

El método más sencillo es usar el script bash incluido:

```bash
cd /Users/jalberth/Documents/monorepos/alternativa_2.0/assets
./import_menu.sh
```

El script te preguntará si deseas limpiar la base de datos antes de importar.

### Opción 2: Comando Django Manual

Si prefieres ejecutar el comando directamente:

```bash
# Ir al directorio del backend
cd /Users/jalberth/Documents/monorepos/alternativa_2.0/backend

# Activar entorno virtual
source .venv/bin/activate

# Opción A: Importar sin limpiar (añade a lo existente)
python manage.py import_menu_from_json

# Opción B: Limpiar todo antes de importar
python manage.py import_menu_from_json --clear

# Opción C: Especificar ruta personalizada a assets
python manage.py import_menu_from_json --assets-path /ruta/personalizada

# Desactivar entorno virtual
deactivate
```

---

## 📊 Orden de Importación

El comando importa los datos en el siguiente orden (respetando las dependencias):

1. **Ingredientes** ✓ (sin dependencias)
2. **Categorías** ✓ (sin dependencias)
3. **Productos** ✓ (depende de categorías e ingredientes)

---

## ⚙️ Opciones del Comando

| Opción | Descripción | Ejemplo |
|--------|-------------|---------|
| `--clear` | Elimina todos los productos, categorías e ingredientes antes de importar | `--clear` |
| `--assets-path` | Especifica una ruta personalizada a la carpeta assets | `--assets-path /mi/ruta` |

---

## ✅ Verificación después de la Importación

Después de ejecutar la importación, deberías ver:

```
========================================
📊 IMPORT SUMMARY
========================================
  Ingredients: 196
  Categories: 12
  Products: 80+
========================================
✅ Menu import completed successfully!
```

### Verificar en Django Admin:

1. Iniciar el servidor:
   ```bash
   cd backend
   source .venv/bin/activate
   python manage.py runserver
   ```

2. Ir a: http://localhost:8000/admin

3. Verificar:
   - **Ingredients**: ~196 ingredientes
   - **Categories**: 12 categorías
   - **Products**: 80+ productos

---

## 🔍 Solución de Problemas

### Error: "No se encontró el entorno virtual"

```bash
cd /Users/jalberth/Documents/monorepos/alternativa_2.0/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Error: "File not found"

Verifica que los archivos JSON están en la carpeta assets:

```bash
ls -la /Users/jalberth/Documents/monorepos/alternativa_2.0/assets/*.json
```

### Error: "Permission denied"

Dale permisos de ejecución al script:

```bash
chmod +x /Users/jalberth/Documents/monorepos/alternativa_2.0/assets/import_menu.sh
```

### Error de Base de Datos

Si la base de datos no existe, créala primero:

```bash
cd backend
source .venv/bin/activate
python manage.py migrate
```

---

## 📝 Notas Importantes

1. **Duplicados**: El comando detecta y evita duplicados de ingredientes por nombre
2. **Traducciones**: Todos los datos se importan en español (es) e inglés (en)
3. **Stock**: Los productos se crean con stock inicial de 100 unidades
4. **Precios**: Los precios están basados en las cartas reales del restaurante
5. **Imágenes**: Las imágenes de productos NO se importan automáticamente (deben agregarse manualmente después)

---

## 🔄 Reimportar Datos

Si necesitas reimportar todo desde cero:

```bash
# Esto eliminará TODOS los productos, categorías e ingredientes
python manage.py import_menu_from_json --clear
```

⚠️ **ADVERTENCIA**: `--clear` eliminará toda la data existente. Úsalo con precaución.

---

## 📧 Soporte

Si encuentras algún problema, revisa:
1. Los logs del comando (se muestran en la terminal)
2. El archivo de código: `backend/apps/products/management/commands/import_menu_from_json.py`
3. Los archivos JSON en la carpeta `assets/`
