# 🛍️ Orders API

## Overview
Sistema de gestión de pedidos con funcionalidades para usuarios y administradores, integrado con Stripe para procesamiento de pagos.

## Base URL
```
https://backendtoutaunclicla-production.up.railway.app/api/v1/orders
```

## 🔒 Autenticación Requerida
Todos los endpoints requieren autenticación JWT.

---

## Endpoints

### 1. Obtener Mis Pedidos 🔒
**GET** `/my-orders`

#### Descripción
Obtiene todos los pedidos del usuario autenticado con información detallada de productos y dirección de envío.

#### Headers Requeridos
```
Authorization: Bearer <jwt_token>
```

#### Query Parameters
| Parámetro | Tipo | Descripción | Por Defecto |
|-----------|------|-------------|-------------|
| page | number | Número de página | 1 |
| limit | number | Elementos por página | 10 |
| status | string | Filtrar por estado del pedido | - |

#### Estados válidos
- `pendiente` - Pago pendiente
- `procesando` - En proceso de preparación
- `enviado` - Enviado al cliente
- `entregado` - Entregado exitosamente
- `cancelado` - Cancelado por el usuario o admin

#### Respuesta Exitosa (200)
```json
{
  "orders": [
    {
      "id": "uuid",
      "usuario_id": "user_uuid",
      "direccion_envio_id": "address_uuid",
      "total": 159.98,
      "estado": "procesando",
      "fecha_pedido": "2025-06-17T10:30:00Z",
      "stripe_payment_intent_id": "pi_stripe_id",
      "detalles_pedido": [
        {
          "id": "detail_uuid",
          "pedido_id": "uuid",
          "producto_id": 123,
          "quantity": 2,
          "price": 49.99,
          "productos": {
            "nombre": "Producto Ejemplo",
            "precio": 49.99,
            "imagen_principal": "https://example.com/image.jpg"
          }
        }
      ],
      "direcciones_envio": {
        "id": "address_uuid",
        "direccion": "Calle Principal 123",
        "ciudad": "París",
        "codigo_postal": "75001",
        "pais": "Francia"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 401 | Unauthorized | Token inválido o expirado |
| 500 | Internal Server Error | Error del servidor |

---

### 2. Obtener Detalles del Pedido 🔒
**GET** `/:id`

#### Descripción
Obtiene los detalles completos de un pedido específico del usuario autenticado.

#### Headers Requeridos
```
Authorization: Bearer <jwt_token>
```

#### URL Parameters
- `id`: ID del pedido (UUID)

#### Respuesta Exitosa (200)
```json
{
  "order": {
    "id": "uuid",
    "usuario_id": "user_uuid",
    "direccion_envio_id": "address_uuid",
    "total": 159.98,
    "estado": "procesando",
    "fecha_pedido": "2025-06-17T10:30:00Z",
    "stripe_payment_intent_id": "pi_stripe_id",
    "detalles_pedido": [
      {
        "id": "detail_uuid",
        "pedido_id": "uuid",
        "producto_id": 123,
        "quantity": 2,
        "price": 49.99,
        "productos": {
          "nombre": "Producto Ejemplo",
          "precio": 49.99,
          "imagen_principal": "https://example.com/image.jpg"
        }
      }
    ],
    "direcciones_envio": {
      "id": "address_uuid",
      "nombre_completo": "Juan Pérez",
      "direccion": "Calle Principal 123",
      "ciudad": "París",
      "codigo_postal": "75001",
      "pais": "Francia",
      "telefono": "+33 1 23 45 67 89"
    }
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 401 | Unauthorized | Token inválido o expirado |
| 404 | Order not found | Pedido no encontrado |
| 500 | Internal Server Error | Error del servidor |

---

### 3. Crear Pedido 🔒
**POST** `/`

#### Descripción
Crea un nuevo pedido a partir del carrito actual del usuario, procesa el pago con Stripe y actualiza el stock de productos.

#### Headers Requeridos
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "addressId": "address_uuid",
  "paymentMethodId": "pm_stripe_id"
}
```

#### Validaciones
- **addressId**: UUID válido, requerido, debe pertenecer al usuario
- **paymentMethodId**: String requerido, método de pago válido de Stripe

#### Proceso de Creación
1. Verifica que el carrito no esté vacío
2. Valida stock disponible para todos los productos
3. Verifica que la dirección pertenezca al usuario
4. Crea y confirma el pago con Stripe
5. Crea el pedido en la base de datos
6. Actualiza el stock de productos
7. Limpia el carrito del usuario

#### Respuesta Exitosa (201)
```json
{
  "message": "Order created successfully",
  "order": {
    "id": "uuid",
    "usuario_id": "user_uuid",
    "total": 159.98,
    "estado": "pendiente",
    "fecha_pedido": "2025-06-17T10:30:00Z",
    "stripe_payment_intent_id": "pi_stripe_id"
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Empty cart | Carrito vacío |
| 400 | Insufficient stock | Stock insuficiente para algún producto |
| 400 | Invalid address | Dirección no válida o no pertenece al usuario |
| 400 | Payment failed | Pago no pudo ser procesado |
| 401 | Unauthorized | Token inválido o expirado |
| 500 | Internal Server Error | Error del servidor |

#### Ejemplo de Error (Stock insuficiente)
```json
{
  "error": "Insufficient stock",
  "message": "Only 2 units of iPhone 15 Pro available"
}
```

---

### 4. Cancelar Pedido 🔒
**PUT** `/:id/cancel`

#### Descripción
Cancela un pedido pendiente del usuario autenticado. Solo se pueden cancelar pedidos en estado "pendiente".

#### Headers Requeridos
```
Authorization: Bearer <jwt_token>
```

#### URL Parameters
- `id`: ID del pedido (UUID)

#### Respuesta Exitosa (200)
```json
{
  "message": "Order cancelled successfully"
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Cannot cancel order | Solo pedidos pendientes pueden cancelarse |
| 401 | Unauthorized | Token inválido o expirado |
| 404 | Order not found | Pedido no encontrado |
| 500 | Internal Server Error | Error del servidor |

---

### 5. Obtener Todos los Pedidos 🔒👑
**GET** `/`

#### Descripción
Obtiene todos los pedidos del sistema (solo administradores). Incluye información de usuarios y detalles completos.

#### Headers Requeridos
```
Authorization: Bearer <admin_jwt_token>
```

#### Query Parameters
| Parámetro | Tipo | Descripción | Por Defecto |
|-----------|------|-------------|-------------|
| page | number | Número de página | 1 |
| limit | number | Elementos por página | 20 |
| status | string | Filtrar por estado | - |
| sortBy | string | Campo de ordenamiento | 'fecha_creacion' |
| sortOrder | string | Orden (asc/desc) | 'desc' |

#### Respuesta Exitosa (200)
```json
{
  "orders": [
    {
      "id": "uuid",
      "usuario_id": "user_uuid",
      "total": 159.98,
      "estado": "procesando",
      "fecha_pedido": "2025-06-17T10:30:00Z",
      "usuarios": {
        "nombre": "Juan Pérez",
        "correo_electronico": "juan@ejemplo.com"
      },
      "detalles_pedido": [
        {
          "id": "detail_uuid",
          "quantity": 2,
          "price": 49.99,
          "productos": {
            "nombre": "Producto Ejemplo",
            "precio": 49.99
          }
        }
      ],
      "direcciones_envio": {
        "direccion": "Calle Principal 123",
        "ciudad": "París"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 200,
    "itemsPerPage": 20
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Admin access required | No eres administrador |
| 500 | Internal Server Error | Error del servidor |

---

### 6. Actualizar Estado del Pedido 🔒👑
**PUT** `/:id/status`

#### Descripción
Actualiza el estado de un pedido específico (solo administradores).

#### Headers Requeridos
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

#### URL Parameters
- `id`: ID del pedido (UUID)

#### Request Body
```json
{
  "status": "enviado"
}
```

#### Estados válidos
- `pending` - Pendiente
- `processing` - Procesando
- `shipped` - Enviado
- `delivered` - Entregado
- `cancelled` - Cancelado

#### Respuesta Exitosa (200)
```json
{
  "message": "Order status updated successfully"
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Validation error | Estado no válido |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Admin access required | No eres administrador |
| 404 | Order not found | Pedido no encontrado |
| 500 | Internal Server Error | Error del servidor |

---

## Ejemplos de Uso

### Flujo Completo de Pedido

#### 1. Ver mis pedidos
```bash
curl -X GET "http://localhost:5500/api/v1/orders/my-orders?page=1&limit=5" \
  -H "Authorization: Bearer <token>"
```

#### 2. Crear nuevo pedido
```bash
curl -X POST http://localhost:5500/api/v1/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "550e8400-e29b-41d4-a716-446655440000",
    "paymentMethodId": "pm_1234567890abcdef"
  }'
```

#### 3. Ver detalles del pedido
```bash
curl -X GET http://localhost:5500/api/v1/orders/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <token>"
```

#### 4. Cancelar pedido (si está pendiente)
```bash
curl -X PUT http://localhost:5500/api/v1/orders/550e8400-e29b-41d4-a716-446655440000/cancel \
  -H "Authorization: Bearer <token>"
```

### Administración (requiere token admin)

#### 5. Ver todos los pedidos
```bash
curl -X GET "http://localhost:5500/api/v1/orders?status=procesando&page=1" \
  -H "Authorization: Bearer <admin_token>"
```

#### 6. Actualizar estado del pedido
```bash
curl -X PUT http://localhost:5500/api/v1/orders/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "enviado"
  }'
```

---

## Casos de Uso Comunes

### Para Usuarios
- **Historial de Compras**: Ver todos los pedidos realizados
- **Seguimiento**: Consultar estado actual de pedidos
- **Cancelación**: Cancelar pedidos pendientes
- **Detalles**: Ver información completa de productos comprados

### Para Administradores
- **Gestión de Pedidos**: Ver y gestionar todos los pedidos
- **Actualización de Estados**: Cambiar estado según el proceso de fulfillment
- **Reportes**: Análisis de ventas y estados de pedidos
- **Soporte**: Resolución de problemas de pedidos

---

## Integración con Frontend

### Estados de UI
```javascript
const ORDER_STATES = {
  'pendiente': { color: 'orange', label: 'Pago Pendiente' },
  'procesando': { color: 'blue', label: 'Procesando' },
  'enviado': { color: 'purple', label: 'Enviado' },
  'entregado': { color: 'green', label: 'Entregado' },
  'cancelado': { color: 'red', label: 'Cancelado' }
};
```

### Componente de Pedido
```javascript
// Obtener pedidos del usuario
const fetchUserOrders = async (page = 1) => {
  const response = await fetch(`/api/v1/orders/my-orders?page=${page}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Crear pedido desde carrito
const createOrder = async (addressId, paymentMethodId) => {
  const response = await fetch('/api/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ addressId, paymentMethodId })
  });
  return response.json();
};
```

---

## Reglas de Negocio

### Creación de Pedidos
- El carrito debe tener al menos un producto
- Todos los productos deben tener stock suficiente
- La dirección debe pertenecer al usuario autenticado
- El pago debe ser confirmado antes de crear el pedido
- El stock se actualiza automáticamente al confirmar el pedido

### Cancelación de Pedidos
- Solo pedidos en estado "pendiente" pueden ser cancelados
- Al cancelar, se reembolsa automáticamente en Stripe
- El stock se restaura para los productos del pedido cancelado

### Estados de Pedido
- **pendiente**: Pedido creado, pago en proceso
- **procesando**: Pago confirmado, preparando envío
- **enviado**: Pedido enviado, tracking disponible
- **entregado**: Pedido recibido por el cliente
- **cancelado**: Pedido cancelado por usuario o admin

---

## Integración con Stripe

### Proceso de Pago
1. El frontend crea un Payment Intent en Stripe
2. El usuario confirma el pago en el frontend
3. El backend verifica el pago exitoso
4. Se crea el pedido en la base de datos
5. Se actualiza el stock de productos

### Webhooks
El sistema maneja webhooks de Stripe para:
- Confirmar pagos exitosos
- Manejar pagos fallidos
- Procesar reembolsos

---

## Notas Importantes

- Los pedidos son inmutables una vez creados (excepto el estado)
- El cálculo de totales incluye precios al momento de la compra
- Se mantiene historial completo para auditoría
- Los precios se almacenan en el detalle del pedido para evitar cambios posteriores
- El sistema integra con Stripe para procesamiento seguro de pagos
- Se envían notificaciones por email en cambios de estado importantes
