# 💳 Stripe Payments API

## Overview
Sistema de procesamiento de pagos integrado con Stripe para manejar transacciones seguras, métodos de pago y webhooks.

## Base URL
```
/api/v1/stripe
```

## 🔒 Autenticación Requerida
Todos los endpoints requieren autenticación JWT (excepto webhooks).

---

## Endpoints

### 1. Crear Payment Intent 🔒
**POST** `/payment-intent`

#### Descripción
Crea un Payment Intent en Stripe para procesar un pago. Este es el primer paso en el flujo de pago.

#### Headers Requeridos
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "amount": 159.99,
  "currency": "usd"
}
```

#### Validaciones
- **amount**: Número positivo, requerido
- **currency**: String opcional (por defecto "usd")

#### Respuesta Exitosa (200)
```json
{
  "clientSecret": "pi_3N4X1Y2Z3456789_secret_abcdef123456",
  "paymentIntentId": "pi_3N4X1Y2Z3456789"
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Invalid amount | Monto debe ser mayor a 0 |
| 401 | Unauthorized | Token inválido o expirado |
| 500 | Failed to create payment intent | Error de Stripe |

---

### 2. Confirmar Pago 🔒
**POST** `/confirm-payment`

#### Descripción
Confirma un Payment Intent con un método de pago específico. Finaliza la transacción de pago.

#### Headers Requeridos
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "paymentIntentId": "pi_3N4X1Y2Z3456789",
  "paymentMethodId": "pm_1234567890abcdef"
}
```

#### Validaciones
- **paymentIntentId**: String requerido, ID válido de Stripe
- **paymentMethodId**: String requerido, método de pago válido

#### Respuesta Exitosa (200)
```json
{
  "status": "succeeded",
  "paymentIntent": {
    "id": "pi_3N4X1Y2Z3456789",
    "amount": 15999,
    "currency": "usd",
    "status": "succeeded",
    "created": 1634567890
  }
}
```

#### Estados Posibles
- `succeeded`: Pago exitoso
- `requires_action`: Requiere autenticación adicional (3D Secure)
- `requires_payment_method`: Método de pago inválido
- `failed`: Pago falló

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Payment failed | Pago no pudo ser procesado |
| 401 | Unauthorized | Token inválido o expirado |
| 500 | Failed to confirm payment | Error de Stripe |

---

### 3. Obtener Métodos de Pago 🔒
**GET** `/payment-methods`

#### Descripción
Obtiene todos los métodos de pago guardados del usuario autenticado.

#### Headers Requeridos
```
Authorization: Bearer <jwt_token>
```

#### Respuesta Exitosa (200)
```json
{
  "paymentMethods": [
    {
      "id": "pm_1234567890abcdef",
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "exp_month": 12,
        "exp_year": 2025,
        "country": "US"
      },
      "created": 1634567890
    },
    {
      "id": "pm_0987654321fedcba",
      "type": "card",
      "card": {
        "brand": "mastercard",
        "last4": "5555",
        "exp_month": 8,
        "exp_year": 2026,
        "country": "FR"
      },
      "created": 1634567880
    }
  ]
}
```

#### Respuesta (Usuario sin métodos)
```json
{
  "paymentMethods": []
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 401 | Unauthorized | Token inválido o expirado |
| 500 | Failed to get payment methods | Error de Stripe |

---

### 4. Guardar Método de Pago 🔒
**POST** `/payment-methods`

#### Descripción
Guarda un método de pago del usuario para uso futuro. Crea un customer en Stripe si no existe.

#### Headers Requeridos
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "paymentMethodId": "pm_1234567890abcdef"
}
```

#### Validaciones
- **paymentMethodId**: String requerido, ID válido de método de pago de Stripe

#### Proceso
1. Obtiene o crea un customer de Stripe para el usuario
2. Vincula el método de pago al customer
3. Actualiza el stripe_customer_id en la base de datos

#### Respuesta Exitosa (200)
```json
{
  "message": "Payment method saved successfully"
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Invalid payment method | Método de pago no válido |
| 401 | Unauthorized | Token inválido o expirado |
| 500 | Failed to save payment method | Error de Stripe |

---

### 5. Eliminar Método de Pago 🔒
**DELETE** `/payment-methods/:paymentMethodId`

#### Descripción
Elimina un método de pago guardado del usuario.

#### Headers Requeridos
```
Authorization: Bearer <jwt_token>
```

#### URL Parameters
- `paymentMethodId`: ID del método de pago a eliminar

#### Respuesta Exitosa (200)
```json
{
  "message": "Payment method removed successfully"
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 401 | Unauthorized | Token inválido o expirado |
| 404 | Payment method not found | Método de pago no encontrado |
| 500 | Failed to remove payment method | Error de Stripe |

---

### 6. Webhook de Stripe 🌐
**POST** `/webhook`

#### Descripción
Endpoint para recibir webhooks de Stripe. Maneja eventos importantes como pagos exitosos o fallidos.

#### Headers Requeridos
```
Stripe-Signature: webhook_signature
Content-Type: application/json
```

#### Eventos Manejados
- `payment_intent.succeeded`: Pago exitoso
- `payment_intent.payment_failed`: Pago fallido

#### Proceso para `payment_intent.succeeded`
1. Verifica la firma del webhook
2. Actualiza el estado del pedido a "completed"
3. Registra el ID del payment intent

#### Proceso para `payment_intent.payment_failed`
1. Verifica la firma del webhook
2. Actualiza el estado del pedido a "payment_failed"
3. Registra el fallo para seguimiento

#### Respuesta Exitosa (200)
```json
{
  "received": true
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Webhook Error | Firma inválida o evento malformado |
| 500 | Webhook handler failed | Error procesando evento |

---

## Ejemplos de Uso

### Flujo Completo de Pago

#### 1. Crear Payment Intent
```bash
curl -X POST http://localhost:5500/api/v1/stripe/payment-intent \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 159.99,
    "currency": "usd"
  }'
```

#### 2. Confirmar pago (frontend maneja Stripe Elements)
```javascript
// En el frontend con Stripe Elements
const { error, paymentIntent } = await stripe.confirmCardPayment(
  clientSecret,
  {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: 'Juan Pérez',
      },
    }
  }
);

// Luego confirmar en el backend
const response = await fetch('/api/v1/stripe/confirm-payment', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    paymentIntentId: paymentIntent.id,
    paymentMethodId: paymentIntent.payment_method
  })
});
```

#### 3. Obtener métodos de pago guardados
```bash
curl -X GET http://localhost:5500/api/v1/stripe/payment-methods \
  -H "Authorization: Bearer <token>"
```

#### 4. Guardar método de pago
```bash
curl -X POST http://localhost:5500/api/v1/stripe/payment-methods \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethodId": "pm_1234567890abcdef"
  }'
```

#### 5. Eliminar método de pago
```bash
curl -X DELETE http://localhost:5500/api/v1/stripe/payment-methods/pm_1234567890abcdef \
  -H "Authorization: Bearer <token>"
```

---

## Casos de Uso Comunes

### Para E-commerce
- **Pago Único**: Crear payment intent para compra inmediata
- **Métodos Guardados**: Guardar tarjetas para checkout rápido
- **Procesamiento Asíncrono**: Manejar pagos que requieren tiempo

### Para Suscripciones
- **Setup Intents**: Configurar métodos para pagos futuros
- **Billing**: Cobros automáticos con métodos guardados

### Para Marketplace
- **Split Payments**: Dividir pagos entre vendedores
- **Hold Funds**: Retener fondos hasta confirmación

---

## Integración con Frontend

### Configuración de Stripe
```javascript
// Inicializar Stripe
const stripe = Stripe('pk_test_your_publishable_key');

// Crear elementos
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');
```

### Componente de Pago
```javascript
const PaymentForm = () => {
  const handleSubmit = async (event) => {
    event.preventDefault();

    // 1. Crear Payment Intent
    const { clientSecret } = await createPaymentIntent(amount);

    // 2. Confirmar pago
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: { name: customerName },
        }
      }
    );

    if (error) {
      setError(error.message);
    } else {
      // 3. Confirmar en backend
      await confirmPayment(paymentIntent.id, paymentIntent.payment_method);
      setSuccess(true);
    }
  };
};
```

### Manejo de Métodos Guardados
```javascript
// Obtener métodos guardados
const getPaymentMethods = async () => {
  const response = await fetch('/api/v1/stripe/payment-methods', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Usar método guardado
const payWithSavedMethod = async (paymentMethodId, amount) => {
  const { clientSecret } = await createPaymentIntent(amount);
  
  const { error } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: paymentMethodId
  });
  
  return !error;
};
```

---

## Seguridad

### Webhooks
- **Verificación de Firma**: Todas las webhooks verifican la firma de Stripe
- **Idempotencia**: Los eventos se procesan una sola vez
- **Logging**: Todos los eventos se registran para auditoría

### Métodos de Pago
- **Encriptación**: Los datos sensibles nunca tocan nuestros servidores
- **Tokenización**: Solo se almacenan tokens de Stripe
- **PCI Compliance**: Cumplimiento automático via Stripe

### Transacciones
- **3D Secure**: Soporte automático para autenticación fuerte
- **Fraud Detection**: Protección integrada de Stripe
- **Monitoring**: Alertas para transacciones sospechosas

---

## Testing

### Tarjetas de Prueba
```javascript
// Tarjetas de test de Stripe
const TEST_CARDS = {
  visa: '4242424242424242',
  visa_debit: '4000056655665556',
  mastercard: '5555555555554444',
  amex: '378282246310005',
  declined: '4000000000000002',
  insufficient_funds: '4000000000009995',
  requires_authentication: '4000002500003155'
};
```

### Webhooks en Desarrollo
```bash
# Instalar Stripe CLI
stripe listen --forward-to localhost:5500/api/v1/stripe/webhook

# Trigger eventos de prueba
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

---

## Configuración de Webhooks

### Eventos Requeridos
En el dashboard de Stripe, configurar:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_method.attached`
- `customer.created`

### URL del Webhook
```
https://tu-dominio.com/api/v1/stripe/webhook
```

### Variables de Entorno
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Monitoreo y Analytics

### Métricas Clave
- **Tasa de Conversión**: % de payment intents exitosos
- **Tiempo de Procesamiento**: Duración promedio de pagos
- **Métodos Preferidos**: Análisis de tipos de tarjeta
- **Fallos por Región**: Geografía de pagos fallidos

### Logging
```javascript
// Estructura de logs
{
  event_type: 'payment_intent.created',
  user_id: 'uuid',
  amount: 15999,
  currency: 'usd',
  payment_method: 'card',
  status: 'succeeded',
  timestamp: '2025-06-17T10:30:00Z'
}
```

---

## Notas Importantes

- **Monedas Soportadas**: USD, EUR, GBP (configurar según necesidades)
- **Límites de Pago**: Mínimo $0.50 USD, máximo según configuración de cuenta
- **Retenciones**: Stripe retiene fondos 2-7 días según el país
- **Fees**: Comisiones de Stripe se aplican automáticamente
- **Reembolsos**: Manejados directamente desde el dashboard de Stripe
- **Disputes**: Gestión de contracargos integrada en Stripe Dashboard
