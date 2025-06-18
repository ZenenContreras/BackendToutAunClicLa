# 📦 Products API

## Overview
Sistema de gestión de productos con funcionalidades públicas para consulta y administrativas para gestión.

## Base URL
```
/api/v1/products
```

---

## Endpoints

### 1. Obtener Todos los Productos
**GET** `/`

#### Descripción
Obtiene una lista paginada de todos los productos activos con información completa.

#### Query Parameters
| Parámetro | Tipo | Descripción | Por Defecto |
|-----------|------|-------------|-------------|
| page | number | Número de página | 1 |
| limit | number | Elementos por página | 20 |
| search | string | Búsqueda por nombre/descripción | - |
| category | number | Filtrar por ID de categoría | - |
| minPrice | number | Precio mínimo | - |
| maxPrice | number | Precio máximo | - |
| inStock | boolean | Solo productos con stock | - |
| sort | string | Campo de ordenamiento | 'id' |
| order | string | Orden (asc/desc) | 'asc' |

#### Respuesta Exitosa (200)
```json
{
  "products": [
    {
      "id": 123,
      "nombre": "iPhone 14 Pro Max",
      "descripcion": "El iPhone más avanzado con chip A16 Bionic...",
      "precio": 1199.99,
      "categoria_id": 1,
      "imagenes": [
        "https://example.com/iphone14-1.jpg",
        "https://example.com/iphone14-2.jpg"
      ],
      "imagen_principal": "https://example.com/iphone14-1.jpg",
      "stock": 25,
      "activo": true,
      "fecha_creacion": "2025-06-17T10:30:00Z",
      "categoria": {
        "id": 1,
        "nombre": "Electrónicos"
      },
      "estadisticas": {
        "promedio_calificacion": 4.5,
        "total_reviews": 128,
        "total_favoritos": 45
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 15,
    "totalItems": 289,
    "itemsPerPage": 20
  },
  "filters": {
    "categories": [
      { "id": 1, "nombre": "Electrónicos", "count": 45 },
      { "id": 2, "nombre": "Ropa", "count": 123 }
    ],
    "priceRange": {
      "min": 9.99,
      "max": 2499.99
    }
  }
}
```

