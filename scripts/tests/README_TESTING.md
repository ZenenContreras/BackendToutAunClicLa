# 🧪 Sistema de Testing de la API

## Descripción

Suite completa de testing para todas las rutas de la API **ToutaunclicLa**. Incluye pruebas automatizadas para verificar el correcto funcionamiento de todos los endpoints, validaciones, casos de error y flujos de trabajo.

## 📋 Requisitos Previos

- **Servidor ejecutándose**: `npm start` en puerto 5500
- **Base de datos**: Supabase configurada y accesible
- **Variables de entorno**: Archivo `.env` con configuración completa
- **Node.js**: Versión 16 o superior

## 🏗️ Arquitectura de Testing

### Clase Base: `BaseAPITester`

Todos los tests heredan de `BaseAPITester` que proporciona:

- 🔐 **Configuración automática de autenticación**
- 📊 **Sistema de estadísticas y métricas**
- 🎨 **Output coloreado para mejor legibilidad**
- 🔄 **Gestión automática de tokens JWT**
- 📝 **Logging estructurado de resultados**

### Scripts de Testing Disponibles

| Script | Descripción | Comando |
|--------|-------------|---------|
| `test-auth.js` | Autenticación (registro, login, verificación) | `npm run test:auth` |
| `test-products.js` | Productos (listado, búsqueda, operaciones admin) | `npm run test:products` |
| `test-cart.js` | Carrito (agregar, quitar, cupones, gestión) | `npm run test:cart` |
| `test-favorites.js` | Favoritos (agregar, quitar, estado, validaciones) | `npm run test:favorites` |
| `test-reviews.js` | Reseñas (crear, actualizar, eliminar, por producto) | `npm run test:reviews` |
| `test-addresses.js` | Direcciones (CRUD completo, formatos duales) | `npm run test:addresses` |
| `test-users.js` | Usuarios (perfil, contraseña, gestión admin) | `npm run test:users` |
| `test-orders.js` | Pedidos (crear, cancelar, admin, estados) | `npm run test:orders` |
| `test-all-routes.js` | **Suite completa** (todos los tests) | `npm run test:all` |

## 🚀 Uso Rápido

### Ejecutar todos los tests
```bash
npm run test:all
```

### Ejecutar test individual
```bash
npm run test:auth
npm run test:products
npm run test:cart
# ... etc
```

### Ejecución directa con Node
```bash
node scripts/tests/test-auth.js
node scripts/tests/test-all-routes.js
```

### Ver ayuda
```bash
npm run test:help
```

## 📊 Interpretación de Resultados

### Códigos de Estado

- ✅ **PASS**: Test ejecutado exitosamente
- ❌ **FAIL**: Test falló (error inesperado)
- ⏭️ **SKIP**: Test omitido (condición no cumplida)

### Colores de Output

- 🟢 **Verde**: Operaciones exitosas
- 🔴 **Rojo**: Errores y fallos
- 🟡 **Amarillo**: Advertencias y tests omitidos
- 🔵 **Azul**: Información general
- ⚪ **Blanco**: Detalles técnicos

### Ejemplo de Output

```
🧪 TESTING AUTENTICACIÓN
========================

  ✅ Registro de usuario... PASS
  ✅ Obtener código de verificación... PASS
  ✅ Verificar email... PASS
  ✅ Login de usuario... PASS
  ✅ Obtener perfil de usuario... PASS

📊 ESTADÍSTICAS FINALES
=====================
✅ Exitosos: 5
❌ Fallidos: 0
⏭️ Omitidos: 0
📊 Total: 5

🎯 Tasa de éxito: 100.0%
```

## 🔧 Características del Sistema

### Autenticación Automática

Cada test:
1. Crea un usuario único con timestamp
2. Obtiene automáticamente el código de verificación
3. Verifica el email
4. Realiza login y obtiene token JWT
5. Usa el token para tests autenticados

### Gestión de Datos de Prueba

- **Usuarios únicos**: Email con timestamp para evitar conflictos
- **Limpieza automática**: Los datos se crean con prefijos identificables
- **Datos relacionados**: Products, cart items, favorites, etc. se vinculan correctamente

