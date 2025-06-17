# 📖 API Documentation - ToutAunClicLa

## 🚀 Guía Completa de Endpoints

Esta documentación describe todos los endpoints disponibles en la API, sus parámetros, respuestas esperadas y ejemplos de uso.

---

## 🔐 Autenticación

La mayoría de endpoints requieren autenticación JWT. Obtén el token mediante login y úsalo en el header `Authorization`.

### Base URL
```
http://localhost:5500/api/v1
```

### Headers Requeridos
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN" // Solo en rutas protegidas
}
```

---

## 👥 Autenticación (`/auth`)

### 1. Registro de Usuario
**POST** `/auth/register`

**Body:**
```json
{
  "name": "Juan",
  "lastName": "Pérez", 
  "email": "juan@ejemplo.com",
  "password": "password123"
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "correo_electronico": "juan@ejemplo.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "verificado": false
  },
  "verificationSent": true
}
```

**Errores Posibles:**
- `400` - Datos inválidos o usuario ya existe
- `500` - Error del servidor

---

### 2. Inicio de Sesión
**POST** `/auth/login`

**Body:**
```json
{
  "email": "juan@ejemplo.com",
  "password": "password123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "correo_electronico": "juan@ejemplo.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "verificado": true
  }
}
```

**Errores Posibles:**
- `401` - Credenciales incorrectas
- `403` - Email no verificado
- `500` - Error del servidor

---

### 3. Verificar Email
**POST** `/auth/verify-email`

**Body:**
```json
{
  "email": "juan@ejemplo.com",
  "verificationCode": "123456"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "uuid",
    "verificado": true
  }
}
```

---

### 4. Reenviar Código de Verificación
**POST** `/auth/resend-verification`

**Body:**
```json
{
  "email": "juan@ejemplo.com"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Verification code sent successfully"
}
```

---

### 5. Obtener Perfil 🔒
**GET** `/auth/profile`

**Headers:** `Authorization: Bearer token`

**Respuesta Exitosa (200):**
```json
{
  "user": {
    "id": "uuid",
    "correo_electronico": "juan@ejemplo.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "verificado": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## 🛒 Carrito de Compras (`/cart`) 🔒

Todos los endpoints del carrito requieren autenticación.

### 1. Obtener Carrito
**GET** `/cart`

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 20)

**Respuesta Exitosa (200):**
```json
{
  "cartItems": [
    {
      "id": "uuid",
      "usuario_id": "uuid",
      "producto_id": 123,
      "cantidad": 2,
      "created_at": "2024-01-01T00:00:00Z",
      "productos": {
        "id": 123,
        "nombre": "iPhone 14",
        "precio": 999.99,
        "imagen_principal": "url",
        "stock": 50
      }
    }
  ],
  "total": 1999.98,
  "itemCount": 1,
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 20,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 2. Agregar Producto al Carrito
**POST** `/cart/items`

**Body:**
```json
{
  "productId": 123,
  "quantity": 2
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "Product added to cart successfully",
  "cartItem": {
    "id": "uuid",
    "usuario_id": "uuid",
    "producto_id": 123,
    "cantidad": 2,
    "productos": {
      "nombre": "iPhone 14",
      "precio": 999.99
    }
  }
}
```

**Errores Posibles:**
- `404` - Producto no encontrado
- `400` - Stock insuficiente
- `400` - Cantidad inválida

---

### 3. Actualizar Cantidad
**PUT** `/cart/items/:id`

**Body:**
```json
{
  "quantity": 3
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Cart item updated successfully",
  "cartItem": {
    "id": "uuid",
    "cantidad": 3
  }
}
```

---

### 4. Eliminar Producto del Carrito
**DELETE** `/cart/items/:id`

**Respuesta Exitosa (200):**
```json
{
  "message": "Item removed from cart successfully"
}
```

---

### 5. Vaciar Carrito
**DELETE** `/cart`

**Respuesta Exitosa (200):**
```json
{
  "message": "Cart cleared successfully"
}
```

---

### 6. Aplicar Cupón (Rate Limited)
**POST** `/cart/apply-coupon`

**Rate Limit:** 10 intentos por 10 minutos

**Body:**
```json
{
  "couponCode": "DESCUENTO20"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Coupon applied successfully",
  "coupon": {
    "id": "uuid",
    "code": "DESCUENTO20",
    "discount": 20
  },
  "cartSummary": {
    "subtotal": 1999.98,
    "discountAmount": 399.996,
    "total": 1599.984,
    "itemCount": 1
  }
}
```

**Errores Posibles:**
- `404` - Cupón no encontrado
- `400` - Cupón expirado
- `400` - Carrito vacío
- `429` - Rate limit excedido

---

### 7. Obtener Carrito con Cupón
**GET** `/cart/with-coupon`

**Query Parameters:**
- `couponCode` (opcional): Código del cupón

**Respuesta Exitosa (200):**
```json
{
  "cartItems": [...],
  "subtotal": 1999.98,
  "discountAmount": 399.996,
  "total": 1599.984,
  "itemCount": 1,
  "appliedCoupon": {
    "id": "uuid",
    "code": "DESCUENTO20",
    "discount": 20
  }
}
```

---

## ❤️ Favoritos (`/favorites`) 🔒

Todos los endpoints de favoritos requieren autenticación.

### 1. Obtener Favoritos
**GET** `/favorites`

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 20)

**Respuesta Exitosa (200):**
```json
{
  "favorites": [
    {
      "id": "uuid",
      "usuario_id": "uuid",
      "producto_id": 123,
      "fecha_agregado": "2024-01-01T00:00:00Z",
      "productos": {
        "id": 123,
        "nombre": "iPhone 14",
        "precio": 999.99,
        "imagen_principal": "url",
        "stock": 50,
        "categorias": {
          "nombre": "Electrónicos"
        }
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 20
  }
}
```

---

### 2. Agregar a Favoritos
**POST** `/favorites`

**Body:**
```json
{
  "productId": 123
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "Product added to favorites successfully",
  "favorite": {
    "id": "uuid",
    "usuario_id": "uuid",
    "producto_id": 123,
    "fecha_agregado": "2024-01-01T00:00:00Z",
    "productos": {
      "id": 123,
      "nombre": "iPhone 14",
      "precio": 999.99,
      "imagen_principal": "url",
      "stock": 50
    }
  }
}
```

**Errores Posibles:**
- `404` - Producto no encontrado
- `409` - Producto ya en favoritos

---

### 3. Verificar Estado de Favorito
**GET** `/favorites/status/:productId`

**Respuesta Exitosa (200):**
```json
{
  "isFavorite": true,
  "favoriteId": "uuid"
}
```

---

### 4. Eliminar de Favoritos
**DELETE** `/favorites/:productId`

**Respuesta Exitosa (200):**
```json
{
  "message": "Product removed from favorites successfully"
}
```

---

## ⭐ Reseñas (`/reviews`)

### 1. Obtener Reseñas de Producto
**GET** `/reviews/product/:productId`

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)

**Respuesta Exitosa (200):**
```json
{
  "reviews": [
    {
      "id": "uuid",
      "producto_id": 123,
      "usuario_id": "uuid",
      "estrellas": 5,
      "comentario": "Excelente producto",
      "fecha_creacion": "2024-01-01T00:00:00Z",
      "usuarios": {
        "nombre": "Juan",
        "apellido": "Pérez"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10
  }
}
```

---

### 2. Crear Reseña 🔒
**POST** `/reviews`

**Body:**
```json
{
  "productId": 123,
  "rating": 5,
  "comment": "Excelente producto, muy recomendado"
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "Review created successfully",
  "review": {
    "id": "uuid",
    "producto_id": 123,
    "usuario_id": "uuid",
    "estrellas": 5,
    "comentario": "Excelente producto, muy recomendado",
    "fecha_creacion": "2024-01-01T00:00:00Z",
    "usuarios": {
      "nombre": "Juan",
      "apellido": "Pérez"
    }
  }
}
```

**Errores Posibles:**
- `404` - Producto no encontrado
- `409` - Ya has reseñado este producto
- `403` - Debes comprar el producto para reseñarlo

---

### 3. Actualizar Reseña 🔒
**PUT** `/reviews/:id`

**Body:**
```json
{
  "rating": 4,
  "comment": "Buen producto, actualizo mi reseña"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Review updated successfully",
  "review": {
    "id": "uuid",
    "estrellas": 4,
    "comentario": "Buen producto, actualizo mi reseña"
  }
}
```

---

### 4. Eliminar Reseña 🔒
**DELETE** `/reviews/:id`

**Respuesta Exitosa (200):**
```json
{
  "message": "Review deleted successfully"
}
```

---

## 🏠 Direcciones de Envío (`/addresses`) 🔒

Todos los endpoints de direcciones requieren autenticación.

### 1. Obtener Direcciones
**GET** `/addresses`

**Respuesta Exitosa (200):**
```json
{
  "addresses": [
    {
      "id": "uuid",
      "usuario_id": "uuid",
      "direccion": "Calle Principal 123, Apt 4B",
      "ciudad": "París",
      "estado": "Île-de-France",
      "codigo_postal": "75001",
      "pais": "Francia",
      "telefono": "+33 1 23 45 67 89"
    }
  ]
}
```

---

### 2. Crear Dirección
**POST** `/addresses`

**Body:**
```json
{
  "address": "Calle Principal 123, Apt 4B",
  "city": "París",
  "state": "Île-de-France",
  "postalCode": "75001",
  "country": "Francia",
  "phone": "+33 1 23 45 67 89"
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "Address created successfully",
  "address": {
    "id": "uuid",
    "usuario_id": "uuid",
    "direccion": "Calle Principal 123, Apt 4B",
    "ciudad": "París",
    "estado": "Île-de-France",
    "codigo_postal": "75001",
    "pais": "Francia",
    "telefono": "+33 1 23 45 67 89"
  }
}
```

**Campos Requeridos:**
- `address` - Dirección completa
- `city` - Ciudad
- `state` - Estado/Provincia
- `postalCode` - Código postal
- `country` - País

**Campos Opcionales:**
- `phone` - Teléfono de contacto

---

### 3. Actualizar Dirección
**PUT** `/addresses/:id`

**Body:** (igual que crear dirección)

**Respuesta Exitosa (200):**
```json
{
  "message": "Address updated successfully",
  "address": {
    "id": "uuid",
    "direccion": "Nueva dirección actualizada"
  }
}
```

---

### 4. Eliminar Dirección
**DELETE** `/addresses/:id`

**Respuesta Exitosa (200):**
```json
{
  "message": "Address deleted successfully"
}
```

---

## 📦 Productos (`/products`)

### 1. Obtener Productos
**GET** `/products`

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 12)
- `category` (opcional): ID de categoría
- `search` (opcional): Término de búsqueda
- `minPrice` (opcional): Precio mínimo
- `maxPrice` (opcional): Precio máximo

**Respuesta Exitosa (200):**
```json
{
  "products": [
    {
      "id": 123,
      "nombre": "iPhone 14",
      "descripcion": "Smartphone Apple",
      "precio": 999.99,
      "categoria_id": 1,
      "stock": 50,
      "imagen_principal": "url_imagen",
      "categorias": {
        "nombre": "Electrónicos"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 12
  }
}
```

---

### 2. Obtener Producto Específico
**GET** `/products/:id`

**Respuesta Exitosa (200):**
```json
{
  "product": {
    "id": 123,
    "nombre": "iPhone 14",
    "descripcion": "Smartphone Apple con pantalla Super Retina...",
    "precio": 999.99,
    "categoria_id": 1,
    "stock": 50,
    "imagen_principal": "url_imagen",
    "imagenes": ["url1", "url2", "url3"],
    "categorias": {
      "id": 1,
      "nombre": "Electrónicos"
    }
  }
}
```

---

## 🛍️ Pedidos (`/orders`) 🔒

### 1. Obtener Pedidos del Usuario
**GET** `/orders`

**Respuesta Exitosa (200):**
```json
{
  "orders": [
    {
      "id": 456,
      "usuario_id": "uuid",
      "total": 1999.98,
      "estado": "completed",
      "fecha_pedido": "2024-01-01T00:00:00Z",
      "direccion_envio": {
        "direccion": "Calle Principal 123",
        "ciudad": "París"
      }
    }
  ]
}
```

---

### 2. Crear Pedido
**POST** `/orders`

**Body:**
```json
{
  "addressId": "uuid",
  "paymentMethodId": "stripe_payment_method_id",
  "couponCode": "DESCUENTO20" // opcional
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": 456,
    "total": 1599.98,
    "estado": "pending",
    "paymentIntentId": "pi_stripe_id"
  }
}
```

---

### 3. Obtener Detalles del Pedido
**GET** `/orders/:id`

**Respuesta Exitosa (200):**
```json
{
  "order": {
    "id": 456,
    "total": 1599.98,
    "estado": "completed",
    "fecha_pedido": "2024-01-01T00:00:00Z",
    "items": [
      {
        "producto_id": 123,
        "cantidad": 2,
        "precio_unitario": 999.99,
        "productos": {
          "nombre": "iPhone 14"
        }
      }
    ],
    "direccion_envio": {
      "direccion": "Calle Principal 123",
      "ciudad": "París"
    }
  }
}
```

---

## 💳 Stripe - Pagos (`/stripe`) 🔒

### 1. Crear Payment Intent
**POST** `/stripe/create-payment-intent`

**Body:**
```json
{
  "addressId": "uuid",
  "couponCode": "DESCUENTO20" // opcional
}
```

**Respuesta Exitosa (200):**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "amount": 159998, // en centavos
  "currency": "eur"
}
```

---

### 2. Confirmar Pago
**POST** `/stripe/confirm-payment`

**Body:**
```json
{
  "paymentIntentId": "pi_stripe_id",
  "addressId": "uuid",
  "couponCode": "DESCUENTO20" // opcional
}
```

---

## 👤 Gestión de Usuarios (`/users`) 🔒

### 1. Actualizar Perfil
**PUT** `/users/profile`

**Body:**
```json
{
  "name": "Juan Carlos",
  "lastName": "Pérez García",
  "phone": "+33 1 23 45 67 89"
}
```

---

## 🔍 Health Check

### 1. Estado del Sistema
**GET** `/health`

**Respuesta Exitosa (200):**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 3600,
  "environment": "development"
}
```

---

## ⚠️ Códigos de Error Comunes

### Errores de Autenticación
- `401 Unauthorized` - Token inválido o faltante
- `403 Forbidden` - Email no verificado o permisos insuficientes

### Errores de Validación
- `400 Bad Request` - Datos inválidos o faltantes
- `409 Conflict` - Recurso duplicado
- `404 Not Found` - Recurso no encontrado

### Errores del Servidor
- `500 Internal Server Error` - Error interno del servidor
- `503 Service Unavailable` - Servicio temporalmente no disponible

### Rate Limiting
- `429 Too Many Requests` - Límite de requests excedido

---

## 🧪 Testing de la API

### Scripts Disponibles
```bash
# Testing completo del sistema
npm run test:complete

# Testing específico por módulo
npm run test:favorites
npm run test:reviews
npm run test:addresses

# Crear datos de prueba
npm run test:data create

# Ver estadísticas de BD
npm run test:data stats
```

### Datos de Prueba
Al ejecutar `npm run test:data create` se crean:
- Usuario verificado: `zenencontreras1@gmail.com` / `123456`
- 3 productos de ejemplo
- 3 cupones: `DESCUENTO10`, `DESCUENTO20`, `EXPIRADO`

### Ejemplo de Testing con cURL
```bash
# 1. Login para obtener token
curl -X POST http://localhost:5500/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "zenencontreras1@gmail.com", "password": "123456"}'

# 2. Usar el token en requests autenticados
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5500/api/v1/cart

# 3. Agregar producto al carrito
curl -X POST http://localhost:5500/api/v1/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 34, "quantity": 2}'
```

---

## 🔧 Rate Limiting

### Límites Implementados
- **General:** 100 requests por 15 minutos por IP
- **Autenticación:** 5 intentos por 15 minutos por IP  
- **Cupones:** 10 intentos por 10 minutos por usuario

### Headers de Rate Limit
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

---

## 📱 Integración Frontend

### Inicialización
```javascript
const API_BASE_URL = 'http://localhost:5500/api/v1';
let authToken = localStorage.getItem('authToken');

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    },
    ...options
  };
  
  const response = await fetch(url, config);
  return response.json();
};
```

### Ejemplo de Uso
```javascript
// Login
const loginResponse = await apiCall('/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

if (loginResponse.token) {
  authToken = loginResponse.token;
  localStorage.setItem('authToken', authToken);
}

// Obtener carrito
const cart = await apiCall('/cart');

// Agregar a favoritos
const favorite = await apiCall('/favorites', {
  method: 'POST',
  body: JSON.stringify({ productId: 123 })
});
```

---

## 🛟 Soporte

### Comandos de Diagnóstico
```bash
# Verificar estado del sistema
npm run test:complete

# Reiniciar datos de prueba
npm run test:data reset

# Verificar servidor
curl http://localhost:5500/health
```

### Solución de Problemas Comunes

**1. Error 401 en todas las requests autenticadas**
- Verificar que el token JWT esté incluido en el header
- Verificar que el token no haya expirado
- Hacer login nuevamente para obtener un nuevo token

**2. Error 403 "Email not verified"**
- Verificar el email usando el endpoint `/auth/verify-email`
- Reenviar código con `/auth/resend-verification`

**3. Error 404 en productos o recursos**
- Crear datos de prueba: `npm run test:data create`
- Verificar que el servidor esté ejecutándose: `npm run dev`

**4. Error de conexión a la base de datos**
- Verificar variables de entorno en `.env`
- Ejecutar migración: `npm run migrate:detalles-pedido`

---

*Documentación generada para ToutAunClicLa API - Sistema completo de e-commerce*