#### Ejemplo con Filtros
```bash
GET /api/v1/products?search=iPhone&category=1&minPrice=800&maxPrice=1500&inStock=true&sort=precio&order=desc
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Invalid parameters | Parámetros de consulta inválidos |
| 500 | Internal Server Error | Error del servidor |

---

### 2. Obtener Producto por ID
**GET** `/:id`

#### Descripción
Obtiene información detallada de un producto específico incluyendo reseñas y productos relacionados.

#### URL Parameters
- `id`: ID del producto (número entero)

#### Respuesta Exitosa (200)
```json
{
  "product": {
    "id": 123,
    "nombre": "iPhone 14 Pro Max",
    "descripcion": "El iPhone más avanzado con chip A16 Bionic, sistema de cámaras Pro de 48MP y pantalla Super Retina XDR de 6.7 pulgadas.",
    "precio": 1199.99,
    "precio_anterior": 1299.99,
    "descuento_porcentaje": 7.7,
    "categoria_id": 1,
    "imagenes": [
      "https://example.com/iphone14-1.jpg",
      "https://example.com/iphone14-2.jpg",
      "https://example.com/iphone14-3.jpg"
    ],
    "imagen_principal": "https://example.com/iphone14-1.jpg",
    "stock": 25,
    "activo": true,
    "fecha_creacion": "2025-06-17T10:30:00Z",
    "categoria": {
      "id": 1,
      "nombre": "Electrónicos",
      "descripcion": "Productos electrónicos y tecnológicos"
    },
    "especificaciones": {
      "pantalla": "6.7 pulgadas Super Retina XDR",
      "procesador": "A16 Bionic",
      "memoria": "128GB, 256GB, 512GB, 1TB",
      "camara": "Sistema Pro de 48MP"
    },
    "estadisticas": {
      "promedio_calificacion": 4.5,
      "total_reviews": 128,
      "total_favoritos": 45,
      "total_vendidos": 2156,
      "distribucion_calificaciones": {
        "5": 89,
        "4": 25,
        "3": 8,
        "2": 4,
        "1": 2
      }
    }
  },
  "reviews_recientes": [
    {
      "id": "uuid",
      "estrellas": 5,
      "comentario": "Excelente producto...",
      "fecha_creacion": "2025-06-16T10:30:00Z",
      "usuario": {
        "nombre": "Juan P."
      }
    }
  ],
  "productos_relacionados": [
    {
      "id": 124,
      "nombre": "iPhone 14 Pro",
      "precio": 999.99,
      "imagen_principal": "https://example.com/iphone14pro.jpg"
    }
  ],
  "disponibilidad": {
    "en_stock": true,
    "cantidad_disponible": 25,
    "tiempo_entrega": "2-3 días laborables",
    "envio_gratis": true
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 404 | Product not found | Producto no encontrado |
| 400 | Invalid product ID | ID de producto inválido |

---

### 3. Crear Producto 🔒👑
**POST** `/`

#### Descripción
Crea un nuevo producto. Solo administradores pueden crear productos.

#### Headers Requeridos
```
Authorization: Bearer <admin_jwt_token>
```

#### Request Body
```json
{
  "name": "Nuevo Producto",
  "description": "Descripción detallada del producto",
  "price": 299.99,
  "categoryId": 1,
  "images": [
    "https://example.com/producto-1.jpg",
    "https://example.com/producto-2.jpg"
  ],
  "stock": 50
}
```

#### Validaciones
- **name**: String mínimo 3 caracteres, requerido
- **description**: String requerido
- **price**: Número positivo, requerido
- **categoryId**: Número entero positivo, requerido (debe existir)
- **images**: Array de URLs válidas, opcional
- **stock**: Número entero mínimo 0, opcional (default: 0)

#### Respuesta Exitosa (201)
```json
{
  "message": "Product created successfully",
  "product": {
    "id": 456,
    "nombre": "Nuevo Producto",
    "descripcion": "Descripción detallada del producto",
    "precio": 299.99,
    "categoria_id": 1,
    "imagenes": [
      "https://example.com/producto-1.jpg",
      "https://example.com/producto-2.jpg"
    ],
    "imagen_principal": "https://example.com/producto-1.jpg",
    "stock": 50,
    "activo": true,
    "fecha_creacion": "2025-06-17T12:00:00Z"
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Validation error | Datos inválidos |
| 401 | Unauthorized | Token inválido |
| 403 | Admin access required | No eres administrador |
| 404 | Category not found | Categoría no encontrada |

---

### 4. Actualizar Producto 🔒👑
**PUT** `/:id`

#### Descripción
Actualiza un producto existente. Solo administradores pueden actualizar productos.

#### URL Parameters
- `id`: ID del producto (número entero)

#### Request Body
```json
{
  "name": "Producto Actualizado",
  "description": "Nueva descripción",
  "price": 349.99,
  "categoryId": 2,
  "images": [
    "https://example.com/producto-nuevo-1.jpg"
  ],
  "stock": 75,
  "active": true
}
```

#### Respuesta Exitosa (200)
```json
{
  "message": "Product updated successfully",
  "product": {
    "id": 456,
    "nombre": "Producto Actualizado",
    "precio": 349.99,
    "fecha_actualizacion": "2025-06-17T13:00:00Z"
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Validation error | Datos inválidos |
| 401 | Unauthorized | Token inválido |
| 403 | Admin access required | No eres administrador |
| 404 | Product not found | Producto no encontrado |

---

### 5. Eliminar Producto 🔒👑
**DELETE** `/:id`

#### Descripción
Elimina (desactiva) un producto. Solo administradores pueden eliminar productos.

#### URL Parameters
- `id`: ID del producto (número entero)

#### Respuesta Exitosa (200)
```json
{
  "message": "Product deleted successfully",
  "productId": 456
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 401 | Unauthorized | Token inválido |
| 403 | Admin access required | No eres administrador |
| 404 | Product not found | Producto no encontrado |
| 409 | Cannot delete | Producto en uso en pedidos activos |

---

## Casos de Uso Comunes

### Catálogo Público

#### 1. Obtener productos populares
```bash
curl -X GET "http://localhost:5500/api/v1/products?sort=total_vendidos&order=desc&limit=10"
```

#### 2. Buscar productos
```bash
curl -X GET "http://localhost:5500/api/v1/products?search=iPhone&category=1"
```

#### 3. Filtrar por precio
```bash
curl -X GET "http://localhost:5500/api/v1/products?minPrice=100&maxPrice=500"
```

#### 4. Obtener producto específico
```bash
curl -X GET http://localhost:5500/api/v1/products/123
```

### Administración (requiere token admin)

#### 5. Crear producto
```bash
curl -X POST http://localhost:5500/api/v1/products \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo Producto",
    "description": "Descripción detallada",
    "price": 199.99,
    "categoryId": 1,
    "stock": 100
  }'
```

#### 6. Actualizar producto
```bash
curl -X PUT http://localhost:5500/api/v1/products/123 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 189.99,
    "stock": 150
  }'
```

---

## Integración con Frontend

### Catálogo de Productos
```javascript
// Función para obtener productos con filtros
async function getProducts(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await fetch(`/api/v1/products?${params}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Función para obtener producto detallado
async function getProductDetails(productId) {
  try {
    const response = await fetch(`/api/v1/products/${productId}`);
    
    if (!response.ok) {
      throw new Error('Product not found');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
}

// Función para buscar productos
async function searchProducts(query, filters = {}) {
  try {
    const searchFilters = { ...filters, search: query };
    return await getProducts(searchFilters);
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}
```

### Administración de Productos
```javascript
// Función para crear producto (admin)
async function createProduct(productData, adminToken) {
  try {
    const response = await fetch('/api/v1/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

// Función para actualizar stock (admin)
async function updateProductStock(productId, newStock, adminToken) {
  try {
    const response = await fetch(`/api/v1/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stock: newStock })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error updating stock:', error);
    throw error;
  }
}
```

---

## Campos de Respuesta

### Product Object (Básico)
```typescript
interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_anterior?: number;
  descuento_porcentaje?: number;
  categoria_id: number;
  imagenes: string[];
  imagen_principal: string;
  stock: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}
