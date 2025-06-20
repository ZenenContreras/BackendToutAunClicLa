# 👥 API de Usuarios

Sistema de gestión de usuarios con funciones administrativas y de usuario final.

## Base URL
```
https://backendtoutaunclicla-production.up.railway.app/api/v1/users
```

**🔒 Autenticación Requerida**: Todos los endpoints requieren token JWT válido.

---

## Endpoints de Usuario

### PUT /profile
Actualiza el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer jwt_token
```

**Request Body:**
```json
{
  "nombre": "Nuevo Nombre",
  "telefono": "+1234567890",
  "avatarUrl": "https://ejemplo.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "nombre": "Nuevo Nombre",
    "telefono": "+1234567890",
    "verified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "avatarUrl": "https://ejemplo.com/avatar.jpg"
  }
}
```

**Características:**
- Actualización selectiva de campos
- Validación de pertenencia de usuario
- Actualización de avatar opcional
{
  "nombre": "Juan Pérez",
  "telefono": "+34 123 456 789",
  "avatarUrl": "https://ejemplo.com/avatar.jpg"
}
```

#### Validaciones
- **nombre**: Mínimo 2 caracteres, requerido
- **telefono**: Opcional, formato libre
- **avatarUrl**: URL válida, opcional

#### Respuesta Exitosa (200)
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user_uuid",
    "email": "juan@ejemplo.com",
    "nombre": "Juan Pérez",
    "telefono": "+34 123 456 789",
    "verified": true,
    "createdAt": "2025-01-01T10:00:00Z",
    "avatarUrl": "https://ejemplo.com/avatar.jpg"
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Validation error | Datos inválidos |
| 401 | Unauthorized | Token inválido o expirado |
| 500 | Failed to update profile | Error del servidor |

---

### 2. Cambiar Contraseña 🔒
**PUT** `/password`

#### Descripción
Cambia la contraseña del usuario autenticado. Requiere la contraseña actual para verificación.

