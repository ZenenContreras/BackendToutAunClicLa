# 🛒 API de Carrito de Compras

Sistema completo de carrito de compras con paginación, validación de stock y soporte para cupones de descuento.

## Base URL
```
https://backendtoutaunclicla-production.up.railway.app/api/v1/cart
```

**🔒 Autenticación Requerida**: Todos los endpoints requieren token JWT válido.

---

## Endpoints Disponibles

### GET /
Obtiene el carrito del usuario autenticado con paginación.

**Headers:**
```
Authorization: Bearer jwt_token
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 20)

**Response (200):**
```json
{
  "cartItems": [
    {
      "id": 1,
      "usuario_id": "uuid",
      "producto_id": 123,
      "cantidad": 2,
      "productos": {
        "id": 123,
        "nombre": "Producto Ejemplo",
        "precio": 29.99,
        "imagen_principal": "https://ejemplo.com/imagen.jpg",
        "stock": 50
      }
    }
  ],
  "total": 59.98,
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

**Características:**
- Paginación automática
- Cálculo de total general
- Información completa del producto
- Contador total de items
          "nombre": "Electrónicos"
        }
      },
      "addedAt": "2025-06-17T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 20
  },
  "summary": {
    "totalItems": 1,
    "totalQuantity": 2,
    "subtotal": 59.98,
    "total": 59.98
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 401 | Unauthorized | Token inválido o expirado |
| 500 | Internal Server Error | Error del servidor |

---

### 2. Obtener Carrito con Cupón
**GET** `/with-coupon`

#### Descripción
Obtiene el carrito aplicando un cupón de descuento para ver el precio final.

#### Query Parameters
| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| couponCode | string | Código del cupón | No |

#### Respuesta Exitosa (200)
```json
{
  "cartItems": [...],
  "coupon": {
    "codigo": "DESCUENTO20",
    "tipo": "percentage",
    "valor": 20,
    "descripcion": "20% de descuento"
  },
  "summary": {
    "subtotal": 100.00,
    "discount": 20.00,
    "total": 80.00,
    "savings": 20.00
  }
}
```

---

### 3. Agregar Producto al Carrito
**POST** `/items`

#### Descripción
Agrega un producto al carrito o actualiza la cantidad si ya existe.

#### Request Body
```json
{
  "productId": 123,
  "quantity": 2
}
```

#### Validaciones
- **productId**: Número entero positivo, requerido
- **quantity**: Número entero mínimo 1, requerido

#### Respuesta Exitosa (201)
```json
{
  "message": "Product added to cart successfully",
  "cartItem": {
    "id": "uuid",
    "productId": 123,
    "quantity": 2,
    "unitPrice": 29.99,
    "totalPrice": 59.98,
    "product": {
      "id": 123,
      "nombre": "Producto Ejemplo",
      "precio": 29.99,
      "stock": 50
    }
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Validation error | Datos inválidos |
| 404 | Product not found | Producto no encontrado |
| 400 | Insufficient stock | Stock insuficiente |
| 401 | Unauthorized | Token inválido |

#### Ejemplo de Error (Stock insuficiente)
```json
{
  "error": "Insufficient stock",
  "message": "Only 3 units available, requested 5",
  "availableStock": 3,
  "requestedQuantity": 5
}
```

---

### 4. Actualizar Cantidad
**PUT** `/items/:id`

#### Descripción
Actualiza la cantidad de un producto específico en el carrito.

#### URL Parameters
- `id`: ID del item en el carrito (UUID)

#### Request Body
```json
{
  "quantity": 3
}
```

#### Validaciones
- **quantity**: Número entero mínimo 1, requerido

#### Respuesta Exitosa (200)
```json
{
  "message": "Cart item updated successfully",
  "cartItem": {
    "id": "uuid",
    "quantity": 3,
    "totalPrice": 89.97
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Insufficient stock | Stock insuficiente |
| 404 | Cart item not found | Item no encontrado en el carrito |
| 403 | Access denied | Item no pertenece al usuario |

---

### 5. Eliminar Producto del Carrito
**DELETE** `/items/:id`

#### Descripción
Elimina un producto específico del carrito.

#### URL Parameters
- `id`: ID del item en el carrito (UUID)

#### Respuesta Exitosa (200)
```json
{
  "message": "Item removed from cart successfully"
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 404 | Cart item not found | Item no encontrado |
| 403 | Access denied | Item no pertenece al usuario |

---

### 6. Vaciar Carrito
**DELETE** `/`

#### Descripción
Elimina todos los productos del carrito del usuario.

#### Respuesta Exitosa (200)
```json
{
  "message": "Cart cleared successfully",
  "itemsRemoved": 5
}
```

---

### 7. Aplicar Cupón 🚨 Rate Limited
**POST** `/apply-coupon`

#### Descripción
Aplica un cupón de descuento al carrito.

#### Rate Limiting
- **Límite**: 10 intentos por 10 minutos por usuario
- **Reset**: Automático cada 10 minutos

#### Request Body
```json
{
  "couponCode": "DESCUENTO20"
}
```

#### Validaciones
- **couponCode**: String 3-20 caracteres, requerido

#### Respuesta Exitosa (200)
```json
{
  "message": "Coupon applied successfully",
  "coupon": {
    "codigo": "DESCUENTO20",
    "tipo": "percentage",
    "valor": 20,
    "descripcion": "20% de descuento en toda la compra"
  },
  "discount": {
    "amount": 25.00,
    "percentage": 20
  },
  "newTotal": 100.00
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Empty cart | Carrito vacío |
| 404 | Coupon not found | Cupón no encontrado |
| 400 | Coupon expired | Cupón expirado |
| 400 | Coupon already used | Cupón ya usado por el usuario |
| 400 | Minimum amount not met | No cumple monto mínimo |
| 429 | Too Many Requests | Rate limit excedido |

#### Ejemplo de Error (Cupón expirado)
```json
{
  "error": "Coupon expired",
  "message": "This coupon expired on 2025-06-15",
  "expirationDate": "2025-06-15T23:59:59Z"
}
```

---

## Casos de Uso Comunes

### Flujo Completo de Carrito

#### 1. Agregar productos
```bash
# Agregar producto 1
curl -X POST http://localhost:5500/api/v1/cart/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 123,
    "quantity": 2
  }'

# Agregar producto 2
curl -X POST http://localhost:5500/api/v1/cart/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 456,
    "quantity": 1
  }'
```

#### 2. Ver carrito
```bash
curl -X GET http://localhost:5500/api/v1/cart \
  -H "Authorization: Bearer <token>"
```

#### 3. Aplicar cupón
```bash
curl -X POST http://localhost:5500/api/v1/cart/apply-coupon \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "couponCode": "DESCUENTO20"
  }'
```

#### 4. Ver carrito con descuento
```bash
curl -X GET "http://localhost:5500/api/v1/cart/with-coupon?couponCode=DESCUENTO20" \
  -H "Authorization: Bearer <token>"
```

#### 5. Actualizar cantidad
```bash
curl -X PUT http://localhost:5500/api/v1/cart/items/<item_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3
  }'
```

---

## Reglas de Negocio

### Stock Management
- Se verifica stock disponible antes de agregar/actualizar
- No se pueden agregar más productos de los disponibles
- El stock se reserva temporalmente (implementar TTL)

### Cupones
- Un usuario solo puede usar un cupón por pedido
- Los cupones tienen fecha de expiración
- Algunos cupones requieren monto mínimo de compra
- Los cupones pueden ser de porcentaje o cantidad fija

### Persistencia
- El carrito persiste entre sesiones
- Los productos eliminados del catálogo se mantienen en el carrito con estado "no disponible"
- La información de precios se actualiza dinámicamente

---

## Notas Importantes

- Los precios se calculan en tiempo real desde la base de datos
- Los cupones se validan en cada operación
- El carrito tiene un límite máximo de 50 productos diferentes
- Los items se ordenan por fecha de agregado (más recientes primero)
- Se mantiene historial de cambios para auditoría
