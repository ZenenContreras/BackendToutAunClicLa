# Sistema de Emails con Resend - ToutAunClicLa

## 📧 Configuración de Emails

La aplicación ToutAunClicLa utiliza Resend como servicio de email para enviar:

1. **Códigos de verificación** al registrarse
2. **Emails de bienvenida** tras verificar la cuenta
3. **Notificaciones de pedidos** (futuro)
4. **Recuperación de contraseña** (futuro)

## 🎨 Diseño de Emails

Los emails siguen el diseño de la aplicación con:

- **Colores principales**: Degradado de #667eea a #764ba2
- **Tipografía**: System fonts (Apple/Google)
- **Responsive**: Adaptables a móviles
- **Profesional**: Branding consistente con ToutAunClicLa

## 🔐 Email de Verificación

### Características:
- Código de 6 dígitos numéricos
- Válido por 15 minutos
- Diseño professional con branding
- Instrucciones claras en español
- Advertencias de seguridad

### Contenido:
- Saludo personalizado con nombre del usuario
- Código destacado visualmente
- Información sobre la expiración
- Beneficios de verificar la cuenta
- Enlaces de soporte

## 🎉 Email de Bienvenida

### Características:
- Se envía automáticamente tras verificación
- Presenta los beneficios de la plataforma
- CTA para comenzar a comprar
- Información de contacto

### Contenido:
- Mensaje de bienvenida personalizado
- Listado de características principales
- Botón de llamada a la acción
- Información de soporte

## 🛠️ Configuración de Desarrollo

### Variables de Entorno:
```bash
RESEND_API_KEY=re_your_api_key
```

### Modo de Desarrollo:
- Sin API key: Los emails se simulan en consola
- Con API key: Se envían emails reales
- Los códigos se muestran en respuesta (solo desarrollo)

## 🚀 Uso en Producción

### Dominio Verificado:
1. Configurar dominio en Resend
2. Verificar DNS records
3. Actualizar remitente en configuración

### Monitoreo:
- Logs de envío en Resend dashboard
- Métricas de entrega
- Handling de errores

## 📝 Ejemplos de Uso

### Registro con verificación:
```javascript
// 1. Usuario se registra
POST /api/v1/auth/register
{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "nombre": "Juan Pérez",
  "telefono": "+1234567890"
}

// 2. Se genera código y envía email
// Código: 123456 (válido 15 min)

// 3. Usuario ingresa código
POST /api/v1/auth/verify-email
{
  "code": "123456"
}

// 4. Se envía email de bienvenida automáticamente
```

### Reenvío de código:
```javascript
POST /api/v1/auth/resend-verification
{
  "email": "usuario@ejemplo.com"
}
```

## 🎨 Personalización

### Colores del Email:
- **Primary**: #667eea
- **Secondary**: #764ba2
- **Background**: Linear gradient
- **Text**: #333 (dark), #666 (medium), #888 (light)
- **Success**: #28a745
- **Warning**: #ffc107

### Estructura HTML:
- Container responsivo (600px max)
- Header con branding
- Content area con padding
- Footer con enlaces y información legal
- CSS inline para compatibilidad

## 🔧 Mantenimiento

### Actualizaciones de Templates:
- Modificar archivos en `src/config/resend.js`
- Mantener consistencia con diseño web
- Probar en diferentes clientes de email

### Monitoreo:
- Revisar métricas de entrega en Resend
- Monitorear logs de errores
- Actualizar templates según feedback
