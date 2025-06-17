# 🧪 Guía de Testing de API: Carrito, Favoritos y Cupones

## 🚀 Configuración Inicial

### 1. Crear datos de prueba
```bash
npm run test:data create
```

### 2. Crear usuario verificado para testing
```bash
npm run test:verification demo test-api@toutaunclicla.com "API Tester"
```

### 3. Obtener token de autenticación
```bash
# Login para obtener token
curl -X POST http://localhost:5500/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-api@toutaunclicla.com",
    "password": "password123"
  }'
```

## 🛒 Testing del Carrito

### **Obtener carrito vacío**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5500/api/v1/cart
```

### **Agregar producto al carrito**
```bash
curl -X POST http://localhost:5500/api/v1/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 31,
    "quantity": 2
  }'
```

### **Agregar más productos**
```bash
curl -X POST http://localhost:5500/api/v1/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 32,
    "quantity": 1
  }'
```

### **Ver carrito actualizado**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5500/api/v1/cart
```

### **Actualizar cantidad de un item**
```bash
curl -X PUT http://localhost:5500/api/v1/cart/items/ITEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3
  }'
```

### **Aplicar cupón de descuento**
```bash
curl -X POST http://localhost:5500/api/v1/cart/apply-coupon \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "couponCode": "DESCUENTO10"
  }'
```

### **Ver carrito con cupón aplicado**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5500/api/v1/cart/with-coupon?couponCode=DESCUENTO10"
```

### **Probar cupón expirado**
```bash
curl -X POST http://localhost:5500/api/v1/cart/apply-coupon \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "couponCode": "EXPIRADO"
  }'
```

### **Eliminar item del carrito**
```bash
curl -X DELETE http://localhost:5500/api/v1/cart/items/ITEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Vaciar carrito completo**
```bash
curl -X DELETE http://localhost:5500/api/v1/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ❤️ Testing de Favoritos

### **Ver favoritos (inicialmente vacío)**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5500/api/v1/favorites
```

### **Agregar producto a favoritos**
```bash
curl -X POST http://localhost:5500/api/v1/favorites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 31
  }'
```

### **Agregar más productos a favoritos**
```bash
curl -X POST http://localhost:5500/api/v1/favorites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 33
  }'
```

### **Ver lista de favoritos**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5500/api/v1/favorites
```

### **Verificar si producto está en favoritos**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5500/api/v1/favorites/status/31
```

### **Intentar agregar duplicado (debe fallar)**
```bash
curl -X POST http://localhost:5500/api/v1/favorites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 31
  }'
```

### **Quitar de favoritos**
```bash
curl -X DELETE http://localhost:5500/api/v1/favorites/31 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Verificar que se quitó**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5500/api/v1/favorites/status/31
```

## 🎫 Testing de Cupones

### **Probar cupón válido 10%**
```bash
curl -X POST http://localhost:5500/api/v1/cart/apply-coupon \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "couponCode": "DESCUENTO10"
  }'
```

### **Probar cupón válido 20%**
```bash
curl -X POST http://localhost:5500/api/v1/cart/apply-coupon \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "couponCode": "DESCUENTO20"
  }'
```

### **Probar cupón inexistente**
```bash
curl -X POST http://localhost:5500/api/v1/cart/apply-coupon \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "couponCode": "NOEXISTE"
  }'
```

### **Probar cupón expirado**
```bash
curl -X POST http://localhost:5500/api/v1/cart/apply-coupon \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "couponCode": "EXPIRADO"
  }'
```

## 🔄 Testing de Flujos Completos

### **Flujo Completo de Compra**
```bash
# 1. Agregar productos al carrito
curl -X POST http://localhost:5500/api/v1/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 31, "quantity": 2}'

# 2. Ver carrito
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5500/api/v1/cart

# 3. Aplicar cupón
curl -X POST http://localhost:5500/api/v1/cart/apply-coupon \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"couponCode": "DESCUENTO20"}'

# 4. Ver total con descuento
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5500/api/v1/cart/with-coupon?couponCode=DESCUENTO20"
```

### **Flujo de Gestión de Favoritos**
```bash
# 1. Agregar varios productos a favoritos
curl -X POST http://localhost:5500/api/v1/favorites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 31}'

curl -X POST http://localhost:5500/api/v1/favorites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 32}'

# 2. Ver lista paginada
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5500/api/v1/favorites?page=1&limit=10"

# 3. Agregar favorito al carrito
curl -X POST http://localhost:5500/api/v1/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 31, "quantity": 1}'
```

## 🧹 Validaciones de Errores

### **Validaciones del Carrito**
```bash
# Producto inexistente
curl -X POST http://localhost:5500/api/v1/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 99999, "quantity": 1}'

# Cantidad inválida
curl -X POST http://localhost:5500/api/v1/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 31, "quantity": 0}'

# Stock insuficiente
curl -X POST http://localhost:5500/api/v1/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 31, "quantity": 1000}'
```

### **Validaciones de Favoritos**
```bash
# Producto inexistente
curl -X POST http://localhost:5500/api/v1/favorites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 99999}'

# ID de producto inválido
curl -X POST http://localhost:5500/api/v1/favorites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": "invalid"}'
```

### **Validaciones de Cupones**
```bash
# Cupón en carrito vacío
curl -X DELETE http://localhost:5500/api/v1/cart \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X POST http://localhost:5500/api/v1/cart/apply-coupon \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"couponCode": "DESCUENTO10"}'

# Código vacío
curl -X POST http://localhost:5500/api/v1/cart/apply-coupon \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"couponCode": ""}'
```

## 📊 Verificación Final

### **Ver estadísticas**
```bash
npm run test:data stats
```

### **Limpiar datos de prueba**
```bash
npm run test:data clean
```

### **Recrear datos de prueba**
```bash
npm run test:data reset
```

## 🎯 Casos de Prueba Esperados

### ✅ **Éxitos Esperados**
- Carrito se actualiza correctamente
- Favoritos se gestionan sin errores
- Cupones válidos aplican descuentos
- Cálculos de precios son exactos
- Validaciones funcionan correctamente

### ❌ **Errores Esperados**
- 404 para productos inexistentes
- 409 para favoritos duplicados
- 400 para cupones expirados/inválidos
- 400 para cantidades inválidas
- 401 sin token de autenticación

## 💡 Tips de Testing

1. **Guarda el token**: Usa una variable de entorno o script para no repetir el token
2. **Usa IDs reales**: Los productos de prueba tienen IDs dinámicos
3. **Verifica responses**: Revisa que los JSON de respuesta tengan la estructura esperada
4. **Prueba edge cases**: Cantidades muy altas, productos inexistentes, etc.
5. **Limpia entre tests**: Usa `npm run test:data reset` para empezar limpio
