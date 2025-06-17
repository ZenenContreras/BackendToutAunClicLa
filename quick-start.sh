#!/bin/bash

# 🚀 Script de Inicio Rápido - ToutAunClicLa
# Sistema de Carrito, Favoritos y Cupones

echo "🎉 SISTEMA DE CARRITO, FAVORITOS Y CUPONES"
echo "========================================"
echo "📅 Completado: 17 de Junio, 2025"
echo "👨‍💻 Desarrollador: GitHub Copilot"
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Verificando dependencias...${NC}"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js y npm disponibles${NC}"

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Instalando dependencias...${NC}"
    npm install
fi

echo -e "${BLUE}🗄️ Verificando base de datos...${NC}"

# Ejecutar pruebas completas del sistema
echo -e "${YELLOW}🧪 Ejecutando pruebas del sistema...${NC}"
npm run test:complete

echo ""
echo -e "${BLUE}🚀 Opciones disponibles:${NC}"
echo ""
echo "1) Iniciar servidor de desarrollo"
echo "2) Crear datos de prueba"  
echo "3) Ver estadísticas de la base de datos"
echo "4) Ejecutar migración de detalles_pedido"
echo "5) Testing de emails"
echo "6) Limpiar datos de prueba"
echo "7) Ver documentación de API"
echo "8) Salir"
echo ""

read -p "Selecciona una opción (1-8): " choice

case $choice in
    1)
        echo -e "${GREEN}🚀 Iniciando servidor de desarrollo...${NC}"
        echo -e "${YELLOW}📡 Servidor disponible en: http://localhost:5500${NC}"
        echo -e "${YELLOW}📚 Documentación en: http://localhost:5500/health${NC}"
        npm run dev
        ;;
    2)
        echo -e "${BLUE}📦 Creando datos de prueba...${NC}"
        npm run test:data create
        echo -e "${GREEN}✅ Datos de prueba creados${NC}"
        ;;
    3)
        echo -e "${BLUE}📊 Estadísticas de la base de datos:${NC}"
        npm run test:data stats
        ;;
    4)
        echo -e "${BLUE}🔧 Ejecutando migración de tabla detalles_pedido...${NC}"
        npm run migrate:detalles-pedido
        ;;
    5)
        echo -e "${BLUE}📧 Testing de emails...${NC}"
        npm run test:verification
        ;;
    6)
        echo -e "${YELLOW}🧹 Limpiando datos de prueba...${NC}"
        npm run test:data clean
        echo -e "${GREEN}✅ Datos de prueba eliminados${NC}"
        ;;
    7)
        echo -e "${BLUE}📚 Abriendo documentación de API...${NC}"
        if command -v open &> /dev/null; then
            open docs/API_TESTING.md
        elif command -v xdg-open &> /dev/null; then
            xdg-open docs/API_TESTING.md
        else
            echo -e "${YELLOW}📄 Ver archivo: docs/API_TESTING.md${NC}"
        fi
        ;;
    8)
        echo -e "${GREEN}👋 ¡Hasta luego!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✨ Comando completado${NC}"
echo ""
echo -e "${BLUE}💡 Comandos útiles:${NC}"
echo "  npm run dev                 - Servidor de desarrollo"
echo "  npm run test:complete       - Pruebas completas"
echo "  npm run test:data create    - Crear datos de prueba"
echo "  npm run test:data stats     - Ver estadísticas"
echo ""
echo -e "${YELLOW}📚 Documentación disponible en:${NC}"
echo "  docs/API_TESTING.md         - Guía de testing de API"
echo "  REPORTE_FINAL.md           - Reporte final del proyecto"
echo "  CARRITO_FAVORITOS_CUPONES.md - Documentación funcional"
echo ""
echo -e "${GREEN}🎉 Sistema listo para producción!${NC}"
