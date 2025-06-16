# Toutaunclicla API - Ejemplos de uso

Este archivo contiene ejemplos prácticos de cómo consumir la API desde diferentes entornos.

## 🌐 Colección de Postman

### Variables de entorno para Postman

```json
{
  "baseUrl": "http://localhost:3000/api",
  "authToken": ""
}
```

### 1. Registro de usuario

**POST** `{{baseUrl}}/auth/register`

```json
{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+1234567890"
}
```

### 2. Inicio de sesión

**POST** `{{baseUrl}}/auth/login`

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Script de Post-request:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("authToken", response.token);
}
```

### 3. Obtener productos

**GET** `{{baseUrl}}/products?page=1&limit=10`

### 4. Agregar al carrito

**POST** `{{baseUrl}}/cart/items`

Headers: `Authorization: Bearer {{authToken}}`

```json
{
  "productId": "uuid-del-producto",
  "quantity": 2
}
```

## 🔗 Ejemplos con cURL

### Registro
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Juan",
    "lastName": "Pérez"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Obtener productos
```bash
curl -X GET "http://localhost:3000/api/products?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Obtener carrito (requiere autenticación)
```bash
curl -X GET http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## ⚡ Ejemplos con JavaScript/Frontend

### Clase de servicio completa

```javascript
class ApiService {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  // Método base para hacer requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Autenticación
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Productos
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  // Carrito
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId, quantity) {
    return this.request('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  }

  async updateCartItem(itemId, quantity) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }

  async removeFromCart(itemId) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'DELETE'
    });
  }

  async clearCart() {
    return this.request('/cart', {
      method: 'DELETE'
    });
  }

  // Direcciones
  async getAddresses() {
    return this.request('/addresses');
  }

  async createAddress(addressData) {
    return this.request('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData)
    });
  }

  async updateAddress(id, addressData) {
    return this.request(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData)
    });
  }

  async deleteAddress(id) {
    return this.request(`/addresses/${id}`, {
      method: 'DELETE'
    });
  }

  // Pedidos
  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/orders/my-orders${query ? `?${query}` : ''}`);
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(addressId, paymentMethodId) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify({ addressId, paymentMethodId })
    });
  }

  async cancelOrder(id) {
    return this.request(`/orders/${id}/cancel`, {
      method: 'PUT'
    });
  }

  // Reseñas
  async getProductReviews(productId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reviews/product/${productId}${query ? `?${query}` : ''}`);
  }

  async createReview(productId, rating, comment) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify({ productId, rating, comment })
    });
  }

  async updateReview(id, rating, comment) {
    return this.request(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ rating, comment })
    });
  }

  async deleteReview(id) {
    return this.request(`/reviews/${id}`, {
      method: 'DELETE'
    });
  }

  // Stripe/Pagos
  async createPaymentIntent(amount, currency = 'usd') {
    return this.request('/stripe/payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency })
    });
  }

  async getPaymentMethods() {
    return this.request('/stripe/payment-methods');
  }

  async savePaymentMethod(paymentMethodId) {
    return this.request('/stripe/payment-methods', {
      method: 'POST',
      body: JSON.stringify({ paymentMethodId })
    });
  }

  async deletePaymentMethod(paymentMethodId) {
    return this.request(`/stripe/payment-methods/${paymentMethodId}`, {
      method: 'DELETE'
    });
  }
}

// Uso de la clase
const api = new ApiService();

// Ejemplo de uso completo
async function ejemploCompleto() {
  try {
    // 1. Registrarse o hacer login
    await api.login('test@example.com', 'password123');
    
    // 2. Obtener productos
    const productos = await api.getProducts({ page: 1, limit: 10 });
    console.log('Productos:', productos);
    
    // 3. Agregar al carrito
    if (productos.products.length > 0) {
      await api.addToCart(productos.products[0].id, 2);
    }
    
    // 4. Ver carrito
    const carrito = await api.getCart();
    console.log('Carrito:', carrito);
    
    // 5. Obtener direcciones
    const direcciones = await api.getAddresses();
    console.log('Direcciones:', direcciones);
    
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 🔄 Estados de la aplicación con React

### Hook personalizado para el carrito

```javascript
import { useState, useEffect, useContext, createContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const api = new ApiService();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const cartData = await api.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    try {
      await api.addToCart(productId, quantity);
      await fetchCart(); // Refrescar carrito
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await api.updateCartItem(itemId, quantity);
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.removeFromCart(itemId);
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      setCart({ cartItems: [], total: 0, itemCount: 0 });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      refetchCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
```

## 📱 Ejemplo con React Native

```javascript
// api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  constructor() {
    this.baseURL = 'http://10.0.2.2:3000/api'; // Para Android Emulator
    // this.baseURL = 'http://localhost:3000/api'; // Para iOS Simulator
  }

  async getToken() {
    return await AsyncStorage.getItem('authToken');
  }

  async setToken(token) {
    await AsyncStorage.setItem('authToken', token);
  }

  async request(endpoint, options = {}) {
    const token = await this.getToken();
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }
    
    return data;
  }

  // Resto de métodos igual que en el ejemplo web...
}

export default new ApiService();
```

## 🔧 Configuración de CORS para producción

Si tu frontend está en un dominio diferente, asegúrate de configurar CORS correctamente:

```javascript
// En tu archivo de configuración del servidor
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://tu-dominio-frontend.com'
  ],
  credentials: true
}));
```
