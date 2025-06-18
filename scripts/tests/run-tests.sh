#!/bin/bash

# ================================
# SCRIPTS DE EJECUCIÓN DE TESTING
# ================================
# 
# Scripts para ejecutar tests individuales o la suite completa
# Uso: Dar permisos de ejecución con chmod +x y ejecutar

echo "🧪 SCRIPTS DE TESTING DISPONIBLES"
echo "================================"
echo ""
echo "Tests individuales:"
echo "  npm run test:auth      - Pruebas de autenticación"
echo "  npm run test:products  - Pruebas de productos"
echo "  npm run test:cart      - Pruebas de carrito"
echo "  npm run test:favorites - Pruebas de favoritos"
echo "  npm run test:reviews   - Pruebas de reseñas"
echo "  npm run test:addresses - Pruebas de direcciones"
echo "  npm run test:users     - Pruebas de usuarios"
echo "  npm run test:orders    - Pruebas de pedidos"
echo ""
echo "Suite completa:"
echo "  npm run test:all       - Ejecutar todos los tests"
echo ""
echo "Ejecución directa:"
echo "  node scripts/tests/test-auth.js"
echo "  node scripts/tests/test-all-routes.js"
echo ""
echo "📋 REQUISITOS:"
echo "- Servidor ejecutándose en puerto 5500 (npm start)"
echo "- Base de datos configurada y accesible"
echo "- Variables de entorno configuradas"
echo ""
