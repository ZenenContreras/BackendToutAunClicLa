# 🏠 Addresses API

## Overview
Sistema de gestión de direcciones de envío para usuarios registrados.

## Base URL
```
/api/v1/addresses
```

## 🔒 Autenticación Requerida
Todos los endpoints requieren autenticación JWT.

---

## Endpoints

### 1. Obtener Direcciones
**GET** `/`

#### Descripción
Obtiene todas las direcciones de envío del usuario autenticado.

#### Headers Requeridos
```
Authorization: Bearer <jwt_token>
```

#### Respuesta Exitosa (200)
```json
{
  "addresses": [
    {
      "id": "uuid",
      "street": "Calle Principal 123, Apartamento 4B",
      "city": "Madrid",
      "state": "Comunidad de Madrid",
      "zipCode": "28001",
      "country": "España",
      "phone": "+34 123 456 789"
    },
    {
      "id": "uuid",
      "street": "Avenida Secundaria 456",
      "city": "Barcelona",
      "state": "Cataluña",
      "zipCode": "08001",
      "country": "España",
      "phone": "+34 987 654 321"
    }
  ]
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 401 | Unauthorized | Token inválido o expirado |
| 500 | Internal Server Error | Error del servidor |

---

### 2. Crear Dirección
**POST** `/`

#### Descripción
Crea una nueva dirección de envío para el usuario autenticado.

#### Request Body
```json
{
  "street": "Calle Principal 123, Apartamento 4B",
  "city": "Madrid",
  "state": "Comunidad de Madrid",
  "zipCode": "28001",
  "country": "España",
  "phone": "+34 123 456 789"
}
```

#### Validaciones
- **street**: String requerido, dirección completa
- **city**: String requerido, nombre de la ciudad
- **state**: String requerido, provincia/estado
- **zipCode**: String requerido, código postal
- **country**: String requerido, país
- **phone**: String opcional, número de teléfono

#### Respuesta Exitosa (201)
```json
{
  "message": "Address created successfully",
  "address": {
    "id": "uuid",
    "street": "Calle Principal 123, Apartamento 4B",
    "city": "Madrid",
    "state": "Comunidad de Madrid",
    "zipCode": "28001",
    "country": "España",
    "phone": "+34 123 456 789"
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Validation error | Datos inválidos o campos faltantes |
| 401 | Unauthorized | Token inválido |
| 500 | Internal Server Error | Error del servidor |

#### Ejemplo de Error (Validación)
```json
{
  "error": "Validation error",
  "message": "\"city\" is required",
  "details": [
    {
      "message": "\"city\" is required",
      "path": ["city"],
      "type": "any.required"
    }
  ]
}
```

---

### 3. Actualizar Dirección
**PUT** `/:id`

#### Descripción
Actualiza una dirección existente. Solo el propietario puede actualizar su dirección.

#### URL Parameters
- `id`: ID de la dirección (UUID)

#### Request Body
```json
{
  "street": "Calle Principal 123, Apartamento 4B (Actualizada)",
  "city": "Madrid",
  "state": "Comunidad de Madrid",
  "zipCode": "28001",
  "country": "España",
  "phone": "+34 111 222 333"
}
```

#### Validaciones
- Mismas validaciones que crear dirección
- Todos los campos son requeridos (actualización completa)

#### Respuesta Exitosa (200)
```json
{
  "message": "Address updated successfully",
  "address": {
    "id": "uuid",
    "street": "Calle Principal 123, Apartamento 4B (Actualizada)",
    "city": "Madrid",
    "state": "Comunidad de Madrid",
    "zipCode": "28001",
    "country": "España",
    "phone": "+34 111 222 333"
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Validation error | Datos inválidos |
| 401 | Unauthorized | Token inválido |
| 404 | Address not found | Dirección no encontrada |
| 403 | Access denied | Dirección no pertenece al usuario |

---

### 4. Eliminar Dirección
**DELETE** `/:id`

#### Descripción
Elimina una dirección existente. Solo el propietario puede eliminar su dirección.

#### URL Parameters
- `id`: ID de la dirección (UUID)

#### Respuesta Exitosa (200)
```json
{
  "message": "Address deleted successfully",
  "addressId": "uuid"
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 401 | Unauthorized | Token inválido |
| 404 | Address not found | Dirección no encontrada |
| 403 | Access denied | Dirección no pertenece al usuario |
| 409 | Cannot delete | Dirección en uso en pedidos activos |

---

## Casos de Uso Comunes

### Flujo Completo de Direcciones

#### 1. Obtener todas las direcciones
```bash
curl -X GET http://localhost:5500/api/v1/addresses \
  -H "Authorization: Bearer <token>"
```

#### 2. Crear nueva dirección
```bash
curl -X POST http://localhost:5500/api/v1/addresses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "street": "Calle Nueva 789",
    "city": "Valencia",
    "state": "Comunidad Valenciana",
    "zipCode": "46001",
    "country": "España",
    "phone": "+34 555 666 777"
  }'
```

#### 3. Actualizar dirección existente
```bash
curl -X PUT http://localhost:5500/api/v1/addresses/<address_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "street": "Calle Nueva 789, Piso 2",
    "city": "Valencia",
    "state": "Comunidad Valenciana",
    "zipCode": "46001",
    "country": "España",
    "phone": "+34 555 666 888"
  }'
```

#### 4. Eliminar dirección
```bash
curl -X DELETE http://localhost:5500/api/v1/addresses/<address_id> \
  -H "Authorization: Bearer <token>"
```

---

## Integración con Frontend

### Gestión de Direcciones
```javascript
// Función para obtener todas las direcciones
async function getAddresses(token) {
  try {
    const response = await fetch('/api/v1/addresses', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching addresses:', error);
    throw error;
  }
}

// Función para crear dirección
async function createAddress(addressData, token) {
  try {
    const response = await fetch('/api/v1/addresses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addressData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating address:', error);
    throw error;
  }
}

// Función para actualizar dirección
async function updateAddress(addressId, addressData, token) {
  try {
    const response = await fetch(`/api/v1/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addressData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
}

// Función para eliminar dirección
async function deleteAddress(addressId, token) {
  try {
    const response = await fetch(`/api/v1/addresses/${addressId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
}
```

### Formulario de Dirección
```javascript
// Validaciones del frontend
function validateAddress(addressData) {
  const errors = {};
  
  if (!addressData.street?.trim()) {
    errors.street = 'La dirección es requerida';
  }
  
  if (!addressData.city?.trim()) {
    errors.city = 'La ciudad es requerida';
  }
  
  if (!addressData.state?.trim()) {
    errors.state = 'La provincia/estado es requerida';
  }
  
  if (!addressData.zipCode?.trim()) {
    errors.zipCode = 'El código postal es requerido';
  }
  
  if (!addressData.country?.trim()) {
    errors.country = 'El país es requerido';
  }
  
  // Validación de teléfono (opcional)
  if (addressData.phone && !isValidPhone(addressData.phone)) {
    errors.phone = 'Formato de teléfono inválido';
  }
  
  return errors;
}

function isValidPhone(phone) {
  // Regex básico para validar formatos internacionales
  const phoneRegex = /^\+?[\d\s\-\(\)]{8,15}$/;
  return phoneRegex.test(phone);
}
```

---

## Reglas de Negocio

### Restricciones
- Un usuario puede tener múltiples direcciones (sin límite)
- Todas las direcciones pertenecen únicamente al usuario que las creó
- No se pueden eliminar direcciones que están siendo usadas en pedidos activos
- Todos los campos son requeridos excepto el teléfono

### Validaciones Específicas
- **Código Postal**: Formato libre (diferentes países tienen diferentes formatos)
- **Teléfono**: Formato internacional recomendado (+país código número)
- **País**: Se recomienda usar códigos ISO pero acepta texto libre
- **Dirección**: Debe incluir información suficiente para entrega

### Consideraciones de Seguridad
- Las direcciones solo son visibles para el propietario
- Se valida que el usuario autenticado sea el propietario antes de cualquier operación
- No se exponen direcciones de otros usuarios en ninguna circunstancia

---

## Campos de Respuesta

### Address Object
```typescript
interface Address {
  id: string;          // UUID de la dirección
  street: string;      // Dirección completa con número y detalles
  city: string;        // Ciudad
  state: string;       // Provincia/Estado
  zipCode: string;     // Código postal
  country: string;     // País
  phone?: string;      // Teléfono opcional
}
```

### Formato Recomendado de Campos

#### Street (Dirección)
```
Calle/Avenida/Plaza Nombre Número, Piso/Apartamento/Detalles
```
Ejemplos:
- `"Calle Mayor 123, 2º A"`
- `"Avenida de la Constitución 456, Local B"`
- `"Plaza España 789, Edificio Torre, Piso 10"`

#### Phone (Teléfono)
```
+[código_país] [número]
```
Ejemplos:
- `"+34 123 456 789"` (España)
- `"+1 (555) 123-4567"` (EE.UU.)
- `"+33 1 23 45 67 89"` (Francia)

---

## Integración con Servicios Externos

### Validación de Direcciones
```javascript
// Integración con servicios de validación (Google Maps, etc.)
async function validateAddressWithService(address) {
  try {
    // Ejemplo de validación con Google Geocoding API
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address.street + ', ' + address.city + ', ' + address.country)}&key=${API_KEY}`);
    const data = await response.json();
    
    return {
      isValid: data.status === 'OK',
      formatted: data.results[0]?.formatted_address,
      coordinates: data.results[0]?.geometry?.location
    };
  } catch (error) {
    console.error('Address validation error:', error);
    return { isValid: true }; // Fallback: aceptar la dirección
  }
}
```

### Autocompletado
```javascript
// Función para autocompletado de direcciones
async function getAddressSuggestions(query) {
  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${API_KEY}`);
    const data = await response.json();
    
    return data.predictions.map(prediction => ({
      description: prediction.description,
      placeId: prediction.place_id
    }));
  } catch (error) {
    console.error('Autocomplete error:', error);
    return [];
  }
}
```

---

## Estados de Dirección

### Estados Posibles
- `active` - Dirección activa y disponible para uso
- `archived` - Dirección archivada (no se muestra pero se mantiene para historial)

### Uso en Pedidos
- Las direcciones se pueden usar en múltiples pedidos
- Una vez usado en un pedido, se mantiene un snapshot de la dirección
- Los cambios posteriores no afectan pedidos ya realizados

---

## Mejores Prácticas

### Para el Frontend
1. **Validación en Tiempo Real**: Validar campos mientras el usuario escribe
2. **Autocompletado**: Implementar autocompletado para mejorar UX
3. **Formato Consistente**: Mantener formato consistente en la visualización
4. **Dirección Principal**: Marcar una dirección como principal/por defecto

### Para el Backend
1. **Geocodificación**: Validar direcciones con servicios externos cuando sea posible
2. **Normalización**: Normalizar formatos de códigos postales y teléfonos
3. **Historial**: Mantener historial de cambios para auditoría
4. **Límites**: Considerar límite máximo de direcciones por usuario si es necesario

---

## Métricas y Analytics

### Métricas Útiles
- Número promedio de direcciones por usuario
- Países/ciudades más comunes
- Direcciones más utilizadas en pedidos
- Tasa de actualización de direcciones

### Endpoints de Analytics (para admins)
```
GET /api/v1/addresses/analytics/summary
GET /api/v1/addresses/analytics/countries
GET /api/v1/addresses/analytics/usage
```

---

## Notas Importantes

- Las direcciones se almacenan en la tabla `direcciones_envio`
- Se mantiene relación con `usuarios` via `usuario_id`
- No hay campo `created_at` en el esquema actual
- Se recomienda implementar soft delete para mantener historial
- Las direcciones son críticas para el proceso de checkout
- Se debe validar que el usuario tenga al menos una dirección antes del checkout
