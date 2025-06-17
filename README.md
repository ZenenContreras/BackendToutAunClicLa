# Toutaunclicla API

API REST completa para aplicación de e-commerce construida con Express.js, Supabase, Stripe y Resend.

## 🚀 Características

- **Autenticación JWT** con registro y login de usuarios
- **Verificación por email** con códigos de 6 dígitos usando Resend
- **Gestión de productos** con categorías, imágenes y stock
- **Carrito de compras** con persistencia
- **Sistema de reseñas** para productos
- **Gestión de direcciones** de usuarios
- **Procesamiento de pagos** con Stripe
- **Panel de administración** para gestión de productos y pedidos
- **Emails profesionales** con plantillas HTML responsivas
- **Rate limiting** y validación de datos
- **Seguridad** con CORS, Helmet y middlewares de autenticación

## 📋 Requisitos previos

- Node.js 16+
- Cuenta de Supabase
- Cuenta de Stripe
- Cuenta de Resend para emails
- npm o yarn

## 🛠️ Instalación

1. **Clona el repositorio:**
```bash
git clone <tu-repositorio>
cd backendToutaunclicla
```

2. **Instala las dependencias:**
```bash
npm install
```

3. **Configura las variables de entorno:**

<<<<<<< HEAD
4. **Configura Resend:**
- Ve a [Resend](https://resend.com) y crea una cuenta
- Obtén tu API Key desde el dashboard
- Agrega tu dominio verificado o usa el dominio sandbox para desarrollo
- Agrega la API Key a tu archivo `.env`

5. **Configura la base de datos:**
=======

4. **Configura la base de datos:**
>>>>>>> e8f8f8861edd2ace9d3d01a3cd5a160bc5d0b38f
- Ve a tu proyecto de Supabase
- Ejecuta el script SQL en `database/schema.sql` en el SQL Editor
- Esto creará todas las tablas necesarias

5. **Ejecuta la aplicación:**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 Documentación de la API

### Base URL
```
http://localhost:3000/api
```

### 🔐 Autenticación

#### Registro de usuario
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "nombre": "Juan Pérez",
  "telefono": "+1234567890"
}
```

**Respuesta exitosa:**
```json
{
  "message": "User registered successfully. Please check your email for verification code.",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "nombre": "Juan Pérez",
    "telefono": "+1234567890",
    "verified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token",
  "verificationRequired": true
}
```

#### Verificar email con código
```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "code": "123456"
}
```

**Respuesta exitosa:**
```json
{
  "message": "Email verified successfully",
  "verified": true
}
```

#### Reenviar código de verificación
```http
POST /api/v1/auth/resend-verification
Content-Type: application/json

{
  "email": "usuario@ejemplo.com"
}
```

#### Inicio de sesión
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

#### Obtener perfil
```http
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

### 👤 Usuarios

#### Actualizar perfil
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Juan Carlos",
  "lastName": "Pérez García",
  "phone": "+1234567890"
}
```

#### Cambiar contraseña
```http
PUT /api/users/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "contraseñaActual",
  "newPassword": "nuevaContraseña123"
}
```

### 🛍️ Productos

#### Listar productos
```http
GET /api/products?page=1&limit=20&category=uuid&search=texto&sortBy=name&sortOrder=asc
```

#### Obtener producto por ID
```http
GET /api/products/:id
```

#### Crear producto (Admin)
```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Producto ejemplo",
  "description": "Descripción del producto",
  "price": 29.99,
  "categoryId": "uuid-categoria",
  "images": ["url1", "url2"],
  "stock": 100
}
```

### 📍 Direcciones

#### Listar direcciones del usuario
```http
GET /api/addresses
Authorization: Bearer <token>
```

#### Crear dirección
```http
POST /api/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "street": "Calle Principal 123",
  "city": "Ciudad",
  "state": "Estado",
  "zipCode": "12345",
  "country": "País",
  "isDefault": true
}
```

### 🛒 Carrito

#### Obtener carrito
```http
GET /api/cart
Authorization: Bearer <token>
```

#### Agregar al carrito
```http
POST /api/cart/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "uuid-producto",
  "quantity": 2
}
```

#### Actualizar cantidad
```http
PUT /api/cart/items/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Eliminar del carrito
```http
DELETE /api/cart/items/:id
Authorization: Bearer <token>
```

### ⭐ Reseñas

