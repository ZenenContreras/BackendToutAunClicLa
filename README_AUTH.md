# 🔐 API de Autenticación

Sistema completo de autenticación con JWT, verificación por email, control de seguridad y gestión de cuentas.

## Base URL
```
https://backendtoutaunclicla-production.up.railway.app/api/v1/auth
```

---

## Endpoints Disponibles

### POST /register
Registra un nuevo usuario en el sistema.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "nombre": "Nombre Usuario",
  "telefono": "+1234567890"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully. Please check your email for verification code.",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "nombre": "Nombre Usuario",
    "telefono": "+1234567890",
    "verified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token",
  "verificationRequired": true
}
```

**Características:**
- Hash de contraseña con bcrypt (12 rounds)
- Código de verificación de 6 dígitos
- Token JWT válido por 7 días
- Email de verificación automático
- Validación de usuario existente

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Validation error | Datos inválidos en el request |
| 409 | User already exists | El email ya está registrado |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

#### Ejemplo de Error
```json
{
  "error": "User already exists",
  "message": "A user with this email already exists"
}
```

---

### 2. Inicio de Sesión
**POST** `/login`

#### Descripción
Autentica a un usuario y devuelve un token JWT. Solo usuarios verificados pueden hacer login.

#### Rate Limiting
- **Límite**: 5 intentos por 15 minutos por IP
- **Bloqueo**: Cuenta bloqueada tras 5 intentos fallidos

#### Request Body
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

#### Validaciones
- **email**: Formato de email válido, requerido
- **password**: Requerido

#### Respuesta Exitosa (200)
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "nombre": "Juan Pérez",
    "telefono": "+34 123 456 789",
    "verified": true,
    "lastLogin": "2025-06-17T10:30:00Z"
  },
  "token": "jwt_token_here"
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Validation error | Datos inválidos |
| 401 | Invalid credentials | Email o contraseña incorrectos |
| 403 | Account not verified | Cuenta no verificada |
| 423 | Account locked | Cuenta bloqueada por intentos fallidos |
| 429 | Too Many Requests | Rate limit excedido |

#### Ejemplo de Error (Account not verified)
```json
{
  "error": "Account not verified",
  "message": "Please verify your email address before logging in. Check your email for the verification link.",
  "needsVerification": true
}
```

---

### 3. Verificar Email
**POST** `/verify-email`

#### Descripción
Verifica la cuenta del usuario usando el código enviado por email.

#### Rate Limiting
- **Límite**: 10 intentos por 15 minutos por IP

#### Request Body
```json
{
  "code": "123456"
}
```

#### Validaciones
- **code**: Exactamente 6 dígitos numéricos, requerido

#### Respuesta Exitosa (200)
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "verified": true
  },
  "token": "jwt_token_here"
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Invalid verification code | Código incorrecto o expirado |
| 404 | User not found | Usuario no encontrado |
| 409 | Already verified | Cuenta ya verificada |

---

### 4. Reenviar Verificación
**POST** `/resend-verification`

#### Descripción
Reenvía el código de verificación por email.

#### Rate Limiting
- **Límite**: 3 intentos por hora por email

#### Request Body
```json
{
  "email": "usuario@ejemplo.com"
}
```

#### Respuesta Exitosa (200)
```json
{
  "message": "Verification code sent successfully",
  "email": "usuario@ejemplo.com"
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 404 | User not found | Usuario no encontrado |
| 409 | Already verified | Cuenta ya verificada |
| 429 | Too Many Requests | Rate limit excedido |

---

### 5. Estado de Verificación
**GET** `/verification-status`

#### Descripción
Verifica el estado de verificación de un usuario.

#### Query Parameters
- `email`: Email del usuario (requerido)

#### Respuesta Exitosa (200)
```json
{
  "verified": true,
  "email": "usuario@ejemplo.com"
}
```

---

### 6. Obtener Perfil 🔒
**GET** `/profile`

#### Descripción
Obtiene el perfil del usuario autenticado.

#### Headers Requeridos
```
Authorization: Bearer <jwt_token>
```

#### Respuesta Exitosa (200)
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "nombre": "Juan Pérez",
    "telefono": "+34 123 456 789",
    "verified": true,
    "createdAt": "2025-06-17T10:30:00Z",
    "lastLogin": "2025-06-17T10:30:00Z"
  }
}
```

#### Errores Posibles
| Código | Error | Descripción |
|--------|-------|-------------|
| 401 | Unauthorized | Token inválido o expirado |
| 404 | User not found | Usuario no encontrado |

---

## Seguridad

### Protecciones Implementadas
- **Rate Limiting**: Previene ataques de fuerza bruta
- **Account Locking**: Bloqueo temporal tras intentos fallidos
- **JWT Tokens**: Tokens seguros con expiración de 7 días
- **Password Hashing**: bcrypt con salt automático
- **Email Verification**: Verificación obligatoria antes del login
- **IP Tracking**: Registro de última IP de acceso

### Headers de Seguridad
- `X-RateLimit-Remaining`: Intentos restantes
- `X-RateLimit-Reset`: Tiempo hasta reset del limite

---

## Ejemplos de Uso

### Flujo Completo de Registro y Login

#### 1. Registrar usuario
```bash
curl -X POST http://localhost:5500/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "password123",
    "nombre": "Usuario Test"
  }'
```

#### 2. Verificar email (revisar bandeja de entrada)
```bash
curl -X POST http://localhost:5500/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456"
  }'
```

#### 3. Hacer login
```bash
curl -X POST http://localhost:5500/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "password123"
  }'
```

#### 4. Usar token para acceder al perfil
```bash
curl -X GET http://localhost:5500/api/v1/auth/profile \
  -H "Authorization: Bearer <token_recibido>"
```

---

## Notas Importantes

- Los tokens JWT expiran en 7 días
- Los códigos de verificación expiran en 15 minutos
- Las cuentas se bloquean por 24 horas tras 5 intentos fallidos
- Solo usuarios verificados pueden hacer login
- Los emails de verificación se envían usando Resend