```

### Product Object (Detallado)
```typescript
interface ProductDetailed extends Product {
  categoria: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  especificaciones?: Record<string, any>;
  estadisticas: {
    promedio_calificacion: number;
    total_reviews: number;
    total_favoritos: number;
    total_vendidos: number;
    distribucion_calificaciones: {
      "5": number;
      "4": number;
      "3": number;
      "2": number;
      "1": number;
    };
  };
  disponibilidad: {
    en_stock: boolean;
    cantidad_disponible: number;
    tiempo_entrega: string;
    envio_gratis: boolean;
  };
}
```

---

## Filtros Disponibles

### Búsqueda por Texto
- Busca en nombre y descripción del producto
- Búsqueda insensible a mayúsculas/minúsculas
- Soporte para búsqueda parcial

### Filtros Numéricos
- **Precio**: `minPrice`, `maxPrice`
- **Calificación**: `minRating` (1-5)
- **Stock**: `inStock` (boolean)

### Filtros por Categoría
- **category**: ID de categoría específica
- **categories**: Array de IDs de categorías

### Ordenamiento
- **sort**: `id`, `nombre`, `precio`, `fecha_creacion`, `promedio_calificacion`, `total_vendidos`
- **order**: `asc`, `desc`

---

## Reglas de Negocio

### Estados de Producto
- **activo**: true/false - Determina si el producto se muestra públicamente
- **stock**: 0 o mayor - Cantidad disponible
- **precio**: Siempre mayor que 0

### Gestión de Stock
- El stock se reduce automáticamente con cada venta
- Stock 0 = "Agotado" pero el producto sigue visible
- Stock negativo no está permitido

### Imágenes
- La primera imagen del array se considera imagen principal
- Se admiten URLs externas (CDN recomendado)
- Formatos soportados: JPG, PNG, WebP

### Categorías
- Todo producto debe tener una categoría válida
- Las categorías inactivas ocultan sus productos

---

## SEO y Performance

### Optimizaciones Implementadas
- Paginación para listas grandes
- Índices de base de datos en campos de búsqueda
- Caché de productos populares
- Compresión de imágenes (recomendado en CDN)

### Metadatos para SEO
```json
{
  "seo": {
    "title": "iPhone 14 Pro Max - 128GB - ToutAunClicLa",
    "description": "Compra el iPhone 14 Pro Max con el mejor precio...",
    "keywords": ["iPhone", "smartphone", "Apple", "128GB"],
    "canonical": "https://toutaunclicla.com/products/123",
    "images": [
      {
        "url": "https://cdn.toutaunclicla.com/iphone14-main.jpg",
        "alt": "iPhone 14 Pro Max Azul"
      }
    ]
  }
}
```

---

## Analytics y Métricas

### Métricas por Producto
- Vistas del producto
- Conversión de vista a compra
- Tiempo promedio en página de producto
- Productos agregados al carrito
- Productos agregados a favoritos

### Endpoints de Analytics (admin)
```
GET /api/v1/products/analytics/popular
GET /api/v1/products/analytics/conversion
GET /api/v1/products/analytics/revenue
```

---

## Notas Importantes

- Los productos eliminados se marcan como `activo: false` (soft delete)
- Las imágenes deben estar en un CDN para mejor performance
- Se recomienda implementar caché Redis para productos populares
- Los precios se almacenan con precisión decimal
- Las estadísticas se calculan en tiempo real o via jobs programados
- Se mantiene historial de cambios de precios para analytics