#### Headers Requeridos
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword456"
}
```

#### Validaciones
- **currentPassword**: Requerido
- **newPassword**: Mínimo 6 caracteres, requerido, debe ser diferente a la actual

#### Respuesta Exitosa (200)
```json
{
  "message": "Password changed successfully"
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Invalid password | Contraseña actual incorrecta o nueva igual a la actual |
| 401 | Unauthorized | Token inválido o expirado |
| 500 | Failed to change password | Error del servidor |

#### Ejemplo de Error (Contraseña igual)
```json
{
  "error": "Invalid password",
  "message": "New password must be different from current password"
}
```

---

### 3. Eliminar Cuenta 🔒
**DELETE** `/account`

#### Descripción
Elimina permanentemente la cuenta del usuario autenticado. Requiere confirmación con contraseña.

#### Headers Requeridos
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "password": "password123"
}
```

#### Validaciones
- **password**: Contraseña actual, requerida para confirmación

#### Proceso de Eliminación
1. Verifica la contraseña del usuario
2. Elimina el usuario de Supabase Auth
3. Los datos relacionados se eliminan en cascada

#### Respuesta Exitosa (200)
```json
{
  "message": "Account deleted successfully"
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Invalid password | Contraseña incorrecta |
| 401 | Unauthorized | Token inválido o expirado |
| 500 | Failed to delete account | Error del servidor |

---

### 4. Obtener Todos los Usuarios 🔒👑
**GET** `/`

#### Descripción
Obtiene una lista paginada de todos los usuarios del sistema (solo administradores).

#### Headers Requeridos
```
Authorization: Bearer <admin_jwt_token>
```

#### Query Parameters
| Parámetro | Tipo | Descripción | Por Defecto |
|-----------|------|-------------|-------------|
| page | number | Número de página | 1 |
| limit | number | Elementos por página | 20 |
| search | string | Buscar por nombre o email | - |
| verified | boolean | Filtrar por usuarios verificados | - |
| sortBy | string | Campo de ordenamiento | 'fecha_creacion' |
| sortOrder | string | Orden (asc/desc) | 'desc' |

#### Campos de Ordenamiento Válidos
- `fecha_creacion` - Fecha de registro
- `nombre` - Nombre del usuario
- `correo_electronico` - Email del usuario
- `fecha_ultimo_login` - Último inicio de sesión

#### Respuesta Exitosa (200)
```json
{
  "users": [
    {
      "id": "user_uuid",
      "email": "juan@ejemplo.com",
      "nombre": "Juan Pérez",
      "telefono": "+34 123 456 789",
      "verified": true,
      "isBlocked": false,
      "lastLogin": "2025-06-17T10:30:00Z",
      "createdAt": "2025-01-01T10:00:00Z",
      "avatarUrl": "https://ejemplo.com/avatar.jpg"
    },
    {
      "id": "user_uuid2",
      "email": "maria@ejemplo.com",
      "nombre": "María González",
      "telefono": "+34 987 654 321",
      "verified": true,
      "isBlocked": false,
      "lastLogin": "2025-06-16T15:20:00Z",
      "createdAt": "2025-01-02T14:30:00Z",
      "avatarUrl": null
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 98,
    "itemsPerPage": 20
  }
}
```

#### Ejemplo con Filtros
```bash
GET /api/v1/users?search=juan&verified=true&page=1&limit=10
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Admin access required | No eres administrador |
| 500 | Failed to get users | Error del servidor |

---

### 5. Actualizar Estado del Usuario 🔒👑
**PUT** `/:id/status`

#### Descripción
Bloquea o desbloquea un usuario específico (solo administradores).

#### Headers Requeridos
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

#### URL Parameters
- `id`: ID del usuario (UUID)

#### Request Body
```json
{
  "blocked": true,
  "reason": "Violación de términos de servicio"
}
```

#### Validaciones
- **blocked**: Boolean requerido
- **reason**: String requerido cuando `blocked` es `true`, opcional cuando es `false`

#### Para Bloquear Usuario
```json
{
  "blocked": true,
  "reason": "Actividad sospechosa detectada"
}
```

#### Para Desbloquear Usuario
```json
{
  "blocked": false
}
```

#### Respuesta Exitosa (200)
```json
{
  "message": "User blocked successfully",
  "user": {
    "id": "user_uuid",
    "email": "usuario@ejemplo.com",
    "nombre": "Usuario Ejemplo",
    "telefono": "+34 123 456 789",
    "verified": true,
    "isBlocked": true,
    "blockReason": "Violación de términos de servicio",
    "createdAt": "2025-01-01T10:00:00Z"
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Validation error | Datos inválidos |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Admin access required | No eres administrador |
| 404 | User not found | Usuario no encontrado |
| 500 | Failed to update user status | Error del servidor |

---

## Ejemplos de Uso

### Para Usuarios Autenticados

#### 1. Actualizar perfil
```bash
curl -X PUT https://backendtoutaunclicla-production.up.railway.app/api/v1/users/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Carlos Pérez",
    "telefono": "+34 123 456 789",
    "avatarUrl": "https://ejemplo.com/avatar.jpg"
  }'
```

#### 2. Cambiar contraseña
```bash
curl -X PUT https://backendtoutaunclicla-production.up.railway.app/api/v1/users/password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldPassword123",
    "newPassword": "newSecurePassword456"
  }'
```

#### 3. Eliminar cuenta
```bash
curl -X DELETE https://backendtoutaunclicla-production.up.railway.app/api/v1/users/account \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "myPassword123"
  }'
```

### Para Administradores

#### 4. Obtener todos los usuarios
```bash
curl -X GET "https://backendtoutaunclicla-production.up.railway.app/api/v1/users?page=1&limit=20&search=juan" \
  -H "Authorization: Bearer <admin_token>"
```

#### 5. Filtrar usuarios verificados
```bash
curl -X GET "https://backendtoutaunclicla-production.up.railway.app/api/v1/users?verified=true&sortBy=fecha_ultimo_login&sortOrder=desc" \
  -H "Authorization: Bearer <admin_token>"
```

#### 6. Bloquear usuario
```bash
curl -X PUT https://backendtoutaunclicla-production.up.railway.app/api/v1/users/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "blocked": true,
    "reason": "Actividad sospechosa detectada"
  }'
```

#### 7. Desbloquear usuario
```bash
curl -X PUT https://backendtoutaunclicla-production.up.railway.app/api/v1/users/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "blocked": false
  }'
```

---

## Casos de Uso Comunes

### Para Usuarios
- **Actualización de Perfil**: Cambiar información personal y avatar
- **Gestión de Seguridad**: Cambiar contraseña regularmente
- **Eliminación de Cuenta**: Proceso de baja completo

### Para Administradores
- **Gestión de Usuarios**: Ver y administrar todos los usuarios
- **Moderación**: Bloquear usuarios problemáticos
- **Búsqueda**: Encontrar usuarios específicos
- **Reporting**: Análisis de usuarios verificados vs no verificados

---

## Integración con Frontend

### Componente de Perfil
```javascript
// Actualizar perfil de usuario
const updateUserProfile = async (profileData) => {
  const response = await fetch('/api/v1/users/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });
  return response.json();
};

// Cambiar contraseña
const changePassword = async (currentPassword, newPassword) => {
  const response = await fetch('/api/v1/users/password', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  return response.json();
};
```

### Panel de Administración
```javascript
// Obtener usuarios con filtros
const getUsers = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/v1/users?${params}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  return response.json();
};

// Bloquear/desbloquear usuario
const updateUserStatus = async (userId, blocked, reason = null) => {
  const response = await fetch(`/api/v1/users/${userId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ blocked, reason })
  });
  return response.json();
};
```

### Hook de Usuario
```javascript
const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateProfile = async (data) => {
    setLoading(true);
    try {
      const result = await updateUserProfile(data);
      setUser(result.user);
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { user, updateProfile, loading };
};
```

---

## Validaciones y Reglas de Negocio

### Actualización de Perfil
- **Nombre**: Debe tener al menos 2 caracteres
- **Teléfono**: Formato libre, opcional
- **Avatar**: URL válida, opcional
- **Email**: No se puede cambiar desde este endpoint

### Cambio de Contraseña
- **Contraseña Actual**: Debe ser válida
- **Nueva Contraseña**: Mínimo 6 caracteres
- **Diferencia**: Nueva contraseña debe ser diferente a la actual
- **Historial**: Se registra la fecha del cambio

### Eliminación de Cuenta
- **Confirmación**: Requiere contraseña actual
- **Permanente**: La eliminación es irreversible
- **Cascada**: Se eliminan todos los datos relacionados

### Administración de Usuarios
- **Bloqueo**: Solo administradores pueden bloquear usuarios
- **Razón**: Requerida al bloquear, opcional al desbloquear
- **Historial**: Se mantiene registro de bloqueos/desbloqueos

---

## Seguridad

### Autenticación
- **JWT Required**: Todos los endpoints requieren token válido
- **Admin Rights**: Endpoints administrativos verifican rol de admin
- **Token Expiration**: Tokens expiran automáticamente

### Validación de Datos
- **Input Sanitization**: Todos los inputs se validan y sanitizan
- **SQL Injection**: Protección via Supabase ORM
- **XSS Prevention**: Validación de URLs y contenido

### Privacidad
- **Data Minimization**: Solo se exponen campos necesarios
- **Password Hashing**: Contraseñas hasheadas via Supabase Auth
- **Audit Trail**: Registro de cambios importantes

---

## Estados de Usuario

### Verificación
- `true`: Usuario ha verificado su email
- `false`: Usuario pendiente de verificación

### Bloqueo
- `false`: Usuario activo
- `true`: Usuario bloqueado temporalmente

### Roles
- `user`: Usuario estándar
- `admin`: Administrador con permisos especiales

---

## Analytics y Métricas

### Métricas de Usuarios
- **Usuarios Activos**: Login en últimos 30 días
- **Tasa de Verificación**: % de usuarios verificados
- **Retención**: % de usuarios que regresan
- **Usuarios Bloqueados**: Número de cuentas bloqueadas

### Comportamiento
- **Frecuencia de Cambio de Contraseña**: Cada cuánto cambian contraseñas
- **Actualización de Perfil**: Frecuencia de actualizaciones
- **Eliminación de Cuentas**: Tasa de churn

---

## Notas Importantes

- **Soft Delete**: Considerar soft delete para cumplimiento legal
- **GDPR Compliance**: El borrado de cuenta cumple con derecho al olvido
- **Backup**: Los cambios de perfil se registran para auditoría
- **Rate Limiting**: Endpoints protegidos contra abuso
- **Session Management**: Los cambios de contraseña invalidan otras sesiones
- **Admin Logs**: Todas las acciones administrativas se registran