#### Obtener reseñas de un producto
```http
GET /api/reviews/product/:productId?page=1&limit=10
```

#### Crear reseña
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "uuid-producto",
  "rating": 5,
  "comment": "Excelente producto"
}
```

### 📦 Pedidos

#### Listar mis pedidos
```http
GET /api/orders/my-orders?page=1&limit=10&status=completed
Authorization: Bearer <token>
```

#### Crear pedido
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "addressId": "uuid-direccion",
  "paymentMethodId": "pm_stripe_id"
}
```

### 💳 Pagos (Stripe)

#### Crear Payment Intent
```http
POST /api/stripe/payment-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 29.99,
  "currency": "usd"
}
```

#### Guardar método de pago
```http
POST /api/stripe/payment-methods
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethodId": "pm_stripe_id"
}
```

## 🏗️ Estructura del proyecto

```
src/
├── config/          # Configuraciones (Supabase, Stripe)
├── controllers/     # Lógica de negocio
├── middlewares/     # Middlewares (auth, validación, etc.)
├── routes/          # Definición de rutas
└── server.js        # Punto de entrada
database/
└── schema.sql       # Esquema de base de datos
```

## 🔒 Middlewares de seguridad

- **Helmet**: Protección de headers HTTP
- **CORS**: Control de acceso de origen cruzado
- **Rate Limiting**: Limitación de solicitudes por IP
- **JWT Authentication**: Autenticación basada en tokens
- **Validación de datos**: Validación con Joi
- **Compresión**: Compresión gzip de respuestas

## 🗄️ Base de datos

La API utiliza PostgreSQL a través de Supabase con las siguientes tablas:

- `users` - Información de usuarios
- `categories` - Categorías de productos
- `products` - Catálogo de productos
- `addresses` - Direcciones de usuarios
- `cart_items` - Items del carrito
- `orders` - Pedidos
- `order_items` - Items de pedidos
- `reviews` - Reseñas de productos

## 💰 Integración con Stripe

La API incluye integración completa con Stripe para:

- Creación de Payment Intents
- Gestión de métodos de pago
- Webhooks para eventos de pago
- Asociación de customers con usuarios

## 📱 Consumo desde el Frontend

### Ejemplo con fetch (JavaScript)

```javascript
// Configuración base
const API_BASE_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('authToken');

// Headers comunes
const headers = {
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` })
};

// Obtener productos
async function getProducts(page = 1, limit = 20) {
  const response = await fetch(`${API_BASE_URL}/products?page=${page}&limit=${limit}`);
  return response.json();
}

// Agregar al carrito
async function addToCart(productId, quantity) {
  const response = await fetch(`${API_BASE_URL}/cart/items`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ productId, quantity })
  });
  return response.json();
}

// Crear pedido
async function createOrder(addressId, paymentMethodId) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ addressId, paymentMethodId })
  });
  return response.json();
}
```

### Ejemplo con Axios (React)

```javascript
import axios from 'axios';

// Configurar interceptor para el token
axios.defaults.baseURL = 'http://localhost:3000/api';
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Servicios
export const authService = {
  login: (email, password) => 
    axios.post('/auth/login', { email, password }),
  
  register: (userData) => 
    axios.post('/auth/register', userData),
    
  getProfile: () => 
    axios.get('/auth/profile')
};

export const productService = {
  getAll: (params) => 
    axios.get('/products', { params }),
    
  getById: (id) => 
    axios.get(`/products/${id}`)
};

export const cartService = {
  get: () => 
    axios.get('/cart'),
    
  addItem: (productId, quantity) => 
    axios.post('/cart/items', { productId, quantity }),
    
  updateItem: (id, quantity) => 
    axios.put(`/cart/items/${id}`, { quantity }),
    
  removeItem: (id) => 
    axios.delete(`/cart/items/${id}`)
};
```

## 🚀 Despliegue

### Variables de entorno para producción

```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key
JWT_SECRET=your_production_jwt_secret
STRIPE_SECRET_KEY=your_production_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_production_stripe_webhook_secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Despliegue en Vercel/Netlify/Railway

1. Conecta tu repositorio
2. Configura las variables de entorno
3. Deploy automático

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Coverage
npm run test:coverage
```

## 📄 Licencia

MIT License

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Para soporte o preguntas, abre un issue en el repositorio.
# BackendToutAunClicLa
