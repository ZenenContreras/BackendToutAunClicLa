# ⭐ Reviews API

## Overview
Sistema de reseñas que permite a los usuarios calificar y comentar productos que han comprado.

## Base URL
```
/api/v1/reviews
```

---

## Endpoints

### 1. Obtener Reseñas de Producto
**GET** `/product/:productId`

#### Descripción
Obtiene todas las reseñas de un producto específico con información del usuario que las escribió.

#### URL Parameters
- `productId`: ID del producto (número entero)

#### Query Parameters
| Parámetro | Tipo | Descripción | Por Defecto |
|-----------|------|-------------|-------------|
| page | number | Número de página | 1 |
| limit | number | Elementos por página | 10 |

#### Respuesta Exitosa (200)
```json
{
  "reviews": [
    {
      "id": "uuid",
      "producto_id": 123,
      "usuario_id": "user_uuid",
      "estrellas": 5,
      "comentario": "Excelente producto, muy recomendado!",
      "fecha_creacion": "2025-06-17T10:30:00Z",
      "usuarios": {
        "nombre": "Juan Pérez"
      }
    },
    {
      "id": "uuid",
      "producto_id": 123,
      "usuario_id": "user_uuid2",
      "estrellas": 4,
      "comentario": "Muy bueno, aunque podría mejorar en algunos aspectos.",
      "fecha_creacion": "2025-06-16T15:20:00Z",
      "usuarios": {
        "nombre": "María González"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10
  },
  "statistics": {
    "averageRating": 4.3,
    "totalReviews": 25,
    "ratingDistribution": {
      "5": 12,
      "4": 8,
      "3": 3,
      "2": 1,
      "1": 1
    }
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 404 | Product not found | Producto no encontrado |
| 400 | Invalid product ID | ID de producto inválido |

---

### 2. Crear Reseña 🔒
**POST** `/`

#### Descripción
Crea una nueva reseña para un producto. Solo usuarios que han comprado el producto pueden crear reseñas.

#### Headers Requeridos
```
Authorization: Bearer <jwt_token>
```

#### Request Body
```json
{
  "productId": 123,
  "estrellas": 5,
  "comentario": "Excelente producto, muy recomendado!"
}
```

#### Validaciones
- **productId**: Número entero positivo, requerido
- **estrellas**: Número entero entre 1 y 5, requerido
- **comentario**: String opcional, máximo 2000 caracteres

#### Respuesta Exitosa (201)
```json
{
  "message": "Review created successfully",
  "review": {
    "id": "uuid",
    "producto_id": 123,
    "usuario_id": "user_uuid",
    "estrellas": 5,
    "comentario": "Excelente producto, muy recomendado!",
    "fecha_creacion": "2025-06-17T10:30:00Z",
    "usuarios": {
      "nombre": "Juan Pérez"
    }
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Validation error | Datos inválidos |
| 401 | Unauthorized | Token inválido |
| 404 | Product not found | Producto no encontrado |
| 409 | Review already exists | Ya has reseñado este producto |
| 403 | Purchase required | Debes comprar el producto primero |

#### Ejemplo de Error (Ya reseñado)
```json
{
  "error": "Review already exists",
  "message": "You have already reviewed this product",
  "existingReviewId": "uuid"
}
```

#### Ejemplo de Error (Compra requerida)
```json
{
  "error": "Purchase required",
  "message": "You can only review products you have purchased",
  "productId": 123
}
```

---

### 3. Actualizar Reseña 🔒
**PUT** `/:id`

#### Descripción
Actualiza una reseña existente. Solo el autor puede actualizar su reseña.

#### URL Parameters
- `id`: ID de la reseña (UUID)

#### Request Body
```json
{
  "estrellas": 4,
  "comentario": "Actualizo mi reseña después de usarlo más tiempo"
}
```

#### Validaciones
- **estrellas**: Número entero entre 1 y 5, requerido
- **comentario**: String opcional, máximo 2000 caracteres

#### Respuesta Exitosa (200)
```json
{
  "message": "Review updated successfully",
  "review": {
    "id": "uuid",
    "estrellas": 4,
    "comentario": "Actualizo mi reseña después de usarlo más tiempo",
    "fecha_creacion": "2025-06-17T10:30:00Z",
    "fecha_actualizacion": "2025-06-17T12:00:00Z"
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Validation error | Datos inválidos |
| 401 | Unauthorized | Token inválido |
| 404 | Review not found | Reseña no encontrada |
| 403 | Access denied | No eres el autor de esta reseña |

---

### 4. Eliminar Reseña 🔒
**DELETE** `/:id`

#### Descripción
Elimina una reseña existente. Solo el autor puede eliminar su reseña.

#### URL Parameters
- `id`: ID de la reseña (UUID)

#### Respuesta Exitosa (200)
```json
{
  "message": "Review deleted successfully",
  "reviewId": "uuid"
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 401 | Unauthorized | Token inválido |
| 404 | Review not found | Reseña no encontrada |
| 403 | Access denied | No eres el autor de esta reseña |

---

## Casos de Uso Comunes

### Flujo Completo de Reseñas

#### 1. Ver reseñas de un producto
```bash
curl -X GET http://localhost:5500/api/v1/reviews/product/123
```

#### 2. Ver reseñas con paginación
```bash
curl -X GET "http://localhost:5500/api/v1/reviews/product/123?page=2&limit=5"
```

#### 3. Crear una reseña (requiere haber comprado)
```bash
curl -X POST http://localhost:5500/api/v1/reviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 123,
    "estrellas": 5,
    "comentario": "Excelente producto, muy recomendado!"
  }'
```

#### 4. Actualizar reseña
```bash
curl -X PUT http://localhost:5500/api/v1/reviews/<review_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "estrellas": 4,
    "comentario": "Actualizo mi reseña después de más uso"
  }'
```

#### 5. Eliminar reseña
```bash
curl -X DELETE http://localhost:5500/api/v1/reviews/<review_id> \
  -H "Authorization: Bearer <token>"
```

---

## Integración con Frontend

### Widget de Reseñas
```javascript
// Función para obtener reseñas con estadísticas
async function getProductReviews(productId, page = 1, limit = 10) {
  try {
    const response = await fetch(`/api/v1/reviews/product/${productId}?page=${page}&limit=${limit}`);
    const data = await response.json();
    
    return {
      reviews: data.reviews,
      stats: data.statistics,
      pagination: data.pagination
    };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}

// Función para crear reseña
async function createReview(productId, rating, comment, token) {
  try {
    const response = await fetch('/api/v1/reviews', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId,
        estrellas: rating,
        comentario: comment
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}
```

### Mostrar Estadísticas
```javascript
// Función para renderizar distribución de estrellas
function renderRatingDistribution(distribution, total) {
  const container = document.getElementById('rating-distribution');
  
  for (let stars = 5; stars >= 1; stars--) {
    const count = distribution[stars] || 0;
    const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
    
    container.innerHTML += `
      <div class="rating-bar">
        <span>${stars}⭐</span>
        <div class="bar">
          <div class="fill" style="width: ${percentage}%"></div>
        </div>
        <span>${count}</span>
      </div>
    `;
  }
}
```

---

## Reglas de Negocio

### Restricciones para Crear Reseñas
- Solo usuarios que han comprado el producto pueden crear reseñas
- Un usuario solo puede tener una reseña por producto
- Las reseñas solo se pueden crear después de que el pedido esté "completado"
- No se pueden crear reseñas para productos descontinuados

### Validaciones de Contenido
- Las estrellas deben estar entre 1 y 5
- Los comentarios tienen un límite de 2000 caracteres
- Se filtran palabras inapropiadas (implementar lista de palabras prohibidas)
- Los comentarios muy cortos (menos de 10 caracteres) se marcan como "poco útiles"

### Moderación
- Las reseñas pueden ser reportadas por otros usuarios
- Los administradores pueden ocultar reseñas inapropiadas
- Se mantiene un historial de cambios para auditoría

---

## Campos de Respuesta

### Review Object
```typescript
interface Review {
  id: string;                    // UUID de la reseña
  producto_id: number;           // ID del producto
  usuario_id: string;            // UUID del usuario
  estrellas: number;             // Calificación 1-5
  comentario?: string;           // Comentario opcional
  fecha_creacion: string;        // ISO timestamp
  fecha_actualizacion?: string;  // ISO timestamp si fue editada
  usuarios: {
    nombre: string;              // Nombre del autor
  };
}
```

### Statistics Object
```typescript
interface ReviewStatistics {
  averageRating: number;         // Promedio de estrellas
  totalReviews: number;          // Total de reseñas
  ratingDistribution: {          // Distribución por estrellas
    "5": number;
    "4": number;
    "3": number;
    "2": number;
    "1": number;
  };
}
```

---

## Estados de Reseña

### Estados Posibles
- `active` - Reseña visible públicamente
- `hidden` - Reseña oculta por moderación
- `pending` - Reseña pendiente de aprobación (si hay moderación)

### Filtros Disponibles
- Por calificación (estrellas)
- Por fecha (más recientes/antiguas)
- Por utilidad (si se implementa sistema de votos)
- Solo con comentarios

---

## Notificaciones

### Eventos de Reseñas
- `review.created` - Nueva reseña creada
- `review.updated` - Reseña actualizada
- `review.deleted` - Reseña eliminada
- `review.reported` - Reseña reportada por inappropriate content

### Notificaciones al Vendedor
```json
{
  "event": "review.created",
  "data": {
    "productId": 123,
    "productName": "iPhone 14 Pro Max",
    "rating": 5,
    "reviewId": "uuid",
    "customerName": "Juan P."
  }
}
```

---

## Métricas y Analytics

### Métricas Disponibles
- Promedio de calificación por producto
- Número total de reseñas por producto
- Distribución de calificaciones
- Tendencias de calificación en el tiempo
- Productos mejor/peor calificados

### Endpoints de Métricas (para admins)
```
GET /api/v1/reviews/analytics/summary
GET /api/v1/reviews/analytics/trends
GET /api/v1/reviews/analytics/top-rated
```

---

## Notas Importantes

- Las reseñas se ordenan por fecha de creación (más recientes primero)
- Se implementa validación para prevenir reseñas spam
- Los usuarios pueden actualizar sus reseñas indefinidamente
- Se mantiene integridad referencial con usuarios y productos
- Las estadísticas se calculan en tiempo real
- Se recomienda implementar caché para productos con muchas reseñas
