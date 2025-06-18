#!/usr/bin/env node

/**
 * TEST COMPLETO DE TODAS LAS RUTAS DE LA API
 * ===========================================
 * 
 * Este script prueba systematicamente todas las rutas de la API:
 * - Crea un usuario nuevo y lo verifica
 * - Agrega direcciones, productos al carrito y favoritos
 * - Crea reseñas y actualiza perfil
 * - Prueba todas las funcionalidades end-to-end
 * 
 * @author GitHub Copilot
 * @date 2024
 */

import { supabaseAdmin } from '../src/config/supabase.js';
import fetch from 'node-fetch';

// Configuración
const API_BASE = 'http://localhost:5500/api/v1';
const TEST_USER_EMAIL = `testuser_${Date.now()}@gmail.com`;
const TEST_USER_PASSWORD = 'testpass123';
const TEST_USER_NAME = 'Usuario de Prueba Test';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Clase para manejar la API
class APITester {
  constructor() {
    this.token = null;
    this.userId = null;
    this.testData = {
      user: null,
      products: [],
      cartItems: [],
      favorites: [],
      reviews: [],
      addresses: [],
      orders: []
    };
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };
  }

  async apiCall(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { message: 'No JSON response' };
      }

      return {
        ok: response.ok,
        status: response.status,
        data,
        headers: response.headers
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: error.message,
        data: null
      };
    }
  }

  async test(description, testFunction) {
    this.stats.total++;
    process.stdout.write(`${colors.dim}  ${description}... ${colors.reset}`);

    try {
      const result = await testFunction();
      if (result === false) {
        log('❌ FAIL', 'red');
        this.stats.failed++;
        return false;
      } else if (result === 'skip') {
        log('⏭️  SKIP', 'yellow');
        this.stats.skipped++;
        return 'skip';
      } else {
        log('✅ PASS', 'green');
        this.stats.passed++;
        return true;
      }
    } catch (error) {
      log(`❌ ERROR: ${error.message}`, 'red');
      this.stats.failed++;
      return false;
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // TESTS DE AUTENTICACIÓN
  // ============================================================================

  async testAuthentication() {
    log('\n🔐 TESTING AUTENTICACIÓN', 'bold');
    log('========================', 'bold');

    // 1. Registro
    await this.test('Registro de usuario', async () => {
      const response = await this.apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
          nombre: TEST_USER_NAME,
          telefono: '+34 123 456 789'
        })
      });

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }

      this.testData.user = response.data.user;
      this.userId = response.data.user?.id;
      log(`    Usuario creado: ${TEST_USER_EMAIL}`, 'dim');
      return true;
    });

    // 2. Obtener código de verificación desde BD
    await this.test('Obtener código de verificación', async () => {
      const { data: user } = await supabaseAdmin
        .from('usuarios')
        .select('token_verificacion_email')
        .eq('correo_electronico', TEST_USER_EMAIL)
        .single();

      if (!user?.token_verificacion_email) {
        log('    No se encontró token de verificación', 'red');
        return false;
      }

      this.verificationCode = user.token_verificacion_email;
      log(`    Código obtenido: ${this.verificationCode}`, 'dim');
      return true;
    });

    // 3. Verificar email
    await this.test('Verificar email', async () => {
      const response = await this.apiCall('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          code: this.verificationCode
        })
      });

      if (!response.ok) {
        log(`    Error (${response.status}): ${JSON.stringify(response.data)}`, 'red');
        return false;
      }

      log('    Usuario verificado exitosamente', 'dim');
      return true;
    });

    // 4. Login
    await this.test('Login de usuario', async () => {
      const response = await this.apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD
        })
      });

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }

      this.token = response.data.token;
      this.userId = response.data.user?.id;
      log('    Token JWT obtenido', 'dim');
      return true;
    });

    // Pequeño delay para asegurar que el token esté activo
    await this.sleep(500);

    // 5. Obtener perfil
    await this.test('Obtener perfil de usuario', async () => {
      const response = await this.apiCall('/auth/profile');

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }

      log(`    Perfil obtenido: ${response.data.user?.nombre}`, 'dim');
      return true;
    });
  }

  // ============================================================================
  // TESTS DE PRODUCTOS
  // ============================================================================

  async testProducts() {
    log('\n📦 TESTING PRODUCTOS', 'bold');
    log('===================', 'bold');

    // 1. Obtener todos los productos (público)
    await this.test('Obtener lista completa de productos', async () => {
      const response = await this.apiCall('/products?limit=50'); // Obtener más productos

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }

      this.testData.products = response.data.products || [];
      log(`    ${this.testData.products.length} productos obtenidos de ${response.data.pagination?.totalItems || 'N/A'} totales`, 'dim');
      
      if (this.testData.products.length === 0) {
        log('    ⚠️  No hay productos disponibles para pruebas', 'yellow');
        return false;
      }
      
      return true;
    });

    // 2. Obtener producto específico
    if (this.testData.products.length > 0) {
      await this.test('Obtener producto específico por ID', async () => {
        const productId = this.testData.products[0].id;
        log(`    Probando producto ID: ${productId}`, 'dim');
        const response = await this.apiCall(`/products/${productId}`);

        if (!response.ok) {
          log(`    Error (${response.status}): ${response.data?.error || response.data?.message || 'Unknown error'}`, 'red');
          log(`    Response data: ${JSON.stringify(response.data)}`, 'red');
          return false;
        }

        log(`    Producto obtenido: ${response.data.nombre}`, 'dim');
        return true;
      });
      
      // 3. Test adicional: buscar productos
      await this.test('Buscar productos por texto', async () => {
        const searchTerm = this.testData.products[0].nombre.split(' ')[0]; // Primera palabra del nombre
        const response = await this.apiCall(`/products?search=${encodeURIComponent(searchTerm)}&limit=10`);

        if (!response.ok) {
          log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
          return false;
        }

        const foundProducts = response.data.products || [];
        log(`    ${foundProducts.length} productos encontrados con búsqueda "${searchTerm}"`, 'dim');
        return true;
      });
    }
  }

  // ============================================================================
  // TESTS DE CARRITO
  // ============================================================================

  async testCart() {
    log('\n🛒 TESTING CARRITO', 'bold');
    log('==================', 'bold');

    // 1. Obtener carrito (inicial vacío)
    await this.test('Obtener carrito inicial', async () => {
      const response = await this.apiCall('/cart');

      if (!response.ok) {
        log(`    Error (${response.status}): ${response.data?.error || response.data?.message || 'Unknown error'}`, 'red');
        if (response.data?.details) log(`    Detalles: ${response.data.details}`, 'red');
        return false;
      }

      log(`    Carrito inicial: ${response.data.cartItems?.length || 0} items`, 'dim');
      return true;
    });

    // 2. Agregar productos al carrito
    if (this.testData.products.length > 0) {
      await this.test('Agregar producto al carrito', async () => {
        const productId = this.testData.products[0].id;
        const response = await this.apiCall('/cart/items', {
          method: 'POST',
          body: JSON.stringify({
            productId: productId,
            quantity: 2
          })
        });

        if (!response.ok) {
          log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
          return false;
        }

        this.testData.cartItems.push(response.data.cartItem);
        log(`    Producto agregado al carrito`, 'dim');
        return true;
      });

      // 3. Actualizar cantidad en carrito
      if (this.testData.cartItems.length > 0) {
        await this.test('Actualizar cantidad en carrito', async () => {
          const cartItemId = this.testData.cartItems[0].id;
          const response = await this.apiCall(`/cart/items/${cartItemId}`, {
            method: 'PUT',
            body: JSON.stringify({
              quantity: 3
            })
          });

          if (!response.ok) {
            log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
            return false;
          }

          log('    Cantidad actualizada en carrito', 'dim');
          return true;
        });
      }

      // 4. Aplicar cupón
      await this.test('Aplicar cupón de descuento', async () => {
        const response = await this.apiCall('/cart/apply-coupon', {
          method: 'POST',
          body: JSON.stringify({
            couponCode: 'DESCUENTO20'
          })
        });

        if (!response.ok) {
          log(`    Cupón no aplicado (normal si no existe): ${response.data?.error}`, 'yellow');
          return 'skip';
        }

        log('    Cupón aplicado exitosamente', 'dim');
        return true;
      });

      // 5. Obtener carrito con cupón
      await this.test('Obtener carrito con descuento', async () => {
        const response = await this.apiCall('/cart/with-coupon?couponCode=DESCUENTO20');

        if (!response.ok) {
          log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
          return false;
        }

        log(`    Carrito con descuento obtenido`, 'dim');
        return true;
      });
    }
  }

  // ============================================================================
  // TESTS DE FAVORITOS
  // ============================================================================

  async testFavorites() {
    log('\n❤️  TESTING FAVORITOS', 'bold');
    log('====================', 'bold');

    // 1. Obtener favoritos (inicial vacío)
    await this.test('Obtener favoritos iniciales', async () => {
      const response = await this.apiCall('/favorites');

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }

      log(`    Favoritos iniciales: ${response.data.favorites?.length || 0} items`, 'dim');
      return true;
    });

    // 2. Agregar producto a favoritos
    if (this.testData.products.length > 0) {
      await this.test('Agregar producto a favoritos', async () => {
        const productId = this.testData.products[0].id;
        const response = await this.apiCall('/favorites', {
          method: 'POST',
          body: JSON.stringify({
            productId: productId
          })
        });

        if (!response.ok) {
          log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
          return false;
        }

        this.testData.favorites.push(response.data.favorite);
        log('    Producto agregado a favoritos', 'dim');
        return true;
      });

      // 3. Verificar estado de favorito
      await this.test('Verificar estado de favorito', async () => {
        const productId = this.testData.products[0].id;
        const response = await this.apiCall(`/favorites/status/${productId}`);

        if (!response.ok) {
          log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
          return false;
        }

        const isFavorite = response.data.isFavorite;
        log(`    Estado de favorito: ${isFavorite ? 'ES favorito' : 'NO es favorito'}`, 'dim');
        return isFavorite === true;
      });
    }
  }

  // ============================================================================
  // TESTS DE RESEÑAS
  // ============================================================================

  async testReviews() {
    log('\n⭐ TESTING RESEÑAS', 'bold');
    log('==================', 'bold');

    if (this.testData.products.length > 0) {
      const productId = this.testData.products[0].id;

      // 1. Obtener reseñas del producto
      await this.test('Obtener reseñas de producto', async () => {
        const response = await this.apiCall(`/reviews/product/${productId}`);

        if (!response.ok) {
          log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
          return false;
        }

        log(`    Reseñas existentes: ${response.data.reviews?.length || 0}`, 'dim');
        return true;
      });

      // 2. Crear reseña
      await this.test('Crear reseña de producto', async () => {
        const response = await this.apiCall('/reviews', {
          method: 'POST',
          body: JSON.stringify({
            productId: productId,
            rating: 5,
            comment: 'Excelente producto de prueba! Muy recomendado para testing.'
          })
        });

        if (!response.ok) {
          // Si falla porque requiere compra previa, lo consideramos normal
          if (response.data?.error?.includes('purchase') || response.data?.error?.includes('buy')) {
            log('    Reseña requiere compra previa (normal)', 'yellow');
            return 'skip';
          }
          log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
          return false;
        }

        this.testData.reviews.push(response.data.review);
        log('    Reseña creada exitosamente', 'dim');
        return true;
      });

      // 3. Actualizar reseña (si se creó)
      if (this.testData.reviews.length > 0) {
        await this.test('Actualizar reseña', async () => {
          const reviewId = this.testData.reviews[0].id;
          const response = await this.apiCall(`/reviews/${reviewId}`, {
            method: 'PUT',
            body: JSON.stringify({
              rating: 4,
              comment: 'Producto bueno, actualizo mi reseña de prueba.'
            })
          });

          if (!response.ok) {
            log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
            return false;
          }

          log('    Reseña actualizada exitosamente', 'dim');
          return true;
        });
      }
    }
  }

  // ============================================================================
  // TESTS DE DIRECCIONES
  // ============================================================================

  async testAddresses() {
    log('\n🏠 TESTING DIRECCIONES', 'bold');
    log('======================', 'bold');

    // 1. Obtener direcciones (inicial vacío)
    await this.test('Obtener direcciones iniciales', async () => {
      const response = await this.apiCall('/addresses');

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }

      log(`    Direcciones iniciales: ${response.data.addresses?.length || 0}`, 'dim');
      return true;
    });

    // 2. Crear dirección
    await this.test('Crear nueva dirección', async () => {
      const response = await this.apiCall('/addresses', {
        method: 'POST',
        body: JSON.stringify({
          address: 'Calle de Prueba 123, Apt 4B',
          city: 'Madrid',
          state: 'Madrid',
          postalCode: '28001',
          country: 'España',
          phone: '+34 123 456 789'
        })
      });

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }

      this.testData.addresses.push(response.data.address);
      log('    Dirección creada exitosamente', 'dim');
      return true;
    });

    // 3. Actualizar dirección
    if (this.testData.addresses.length > 0) {
      await this.test('Actualizar dirección', async () => {
        const addressId = this.testData.addresses[0].id;
        const response = await this.apiCall(`/addresses/${addressId}`, {
          method: 'PUT',
          body: JSON.stringify({
            address: 'Calle de Prueba Actualizada 456',
            city: 'Barcelona',
            state: 'Catalunya',
            postalCode: '08001',
            country: 'España',
            phone: '+34 987 654 321'
          })
        });

        if (!response.ok) {
          log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
          return false;
        }

        log('    Dirección actualizada exitosamente', 'dim');
        return true;
      });
    }
  }

  // ============================================================================
  // TESTS DE USUARIO
  // ============================================================================

  async testUsers() {
    log('\n👤 TESTING GESTIÓN DE USUARIO', 'bold');
    log('=============================', 'bold');

    // 1. Actualizar perfil
    await this.test('Actualizar perfil de usuario', async () => {
      const response = await this.apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          nombre: 'Usuario de Prueba Actualizado',
          telefono: '+34 111 222 333'
        })
      });

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }

      log('    Perfil actualizado exitosamente', 'dim');
      return true;
    });

    // 2. Cambiar contraseña
    await this.test('Cambiar contraseña', async () => {
      const response = await this.apiCall('/users/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: TEST_USER_PASSWORD,
          newPassword: 'newpass456'
        })
      });

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }

      log('    Contraseña cambiada exitosamente', 'dim');
      return true;
    });
  }

  // ============================================================================
  // TESTS DE STRIPE (BÁSICO)
  // ============================================================================

  async testStripe() {
    log('\n💳 TESTING STRIPE (BÁSICO)', 'bold');
    log('==========================', 'bold');

    // 1. Obtener métodos de pago
    await this.test('Obtener métodos de pago', async () => {
      const response = await this.apiCall('/stripe/payment-methods');

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }

      log(`    Métodos de pago: ${response.data.paymentMethods?.length || 0}`, 'dim');
      return true;
    });

    // 2. Crear payment intent (básico)
    await this.test('Crear Payment Intent', async () => {
      const response = await this.apiCall('/stripe/payment-intent', {
        method: 'POST',
        body: JSON.stringify({
          amount: 99.99,
          currency: 'eur'
        })
      });

      if (!response.ok) {
        log(`    Error: ${response.data?.error || 'Unknown error'}`, 'red');
        return false;
      }

      log('    Payment Intent creado exitosamente', 'dim');
      return true;
    });
  }

  // ============================================================================
  // MÉTODO PRINCIPAL
  // ============================================================================

  async runAllTests() {
    log('🧪 INICIANDO TESTS COMPLETOS DE TODAS LAS RUTAS', 'bold');
    log('===============================================\n', 'bold');
    
    log(`📧 Email de prueba: ${TEST_USER_EMAIL}`, 'cyan');
    log(`🔑 Contraseña: ${TEST_USER_PASSWORD}`, 'cyan');
    log(`👤 Nombre: ${TEST_USER_NAME}\n`, 'cyan');

    // Ejecutar todos los tests
    await this.testAuthentication();
    await this.testProducts();
    await this.testCart();
    await this.testFavorites();
    await this.testReviews();
    await this.testAddresses();
    await this.testUsers();
    await this.testStripe();

    // Resumen final
    log('\n📊 RESUMEN DE TESTS', 'bold');
    log('==================', 'bold');
    log(`✅ Exitosos: ${this.stats.passed}`, 'green');
    log(`❌ Fallidos: ${this.stats.failed}`, 'red');
    log(`⏭️  Omitidos: ${this.stats.skipped}`, 'yellow');
    log(`📊 Total: ${this.stats.total}`, 'cyan');
    
    const successRate = ((this.stats.passed / (this.stats.total - this.stats.skipped)) * 100).toFixed(1);
    log(`\n🎯 Tasa de éxito: ${successRate}%`, successRate > 90 ? 'green' : successRate > 70 ? 'yellow' : 'red');

    log('\n📋 DATOS CREADOS PARA LIMPIEZA:', 'bold');
    log(`   Usuario: ${TEST_USER_EMAIL}`, 'dim');
    log(`   Productos en carrito: ${this.testData.cartItems.length}`, 'dim');
    log(`   Favoritos: ${this.testData.favorites.length}`, 'dim');
    log(`   Reseñas: ${this.testData.reviews.length}`, 'dim');
    log(`   Direcciones: ${this.testData.addresses.length}`, 'dim');

    log('\n🧹 Para limpiar los datos de prueba:', 'yellow');
    log('   node scripts/cleanup-test-data.js', 'yellow');

    return {
      success: this.stats.failed === 0,
      stats: this.stats,
      testData: this.testData
    };
  }
}

// Ejecutar tests
const tester = new APITester();
tester.runAllTests().catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, 'red');
  process.exit(1);
});
