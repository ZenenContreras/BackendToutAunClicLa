# ❤️ API de Favoritos

Sistema de gestión de productos favoritos con validaciones y paginación.

## Base URL
```
http://localhost:3000/api/favorites
```

**🔒 Autenticación Requerida**: Todos los endpoints requieren token JWT válido.

---

## Endpoints Disponibles

### GET /
Obtiene productos favoritos del usuario con paginación.

**Headers:**
```
Authorization: Bearer jwt_token
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Favoritos por página (default: 20)

**Response (200):**
```json
{
  "favorites": [
    {
      "id": 1,
      "usuario_id": "uuid",
      "producto_id": 123,
      "productos": {
        "id": 123,
        "nombre": "Producto Ejemplo",
        "precio": 29.99,
        "imagen_principal": "https://ejemplo.com/imagen.jpg",
        "stock": 50,
        "categorias": {
          "nombre": "Categoría Ejemplo"
        }
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 50,
    "itemsPerPage": 20
  }
}
```

**Características:**
- Información completa del producto
- Datos de categoría incluidos
- Paginación para listas largas
- Ordenamiento por fecha de agregado (más recientes primero)
| page | number | Número de página | 1 |
| limit | number | Elementos por página | 20 |

#### Respuesta Exitosa (200)
```json
{
  "favorites": [
    {
      "id": "uuid",
      "usuario_id": "user_uuid",
      "producto_id": 123,
      "fecha_agregado": "2025-06-17T10:30:00Z",
      "productos": {
        "id": 123,
        "nombre": "iPhone 14 Pro Max",
        "precio": 1199.99,
        "imagen_principal": "https://example.com/iphone14.jpg",
        "stock": 25,
        "categorias": {
          "nombre": "Electrónicos"
        }
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 45,
    "itemsPerPage": 20
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 401 | Unauthorized | Token inválido o expirado |
| 500 | Internal Server Error | Error del servidor |

---

### 2. Agregar a Favoritos
**POST** `/`

#### Descripción
Agrega un producto a la lista de favoritos del usuario.

#### Request Body
```json
{
  "productId": 123
}
```

#### Validaciones
- **productId**: Número entero positivo, requerido

#### Respuesta Exitosa (201)
```json
{
  "message": "Product added to favorites successfully",
  "favorite": {
    "id": "uuid",
    "usuario_id": "user_uuid",
    "producto_id": 123,
    "fecha_agregado": "2025-06-17T10:30:00Z",
    "productos": {
      "id": 123,
      "nombre": "iPhone 14 Pro Max",
      "precio": 1199.99,
      "imagen_principal": "https://example.com/iphone14.jpg",
      "stock": 25
    }
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Validation error | Datos inválidos |
| 404 | Product not found | Producto no encontrado |
| 409 | Already in favorites | Producto ya está en favoritos |
| 401 | Unauthorized | Token inválido |

#### Ejemplo de Error (Producto ya en favoritos)
```json
{
  "error": "Already in favorites",
  "message": "Product is already in your favorites",
  "productId": 123
}
```

---

### 3. Verificar Estado de Favorito
**GET** `/status/:productId`

#### Descripción
Verifica si un producto específico está en los favoritos del usuario.

#### URL Parameters
- `productId`: ID del producto (número entero)

#### Respuesta Exitosa (200)
```json
{
  "isFavorite": true,
  "favoriteId": "uuid",
  "productId": 123,
  "addedAt": "2025-06-17T10:30:00Z"
}
```

#### Respuesta cuando NO es favorito (200)
```json
{
  "isFavorite": false,
  "productId": 123
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Invalid product ID | ID de producto inválido |
| 401 | Unauthorized | Token inválido |
| 404 | Product not found | Producto no encontrado |

---

### 4. Eliminar de Favoritos
**DELETE** `/:productId`

#### Descripción
Elimina un producto específico de la lista de favoritos.

#### URL Parameters
- `productId`: ID del producto (número entero)

#### Respuesta Exitosa (200)
```json
{
  "message": "Product removed from favorites successfully",
  "productId": 123
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 404 | Favorite not found | Producto no está en favoritos |
| 400 | Invalid product ID | ID de producto inválido |
| 401 | Unauthorized | Token inválido |

---

## Casos de Uso Comunes

### Flujo Completo de Favoritos

#### 1. Verificar si un producto es favorito
```bash
curl -X GET http://localhost:5500/api/v1/favorites/status/123 \
  -H "Authorization: Bearer <token>"
```

#### 2. Agregar producto a favoritos
```bash
curl -X POST http://localhost:5500/api/v1/favorites \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 123
  }'
```

#### 3. Obtener todos los favoritos
```bash
curl -X GET http://localhost:5500/api/v1/favorites \
  -H "Authorization: Bearer <token>"
```

#### 4. Obtener favoritos paginados
```bash
curl -X GET "http://localhost:5500/api/v1/favorites?page=2&limit=10" \
  -H "Authorization: Bearer <token>"
```

#### 5. Eliminar de favoritos
```bash
curl -X DELETE http://localhost:5500/api/v1/favorites/123 \
  -H "Authorization: Bearer <token>"
```

---

## Integración con Frontend

### Toggle de Favoritos
```javascript
// Función para alternar favorito
async function toggleFavorite(productId) {
  try {
    // Verificar estado actual
    const statusResponse = await fetch(`/api/v1/favorites/status/${productId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const status = await statusResponse.json();
    
    if (status.isFavorite) {
      // Eliminar de favoritos
      await fetch(`/api/v1/favorites/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return false; // Ya no es favorito
    } else {
      // Agregar a favoritos
      await fetch('/api/v1/favorites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
      });
      return true; // Ahora es favorito
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
}
```

### Lista de Favoritos
```javascript
// Función para obtener favoritos con paginación
async function getFavorites(page = 1, limit = 20) {
  try {
    const response = await fetch(`/api/v1/favorites?page=${page}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
}
```

---

## Reglas de Negocio

### Restricciones
- Un usuario no puede tener el mismo producto duplicado en favoritos
- No hay límite en la cantidad de favoritos por usuario
- Los favoritos persisten indefinidamente hasta ser eliminados
- Si un producto se elimina del catálogo, permanece en favoritos pero se marca como "no disponible"

### Ordenamiento
- Los favoritos se ordenan por fecha de agregado (más recientes primero)
- Se puede implementar ordenamiento personalizado en el frontend

### Performance
- Las consultas incluyen información completa del producto para evitar requests adicionales
- Se implementa paginación para listas grandes
- Los índices de base de datos optimizan las consultas por usuario_id y producto_id

---

## Estados del Producto en Favoritos

### Producto Disponible
```json
{
  "id": "uuid",
  "productos": {
    "id": 123,
    "nombre": "iPhone 14 Pro Max",
    "precio": 1199.99,
    "stock": 25,
    "activo": true
  }
}
```

### Producto Agotado
```json
{
  "id": "uuid",
  "productos": {
    "id": 123,
    "nombre": "iPhone 14 Pro Max",
    "precio": 1199.99,
    "stock": 0,
    "activo": true
  }
}
```

### Producto Descontinuado
```json
{
  "id": "uuid",
  "productos": {
    "id": 123,
    "nombre": "iPhone 14 Pro Max",
    "precio": 1199.99,
    "stock": 0,
    "activo": false
  }
}
```

---

## Webhooks y Notificaciones

### Eventos Disponibles
- `favorite.added` - Producto agregado a favoritos
- `favorite.removed` - Producto eliminado de favoritos
- `favorite.product_back_in_stock` - Producto favorito vuelve a tener stock
- `favorite.product_price_drop` - Bajada de precio en producto favorito

### Configuración de Notificaciones
```json
{
  "user_preferences": {
    "notify_stock_updates": true,
    "notify_price_drops": true,
    "notification_methods": ["email", "push"]
  }
}
```

---

## Notas Importantes

- Los favoritos no afectan el stock del producto
- Se recomienda mostrar estado de stock en la lista de favoritos
- Los precios se actualizan dinámicamente desde la base de datos
- Se mantiene un constraint único en (usuario_id, producto_id) para evitar duplicados
- Los favoritos se pueden usar para análisis de preferencias del usuario