### Validaciones Exhaustivas

Cada módulo prueba:

- ✅ **Happy path**: Casos de uso normales
- ❌ **Error cases**: Validaciones y casos límite
- 🔐 **Autenticación**: Acceso con/sin permisos
- 📝 **Validación de datos**: Campos requeridos y formatos
- 🔄 **Casos de estado**: Productos inexistentes, duplicados, etc.

## 📁 Estructura de Archivos

```
scripts/tests/
├── test-utils.js          # Clase base y utilidades
├── test-auth.js           # Tests de autenticación
├── test-products.js       # Tests de productos
├── test-cart.js           # Tests de carrito
├── test-favorites.js      # Tests de favoritos
├── test-reviews.js        # Tests de reseñas
├── test-addresses.js      # Tests de direcciones
├── test-users.js          # Tests de usuarios
├── test-orders.js         # Tests de pedidos
├── test-all-routes.js     # Suite maestra
├── run-tests.sh           # Script de ayuda
└── README_TESTING.md      # Esta documentación
```

## 🛠️ Configuración

### Variables de Entorno Requeridas

```env
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
JWT_SECRET=tu_jwt_secret
RESEND_API_KEY=tu_resend_key (para emails)
STRIPE_SECRET_KEY=tu_stripe_key (opcional para algunos tests)
```

### Puerto del Servidor

El sistema está configurado para conectarse a:
- **URL Base**: `http://localhost:5500/api/v1`
- **Puerto**: 5500 (configurable en test-utils.js)

## 🎯 Casos de Uso Específicos

### Testing de Desarrollo

Para verificar cambios durante desarrollo:

```bash
# Test rápido de un módulo específico
npm run test:auth

# Test completo después de cambios importantes
npm run test:all
```

### Testing de Integración

Para verificar que todas las rutas funcionan correctamente:

```bash
# Suite completa con reporte detallado
npm run test:all > test-results.log 2>&1
```

### Testing de Performance

El sistema mide automáticamente:
- Tiempo total de ejecución
- Tiempo por módulo
- Número de requests por segundo

## 🚨 Troubleshooting

### Error: "Servidor no responde"

```bash
# Verificar que el servidor esté ejecutándose
npm start

# Verificar el puerto
curl http://localhost:5500/health
```

### Error: "Token inválido"

- El sistema crea usuarios automáticamente
- Si hay problemas persistentes, revisar configuración JWT

### Error: "No hay productos disponibles"

- Algunos tests requieren productos en la base de datos
- Usar el seeder o crear productos manualmente

### Tests lentos

- Verificar conexión a Supabase
- Revisar logs del servidor para identificar consultas lentas

## 📈 Métricas y Estadísticas

El sistema proporciona métricas detalladas:

### Por Módulo
- Número de tests ejecutados
- Tasa de éxito
- Tiempo de ejecución
- Tests omitidos y razones

### Globales
- Tests totales ejecutados
- Tasa de éxito general
- Módulos completados exitosamente
- Tiempo total de ejecución

## 🔄 Extensión del Sistema

### Agregar Nuevo Test

1. Crear archivo `test-nuevo-modulo.js`
2. Extender de `BaseAPITester`
3. Implementar método `runTests()`
4. Agregar al script maestro
5. Actualizar package.json

### Ejemplo de Estructura

```javascript
import { BaseAPITester } from './test-utils.js';

class NuevoModuloTester extends BaseAPITester {
  constructor() {
    super();
    this.routeName = 'NUEVO MÓDULO';
    this.routeEndpoint = '/nuevo-endpoint';
    this.routeEmoji = '🆕';
  }

  async runTests() {
    await this.setupAuth();
    
    await this.test('Descripción del test', async () => {
      // Lógica del test
      return true; // éxito
    });
    
    return this.printStats();
  }
}
```

## 📞 Soporte

Para problemas o mejoras:

1. Revisar logs de consola
2. Verificar configuración del servidor
3. Comprobar variables de entorno
4. Revisar documentación de cada endpoint

---

**Desarrollado con ❤️ para el proyecto ToutaunclicLa**
