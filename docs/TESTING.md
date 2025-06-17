# 🧪 Testing de Verificación de Email sin Frontend

Este script permite probar completamente el sistema de verificación de email sin necesidad de un frontend.

## 🚀 Comandos Disponibles

### 1. Crear Usuario de Prueba
```bash
npm run test:verification create [email] [nombre]
```

**Ejemplo:**
```bash
npm run test:verification create test@example.com "Juan Pérez"
```

**Lo que hace:**
- Crea un usuario en la base de datos
- Genera un código de verificación de 6 dígitos
- Envía email de verificación (si Resend está configurado)
- Muestra el código generado para testing

### 2. Verificar con Código
```bash
npm run test:verification verify [codigo]
```

**Ejemplo:**
```bash
npm run test:verification verify 123456
```

**Lo que hace:**
- Busca el usuario con ese código
- Verifica que no esté expirado (15 minutos)
- Marca el usuario como verificado
- Envía email de bienvenida

### 3. Ver Estado de Verificación
```bash
npm run test:verification status [email]
```

**Ejemplo:**
```bash
npm run test:verification status test@example.com
```

**Lo que muestra:**
- Si el usuario existe
- Si está verificado
- Si tiene código pendiente
- Si el código está expirado
- Fechas de creación y expiración

### 4. Reenviar Código
```bash
npm run test:verification resend [email]
```

**Ejemplo:**
```bash
npm run test:verification resend test@example.com
```

**Lo que hace:**
- Genera un nuevo código de 6 dígitos
- Actualiza la fecha de expiración
- Envía nuevo email de verificación

### 5. Eliminar Usuario de Prueba
```bash
npm run test:verification delete [email]
```

**Ejemplo:**
```bash
npm run test:verification delete test@example.com
```

### 6. Demo Completo
```bash
npm run test:verification demo [email] [nombre]
```

**Ejemplo:**
```bash
npm run test:verification demo test@demo.com "Usuario Demo"
```

**Lo que hace:**
1. Crea usuario de prueba
2. Muestra estado inicial
3. Verifica con el código generado
4. Muestra estado final
5. ¡Todo en un solo comando!

## 📋 Flujo de Testing Típico

### Opción A: Testing Manual Paso a Paso
```bash
# 1. Crear usuario
npm run test:verification create test@example.com "Test User"
# ➡️ Te da el código: 123456

# 2. Ver estado (opcional)
npm run test:verification status test@example.com

# 3. Verificar
npm run test:verification verify 123456

# 4. Limpiar
npm run test:verification delete test@example.com
```

### Opción B: Demo Automático
```bash
# Todo en uno
npm run test:verification demo test@example.com "Test User"
```

## 🔧 Configuración

### Variables de Entorno Necesarias
```bash
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Opcional para emails reales
RESEND_API_KEY=tu_api_key_de_resend
```

### Sin RESEND_API_KEY
- Los emails se simulan en consola
- Los códigos se muestran en la respuesta
- Perfecto para desarrollo y testing

### Con RESEND_API_KEY
- Se envían emails reales
- Puedes probar el flujo completo end-to-end
- Los códigos también se muestran para conveniencia

## 🎯 Casos de Uso

### 1. Desarrollo de Frontend
```bash
# Crear usuario para conectar tu frontend
npm run test:verification create frontend@test.com "Frontend User"
# Usa el código que te da para probar tu UI
```

### 2. Testing de API
```bash
# Crear usuario verificado para testing de endpoints protegidos
npm run test:verification create api@test.com "API User"
npm run test:verification verify [codigo_mostrado]
```

### 3. Testing de Emails
```bash
# Probar envío de emails con tu cuenta real
npm run test:verification create tu@email.com "Tu Nombre"
# Revisa tu email y usa el código
```

### 4. Debugging
```bash
# Ver estado de cualquier usuario
npm run test:verification status cualquier@email.com

# Reenviar código si algo falló
npm run test:verification resend usuario@problema.com
```

## 🛡️ Funcionalidades de Seguridad Probadas

### ✅ Validaciones Implementadas
- Códigos de exactamente 6 dígitos numéricos
- Expiración de 15 minutos
- Códigos únicos por usuario
- No se puede verificar un usuario ya verificado
- Eliminación de códigos tras verificación exitosa

### ✅ Casos Probados
- Usuario no existe
- Código inválido/no encontrado
- Código expirado
- Usuario ya verificado
- Verificación exitosa

## 🚨 Notas Importantes

### Para Desarrollo
- Los códigos se muestran en consola para conveniencia
- Usa emails de prueba para evitar spam
- Los usuarios de prueba se pueden eliminar fácilmente

### Para Producción
- Nunca mostrar códigos en respuestas de API
- Usar rate limiting en endpoints de verificación
- Monitorear intentos fallidos de verificación

## 🐛 Troubleshooting

### Error: "Usuario ya existe"
```bash
# El script automáticamente elimina y recrea
# O elimínalo manualmente:
npm run test:verification delete usuario@problema.com
```

### Error: "RESEND_API_KEY not found"
```bash
# Normal si no tienes Resend configurado
# Los emails se simulan en consola
```

### Error de conexión a Supabase
```bash
# Verifica tus variables de entorno
# Asegúrate de que Supabase esté accesible
```

## 🎨 Ejemplos de Salida

### Crear Usuario
```
🧪 Test de Verificación de Email - ToutAunClicLa

📝 Creando usuario de prueba: test@example.com
🔄 Creando usuario de prueba...
✅ Usuario creado: { id: 123, email: 'test@example.com', verified: false }
📧 Enviando email de verificación...
✅ Email enviado exitosamente

🎯 RESULTADO:
- Email: test@example.com
- Código de verificación: 846273
- Expira en: 6/16/2025, 3:45:00 PM

💡 Para verificar, usa:
npm run test:verification verify 846273
```

### Verificar Código
```
🧪 Test de Verificación de Email - ToutAunClicLa

🔍 Verificando código: 846273
🔄 Verificando código: 846273
✅ Usuario verificado exitosamente

🎯 RESULTADO: {
  success: true,
  message: 'Usuario verificado',
  user: { id: 123, email: 'test@example.com', verified: true }
}
```

### Estado de Usuario
```
🧪 Test de Verificación de Email - ToutAunClicLa

📊 Obteniendo estado de: test@example.com

🎯 ESTADO:
{
  "found": true,
  "email": "test@example.com",
  "verified": true,
  "hasCode": false,
  "codeExpired": false,
  "code": null,
  "expiresAt": null,
  "createdAt": "2025-06-16T19:30:00.000Z"
}
```
