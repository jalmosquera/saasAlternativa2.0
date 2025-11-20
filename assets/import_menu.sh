#!/bin/bash

# Script para importar el menú desde archivos JSON
# Este script activa el entorno virtual y ejecuta el comando de Django

set -e  # Salir si hay algún error

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Importador de Menú - Alternativa 2.0${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Ruta al proyecto
PROJECT_DIR="/Users/jalberth/Documents/monorepos/alternativa_2.0/backend"
VENV_DIR="$PROJECT_DIR/.venv"

# Verificar que existe el entorno virtual
if [ ! -d "$VENV_DIR" ]; then
    echo -e "${RED}❌ Error: No se encontró el entorno virtual en $VENV_DIR${NC}"
    exit 1
fi

# Activar el entorno virtual
echo -e "${YELLOW}🔧 Activando entorno virtual...${NC}"
source "$VENV_DIR/bin/activate"

# Ir al directorio del backend
cd "$PROJECT_DIR"

# Preguntar si se debe limpiar la base de datos
echo -e "\n${YELLOW}⚠️  ¿Deseas limpiar toda la data existente antes de importar? (s/N)${NC}"
read -r response

if [[ "$response" =~ ^([sS][iI]|[sS])$ ]]; then
    echo -e "${YELLOW}🗑️  Limpiando base de datos...${NC}"
    python manage.py import_menu_from_json --clear
else
    echo -e "${GREEN}📥 Importando sin limpiar data existente...${NC}"
    python manage.py import_menu_from_json
fi

# Desactivar el entorno virtual
deactivate

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Importación completada${NC}"
echo -e "${GREEN}========================================${NC}"
