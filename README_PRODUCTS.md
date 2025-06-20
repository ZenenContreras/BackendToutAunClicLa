# 📦 API de Productos

Sistema completo de gestión de productos con funciones públicas y administrativas.

## Base URL
```
https://backendtoutaunclicla-production.up.railway.app/api/v1/products
```

**🔒 Autenticación Mixta**: Endpoints públicos y administrativos disponibles.

---

## Endpoints Públicos

### GET /
Obtiene lista paginada de productos con filtros y búsqueda.

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Productos por página (default: 20)
- `category` (opcional): Filtrar por ID de categoría
- `search` (opcional): Búsqueda por nombre o descripción
- `sortBy` (opcional): Campo de ordenamiento (default: fecha_creacion)
- `sortOrder` (opcional): Orden asc/desc (default: desc)

**Response (200):**
```json
{
  "products": [
    {
      "id": 123,
      "nombre": "Producto Ejemplo",
      "descripcion": "Descripción del producto",
      "precio": 29.99,
      "categoria_id": 1,
      "imagen_principal": "https://ejemplo.com/imagen.jpg",
      "stock": 50,
      "fecha_creacion": "2024-01-01T00:00:00.000Z",
      "categorias": {
        "nombre": "Categoría Ejemplo"
      },
      "reviews": [
        {
          "estrellas": 5
        }
      ],
      "averageRating": 4.5,
      "reviewCount": 10
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

**Características:**
- Cálculo automático de rating promedio
- Información de categoría incluida
- Búsqueda en nombre y descripción
- Ordenamiento configurable
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

## Endpoints de Categorías y Subcategorías

### GET /categories
Obtiene todas las categorías disponibles.

**Response (200):**
```json
{
  "categories": [
    {
      "id": 1,
      "nombre": "Boutique",
      "fecha_creacion": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "nombre": "Comidas",
      "fecha_creacion": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /subcategories
Obtiene todas las subcategorías, opcionalmente filtradas por categoría.

**Query Parameters:**
- `categoryId` (opcional): Filtrar subcategorías por ID de categoría

**Response (200):**
```json
{
  "subcategories": [
    {
      "id": 1,
      "nombre": "McDonald's",
      "categoria_id": 2,
      "Imagen": "https://ejemplo.com/mcdonalds-logo.jpg",
      "Descripcion": "Restaurante de comida rápida con hamburguesas, papas fritas y más.",
      "categorias": {
        "id": 2,
        "nombre": "Comidas"
      }
    },
    {
      "id": 2,
      "nombre": "KFC",
      "categoria_id": 2,
      "Imagen": "https://ejemplo.com/kfc-logo.jpg",
      "Descripcion": "Restaurante especializado en pollo frito y acompañamientos.",
      "categorias": {
        "id": 2,
        "nombre": "Comidas"
      }
    }
  ]
}
```

### GET /subcategories/:id
Obtiene información detallada de una subcategoría específica.

**URL Parameters:**
- `id`: ID de la subcategoría (número entero)

**Response (200):**
```json
{
  "id": 1,
  "nombre": "McDonald's",
  "categoria_id": 2,
  "Imagen": "https://ejemplo.com/mcdonalds-logo.jpg",
  "Descripcion": "Restaurante de comida rápida con hamburguesas, papas fritas y más.",
  "categorias": {
    "id": 2,
    "nombre": "Comidas"
  }
}
```

**Errores Posibles:**
| Código | Error | Descripción |
|--------|-------|-------------|
| 404 | Subcategory not found | Subcategoría no encontrada |
| 500 | Internal Server Error | Error del servidor |

---

## Productos con Categorías y Subcategorías

Los endpoints de productos ahora incluyen información completa de categorías y subcategorías:

### GET / (Productos actualizados)
Ahora incluye filtro por subcategoría y datos completos.

**Query Parameters adicionales:**
- `subcategory` (opcional): Filtrar por ID de subcategoría

**Response actualizada (200):**
```json
{
  "products": [
    {
      "id": 123,
      "nombre": "Big Mac",
      "descripcion": "La hamburguesa más famosa de McDonald's",
      "precio": 8.50,
      "categoria_id": 2,
      "subcategoria_id": 1,
      "imagen_principal": "https://ejemplo.com/big-mac.jpg",
      "stock": 50,
      "provedor": "McDonald's Corp",
      "fecha_creacion": "2024-01-01T00:00:00.000Z",
      "categorias": {
        "id": 2,
        "nombre": "Comidas"
      },
      "subcategorias": {
        "id": 1,
        "nombre": "McDonald's",
        "Imagen": "https://ejemplo.com/mcdonalds-logo.jpg",
        "Descripcion": "Restaurante de comida rápida con hamburguesas, papas fritas y más."
      },
      "reviews": [
        {
          "estrellas": 5
        }
      ],
      "averageRating": 4.5,
      "reviewCount": 10
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

### POST / (Crear Producto actualizado)
Ahora acepta subcategoría y proveedor.

**Request Body actualizado:**
```json
{
  "name": "Nuevo Producto",
  "description": "Descripción detallada del producto",
  "price": 299.99,
  "categoryId": 2,
  "subcategoryId": 1,
  "images": [
    "https://example.com/producto-1.jpg"
  ],
  "stock": 50,
  "provedor": "Nombre del proveedor"
}
```

---

## Ejemplos de Uso con Categorías y Subcategorías

### 1. Obtener todas las categorías
```bash
curl -X GET "https://backendtoutaunclicla-production.up.railway.app/api/v1/products/categories"
```

### 2. Obtener subcategorías de comidas
```bash
curl -X GET "https://backendtoutaunclicla-production.up.railway.app/api/v1/products/subcategories?categoryId=2"
```

### 3. Obtener productos de McDonald's
```bash
curl -X GET "https://backendtoutaunclicla-production.up.railway.app/api/v1/products?subcategory=1"
```

### 4. Obtener información de un restaurante específico
```bash
curl -X GET "https://backendtoutaunclicla-production.up.railway.app/api/v1/products/subcategories/1"
```

### 5. Crear producto de restaurante
```bash
curl -X POST https://backendtoutaunclicla-production.up.railway.app/api/v1/products \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "McNuggets 6 piezas",
    "description": "Nuggets de pollo crujientes",
    "price": 5.99,
    "categoryId": 2,
    "subcategoryId": 1,
    "stock": 100,
    "provedor": "McDonald'\''s Corp"
  }'
```

---

## Integración Frontend con Categorías

### Cargar categorías y subcategorías
```javascript
// Obtener todas las categorías
async function getCategories() {
  try {
    const response = await fetch('/api/v1/products/categories');
    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

// Obtener subcategorías por categoría
async function getSubcategories(categoryId = null) {
  try {
    const url = categoryId 
      ? `/api/v1/products/subcategories?categoryId=${categoryId}`
      : '/api/v1/products/subcategories';
    
    const response = await fetch(url);
    const data = await response.json();
    return data.subcategories;
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    throw error;
  }
}

// Obtener información de restaurante
async function getRestaurantInfo(subcategoryId) {
  try {
    const response = await fetch(`/api/v1/products/subcategories/${subcategoryId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching restaurant info:', error);
    throw error;
  }
}

// Obtener productos por restaurante
async function getProductsByRestaurant(subcategoryId, filters = {}) {
  try {
    const params = new URLSearchParams({ ...filters, subcategory: subcategoryId });
    const response = await fetch(`/api/v1/products?${params}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching restaurant products:', error);
    throw error;
  }
}
```

### Ejemplo de componente React para menú de restaurante
```jsx
import React, { useState, useEffect } from 'react';

const RestaurantMenu = ({ restaurantId }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRestaurantData = async () => {
      try {
        // Cargar información del restaurante
        const restaurantInfo = await getRestaurantInfo(restaurantId);
        setRestaurant(restaurantInfo);

        // Cargar productos del restaurante
        const restaurantProducts = await getProductsByRestaurant(restaurantId);
        setProducts(restaurantProducts.products);
      } catch (error) {
        console.error('Error loading restaurant data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantData();
  }, [restaurantId]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="restaurant-menu">
      <div className="restaurant-header">
        <img src={restaurant.Imagen} alt={restaurant.nombre} />
        <div>
          <h1>{restaurant.nombre}</h1>
          <p>{restaurant.Descripcion}</p>
        </div>
      </div>
      
      <div className="menu-items">
        {products.map(product => (
          <div key={product.id} className="menu-item">
            <img src={product.imagen_principal} alt={product.nombre} />
            <div>
              <h3>{product.nombre}</h3>
              <p>{product.descripcion}</p>
              <span className="price">${product.precio}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---
